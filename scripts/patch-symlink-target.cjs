const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const baseDir = path.join(process.env.APPDATA, 'npm', 'node_modules', 'vercel');

function patchFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Replace createSymlinkSync in fs-extra require_symlink
  const oldSyncPart = `      if (exists)
        return fs5.symlinkSync(srcpath, dstpath, type);
      mkdirsSync(dir);
      return fs5.symlinkSync(srcpath, dstpath, type);`;

  const newSyncPart = `      try {
        if (exists) return fs5.symlinkSync(srcpath, dstpath, type);
        mkdirsSync(dir);
        return fs5.symlinkSync(srcpath, dstpath, type);
      } catch (err) {
        if (err && (err.code === 'EPERM' || err.code === 'EACCES')) {
          try {
            const resolved = path6.resolve(dir, srcpath);
            if (fs5.statSync(resolved).isDirectory()) {
              fs5.cpSync(resolved, dstpath, { recursive: true, force: true });
            } else {
              fs5.copyFileSync(resolved, dstpath);
            }
            return;
          } catch (e) { return; }
        }
        throw err;
      }`;

  if (content.includes(oldSyncPart)) {
    content = content.replaceAll(oldSyncPart, newSyncPart);
    modified = true;
  }

  // Replace async createSymlink
  const oldAsyncPart = `      return fs5.symlink(srcpath, dstpath, toType);`;
  const newAsyncPart = `      return fs5.symlink(srcpath, dstpath, toType).catch((err) => {
        if (err && (err.code === 'EPERM' || err.code === 'EACCES')) {
          try {
            const resolved = path6.resolve(dir, srcpath);
            if (fs5.statSync(resolved).isDirectory()) {
              fs5.cpSync(resolved, dstpath, { recursive: true, force: true });
            } else {
              fs5.copyFileSync(resolved, dstpath);
            }
            return;
          } catch (e) { return; }
        }
        throw err;
      });`;

  if (content.includes(oldAsyncPart)) {
    content = content.replaceAll(oldAsyncPart, newAsyncPart);
    modified = true;
  }

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Patched require_symlink in:', filePath);
    try {
      execSync(`node --check "${filePath}"`);
      console.log('Syntax check passed for:', filePath);
    } catch (e) {
      console.error('Syntax check failed for:', filePath, e.message);
    }
  }
}

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(p);
    else if (entry.isFile() && entry.name.endsWith('.js')) patchFile(p);
  }
}

walk(baseDir);
console.log('Finished targeted require_symlink patch.');
