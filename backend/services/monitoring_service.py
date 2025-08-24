"""
Performance Monitoring Service for JobFlow
Real-time metrics, alerting, and performance optimization
"""

import time
import psutil
import asyncio
from typing import Dict, List, Optional
from datetime import datetime, timedelta
import json
import httpx
import redis
from fastapi import BackgroundTasks
import logging
from dataclasses import dataclass, asdict
from collections import defaultdict, deque
import os

@dataclass
class PerformanceMetric:
    """Performance metric data structure"""
    timestamp: datetime
    metric_name: str
    value: float
    tags: Dict[str, str]
    unit: str = "count"

@dataclass
class SystemHealth:
    """System health status"""
    timestamp: datetime
    cpu_usage: float
    memory_usage: float
    disk_usage: float
    active_connections: int
    response_time_avg: float
    error_rate: float
    status: str  # healthy, warning, critical

class MonitoringService:
    """Comprehensive monitoring and alerting service"""
    
    def __init__(self):
        self.redis_client = redis.Redis(
            host=os.getenv('REDIS_HOST', 'localhost'),
            port=int(os.getenv('REDIS_PORT', 6379)),
            decode_responses=True
        )
        
        self.supabase_url = os.getenv('SUPABASE_URL')
        self.supabase_key = os.getenv('SUPABASE_SERVICE_KEY')
        
        # In-memory metrics storage for real-time access
        self.metrics_buffer = deque(maxlen=1000)
        self.response_times = deque(maxlen=100)
        self.error_counts = defaultdict(int)
        
        # Performance thresholds
        self.thresholds = {
            'cpu_usage': 80.0,
            'memory_usage': 85.0,
            'disk_usage': 90.0,
            'response_time': 2000.0,  # milliseconds
            'error_rate': 5.0  # percentage
        }
        
        # Setup logging
        self.logger = logging.getLogger('monitoring')
        self.setup_monitoring_tasks()
    
    def setup_monitoring_tasks(self):
        """Setup background monitoring tasks"""
        asyncio.create_task(self.collect_system_metrics())
        asyncio.create_task(self.analyze_performance_trends())
        asyncio.create_task(self.cleanup_old_metrics())
    
    async def record_api_call(
        self,
        endpoint: str,
        method: str,
        response_time: float,
        status_code: int,
        user_id: Optional[str] = None,
        error_message: Optional[str] = None
    ):
        """
        Record API call metrics
        """
        
        # Record response time
        self.response_times.append(response_time)
        
        # Count errors
        if status_code >= 400:
            self.error_counts[f"{method}_{endpoint}"] += 1
        
        # Create metric record
        metric = PerformanceMetric(
            timestamp=datetime.now(),
            metric_name="api_call",
            value=response_time,
            tags={
                'endpoint': endpoint,
                'method': method,
                'status_code': str(status_code),
                'user_id': user_id or 'anonymous'
            },
            unit="milliseconds"
        )
        
        # Store in buffer and Redis
        self.metrics_buffer.append(metric)
        await self.store_metric_redis(metric)
        
        # Store in database for long-term analysis
        await self.store_metric_database(metric, error_message)
        
        # Check for performance alerts
        if response_time > self.thresholds['response_time']:
            await self.trigger_performance_alert(
                "slow_response",
                f"Slow response time: {response_time}ms for {method} {endpoint}",
                {"response_time": response_time, "endpoint": endpoint}
            )
    
    async def record_job_search_metrics(
        self,
        user_id: str,
        search_duration: float,
        jobs_found: int,
        sources_used: List[str],
        success: bool,
        error_details: Optional[str] = None
    ):
        """
        Record job search performance metrics
        """
        
        metric = PerformanceMetric(
            timestamp=datetime.now(),
            metric_name="job_search",
            value=search_duration,
            tags={
                'user_id': user_id,
                'jobs_found': str(jobs_found),
                'sources_count': str(len(sources_used)),
                'success': str(success)
            },
            unit="seconds"
        )
        
        await self.store_metric_redis(metric)
        await self.store_metric_database(metric, error_details)
        
        # Track job search success rate
        success_key = f"job_search_success:{datetime.now().strftime('%Y-%m-%d')}"
        if success:
            await self.redis_client.incr(f"{success_key}:success")
        else:
            await self.redis_client.incr(f"{success_key}:failure")
    
    async def record_ai_generation_metrics(
        self,
        user_id: str,
        generation_type: str,  # resume, cover_letter, linkedin_message
        generation_time: float,
        token_count: int,
        cost: float,
        quality_score: Optional[float] = None
    ):
        """
        Record AI content generation metrics
        """
        
        metric = PerformanceMetric(
            timestamp=datetime.now(),
            metric_name="ai_generation",
            value=generation_time,
            tags={
                'user_id': user_id,
                'type': generation_type,
                'tokens': str(token_count),
                'cost': str(cost),
                'quality_score': str(quality_score) if quality_score else 'null'
            },
            unit="seconds"
        )
        
        await self.store_metric_redis(metric)
        await self.store_metric_database(metric)
        
        # Track AI usage costs
        cost_key = f"ai_costs:{datetime.now().strftime('%Y-%m-%d')}"
        await self.redis_client.incrbyfloat(cost_key, cost)
    
    async def get_real_time_metrics(self) -> Dict:
        """
        Get real-time performance metrics
        """
        
        # Calculate current metrics
        current_time = datetime.now()
        last_minute = current_time - timedelta(minutes=1)
        
        # Recent response times
        recent_response_times = [rt for rt in self.response_times if rt is not None]
        avg_response_time = sum(recent_response_times) / len(recent_response_times) if recent_response_times else 0
        
        # Error rate calculation
        total_requests = len([m for m in self.metrics_buffer if m.metric_name == "api_call" and m.timestamp > last_minute])
        error_requests = sum(self.error_counts.values())
        error_rate = (error_requests / total_requests * 100) if total_requests > 0 else 0
        
        # System health
        system_health = await self.get_system_health()
        
        return {
            'timestamp': current_time.isoformat(),
            'api_metrics': {
                'requests_per_minute': total_requests,
                'avg_response_time': round(avg_response_time, 2),
                'error_rate': round(error_rate, 2),
                'active_connections': system_health.active_connections
            },
            'system_health': asdict(system_health),
            'business_metrics': await self.get_business_metrics(),
            'alerts': await self.get_active_alerts(),
            'performance_score': await self.calculate_performance_score()
        }
    
    async def get_system_health(self) -> SystemHealth:
        """
        Get current system health metrics
        """
        
        # CPU usage
        cpu_usage = psutil.cpu_percent(interval=1)
        
        # Memory usage
        memory = psutil.virtual_memory()
        memory_usage = memory.percent
        
        # Disk usage
        disk = psutil.disk_usage('/')
        disk_usage = (disk.used / disk.total) * 100
        
        # Network connections (approximation)
        connections = len(psutil.net_connections(kind='inet'))
        
        # Average response time
        recent_times = list(self.response_times)[-10:]  # Last 10 requests
        avg_response_time = sum(recent_times) / len(recent_times) if recent_times else 0
        
        # Error rate
        total_recent = len([m for m in self.metrics_buffer if m.timestamp > datetime.now() - timedelta(minutes=5)])
        error_recent = sum([count for count in self.error_counts.values()])
        error_rate = (error_recent / total_recent * 100) if total_recent > 0 else 0
        
        # Determine overall status
        status = "healthy"
        if (cpu_usage > self.thresholds['cpu_usage'] or 
            memory_usage > self.thresholds['memory_usage'] or
            error_rate > self.thresholds['error_rate']):
            status = "critical"
        elif (cpu_usage > self.thresholds['cpu_usage'] * 0.8 or
              memory_usage > self.thresholds['memory_usage'] * 0.8 or
              avg_response_time > self.thresholds['response_time'] * 0.8):
            status = "warning"
        
        return SystemHealth(
            timestamp=datetime.now(),
            cpu_usage=cpu_usage,
            memory_usage=memory_usage,
            disk_usage=disk_usage,
            active_connections=connections,
            response_time_avg=avg_response_time,
            error_rate=error_rate,
            status=status
        )
    
    async def get_business_metrics(self) -> Dict:
        """
        Get business performance metrics
        """
        
        today = datetime.now().strftime('%Y-%m-%d')
        
        # Get metrics from Redis
        daily_users = await self.redis_client.get(f"daily_active_users:{today}") or 0
        job_searches = await self.redis_client.get(f"job_searches:{today}") or 0
        ai_generations = await self.redis_client.get(f"ai_generations:{today}") or 0
        applications = await self.redis_client.get(f"applications:{today}") or 0
        
        # Calculate costs
        ai_costs = await self.redis_client.get(f"ai_costs:{today}") or 0
        
        return {
            'daily_active_users': int(daily_users),
            'job_searches_today': int(job_searches),
            'ai_generations_today': int(ai_generations),
            'applications_today': int(applications),
            'ai_costs_today': float(ai_costs),
            'revenue_today': await self.calculate_daily_revenue(),
            'user_satisfaction': await self.get_user_satisfaction_score()
        }
    
    async def calculate_performance_score(self) -> float:
        """
        Calculate overall performance score (0-100)
        """
        
        system_health = await self.get_system_health()
        
        # Performance factors with weights
        factors = {
            'response_time': (max(0, 100 - (system_health.response_time_avg / 10)), 0.3),
            'error_rate': (max(0, 100 - (system_health.error_rate * 10)), 0.25),
            'cpu_usage': (max(0, 100 - system_health.cpu_usage), 0.2),
            'memory_usage': (max(0, 100 - system_health.memory_usage), 0.15),
            'uptime': (100, 0.1)  # Simplified - would track actual uptime
        }
        
        # Calculate weighted score
        total_score = sum(score * weight for score, weight in factors.values())
        
        return min(100, max(0, total_score))
    
    async def trigger_performance_alert(
        self,
        alert_type: str,
        message: str,
        metadata: Dict
    ):
        """
        Trigger performance alert
        """
        
        alert = {
            'type': alert_type,
            'message': message,
            'metadata': metadata,
            'timestamp': datetime.now().isoformat(),
            'severity': self.get_alert_severity(alert_type, metadata)
        }
        
        # Store alert
        await self.store_alert(alert)
        
        # Send notifications based on severity
        if alert['severity'] in ['critical', 'high']:
            await self.send_alert_notification(alert)
    
    def get_alert_severity(self, alert_type: str, metadata: Dict) -> str:
        """
        Determine alert severity level
        """
        
        if alert_type == "slow_response":
            response_time = metadata.get('response_time', 0)
            if response_time > 5000:  # 5 seconds
                return "critical"
            elif response_time > 2000:  # 2 seconds
                return "high"
            else:
                return "medium"
        
        elif alert_type == "high_error_rate":
            error_rate = metadata.get('error_rate', 0)
            if error_rate > 10:
                return "critical"
            elif error_rate > 5:
                return "high"
            else:
                return "medium"
        
        return "low"
    
    async def send_alert_notification(self, alert: Dict):
        """
        Send alert notification via multiple channels
        """
        
        # Email notification
        await self.send_alert_email(alert)
        
        # Slack notification (if configured)
        if os.getenv('SLACK_WEBHOOK_URL'):
            await self.send_slack_alert(alert)
        
        # Discord notification (if configured)
        if os.getenv('DISCORD_WEBHOOK_URL'):
            await self.send_discord_alert(alert)
    
    async def get_performance_report(self, days: int = 7) -> Dict:
        """
        Generate comprehensive performance report
        """
        
        end_date = datetime.now()
        start_date = end_date - timedelta(days=days)
        
        # Query database for historical data
        metrics_data = await self.query_metrics_database(start_date, end_date)
        
        # Analyze trends
        trends = await self.analyze_performance_trends_data(metrics_data)
        
        # Generate recommendations
        recommendations = await self.generate_performance_recommendations(metrics_data, trends)
        
        return {
            'period': {
                'start_date': start_date.isoformat(),
                'end_date': end_date.isoformat(),
                'days': days
            },
            'summary': {
                'total_requests': len([m for m in metrics_data if m['metric_name'] == 'api_call']),
                'avg_response_time': self.calculate_avg_response_time(metrics_data),
                'error_rate': self.calculate_error_rate(metrics_data),
                'uptime_percentage': self.calculate_uptime(metrics_data)
            },
            'trends': trends,
            'top_endpoints': await self.get_top_endpoints(metrics_data),
            'slowest_endpoints': await self.get_slowest_endpoints(metrics_data),
            'recommendations': recommendations,
            'cost_analysis': await self.generate_cost_analysis(metrics_data)
        }
    
    # Background tasks
    async def collect_system_metrics(self):
        """
        Background task to collect system metrics
        """
        
        while True:
            try:
                system_health = await self.get_system_health()
                
                # Store system metrics
                await self.store_system_metrics(system_health)
                
                # Check for alerts
                if system_health.status != "healthy":
                    await self.trigger_system_alert(system_health)
                
                # Wait 30 seconds
                await asyncio.sleep(30)
                
            except Exception as e:
                self.logger.error(f"Error collecting system metrics: {e}")
                await asyncio.sleep(60)  # Wait longer on error
    
    async def analyze_performance_trends(self):
        """
        Background task to analyze performance trends
        """
        
        while True:
            try:
                # Run every 15 minutes
                await asyncio.sleep(900)
                
                # Analyze recent trends
                trends = await self.detect_performance_trends()
                
                # Generate proactive alerts
                for trend in trends:
                    if trend['severity'] in ['high', 'critical']:
                        await self.trigger_trend_alert(trend)
                
            except Exception as e:
                self.logger.error(f"Error analyzing trends: {e}")
    
    async def cleanup_old_metrics(self):
        """
        Background task to cleanup old metrics
        """
        
        while True:
            try:
                # Run daily
                await asyncio.sleep(86400)
                
                # Clean up metrics older than 30 days
                cutoff_date = datetime.now() - timedelta(days=30)
                await self.cleanup_metrics_database(cutoff_date)
                
                # Clean up Redis keys
                await self.cleanup_redis_metrics()
                
            except Exception as e:
                self.logger.error(f"Error cleaning up metrics: {e}")
    
    # Helper methods for database operations
    async def store_metric_redis(self, metric: PerformanceMetric):
        """Store metric in Redis for fast access"""
        key = f"metrics:{metric.metric_name}:{metric.timestamp.strftime('%Y-%m-%d-%H')}"
        await self.redis_client.lpush(key, json.dumps(asdict(metric), default=str))
        await self.redis_client.expire(key, 86400)  # Expire after 24 hours
    
    async def store_metric_database(self, metric: PerformanceMetric, error_message: Optional[str] = None):
        """Store metric in database for long-term storage"""
        async with httpx.AsyncClient() as client:
            await client.post(
                f"{self.supabase_url}/rest/v1/performance_metrics",
                json={
                    "timestamp": metric.timestamp.isoformat(),
                    "metric_name": metric.metric_name,
                    "value": metric.value,
                    "tags": metric.tags,
                    "unit": metric.unit,
                    "error_message": error_message
                },
                headers={
                    "apikey": self.supabase_key,
                    "Authorization": f"Bearer {self.supabase_key}",
                    "Content-Type": "application/json"
                }
            )
    
    # Placeholder methods (implement based on specific requirements)
    async def get_active_alerts(self) -> List[Dict]:
        """Get currently active alerts"""
        return []  # Placeholder
    
    async def calculate_daily_revenue(self) -> float:
        """Calculate today's revenue"""
        return 0.0  # Placeholder
    
    async def get_user_satisfaction_score(self) -> float:
        """Get user satisfaction score"""
        return 85.0  # Placeholder
    
    async def store_alert(self, alert: Dict):
        """Store alert in database"""
        pass  # Placeholder
    
    async def send_alert_email(self, alert: Dict):
        """Send alert via email"""
        pass  # Placeholder
    
    async def send_slack_alert(self, alert: Dict):
        """Send alert to Slack"""
        pass  # Placeholder
    
    async def send_discord_alert(self, alert: Dict):
        """Send alert to Discord"""
        pass  # Placeholder