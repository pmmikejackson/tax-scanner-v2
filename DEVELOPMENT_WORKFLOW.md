# Development Workflow

## Branching Strategy

### Branch Types
- **`main`** - Production branch (auto-deploys to Vercel/Railway)
- **`develop`** - Staging branch for integration testing
- **`feature/*`** - Individual feature development
- **`hotfix/*`** - Critical production fixes
- **`release/*`** - Preparing new releases

### Workflow

#### For New Features:
```bash
# Start from develop
git checkout develop
git pull origin develop

# Create feature branch
git checkout -b feature/your-feature-name

# Work on your feature...
git add .
git commit -m "feat: Add your feature"

# Push feature branch
git push -u origin feature/your-feature-name

# Create PR: feature/your-feature-name → develop
# After review/testing, merge to develop

# When ready for production:
# Create PR: develop → main
```

#### For Hotfixes:
```bash
# Start from main for urgent fixes
git checkout main
git pull origin main

# Create hotfix branch
git checkout -b hotfix/critical-fix

# Fix the issue...
git add .
git commit -m "fix: Critical production issue"

# Push and create PR to main
git push -u origin hotfix/critical-fix
```

### Benefits
- ✅ Protected production branch
- ✅ Safe experimentation
- ✅ Easy rollbacks
- ✅ Better testing workflow
- ✅ No more force pushes needed

### Current Setup
- `main` - Stable v0.1.22 (Illinois Integration)
- `develop` - Ready for new feature development 