"""
Stripe Payment Service for JobFlow SaaS
Handles subscriptions, payments, and webhooks
"""

import os
import stripe
from typing import Dict, Optional
from datetime import datetime
import httpx
from dotenv import load_dotenv

load_dotenv()

stripe.api_key = os.getenv('STRIPE_SECRET_KEY')

class StripeService:
    """Manages Stripe subscriptions and payments"""
    
    def __init__(self):
        self.stripe = stripe
        self.webhook_secret = os.getenv('STRIPE_WEBHOOK_SECRET')
        self.price_id = os.getenv('STRIPE_PRICE_ID', 'price_1OXxxxxxxxxxxxxxx')
        self.supabase_url = os.getenv('SUPABASE_URL')
        self.supabase_key = os.getenv('SUPABASE_SERVICE_KEY')
        
    async def create_checkout_session(
        self, 
        user_id: str, 
        email: str,
        success_url: str = None,
        cancel_url: str = None
    ) -> Optional[stripe.checkout.Session]:
        """
        Create Stripe checkout session for subscription
        """
        
        if not success_url:
            success_url = f"{os.getenv('NEXT_PUBLIC_APP_URL')}/dashboard?subscription=success"
        
        if not cancel_url:
            cancel_url = f"{os.getenv('NEXT_PUBLIC_APP_URL')}/billing?subscription=cancelled"
        
        try:
            # Check if customer exists
            customer = await self.get_or_create_customer(user_id, email)
            
            # Create checkout session
            session = stripe.checkout.Session.create(
                customer=customer.id,
                payment_method_types=['card'],
                line_items=[{
                    'price': self.price_id,
                    'quantity': 1,
                }],
                mode='subscription',
                success_url=success_url,
                cancel_url=cancel_url,
                metadata={
                    'user_id': user_id
                },
                subscription_data={
                    'metadata': {
                        'user_id': user_id
                    }
                },
                allow_promotion_codes=True,
            )
            
            return session
            
        except stripe.error.StripeError as e:
            print(f"Stripe error: {e}")
            return None
    
    async def get_or_create_customer(self, user_id: str, email: str) -> stripe.Customer:
        """
        Get existing Stripe customer or create new one
        """
        
        # Search for existing customer
        customers = stripe.Customer.list(email=email, limit=1)
        
        if customers.data:
            customer = customers.data[0]
            # Update metadata if needed
            if not customer.metadata.get('user_id'):
                stripe.Customer.modify(
                    customer.id,
                    metadata={'user_id': user_id}
                )
        else:
            # Create new customer
            customer = stripe.Customer.create(
                email=email,
                metadata={'user_id': user_id}
            )
        
        # Save customer ID to database
        await self.update_user_stripe_customer(user_id, customer.id)
        
        return customer
    
    async def cancel_subscription(self, subscription_id: str) -> bool:
        """
        Cancel a subscription
        """
        
        try:
            subscription = stripe.Subscription.modify(
                subscription_id,
                cancel_at_period_end=True
            )
            return True
        except stripe.error.StripeError as e:
            print(f"Error cancelling subscription: {e}")
            return False
    
    async def reactivate_subscription(self, subscription_id: str) -> bool:
        """
        Reactivate a cancelled subscription
        """
        
        try:
            subscription = stripe.Subscription.modify(
                subscription_id,
                cancel_at_period_end=False
            )
            return True
        except stripe.error.StripeError as e:
            print(f"Error reactivating subscription: {e}")
            return False
    
    async def create_billing_portal_session(
        self, 
        customer_id: str,
        return_url: str = None
    ) -> Optional[stripe.billing_portal.Session]:
        """
        Create billing portal session for customer to manage subscription
        """
        
        if not return_url:
            return_url = f"{os.getenv('NEXT_PUBLIC_APP_URL')}/billing"
        
        try:
            session = stripe.billing_portal.Session.create(
                customer=customer_id,
                return_url=return_url,
            )
            return session
        except stripe.error.StripeError as e:
            print(f"Error creating billing portal: {e}")
            return None
    
    async def handle_webhook(self, payload: bytes, signature: str) -> bool:
        """
        Handle Stripe webhook events
        """
        
        try:
            # Verify webhook signature
            event = stripe.Webhook.construct_event(
                payload, signature, self.webhook_secret
            )
        except ValueError:
            print("Invalid payload")
            return False
        except stripe.error.SignatureVerificationError:
            print("Invalid signature")
            return False
        
        # Handle different event types
        if event['type'] == 'customer.subscription.created':
            await self.handle_subscription_created(event['data']['object'])
            
        elif event['type'] == 'customer.subscription.updated':
            await self.handle_subscription_updated(event['data']['object'])
            
        elif event['type'] == 'customer.subscription.deleted':
            await self.handle_subscription_deleted(event['data']['object'])
            
        elif event['type'] == 'invoice.payment_succeeded':
            await self.handle_payment_succeeded(event['data']['object'])
            
        elif event['type'] == 'invoice.payment_failed':
            await self.handle_payment_failed(event['data']['object'])
        
        # Log webhook event
        await self.log_webhook_event(event)
        
        return True
    
    async def handle_subscription_created(self, subscription: Dict):
        """
        Handle new subscription creation
        """
        
        user_id = subscription['metadata'].get('user_id')
        if not user_id:
            return
        
        # Update user subscription status
        await self.update_user_subscription(
            user_id=user_id,
            subscription_id=subscription['id'],
            status='active',
            current_period_end=subscription['current_period_end']
        )
        
        # Send welcome email
        # await EmailService.send_subscription_welcome(user_id)
    
    async def handle_subscription_updated(self, subscription: Dict):
        """
        Handle subscription updates (renewals, plan changes)
        """
        
        user_id = subscription['metadata'].get('user_id')
        if not user_id:
            return
        
        status = 'active' if subscription['status'] == 'active' else subscription['status']
        
        await self.update_user_subscription(
            user_id=user_id,
            subscription_id=subscription['id'],
            status=status,
            current_period_end=subscription['current_period_end']
        )
    
    async def handle_subscription_deleted(self, subscription: Dict):
        """
        Handle subscription cancellation
        """
        
        user_id = subscription['metadata'].get('user_id')
        if not user_id:
            return
        
        await self.update_user_subscription(
            user_id=user_id,
            subscription_id=subscription['id'],
            status='cancelled',
            current_period_end=subscription['current_period_end']
        )
        
        # Send cancellation email
        # await EmailService.send_subscription_cancelled(user_id)
    
    async def handle_payment_succeeded(self, invoice: Dict):
        """
        Handle successful payment
        """
        
        subscription_id = invoice['subscription']
        if not subscription_id:
            return
        
        # Log successful payment
        await self.log_payment(
            subscription_id=subscription_id,
            amount=invoice['amount_paid'],
            status='succeeded'
        )
    
    async def handle_payment_failed(self, invoice: Dict):
        """
        Handle failed payment
        """
        
        subscription_id = invoice['subscription']
        customer_email = invoice['customer_email']
        
        # Log failed payment
        await self.log_payment(
            subscription_id=subscription_id,
            amount=invoice['amount_due'],
            status='failed'
        )
        
        # Send payment failed email
        # await EmailService.send_payment_failed(customer_email)
    
    async def update_user_stripe_customer(self, user_id: str, customer_id: str):
        """
        Update user's Stripe customer ID in database
        """
        
        async with httpx.AsyncClient() as client:
            await client.patch(
                f"{self.supabase_url}/rest/v1/profiles",
                params={"id": f"eq.{user_id}"},
                json={"stripe_customer_id": customer_id},
                headers={
                    "apikey": self.supabase_key,
                    "Authorization": f"Bearer {self.supabase_key}",
                    "Content-Type": "application/json"
                }
            )
    
    async def update_user_subscription(
        self, 
        user_id: str, 
        subscription_id: str,
        status: str,
        current_period_end: int
    ):
        """
        Update user's subscription status in database
        """
        
        period_end_date = datetime.fromtimestamp(current_period_end).isoformat()
        
        async with httpx.AsyncClient() as client:
            await client.patch(
                f"{self.supabase_url}/rest/v1/profiles",
                params={"id": f"eq.{user_id}"},
                json={
                    "stripe_subscription_id": subscription_id,
                    "subscription_status": status,
                    "subscription_end_date": period_end_date,
                    "searches_remaining": 999999 if status == 'active' else None
                },
                headers={
                    "apikey": self.supabase_key,
                    "Authorization": f"Bearer {self.supabase_key}",
                    "Content-Type": "application/json"
                }
            )
    
    async def log_webhook_event(self, event: Dict):
        """
        Log webhook event to database
        """
        
        async with httpx.AsyncClient() as client:
            await client.post(
                f"{self.supabase_url}/rest/v1/subscription_events",
                json={
                    "stripe_event_id": event['id'],
                    "event_type": event['type'],
                    "event_data": event['data'],
                    "processed": True
                },
                headers={
                    "apikey": self.supabase_key,
                    "Authorization": f"Bearer {self.supabase_key}",
                    "Content-Type": "application/json"
                }
            )
    
    async def log_payment(self, subscription_id: str, amount: int, status: str):
        """
        Log payment to database
        """
        
        # Implementation for payment logging
        pass
    
    async def get_subscription_status(self, subscription_id: str) -> Optional[Dict]:
        """
        Get subscription details from Stripe
        """
        
        try:
            subscription = stripe.Subscription.retrieve(subscription_id)
            return {
                'status': subscription.status,
                'cancel_at_period_end': subscription.cancel_at_period_end,
                'current_period_end': subscription.current_period_end,
                'plan': subscription.items.data[0].price.nickname if subscription.items.data else None
            }
        except stripe.error.StripeError:
            return None