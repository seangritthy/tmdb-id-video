import AdmZip from 'adm-zip';
import fs from 'fs';
import path from 'path';

const zip = new AdmZip();
const targetPath = process.cwd();

// Folders never needed on the target device (rebuilt/reinstalled there instead)
const excludeDirs = new Set(['node_modules', '.next', '.git', '.vercel', '.wrangler', 'temp_bin', 'vercel_source']);
// File extensions that are just local debug/test artifacts, not app source
const excludeExts = new Set(['.zip', '.mp4']);
// Specific stray files accumulated from debug sessions (screenshots etc.)
const excludeFiles = new Set([
  '168kh_screenshot.png', 'khdiamond-home.png', 'login.png', 'login2.png', 'login_modal.png',
  'register_form.png', 'register_form2.png', 'scr.png', 'screenshot.png', 'screenshot1.png',
  'screenshot3.png', 'signup.png', 'step1.png', 'step2.png', 'step3.png', 'step4.png',
  'fake_mp4.txt', 'tsconfig.tsbuildinfo'
]);

function addFolderToZip(folderPath, zipPath) {
  const items = fs.readdirSync(folderPath);
  for (const item of items) {
    if (excludeDirs.has(item) || excludeFiles.has(item) || excludeExts.has(path.extname(item))) {
      continue;
    }

    const fullPath = path.join(folderPath, item);
    const stats = fs.statSync(fullPath);

    if (stats.isDirectory()) {
      addFolderToZip(fullPath, path.join(zipPath, item));
    } else {
      zip.addLocalFile(fullPath, zipPath);
    }
  }
}

console.log('Zipping project (clean, phone-transfer package), this might take a few seconds...');
addFolderToZip(targetPath, '');

const outPath = path.join(targetPath, 'vdomov-phone.zip');
zip.writeZip(outPath);
console.log('count', zip.getEntries().length);
console.log(`Successfully created zip file at: ${outPath}`);
