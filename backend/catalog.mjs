import { readFileSync } from 'node:fs';
import vm from 'node:vm';

// Both pricing and state validation use the browser's registered catalogue.
export function loadCatalog() {
  const sandbox = { window: {}, localStorage: { getItem: () => null }, console };
  vm.createContext(sandbox);
  for (const name of ['templates', 'mu', 'layouts/collection', 'platform-catalog', 'layouts/platform', 'editions-catalog', 'premium-catalog', 'editions-layout', 'commerce']) {
    const file = new URL('../frontend/public/js/' + name + '.js', import.meta.url);
    vm.runInContext(readFileSync(file, 'utf8'), sandbox, { filename: file.pathname });
  }
  return sandbox.window;
}
