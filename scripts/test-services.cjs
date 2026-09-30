// Compile TypeScript in memory using the existing dependency; no build output or new packages.
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');
require.extensions['.ts'] = (module, filename) => {
  if (!filename.startsWith(root + path.sep)) throw new Error('Unexpected TypeScript test module');
  const result = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true },
    fileName: filename,
  });
  module._compile(result.outputText, filename);
};
require('../tests/services.test.ts');

require('../tests/projects.test.ts');

require('../tests/cloud-projects.test.ts');

require('../tests/morning-desk.test.ts');

require('../tests/dashboard.test.ts');

require('../tests/provider-expansion.test.ts');

require('../tests/market-columns.test.ts');

require('../tests/discovery.test.ts');

require('../tests/watchlists.test.ts');

require('../tests/discovery-views.test.ts');

require('../tests/scrapbook.test.ts');
