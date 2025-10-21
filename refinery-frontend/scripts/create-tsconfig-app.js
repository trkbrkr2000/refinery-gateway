import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create .nuxt directory if it doesn't exist
const nuxtDir = path.join(__dirname, '..', '.nuxt');
if (!fs.existsSync(nuxtDir)) {
  fs.mkdirSync(nuxtDir, { recursive: true });
}

// Create tsconfig.app.json in .nuxt directory
const tsconfigApp = {
  "extends": "../tsconfig.json",
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "preserve",
    "strict": false,
    "noUnusedLocals": false,
    "noUnusedParameters": false,
    "noFallthroughCasesInSwitch": true,
    "skipLibCheck": true,
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": [
    "../**/*.ts",
    "../**/*.tsx",
    "../**/*.vue",
    "../**/*.js",
    "../**/*.jsx"
  ],
  "exclude": [
    "../node_modules",
    "../dist",
    "../.nuxt",
    "../.output"
  ]
};

const tsconfigAppPath = path.join(nuxtDir, 'tsconfig.app.json');
fs.writeFileSync(tsconfigAppPath, JSON.stringify(tsconfigApp, null, 2));

console.log('Created tsconfig.app.json in .nuxt directory');
