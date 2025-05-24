import { execSync } from 'child_process';
import { test } from 'vitest';

test('eslint passes without errors', () => {
  execSync('pnpm lint', { stdio: 'pipe' });
});
