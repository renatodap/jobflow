#!/bin/bash

# 🌳 BRANCH SETUP SCRIPT - Initialize all product branches
# Run this once to set up the entire branch structure

echo "🚀 Setting up Sharpened Monorepo Branch Structure..."

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo -e "${RED}❌ Not in a git repository! Navigate to your monorepo first.${NC}"
    exit 1
fi

# Products to create branches for
PRODUCTS=(
    "feelsharper"
    "studysharper"
    "jabocafe"
    "ai-tennis"
    "personal-site"
    "automation-empire"
)

echo -e "${BLUE}📋 Current branch status:${NC}"
git branch -a

# Ensure we're on main
echo -e "${YELLOW}🔄 Switching to main branch...${NC}"
git checkout main 2>/dev/null || git checkout -b main

# Pull latest changes
echo -e "${YELLOW}🔄 Pulling latest changes...${NC}"
git pull origin main 2>/dev/null || echo "No remote set up yet"

# Create product branches
echo -e "${BLUE}🌿 Creating product branches...${NC}"
for product in "${PRODUCTS[@]}"; do
    branch_name="product/$product"
    
    # Check if branch exists locally
    if git show-ref --verify --quiet refs/heads/$branch_name; then
        echo -e "${YELLOW}⚠️  Branch $branch_name already exists locally${NC}"
    else
        # Create branch
        git checkout -b $branch_name
        echo -e "${GREEN}✅ Created branch: $branch_name${NC}"
        
        # Push to remote
        git push -u origin $branch_name 2>/dev/null && \
            echo -e "${GREEN}✅ Pushed $branch_name to remote${NC}" || \
            echo -e "${YELLOW}⚠️  Could not push $branch_name (no remote or already exists)${NC}"
    fi
    
    # Return to main
    git checkout main
done

# Create develop branch for integration
echo -e "${BLUE}🔧 Creating develop branch...${NC}"
if ! git show-ref --verify --quiet refs/heads/develop; then
    git checkout -b develop
    git push -u origin develop 2>/dev/null && \
        echo -e "${GREEN}✅ Created and pushed develop branch${NC}" || \
        echo -e "${YELLOW}⚠️  Could not push develop branch${NC}"
    git checkout main
else
    echo -e "${YELLOW}⚠️  Develop branch already exists${NC}"
fi

# Create branch protection script
echo -e "${BLUE}📝 Creating branch protection rules file...${NC}"
cat > .github/branch-protection.json << 'EOF'
{
  "protection_rules": {
    "main": {
      "required_status_checks": {
        "strict": true,
        "contexts": ["build", "test", "typecheck"]
      },
      "enforce_admins": false,
      "required_pull_request_reviews": {
        "required_approving_review_count": 0,
        "dismiss_stale_reviews": true
      },
      "restrictions": null,
      "allow_force_pushes": false,
      "allow_deletions": false
    }
  }
}
EOF
echo -e "${GREEN}✅ Created branch protection rules file${NC}"

# Create helper scripts
echo -e "${BLUE}📝 Creating helper scripts...${NC}"

# Update all branches script
cat > scripts/update-branches.sh << 'EOF'
#!/bin/bash
echo "🔄 Updating all product branches..."
BRANCHES=$(git branch -r | grep "origin/product/" | sed 's/origin\///')
for branch in $BRANCHES; do
    echo "Updating $branch..."
    git checkout $branch
    git pull origin $branch
done
git checkout main
echo "✅ All branches updated!"
EOF
chmod +x scripts/update-branches.sh

# New feature script
cat > scripts/new-feature.sh << 'EOF'
#!/bin/bash
if [ $# -ne 2 ]; then
    echo "Usage: ./new-feature.sh <product> <feature-name>"
    exit 1
fi
PRODUCT=$1
FEATURE=$2
BRANCH_NAME="feature/$PRODUCT/$FEATURE"
git checkout product/$PRODUCT
git pull origin product/$PRODUCT
git checkout -b $BRANCH_NAME
echo "✅ Created feature branch: $BRANCH_NAME"
echo "🚀 Start coding! When done:"
echo "   git add ."
echo "   git commit -m 'feat: your message'"
echo "   git push origin $BRANCH_NAME"
echo "   gh pr create --base product/$PRODUCT"
EOF
chmod +x scripts/new-feature.sh

# Deploy script
cat > scripts/deploy-to-prod.sh << 'EOF'
#!/bin/bash
if [ $# -ne 1 ]; then
    echo "Usage: ./deploy-to-prod.sh <product>"
    exit 1
fi
PRODUCT=$1
echo "🚀 Deploying $PRODUCT to production..."
git checkout product/$PRODUCT
git pull origin product/$PRODUCT
gh pr create --base main --head product/$PRODUCT --title "Deploy $PRODUCT to production" --body "Automated deployment of $PRODUCT" || echo "PR might already exist"
echo "✅ PR created! Check GitHub for merge status"
EOF
chmod +x scripts/deploy-to-prod.sh

echo -e "${GREEN}✅ Helper scripts created${NC}"

# Display final status
echo -e "\n${GREEN}🎉 Branch Structure Setup Complete!${NC}"
echo -e "${BLUE}📊 Summary:${NC}"
echo "  - Product branches created: ${#PRODUCTS[@]}"
echo "  - Helper scripts created: 3"
echo "  - Branch protection rules: Ready to apply"

echo -e "\n${YELLOW}📋 Next Steps:${NC}"
echo "1. Review branches: git branch -a"
echo "2. Apply branch protection on GitHub (Settings > Branches)"
echo "3. Configure Vercel for branch deployments"
echo "4. Start using product branches for development"

echo -e "\n${BLUE}🚀 Quick Start:${NC}"
echo "  Work on FeelSharper:  git checkout product/feelsharper"
echo "  Create feature:       ./scripts/new-feature.sh feelsharper my-feature"
echo "  Deploy to prod:       ./scripts/deploy-to-prod.sh feelsharper"

echo -e "\n${GREEN}✨ Happy coding with organized branches!${NC}"