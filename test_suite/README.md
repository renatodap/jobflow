# Test Suite

Organized test structure for JobFlow Clean.

## Directory Structure

```
test_suite/
├── unit/              # Unit tests for individual functions/components
│   ├── test_email_job_delivery.py
│   ├── page.test.tsx
│   ├── route.test.ts
│   └── page.test.tsx
├── integration/       # Integration tests for service interactions
├── e2e/              # End-to-end tests
├── fixtures/         # Test data and mocks
│   └── mocks/       # Mock data files
├── utils/            # Test utilities and helpers
│   ├── test_server.py
│   ├── test_server_minimal.py
│   ├── simple_test_server.py
│   ├── run_tests.py
│   ├── test_job_search.html
│   ├── run_test.bat
│   └── start_test.bat
├── jest.config.js    # Jest configuration
├── jest.setup.js     # Jest setup
├── pytest.ini        # Pytest configuration
└── requirements-test.txt # Test dependencies
```

## Running Tests

### Python Tests
```bash
# Run all Python tests
py -m pytest test_suite/unit/

# Run with coverage
py -m pytest test_suite/unit/ --cov=core
```

### TypeScript/React Tests
```bash
# Run Jest tests
npm test

# Run with coverage
npm test -- --coverage
```

### Test Servers
```bash
# Run simple test server
py test_suite/utils/simple_test_server.py

# Run minimal test server
py test_suite/utils/test_server_minimal.py
```

## Test Coverage Goals
- Unit tests: 80% coverage
- Integration tests: Core workflows covered
- E2E tests: Critical user paths