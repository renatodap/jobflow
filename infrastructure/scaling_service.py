"""
Automated Scaling Service for JobFlow
Handles auto-scaling based on load, cost optimization, and resource management
"""

import asyncio
import os
import json
from typing import Dict, List, Optional
from datetime import datetime, timedelta
from dataclasses import dataclass, asdict
import httpx
import boto3
from kubernetes import client, config
import docker
import psutil
import redis
import logging

@dataclass
class ScalingMetrics:
    """Metrics used for scaling decisions"""
    timestamp: datetime
    cpu_usage: float
    memory_usage: float
    active_connections: int
    request_queue_size: int
    response_time_p95: float
    error_rate: float
    active_users: int

@dataclass
class ScalingAction:
    """Represents a scaling action taken"""
    timestamp: datetime
    action_type: str  # scale_up, scale_down, optimize
    service: str
    old_count: int
    new_count: int
    reason: str
    cost_impact: float

class AutoScalingService:
    """Automated scaling and resource optimization service"""
    
    def __init__(self):
        # Initialize cloud providers
        self.aws = boto3.client('ecs') if os.getenv('AWS_ACCESS_KEY_ID') else None
        self.gcp = None  # Initialize GCP client if needed
        
        # Initialize container orchestration
        try:
            config.load_incluster_config()
            self.k8s = client.AppsV1Api()
            self.k8s_enabled = True
        except:
            try:
                config.load_kube_config()
                self.k8s = client.AppsV1Api()
                self.k8s_enabled = True
            except:
                self.k8s_enabled = False
        
        # Initialize Docker for local scaling
        try:
            self.docker_client = docker.from_env()
            self.docker_enabled = True
        except:
            self.docker_enabled = False
        
        # Redis for metrics and coordination
        self.redis_client = redis.Redis(
            host=os.getenv('REDIS_HOST', 'localhost'),
            port=int(os.getenv('REDIS_PORT', 6379)),
            decode_responses=True
        )
        
        # Scaling configuration
        self.config = {
            'api_servers': {
                'min_instances': int(os.getenv('API_MIN_INSTANCES', '2')),
                'max_instances': int(os.getenv('API_MAX_INSTANCES', '10')),
                'cpu_threshold_up': 75.0,
                'cpu_threshold_down': 25.0,
                'memory_threshold_up': 80.0,
                'memory_threshold_down': 30.0,
                'response_time_threshold': 2000.0,  # milliseconds
                'scale_up_cooldown': 300,  # 5 minutes
                'scale_down_cooldown': 600  # 10 minutes
            },
            'job_processors': {
                'min_instances': 1,
                'max_instances': 50,
                'queue_threshold_up': 100,
                'queue_threshold_down': 10,
                'scale_up_cooldown': 60,  # 1 minute
                'scale_down_cooldown': 300  # 5 minutes
            },
            'ai_workers': {
                'min_instances': 1,
                'max_instances': 20,
                'queue_threshold_up': 50,
                'queue_threshold_down': 5,
                'cost_per_hour': 0.50,
                'scale_up_cooldown': 120,  # 2 minutes
                'scale_down_cooldown': 600  # 10 minutes
            }
        }
        
        # Scaling history for pattern recognition
        self.scaling_history = []
        self.last_scaling_action = {}
        
        self.logger = logging.getLogger('scaling')
        
        # Start background scaling tasks
        asyncio.create_task(self.scaling_monitor())
        asyncio.create_task(self.cost_optimizer())
        asyncio.create_task(self.predictive_scaler())
    
    async def scaling_monitor(self):
        """
        Main scaling monitor - runs continuously
        """
        
        while True:
            try:
                # Collect current metrics
                metrics = await self.collect_scaling_metrics()
                
                # Make scaling decisions for each service
                await self.evaluate_api_server_scaling(metrics)
                await self.evaluate_job_processor_scaling(metrics)
                await self.evaluate_ai_worker_scaling(metrics)
                
                # Store metrics for pattern recognition
                await self.store_scaling_metrics(metrics)
                
                # Wait before next evaluation
                await asyncio.sleep(30)  # Check every 30 seconds
                
            except Exception as e:
                self.logger.error(f"Error in scaling monitor: {e}")
                await asyncio.sleep(60)
    
    async def collect_scaling_metrics(self) -> ScalingMetrics:
        """
        Collect current system metrics for scaling decisions
        """
        
        # System metrics
        cpu_usage = psutil.cpu_percent(interval=1)
        memory = psutil.virtual_memory()
        memory_usage = memory.percent
        
        # Network connections as proxy for active connections
        connections = len(psutil.net_connections(kind='inet'))
        
        # Get queue sizes from Redis
        job_queue_size = await self.redis_client.llen('job_queue') or 0
        
        # Get response times from monitoring service
        response_times_key = f"response_times:{datetime.now().strftime('%Y-%m-%d-%H')}"
        response_times = await self.redis_client.lrange(response_times_key, 0, -1)
        response_times = [float(rt) for rt in response_times if rt]
        
        # Calculate P95 response time
        if response_times:
            response_times.sort()
            p95_index = int(len(response_times) * 0.95)
            response_time_p95 = response_times[p95_index] if p95_index < len(response_times) else response_times[-1]
        else:
            response_time_p95 = 0
        
        # Get error rate
        error_count_key = f"errors:{datetime.now().strftime('%Y-%m-%d-%H')}"
        total_requests_key = f"requests:{datetime.now().strftime('%Y-%m-%d-%H')}"
        
        error_count = int(await self.redis_client.get(error_count_key) or 0)
        total_requests = int(await self.redis_client.get(total_requests_key) or 0)
        error_rate = (error_count / total_requests * 100) if total_requests > 0 else 0
        
        # Get active users
        active_users_key = f"active_users:{datetime.now().strftime('%Y-%m-%d-%H')}"
        active_users = int(await self.redis_client.get(active_users_key) or 0)
        
        return ScalingMetrics(
            timestamp=datetime.now(),
            cpu_usage=cpu_usage,
            memory_usage=memory_usage,
            active_connections=connections,
            request_queue_size=job_queue_size,
            response_time_p95=response_time_p95,
            error_rate=error_rate,
            active_users=active_users
        )
    
    async def evaluate_api_server_scaling(self, metrics: ScalingMetrics):
        """
        Evaluate if API servers need scaling
        """
        
        service = 'api_servers'
        config = self.config[service]
        current_instances = await self.get_current_instance_count(service)
        
        # Check if cooldown period has passed
        last_action_time = self.last_scaling_action.get(service, datetime.min)
        
        # Scaling up conditions
        should_scale_up = (
            (metrics.cpu_usage > config['cpu_threshold_up'] or
             metrics.memory_usage > config['memory_threshold_up'] or
             metrics.response_time_p95 > config['response_time_threshold'] or
             metrics.error_rate > 5.0) and
            current_instances < config['max_instances'] and
            (datetime.now() - last_action_time).total_seconds() > config['scale_up_cooldown']
        )
        
        # Scaling down conditions
        should_scale_down = (
            metrics.cpu_usage < config['cpu_threshold_down'] and
            metrics.memory_usage < config['memory_threshold_down'] and
            metrics.response_time_p95 < 500 and
            metrics.error_rate < 1.0 and
            current_instances > config['min_instances'] and
            (datetime.now() - last_action_time).total_seconds() > config['scale_down_cooldown']
        )
        
        if should_scale_up:
            new_count = min(current_instances + 1, config['max_instances'])
            reason = f"High load: CPU {metrics.cpu_usage}%, Memory {metrics.memory_usage}%, RT {metrics.response_time_p95}ms"
            await self.scale_service(service, new_count, reason)
            
        elif should_scale_down:
            new_count = max(current_instances - 1, config['min_instances'])
            reason = f"Low load: CPU {metrics.cpu_usage}%, Memory {metrics.memory_usage}%"
            await self.scale_service(service, new_count, reason)
    
    async def evaluate_job_processor_scaling(self, metrics: ScalingMetrics):
        """
        Evaluate if job processors need scaling based on queue size
        """
        
        service = 'job_processors'
        config = self.config[service]
        current_instances = await self.get_current_instance_count(service)
        
        last_action_time = self.last_scaling_action.get(service, datetime.min)
        
        # Scale up if queue is growing
        should_scale_up = (
            metrics.request_queue_size > config['queue_threshold_up'] and
            current_instances < config['max_instances'] and
            (datetime.now() - last_action_time).total_seconds() > config['scale_up_cooldown']
        )
        
        # Scale down if queue is small
        should_scale_down = (
            metrics.request_queue_size < config['queue_threshold_down'] and
            current_instances > config['min_instances'] and
            (datetime.now() - last_action_time).total_seconds() > config['scale_down_cooldown']
        )
        
        if should_scale_up:
            new_count = min(current_instances + 2, config['max_instances'])  # Scale up by 2 for queue processing
            reason = f"Queue size: {metrics.request_queue_size}"
            await self.scale_service(service, new_count, reason)
            
        elif should_scale_down:
            new_count = max(current_instances - 1, config['min_instances'])
            reason = f"Low queue size: {metrics.request_queue_size}"
            await self.scale_service(service, new_count, reason)
    
    async def evaluate_ai_worker_scaling(self, metrics: ScalingMetrics):
        """
        Evaluate AI worker scaling with cost considerations
        """
        
        service = 'ai_workers'
        config = self.config[service]
        current_instances = await self.get_current_instance_count(service)
        
        # Get AI-specific queue size
        ai_queue_size = await self.redis_client.llen('ai_generation_queue') or 0
        
        last_action_time = self.last_scaling_action.get(service, datetime.min)
        
        # Calculate current hourly cost
        current_cost = current_instances * config['cost_per_hour']
        
        # Scale up conditions (considering cost)
        should_scale_up = (
            ai_queue_size > config['queue_threshold_up'] and
            current_instances < config['max_instances'] and
            current_cost < 10.0 and  # Don't exceed $10/hour
            (datetime.now() - last_action_time).total_seconds() > config['scale_up_cooldown']
        )
        
        # Scale down conditions
        should_scale_down = (
            ai_queue_size < config['queue_threshold_down'] and
            current_instances > config['min_instances'] and
            (datetime.now() - last_action_time).total_seconds() > config['scale_down_cooldown']
        )
        
        if should_scale_up:
            new_count = min(current_instances + 1, config['max_instances'])
            reason = f"AI queue size: {ai_queue_size}"
            await self.scale_service(service, new_count, reason)
            
        elif should_scale_down:
            new_count = max(current_instances - 1, config['min_instances'])
            reason = f"Low AI queue size: {ai_queue_size}"
            await self.scale_service(service, new_count, reason)
    
    async def scale_service(self, service: str, target_count: int, reason: str):
        """
        Execute scaling action for a service
        """
        
        current_count = await self.get_current_instance_count(service)
        
        if current_count == target_count:
            return  # No change needed
        
        action_type = "scale_up" if target_count > current_count else "scale_down"
        
        # Calculate cost impact
        cost_per_instance = self.config[service].get('cost_per_hour', 0.10)
        cost_impact = (target_count - current_count) * cost_per_instance
        
        # Create scaling action record
        action = ScalingAction(
            timestamp=datetime.now(),
            action_type=action_type,
            service=service,
            old_count=current_count,
            new_count=target_count,
            reason=reason,
            cost_impact=cost_impact
        )
        
        # Execute the scaling
        success = False
        
        if self.k8s_enabled:
            success = await self.scale_kubernetes_deployment(service, target_count)
        elif self.docker_enabled:
            success = await self.scale_docker_service(service, target_count)
        elif self.aws:
            success = await self.scale_ecs_service(service, target_count)
        
        if success:
            # Record the action
            self.scaling_history.append(action)
            self.last_scaling_action[service] = datetime.now()
            
            # Log the action
            self.logger.info(f"Scaled {service} from {current_count} to {target_count}: {reason}")
            
            # Store in database
            await self.store_scaling_action(action)
            
            # Send notification if significant change
            if abs(target_count - current_count) > 2:
                await self.send_scaling_notification(action)
        else:
            self.logger.error(f"Failed to scale {service} to {target_count}")
    
    async def scale_kubernetes_deployment(self, service: str, target_count: int) -> bool:
        """
        Scale Kubernetes deployment
        """
        
        try:
            # Map service names to Kubernetes deployment names
            deployment_names = {
                'api_servers': 'jobflow-api',
                'job_processors': 'jobflow-job-processor',
                'ai_workers': 'jobflow-ai-worker'
            }
            
            deployment_name = deployment_names.get(service)
            if not deployment_name:
                return False
            
            # Scale the deployment
            body = {'spec': {'replicas': target_count}}
            
            await asyncio.to_thread(
                self.k8s.patch_namespaced_deployment_scale,
                name=deployment_name,
                namespace='jobflow',
                body=body
            )
            
            return True
            
        except Exception as e:
            self.logger.error(f"Kubernetes scaling error: {e}")
            return False
    
    async def scale_docker_service(self, service: str, target_count: int) -> bool:
        """
        Scale Docker Compose service
        """
        
        try:
            # This would use docker-compose API or docker stack deploy
            # For simplicity, using docker service scale command
            service_name = f"jobflow_{service}"
            
            # Execute scaling command
            import subprocess
            result = await asyncio.to_thread(
                subprocess.run,
                ['docker', 'service', 'scale', f'{service_name}={target_count}'],
                capture_output=True,
                text=True
            )
            
            return result.returncode == 0
            
        except Exception as e:
            self.logger.error(f"Docker scaling error: {e}")
            return False
    
    async def scale_ecs_service(self, service: str, target_count: int) -> bool:
        """
        Scale AWS ECS service
        """
        
        try:
            # Map service names to ECS service ARNs
            ecs_services = {
                'api_servers': os.getenv('ECS_API_SERVICE_ARN'),
                'job_processors': os.getenv('ECS_JOB_PROCESSOR_SERVICE_ARN'),
                'ai_workers': os.getenv('ECS_AI_WORKER_SERVICE_ARN')
            }
            
            service_arn = ecs_services.get(service)
            if not service_arn:
                return False
            
            # Update ECS service
            await asyncio.to_thread(
                self.aws.update_service,
                cluster=os.getenv('ECS_CLUSTER_NAME'),
                service=service_arn,
                desiredCount=target_count
            )
            
            return True
            
        except Exception as e:
            self.logger.error(f"ECS scaling error: {e}")
            return False
    
    async def get_current_instance_count(self, service: str) -> int:
        """
        Get current instance count for a service
        """
        
        # Check Redis cache first
        cached_count = await self.redis_client.get(f"instance_count:{service}")
        if cached_count:
            return int(cached_count)
        
        # Query actual infrastructure
        if self.k8s_enabled:
            return await self.get_k8s_instance_count(service)
        elif self.docker_enabled:
            return await self.get_docker_instance_count(service)
        elif self.aws:
            return await self.get_ecs_instance_count(service)
        
        # Default fallback
        return self.config[service]['min_instances']
    
    async def cost_optimizer(self):
        """
        Background task for cost optimization
        """
        
        while True:
            try:
                # Run every hour
                await asyncio.sleep(3600)
                
                # Analyze cost patterns
                await self.analyze_cost_patterns()
                
                # Optimize instance types
                await self.optimize_instance_types()
                
                # Schedule downtime for non-critical services
                await self.schedule_cost_optimized_downtime()
                
            except Exception as e:
                self.logger.error(f"Cost optimization error: {e}")
    
    async def predictive_scaler(self):
        """
        Background task for predictive scaling based on patterns
        """
        
        while True:
            try:
                # Run every 15 minutes
                await asyncio.sleep(900)
                
                # Analyze usage patterns
                patterns = await self.analyze_usage_patterns()
                
                # Predict future load
                predictions = await self.predict_load(patterns)
                
                # Pre-scale based on predictions
                await self.execute_predictive_scaling(predictions)
                
            except Exception as e:
                self.logger.error(f"Predictive scaling error: {e}")
    
    async def analyze_usage_patterns(self) -> Dict:
        """
        Analyze historical usage patterns
        """
        
        # Get historical data from last 7 days
        end_time = datetime.now()
        start_time = end_time - timedelta(days=7)
        
        # Query metrics from database
        metrics_data = await self.query_historical_metrics(start_time, end_time)
        
        # Analyze patterns by hour of day and day of week
        hourly_patterns = {}
        daily_patterns = {}
        
        for metric in metrics_data:
            hour = metric['timestamp'].hour
            day = metric['timestamp'].weekday()
            
            if hour not in hourly_patterns:
                hourly_patterns[hour] = []
            if day not in daily_patterns:
                daily_patterns[day] = []
            
            hourly_patterns[hour].append(metric['cpu_usage'])
            daily_patterns[day].append(metric['cpu_usage'])
        
        # Calculate averages
        hourly_averages = {hour: sum(values) / len(values) for hour, values in hourly_patterns.items()}
        daily_averages = {day: sum(values) / len(values) for day, values in daily_patterns.items()}
        
        return {
            'hourly_patterns': hourly_averages,
            'daily_patterns': daily_averages,
            'peak_hour': max(hourly_averages.items(), key=lambda x: x[1])[0],
            'low_hour': min(hourly_averages.items(), key=lambda x: x[1])[0]
        }
    
    async def predict_load(self, patterns: Dict) -> Dict:
        """
        Predict load for next few hours
        """
        
        current_time = datetime.now()
        predictions = {}
        
        # Predict for next 4 hours
        for i in range(1, 5):
            future_time = current_time + timedelta(hours=i)
            future_hour = future_time.hour
            future_day = future_time.weekday()
            
            # Simple prediction based on historical averages
            hourly_factor = patterns['hourly_patterns'].get(future_hour, 50)
            daily_factor = patterns['daily_patterns'].get(future_day, 50)
            
            # Weighted prediction
            predicted_load = (hourly_factor * 0.7) + (daily_factor * 0.3)
            
            predictions[future_hour] = {
                'predicted_cpu': predicted_load,
                'confidence': 0.7,  # Simple confidence score
                'hour': future_hour
            }
        
        return predictions
    
    async def execute_predictive_scaling(self, predictions: Dict):
        """
        Execute scaling based on predictions
        """
        
        for hour, prediction in predictions.items():
            if prediction['confidence'] > 0.6:  # Only act on confident predictions
                predicted_cpu = prediction['predicted_cpu']
                
                # Determine required instance count
                if predicted_cpu > 80:
                    # Pre-scale up
                    await self.prepare_scale_up()
                elif predicted_cpu < 30:
                    # Pre-scale down (with caution)
                    await self.prepare_scale_down()
    
    # Helper methods
    async def get_k8s_instance_count(self, service: str) -> int:
        """Get current Kubernetes deployment replica count"""
        # Implementation depends on specific Kubernetes setup
        return 2  # Placeholder
    
    async def get_docker_instance_count(self, service: str) -> int:
        """Get current Docker service replica count"""
        # Implementation depends on Docker setup
        return 2  # Placeholder
    
    async def get_ecs_instance_count(self, service: str) -> int:
        """Get current ECS service task count"""
        # Implementation depends on ECS setup
        return 2  # Placeholder
    
    async def store_scaling_metrics(self, metrics: ScalingMetrics):
        """Store scaling metrics for analysis"""
        # Store in Redis and database
        pass
    
    async def store_scaling_action(self, action: ScalingAction):
        """Store scaling action for audit trail"""
        # Store in database
        pass
    
    async def send_scaling_notification(self, action: ScalingAction):
        """Send notification about significant scaling actions"""
        # Send to Slack, email, etc.
        pass
    
    async def query_historical_metrics(self, start_time: datetime, end_time: datetime):
        """Query historical metrics for pattern analysis"""
        # Query from database
        return []  # Placeholder
    
    async def analyze_cost_patterns(self):
        """Analyze cost patterns for optimization"""
        pass
    
    async def optimize_instance_types(self):
        """Optimize instance types for cost efficiency"""
        pass
    
    async def schedule_cost_optimized_downtime(self):
        """Schedule downtime for cost savings"""
        pass
    
    async def prepare_scale_up(self):
        """Prepare for anticipated scale up"""
        pass
    
    async def prepare_scale_down(self):
        """Prepare for anticipated scale down"""
        pass