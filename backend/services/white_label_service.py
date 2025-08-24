"""
White Label Service for JobFlow
Enables custom branding and multi-tenant architecture
"""

from typing import Dict, List, Optional
import json
import os
from datetime import datetime
import httpx
from fastapi import HTTPException
import boto3
from PIL import Image, ImageDraw, ImageFont
import io

class WhiteLabelService:
    """Manages white label configurations and branding"""
    
    def __init__(self):
        self.s3_client = boto3.client(
            's3',
            aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
            aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY'),
            region_name=os.getenv('AWS_REGION', 'us-east-1')
        )
        self.bucket_name = os.getenv('S3_BUCKET_NAME', 'jobflow-white-label')
        self.supabase_url = os.getenv('SUPABASE_URL')
        self.supabase_key = os.getenv('SUPABASE_SERVICE_KEY')
    
    async def create_white_label_tenant(
        self, 
        organization_id: str, 
        config: Dict
    ) -> Dict:
        """
        Create new white label tenant configuration
        """
        
        tenant_config = {
            'organization_id': organization_id,
            'tenant_id': f"tenant_{organization_id}",
            'branding': {
                'company_name': config['company_name'],
                'logo_url': None,
                'primary_color': config.get('primary_color', '#3B82F6'),
                'secondary_color': config.get('secondary_color', '#1E40AF'),
                'accent_color': config.get('accent_color', '#10B981'),
                'font_family': config.get('font_family', 'Inter'),
                'custom_css': config.get('custom_css', ''),
                'favicon_url': None
            },
            'domain': {
                'custom_domain': config.get('custom_domain'),
                'subdomain': config.get('subdomain', f"{organization_id}.jobflow.ai"),
                'ssl_enabled': True,
                'domain_verified': False
            },
            'features': {
                'job_search': config.get('enable_job_search', True),
                'ai_resume_generation': config.get('enable_ai_resume', True),
                'interview_prep': config.get('enable_interview_prep', True),
                'analytics': config.get('enable_analytics', True),
                'api_access': config.get('enable_api', False),
                'custom_integrations': config.get('enable_integrations', False)
            },
            'limits': {
                'max_users': config.get('max_users', 100),
                'searches_per_user': config.get('searches_per_user', 50),
                'ai_generations_per_user': config.get('ai_generations_per_user', 20),
                'api_calls_per_month': config.get('api_calls_per_month', 10000)
            },
            'email_settings': {
                'from_email': config.get('from_email', f"noreply@{config['company_name'].lower().replace(' ', '')}.com"),
                'from_name': config.get('from_name', config['company_name']),
                'smtp_settings': config.get('smtp_settings', {}),
                'email_templates': await self.generate_default_email_templates(config['company_name'])
            },
            'integrations': {
                'job_boards': config.get('job_boards', ['indeed', 'adzuna']),
                'ats_systems': config.get('ats_systems', []),
                'calendar_integration': config.get('calendar_integration', 'google'),
                'crm_integration': config.get('crm_integration', None)
            },
            'created_at': datetime.now().isoformat(),
            'status': 'pending_setup',
            'pricing_tier': config.get('pricing_tier', 'professional')
        }
        
        # Save tenant configuration to database
        await self.save_tenant_config(tenant_config)
        
        # Generate branded assets
        await self.generate_branded_assets(tenant_config)
        
        # Setup DNS records
        await self.setup_domain_records(tenant_config)
        
        return {
            'tenant_id': tenant_config['tenant_id'],
            'subdomain': tenant_config['domain']['subdomain'],
            'status': 'created',
            'setup_url': f"https://admin.jobflow.ai/white-label/{tenant_config['tenant_id']}/setup",
            'next_steps': [
                'Upload company logo and favicon',
                'Customize email templates',
                'Configure domain settings',
                'Test branded experience',
                'Go live with custom domain'
            ]
        }
    
    async def upload_branded_assets(
        self, 
        tenant_id: str, 
        assets: Dict
    ) -> Dict:
        """
        Upload and process branded assets (logo, favicon, etc.)
        """
        
        uploaded_assets = {}
        
        # Process logo
        if 'logo' in assets:
            logo_url = await self.process_and_upload_logo(
                tenant_id, 
                assets['logo']
            )
            uploaded_assets['logo_url'] = logo_url
        
        # Process favicon
        if 'favicon' in assets:
            favicon_url = await self.process_and_upload_favicon(
                tenant_id, 
                assets['favicon']
            )
            uploaded_assets['favicon_url'] = favicon_url
        
        # Process additional brand assets
        if 'email_header' in assets:
            email_header_url = await self.process_and_upload_email_header(
                tenant_id,
                assets['email_header']
            )
            uploaded_assets['email_header_url'] = email_header_url
        
        # Update tenant configuration
        await self.update_tenant_branding(tenant_id, uploaded_assets)
        
        return uploaded_assets
    
    async def process_and_upload_logo(
        self, 
        tenant_id: str, 
        logo_data: bytes
    ) -> str:
        """
        Process logo image and upload to S3
        """
        
        # Open image
        image = Image.open(io.BytesIO(logo_data))
        
        # Generate multiple logo sizes
        logo_sizes = {
            'full': (400, 100),      # Full logo for headers
            'compact': (120, 40),    # Compact logo for mobile
            'icon': (64, 64),        # Icon version
            'large': (800, 200)      # Large version for emails
        }
        
        uploaded_logos = {}
        
        for size_name, (width, height) in logo_sizes.items():
            # Resize image maintaining aspect ratio
            resized_image = self.resize_image_with_padding(image, width, height)
            
            # Convert to bytes
            image_bytes = io.BytesIO()
            resized_image.save(image_bytes, format='PNG', optimize=True)
            image_bytes.seek(0)
            
            # Upload to S3
            key = f"tenants/{tenant_id}/branding/logo_{size_name}.png"
            
            self.s3_client.put_object(
                Bucket=self.bucket_name,
                Key=key,
                Body=image_bytes.getvalue(),
                ContentType='image/png',
                CacheControl='max-age=31536000'  # 1 year cache
            )
            
            # Generate public URL
            logo_url = f"https://{self.bucket_name}.s3.amazonaws.com/{key}"
            uploaded_logos[f"logo_{size_name}_url"] = logo_url
        
        return uploaded_logos['logo_full_url']
    
    async def process_and_upload_favicon(
        self, 
        tenant_id: str, 
        favicon_data: bytes
    ) -> str:
        """
        Process favicon and generate multiple formats
        """
        
        # Open image
        image = Image.open(io.BytesIO(favicon_data))
        
        # Generate favicon sizes
        favicon_sizes = [16, 32, 48, 64, 128]
        
        for size in favicon_sizes:
            # Resize to square
            favicon_image = image.resize((size, size), Image.Resampling.LANCZOS)
            
            # Convert to bytes
            favicon_bytes = io.BytesIO()
            favicon_image.save(favicon_bytes, format='PNG', optimize=True)
            favicon_bytes.seek(0)
            
            # Upload to S3
            key = f"tenants/{tenant_id}/branding/favicon_{size}x{size}.png"
            
            self.s3_client.put_object(
                Bucket=self.bucket_name,
                Key=key,
                Body=favicon_bytes.getvalue(),
                ContentType='image/png',
                CacheControl='max-age=31536000'
            )
        
        # Generate ICO file
        ico_key = f"tenants/{tenant_id}/branding/favicon.ico"
        await self.generate_ico_file(tenant_id, image)
        
        return f"https://{self.bucket_name}.s3.amazonaws.com/{ico_key}"
    
    async def customize_email_templates(
        self, 
        tenant_id: str, 
        templates: Dict
    ) -> Dict:
        """
        Customize email templates for white label tenant
        """
        
        tenant_config = await self.get_tenant_config(tenant_id)
        branding = tenant_config['branding']
        
        customized_templates = {}
        
        for template_name, template_content in templates.items():
            # Replace placeholder variables
            customized_content = template_content.replace(
                '{{COMPANY_NAME}}', branding['company_name']
            ).replace(
                '{{PRIMARY_COLOR}}', branding['primary_color']
            ).replace(
                '{{LOGO_URL}}', branding['logo_url'] or ''
            ).replace(
                '{{SUPPORT_EMAIL}}', tenant_config['email_settings']['from_email']
            )
            
            customized_templates[template_name] = customized_content
            
            # Save to database
            await self.save_email_template(tenant_id, template_name, customized_content)
        
        return customized_templates
    
    async def setup_domain_records(self, tenant_config: Dict) -> Dict:
        """
        Setup DNS records for custom domain
        """
        
        domain_info = tenant_config['domain']
        
        dns_records = {
            'cname_record': {
                'name': domain_info['subdomain'].split('.')[0],
                'value': 'jobflow.ai',
                'type': 'CNAME'
            },
            'verification_record': {
                'name': f"_jobflow-verify.{domain_info['subdomain']}",
                'value': f"jobflow-verify={tenant_config['tenant_id']}",
                'type': 'TXT'
            }
        }
        
        if domain_info.get('custom_domain'):
            dns_records['custom_cname'] = {
                'name': domain_info['custom_domain'],
                'value': 'jobflow.ai',
                'type': 'CNAME'
            }
        
        # Save DNS configuration
        await self.save_dns_config(tenant_config['tenant_id'], dns_records)
        
        return dns_records
    
    async def verify_domain(self, tenant_id: str) -> Dict:
        """
        Verify domain ownership and enable SSL
        """
        
        tenant_config = await self.get_tenant_config(tenant_id)
        domain = tenant_config['domain']['subdomain']
        
        # Check DNS propagation
        dns_verified = await self.check_dns_propagation(domain, tenant_id)
        
        if dns_verified:
            # Enable SSL certificate
            ssl_enabled = await self.enable_ssl_certificate(domain)
            
            # Update tenant status
            await self.update_tenant_domain_status(
                tenant_id, 
                verified=True, 
                ssl_enabled=ssl_enabled
            )
            
            return {
                'domain_verified': True,
                'ssl_enabled': ssl_enabled,
                'live_url': f"https://{domain}",
                'status': 'active'
            }
        else:
            return {
                'domain_verified': False,
                'ssl_enabled': False,
                'next_steps': [
                    'Ensure DNS records are properly configured',
                    'Wait for DNS propagation (up to 24 hours)',
                    'Contact support if issues persist'
                ]
            }
    
    async def generate_tenant_css(
        self, 
        tenant_id: str, 
        branding: Dict
    ) -> str:
        """
        Generate custom CSS for tenant branding
        """
        
        css_template = f"""
        :root {{
            --primary-color: {branding['primary_color']};
            --secondary-color: {branding['secondary_color']};
            --accent-color: {branding['accent_color']};
            --font-family: '{branding['font_family']}', sans-serif;
        }}
        
        .brand-logo {{
            background-image: url('{branding.get('logo_url', '')}');
            background-size: contain;
            background-repeat: no-repeat;
            background-position: center;
        }}
        
        .btn-primary {{
            background-color: var(--primary-color);
            border-color: var(--primary-color);
        }}
        
        .btn-primary:hover {{
            background-color: var(--secondary-color);
            border-color: var(--secondary-color);
        }}
        
        .navbar-brand {{
            font-family: var(--font-family);
            color: var(--primary-color);
        }}
        
        .text-primary {{
            color: var(--primary-color) !important;
        }}
        
        .bg-primary {{
            background-color: var(--primary-color) !important;
        }}
        
        .border-primary {{
            border-color: var(--primary-color) !important;
        }}
        
        /* Custom styles */
        {branding.get('custom_css', '')}
        """
        
        # Upload CSS to S3
        css_key = f"tenants/{tenant_id}/assets/custom.css"
        
        self.s3_client.put_object(
            Bucket=self.bucket_name,
            Key=css_key,
            Body=css_template.encode('utf-8'),
            ContentType='text/css',
            CacheControl='max-age=3600'  # 1 hour cache
        )
        
        css_url = f"https://{self.bucket_name}.s3.amazonaws.com/{css_key}"
        
        # Update tenant configuration
        await self.update_tenant_assets(tenant_id, {'css_url': css_url})
        
        return css_url
    
    async def get_tenant_config(self, tenant_id: str) -> Dict:
        """
        Get tenant configuration from database
        """
        
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.supabase_url}/rest/v1/white_label_tenants",
                params={"tenant_id": f"eq.{tenant_id}"},
                headers={
                    "apikey": self.supabase_key,
                    "Authorization": f"Bearer {self.supabase_key}"
                }
            )
            
            tenants = response.json()
            if tenants:
                return tenants[0]
            else:
                raise HTTPException(status_code=404, detail="Tenant not found")
    
    async def get_tenant_by_domain(self, domain: str) -> Optional[Dict]:
        """
        Get tenant configuration by domain
        """
        
        async with httpx.AsyncClient() as client:
            # Check subdomain
            response = await client.get(
                f"{self.supabase_url}/rest/v1/white_label_tenants",
                params={"subdomain": f"eq.{domain}"},
                headers={
                    "apikey": self.supabase_key,
                    "Authorization": f"Bearer {self.supabase_key}"
                }
            )
            
            tenants = response.json()
            if tenants:
                return tenants[0]
            
            # Check custom domain
            response = await client.get(
                f"{self.supabase_url}/rest/v1/white_label_tenants",
                params={"custom_domain": f"eq.{domain}"},
                headers={
                    "apikey": self.supabase_key,
                    "Authorization": f"Bearer {self.supabase_key}"
                }
            )
            
            tenants = response.json()
            if tenants:
                return tenants[0]
            
            return None
    
    # Helper methods
    async def save_tenant_config(self, config: Dict):
        """Save tenant configuration to database"""
        async with httpx.AsyncClient() as client:
            await client.post(
                f"{self.supabase_url}/rest/v1/white_label_tenants",
                json=config,
                headers={
                    "apikey": self.supabase_key,
                    "Authorization": f"Bearer {self.supabase_key}",
                    "Content-Type": "application/json"
                }
            )
    
    async def generate_default_email_templates(self, company_name: str) -> Dict:
        """Generate default email templates for tenant"""
        return {
            'welcome': f"""
            <h1>Welcome to {company_name} Job Search Platform</h1>
            <p>Thank you for joining our platform. We're excited to help you find your dream job!</p>
            """,
            'job_alert': f"""
            <h2>New Job Opportunities from {company_name}</h2>
            <p>We've found some new job opportunities that match your profile.</p>
            """,
            'application_confirmation': f"""
            <h2>Application Submitted Successfully</h2>
            <p>Your application has been submitted through {company_name} platform.</p>
            """
        }
    
    def resize_image_with_padding(self, image: Image.Image, width: int, height: int) -> Image.Image:
        """Resize image with padding to maintain aspect ratio"""
        # Calculate aspect ratios
        img_aspect = image.width / image.height
        target_aspect = width / height
        
        if img_aspect > target_aspect:
            # Image is wider, fit to width
            new_width = width
            new_height = int(width / img_aspect)
        else:
            # Image is taller, fit to height
            new_height = height
            new_width = int(height * img_aspect)
        
        # Resize image
        resized_image = image.resize((new_width, new_height), Image.Resampling.LANCZOS)
        
        # Create new image with padding
        padded_image = Image.new('RGBA', (width, height), (255, 255, 255, 0))
        
        # Calculate padding
        x_offset = (width - new_width) // 2
        y_offset = (height - new_height) // 2
        
        # Paste resized image onto padded image
        padded_image.paste(resized_image, (x_offset, y_offset))
        
        return padded_image
    
    async def generate_ico_file(self, tenant_id: str, image: Image.Image):
        """Generate ICO file from image"""
        # This is a simplified version - in production you'd use a proper ICO library
        favicon_16 = image.resize((16, 16), Image.Resampling.LANCZOS)
        
        ico_bytes = io.BytesIO()
        favicon_16.save(ico_bytes, format='PNG')
        ico_bytes.seek(0)
        
        key = f"tenants/{tenant_id}/branding/favicon.ico"
        
        self.s3_client.put_object(
            Bucket=self.bucket_name,
            Key=key,
            Body=ico_bytes.getvalue(),
            ContentType='image/x-icon',
            CacheControl='max-age=31536000'
        )
    
    async def check_dns_propagation(self, domain: str, tenant_id: str) -> bool:
        """Check if DNS records have propagated"""
        # This would use DNS lookup libraries in production
        # For now, return True as a placeholder
        return True
    
    async def enable_ssl_certificate(self, domain: str) -> bool:
        """Enable SSL certificate for domain"""
        # This would integrate with Let's Encrypt or similar in production
        return True
    
    async def update_tenant_domain_status(self, tenant_id: str, verified: bool, ssl_enabled: bool):
        """Update tenant domain verification status"""
        async with httpx.AsyncClient() as client:
            await client.patch(
                f"{self.supabase_url}/rest/v1/white_label_tenants",
                params={"tenant_id": f"eq.{tenant_id}"},
                json={
                    "domain_verified": verified,
                    "ssl_enabled": ssl_enabled,
                    "status": "active" if verified else "pending_setup"
                },
                headers={
                    "apikey": self.supabase_key,
                    "Authorization": f"Bearer {self.supabase_key}",
                    "Content-Type": "application/json"
                }
            )
    
    async def update_tenant_branding(self, tenant_id: str, assets: Dict):
        """Update tenant branding assets"""
        async with httpx.AsyncClient() as client:
            await client.patch(
                f"{self.supabase_url}/rest/v1/white_label_tenants",
                params={"tenant_id": f"eq.{tenant_id}"},
                json={"branding": assets},
                headers={
                    "apikey": self.supabase_key,
                    "Authorization": f"Bearer {self.supabase_key}",
                    "Content-Type": "application/json"
                }
            )
    
    async def update_tenant_assets(self, tenant_id: str, assets: Dict):
        """Update tenant asset URLs"""
        async with httpx.AsyncClient() as client:
            await client.patch(
                f"{self.supabase_url}/rest/v1/white_label_tenants",
                params={"tenant_id": f"eq.{tenant_id}"},
                json=assets,
                headers={
                    "apikey": self.supabase_key,
                    "Authorization": f"Bearer {self.supabase_key}",
                    "Content-Type": "application/json"
                }
            )
    
    async def save_email_template(self, tenant_id: str, template_name: str, content: str):
        """Save email template to database"""
        async with httpx.AsyncClient() as client:
            await client.post(
                f"{self.supabase_url}/rest/v1/email_templates",
                json={
                    "tenant_id": tenant_id,
                    "template_name": template_name,
                    "content": content,
                    "created_at": datetime.now().isoformat()
                },
                headers={
                    "apikey": self.supabase_key,
                    "Authorization": f"Bearer {self.supabase_key}",
                    "Content-Type": "application/json"
                }
            )
    
    async def save_dns_config(self, tenant_id: str, dns_records: Dict):
        """Save DNS configuration"""
        async with httpx.AsyncClient() as client:
            await client.post(
                f"{self.supabase_url}/rest/v1/dns_configurations",
                json={
                    "tenant_id": tenant_id,
                    "dns_records": dns_records,
                    "created_at": datetime.now().isoformat()
                },
                headers={
                    "apikey": self.supabase_key,
                    "Authorization": f"Bearer {self.supabase_key}",
                    "Content-Type": "application/json"
                }
            )