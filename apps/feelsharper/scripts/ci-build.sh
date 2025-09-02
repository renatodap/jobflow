#!/bin/bash

# CI Build Script for debugging build issues
echo "=== CI Build Script Started ==="
echo "Node version: $(node -v)"
echo "NPM version: $(npm -v)"
echo "Current directory: $(pwd)"
echo "Directory contents:"
ls -la

# Check if package.json exists
if [ ! -f "package.json" ]; then
    echo "ERROR: package.json not found"
    exit 1
fi

# Check environment variables
echo ""
echo "=== Environment Check ==="
if [ -f ".env.local" ]; then
    echo "✅ .env.local exists"
    echo "File size: $(wc -c < .env.local) bytes"
else
    echo "⚠️  .env.local not found, creating with defaults..."
    cat > .env.local << 'EOF'
NEXT_PUBLIC_SUPABASE_URL=https://dummy.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy_service
ANTHROPIC_API_KEY=sk-ant-dummy-key
OPENAI_API_KEY=sk-dummy-openai-key
EOF
fi

# Clean any previous builds
echo ""
echo "=== Cleaning Previous Builds ==="
if [ -d ".next" ]; then
    echo "Removing existing .next directory..."
    rm -rf .next
fi

# Run the build
echo ""
echo "=== Starting Next.js Build ==="
npm run build 2>&1 | tee build.log

BUILD_EXIT_CODE=${PIPESTATUS[0]}

echo ""
echo "=== Build Result ==="
echo "Build exit code: $BUILD_EXIT_CODE"

# Check if .next directory was created
if [ -d ".next" ]; then
    echo "✅ .next directory created successfully"
    echo "Directory size: $(du -sh .next/ | cut -f1)"
    echo "Directory contents (first 10 files):"
    ls -la .next/ | head -11
else
    echo "❌ .next directory was not created"
    echo ""
    echo "=== Build Log Tail ==="
    tail -50 build.log
    echo ""
    echo "=== Creating fallback .next directory ==="
    mkdir -p .next
    echo "Build failed at $(date)" > .next/build-failed.txt
    cp build.log .next/build.log 2>/dev/null || true
fi

exit $BUILD_EXIT_CODE