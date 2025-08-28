#!/usr/bin/env python3
"""
Cross-platform start script for JobFlow Clean
Works on Windows, Mac, and Linux
"""

import os
import sys
import subprocess
import platform

def check_requirements():
    """Check if all requirements are installed"""
    print("Checking requirements...")
    
    # Check Python packages
    try:
        import fastapi
        import openai
        import supabase
        print("✓ Python packages installed")
    except ImportError as e:
        print(f"✗ Missing Python package: {e}")
        print("Run: pip install -r requirements.txt")
        return False
    
    # Check Node modules
    if not os.path.exists('node_modules'):
        print("✗ Node modules not installed")
        print("Run: npm install")
        return False
    print("✓ Node modules installed")
    
    # Check environment file
    if not os.path.exists('.env.local'):
        print("✗ .env.local not found")
        print("Copy .env.local.example to .env.local and add your keys")
        return False
    print("✓ Environment file found")
    
    return True

def start_services():
    """Start both frontend and backend services"""
    system = platform.system()
    
    print("\n" + "="*50)
    print("Starting JobFlow Clean Services")
    print("="*50)
    
    # Start Next.js frontend
    print("\n1. Starting Next.js frontend...")
    if system == "Windows":
        frontend_cmd = "npm run dev"
    else:
        frontend_cmd = "npm run dev"
    
    frontend_process = subprocess.Popen(
        frontend_cmd, 
        shell=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE
    )
    
    # Start Python backend (if needed)
    print("2. Starting Python email service...")
    backend_cmd = f"{sys.executable} run_email_delivery.py"
    
    backend_process = subprocess.Popen(
        backend_cmd,
        shell=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE
    )
    
    print("\n" + "="*50)
    print("Services Started Successfully!")
    print("="*50)
    print("\n📱 Frontend: http://localhost:3000")
    print("📧 Email Service: Running (check logs)")
    print("\nPress Ctrl+C to stop all services")
    print("="*50)
    
    try:
        # Keep running until interrupted
        frontend_process.wait()
    except KeyboardInterrupt:
        print("\n\nStopping services...")
        frontend_process.terminate()
        backend_process.terminate()
        print("Services stopped.")

def main():
    """Main entry point"""
    if not check_requirements():
        print("\n❌ Please fix the issues above before starting.")
        sys.exit(1)
    
    start_services()

if __name__ == "__main__":
    main()