# GitHub Actions Workflow Tests

This directory contains comprehensive unit tests for GitHub Actions workflows.

## Test Files

### `deploy.spec.ts`

Validates the deployment workflow (`.github/workflows/deploy.yml`) with 30+ test cases covering:

#### Workflow Structure
- YAML syntax validation
- Required configuration fields
- Proper indentation and formatting
- GitHub Actions best practices

#### Changes Validated (vs. main branch)
- ✅ Removal of unnecessary `permissions:` block
- ✅ Removal of custom SSH port (2222) - now using default port 22
- ✅ Changed from `pnpx pm2` to direct `pm2` commands

#### Deployment Configuration
- Secret references validation (REMOTE_HOST, REMOTE_USER, SSH_PASS)
- Action versions are pinned for reproducibility
- Ubuntu runner configuration
- SSH deployment action setup

#### Deployment Script
- PNPM environment setup
- Command execution order validation
- Production build process
- PM2 process management
- Configuration file handling
- Idempotency checks

## Running Tests

```bash
# Run all tests
npm test

# Run only workflow tests
node ace test tests/unit/workflows/deploy.spec.ts

# Run unit test suite
node ace test --suite=unit

# Run with verbose output
node ace test tests/unit/workflows/deploy.spec.ts --verbose
```

## Test Framework

- **Framework**: Japa (AdonisJS official testing framework)
- **Assertion Library**: @japa/assert
- **Test Runner**: @japa/runner with @japa/plugin-adonisjs

## Adding More Tests

To add more workflow tests:

1. Create a new `.spec.ts` file in this directory
2. Follow the existing pattern using `test.group()` and `test()`
3. Use the Japa assertion API for validations
4. Tests will be automatically discovered by the test runner

## Test Coverage

Current coverage includes:
- ✅ YAML syntax validation
- ✅ Workflow structure requirements
- ✅ Secret management
- ✅ Command ordering
- ✅ PM2 usage patterns
- ✅ Shell script syntax
- ✅ Best practices enforcement
- ✅ Idempotency verification

## Continuous Integration

These tests run as part of the test suite and help ensure:
- Deployment workflows remain valid
- Configuration changes don't break deployments
- Best practices are maintained
- Changes are intentional and documented