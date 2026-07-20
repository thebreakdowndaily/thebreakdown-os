# CI Pipeline Execution Order

The CI pipeline is defined to run the following steps in this exact order:

```
prepare:artifacts
    ↓
check:lint
    ↓
check:type
    ↓
check:type:frontend
    ↓
check:test
    ↓
check:build
    ↓
check:a11y
    ↓
check:storybook
    ↓
check:bundle
    ↓
check:lighthouse
    ↓
check:audit
    ↓
check:performance
    ↓
check:security
```

Each step must complete successfully before the next begins. This order is now frozen and should not be altered without a formal change request.
