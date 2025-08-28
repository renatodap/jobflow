#!/usr/bin/env python
"""
JobFlow Email Delivery Runner
Run this script to start the automated email delivery system
"""

import os
import sys
import argparse
from datetime import datetime

# Add core directory to path
sys.path.append(os.path.join(os.path.dirname(__file__), 'core'))

from services.email_job_delivery import EmailJobDeliveryService

def main():
    parser = argparse.ArgumentParser(description='JobFlow Email Delivery System')
    parser.add_argument('--now', action='store_true', 
                        help='Run immediate delivery instead of scheduled')
    parser.add_argument('--test', action='store_true',
                        help='Run in test mode with sample data')
    
    args = parser.parse_args()
    
    print("=" * 60)
    print("JobFlow Email Delivery System")
    print("=" * 60)
    
    service = EmailJobDeliveryService()
    
    if args.test:
        print(f"Running in TEST mode at {datetime.now()}")
        print("Using sample user data for testing...")
        service.run_daily_delivery()
    elif args.now:
        print(f"Running immediate delivery at {datetime.now()}")
        service.run_daily_delivery()
    else:
        print("Starting scheduled email delivery service...")
        print("Emails will be sent at:")
        print("  - 9:00 AM daily")
        print("  - 5:00 PM for twice-daily subscribers")
        print("  - Monday 9:00 AM for weekly subscribers")
        print("\nPress Ctrl+C to stop the service")
        print("=" * 60)
        service.schedule_deliveries()

if __name__ == "__main__":
    main()