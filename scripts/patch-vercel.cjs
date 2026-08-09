const fs = require('fs');
const path = require('path');

function patchFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log('Skipping (not found):', filePath);
    return;
  }
  let content = fs.readFileSync(filePath, 'utf8');

  const oldSync1 = 'return fs5.symlinkSync(srcpath, dstpath, type);';
  const newSync1 = 'try { return fs5.symlinkSync(srcpath, dstpath, type); } catch (e) { if (e.code === "EPERM" || e.code === "EACCES") { try { const resolved = path.resolve(path.dirname(dstpath), srcpath); if (fs5.statSync(resolved).isDirectory()) { fs5.cpSync(resolved, dstpath, { recursive: true, force: true }); } else { fs5.copyFileSync(resolved, dstpath); } return; } catch (err2) { return; } } throw e; }';

  const oldAsync1 = 'return fs5.symlink(srcpath, dstpath, toType);';
  const newAsync1 = 'try { return await fs5.symlink(srcpath, dstpath, toType); } catch (err) { if (err && (err.code === "EPERM" || err.code === "EACCES")) { try { const resolved = path.resolve(path.dirname(dstpath), srcpath); if (fs5.statSync(resolved).isDirectory()) { fs5.cpSync(resolved, dstpath, { recursive: true, force: true }); } else { fs5.copyFileSync(resolved, dstpath); } return; } catch (err2) { return; } } throw err; }';

  const oldSync2 = 'return fs5.symlinkSync(resolvedSrc, dest);';
  const newSync2 = 'try { return fs5.symlinkSync(resolvedSrc, dest); } catch (e) { if (e.code === "EPERM" || e.code === "EACCES") { try { if (fs5.statSync(resolvedSrc).isDirectory()) { fs5.cpSync(resolvedSrc, dest, { recursive: true, force: true }); } else { fs5.copyFileSync(resolvedSrc, dest); } return; } catch (err2) { return; } } throw e; }';

  const oldAsync2 = 'return fs5.symlink(resolvedSrc, dest);';
  const newAsync2 = 'try { return await fs5.symlink(resolvedSrc, dest); } catch (err) { if (err && (err.code === "EPERM" || err.code === "EACCES")) { try { if (fs5.statSync(resolvedSrc).isDirectory()) { fs5.cpSync(resolvedSrc, dest, { recursive: true, force: true }); } else { fs5.copyFileSync(resolvedSrc, dest); } return; } catch (err2) { return; } } throw err; }';

  let changed = false;
  [
    [oldSync1, newSync1],
    [oldAsync1, newAsync1],
    [oldSync2, newSync2],
    [oldAsync2, newAsync2],
  ].forEach(([oldStr, newStr]) => {
    if (content.includes(oldStr)) {
      content = content.replaceAll(oldStr, newStr);
      changed = true;
    }
  });

  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Patched:', filePath);
  } else {
    console.log('No patch targets found in:', filePath);
  }
}

const files = [
  path.join(process.env.APPDATA, 'npm', 'node_modules', 'vercel', 'dist', 'chunks', 'chunk-TMK6RSYW.js'),
  path.join(process.env.APPDATA, 'npm', 'node_modules', 'vercel', 'dist', 'chunks', 'chunk-26TEKOBZ.js'),
  path.join(process.env.APPDATA, 'npm', 'node_modules', 'vercel', 'node_modules', '@vercel', 'next', 'dist', 'index.js'),
];

files.forEach(patchFile);
console.log('All patches applied!');
