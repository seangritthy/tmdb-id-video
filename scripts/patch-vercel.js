const fs = require('fs');
const path = require('path');

const targetFile = path.join(process.env.APPDATA, 'npm', 'node_modules', 'vercel', 'dist', 'chunks', 'chunk-TMK6RSYW.js');

if (!fs.existsSync(targetFile)) {
  console.error('Target file not found:', targetFile);
  process.exit(1);
}

let content = fs.readFileSync(targetFile, 'utf8');

const oldSync = 'return fs5.symlinkSync(srcpath, dstpath, type);';
const newSync = 'try { return fs5.symlinkSync(srcpath, dstpath, type); } catch (e) { if (e.code === "EPERM" || e.code === "EACCES") { try { const resolved = path.resolve(path.dirname(dstpath), srcpath); if (fs5.statSync(resolved).isDirectory()) { fs5.cpSync(resolved, dstpath, { recursive: true, force: true }); } else { fs5.copyFileSync(resolved, dstpath); } return; } catch (err2) { return; } } throw e; }';

const oldAsync = 'fs5.symlink(srcpath, dstpath, type2, callback);';
const newAsync = 'fs5.symlink(srcpath, dstpath, type2, (err) => { if (err && (err.code === "EPERM" || err.code === "EACCES")) { try { const resolved = path.resolve(path.dirname(dstpath), srcpath); if (fs5.statSync(resolved).isDirectory()) { fs5.cpSync(resolved, dstpath, { recursive: true, force: true }); } else { fs5.copyFileSync(resolved, dstpath); } return callback(null); } catch (err2) { return callback(null); } } callback(err); });';

console.log('Matches for oldSync:', content.split(oldSync).length - 1);
content = content.replaceAll(oldSync, newSync);

console.log('Matches for oldAsync:', content.split(oldAsync).length - 1);
content = content.replaceAll(oldAsync, newAsync);

fs.writeFileSync(targetFile, content, 'utf8');
console.log('Successfully patched chunk-TMK6RSYW.js!');
