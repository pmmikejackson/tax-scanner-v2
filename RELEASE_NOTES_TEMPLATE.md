# Release Notes Template

Use this template when creating release notes for new versions.

## [VERSION] - YYYY-MM-DD

### Added
- **New Feature**: Description of what was added
- **Enhancement**: Improvement description

### Fixed
- **Bug Fix**: Description of what was fixed
- **Performance**: Performance improvement description

### Changed
- **Breaking Change**: Description of breaking changes (if any)
- **Update**: Description of updates to existing features

### Removed
- **Deprecated**: Description of removed features (if any)

### Infrastructure
- **Deployment**: Infrastructure or deployment changes
- **Dependencies**: Updated packages or dependencies

### Security
- **Security Fix**: Security-related fixes (if any)

---

## Commit Guidelines

When making commits, use these prefixes for better changelog generation:
- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation updates
- `style:` - Code style changes
- `refactor:` - Code refactoring
- `test:` - Test additions or changes
- `chore:` - Build process or auxiliary tool changes

## Version Increments

- **Patch (0.0.x)**: Bug fixes, small improvements
- **Minor (0.x.0)**: New features, larger improvements
- **Major (x.0.0)**: Breaking changes, major rewrite

## Build Commands

- `npm run build:deploy` - Patch increment + build
- `npm run build:feature` - Minor increment + build  
- `npm run build:major` - Major increment + build 