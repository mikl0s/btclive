#!/bin/bash

# Update imports in mode-toggle.tsx
sed -i 's|"@/components|"../../components|g' src/components/mode-toggle.tsx
sed -i 's|"./ui/|"../ui/|g' src/components/mode-toggle.tsx
sed -i 's|"./theme-provider"|"../theme-provider"|g' src/components/mode-toggle.tsx

# Update imports in hooks
sed -i 's|"components/|"../components/|g' src/hooks/*.ts
sed -i 's|"@/components/|"../components/|g' src/hooks/*.ts

# Update imports in components
find src/components -type f -name "*.tsx" -exec sed -i 's|"@/components/|"../../components/|g' {} \;
find src/components -type f -name "*.tsx" -exec sed -i 's|"@/lib/|"../../lib/|g' {} \;

# Update App.tsx imports
sed -i 's|"@/components/|"./components/|g' src/App.tsx
sed -i 's|"@/lib/|"./lib/|g' src/App.tsx