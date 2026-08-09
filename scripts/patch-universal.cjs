const fs = require('fs');
const path = require('path');

const baseDir = path.join(process.env.APPDATA, 'npm', 'node_modules', 'vercel');

function patchFile(fullPath) {
  let content = fs.readFileSync(fullPath, 'utf8');
  let changed = false;

  // 1. fsX.symlinkSync(src, dst, type)
  const syncRegex = /return\s+([a-zA-Z0-9_$]+)\.symlinkSync\(([^)]+)\);/g;
  if (syncRegex.test(content)) {
    content = content.replace(syncRegex, (match, fsVar, args) => {
      const parts = args.split(',').map(s => s.trim());
      const src = parts[0];
      const dst = parts[1];
      return `try { return ${fsVar}.symlinkSync(${args}); } catch (e) { if (e.code === 'EPERM' || e.code === 'EACCES') { try { const p = require('path'); const _src = ${src}; const _dst = ${dst}; const resolved = p.isAbsolute(_src) ? _src : p.resolve(p.dirname(_dst), _src); if (${fsVar}.statSync(resolved).isDirectory()) { ${fsVar}.cpSync(resolved, _dst, { recursive: true, force: true }); } else { ${fsVar}.copyFileSync(resolved, _dst); } return; } catch (err2) { return; } } throw e; }`;
    });
    changed = true;
  }

  // 2. fsX.symlink(src, dst, type, callback) with callback
  const cbRegex = /([a-zA-Z0-9_$]+)\.symlink\(([^,]+),\s*([^,]+),\s*([^,]+),\s*([a-zA-Z0-9_$]+)\);/g;
  if (cbRegex.test(content)) {
    content = content.replace(cbRegex, (match, fsVar, src, dst, type, cb) => {
      return `${fsVar}.symlink(${src}, ${dst}, ${type}, (err) => { if (err && (err.code === 'EPERM' || err.code === 'EACCES')) { try { const p = require('path'); const _src = ${src}; const _dst = ${dst}; const resolved = p.isAbsolute(_src) ? _src : p.resolve(p.dirname(_dst), _src); if (${fsVar}.statSync(resolved).isDirectory()) { ${fsVar}.cpSync(resolved, _dst, { recursive: true, force: true }); } else { ${fsVar}.copyFileSync(resolved, _dst); } return ${cb}(null); } catch (err2) { return ${cb}(null); } } ${cb}(err); });`;
    });
    changed = true;
  }

  // 3. return fsX.symlink(src, dst, toType) Promise
  const promiseRegex = /return\s+([a-zA-Z0-9_$]+)\.symlink\(([^)]+)\);/g;
  if (promiseRegex.test(content)) {
    content = content.replace(promiseRegex, (match, fsVar, args) => {
      const parts = args.split(',').map(s => s.trim());
      const src = parts[0];
      const dst = parts[1];
      return `return ${fsVar}.symlink(${args}).catch((err) => { if (err && (err.code === 'EPERM' || err.code === 'EACCES')) { try { const p = require('path'); const _src = ${src}; const _dst = ${dst}; const resolved = p.isAbsolute(_src) ? _src : p.resolve(p.dirname(_dst), _src); if (${fsVar}.statSync(resolved).isDirectory()) { ${fsVar}.cpSync(resolved, _dst, { recursive: true, force: true }); } else { ${fsVar}.copyFileSync(resolved, _dst); } return; } catch (err2) { return; } } throw err; });`;
    });
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log('Patched:', fullPath);
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
console.log('Universal patch completed!');
