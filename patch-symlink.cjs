const fs = require('fs');
const path = require('path');

const origSymlink = fs.symlink;
const origSymlinkSync = fs.symlinkSync;
const origPromisesSymlink = fs.promises.symlink;

function copyFallback(target, destPath) {
  let source = target;
  if (!path.isAbsolute(source)) {
    const destDir = path.dirname(destPath);
    source = path.resolve(destDir, target);
  }
  try {
    const stat = fs.statSync(source);
    if (stat.isDirectory()) {
      fs.cpSync(source, destPath, { recursive: true, force: true });
    } else {
      fs.copyFileSync(source, destPath);
    }
  } catch (err) {
    console.warn(`[patch-symlink] copyFallback error from ${source} to ${destPath}:`, err.message);
  }
}

fs.symlink = function(target, destPath, type, callback) {
  if (typeof type === 'function') {
    callback = type;
    type = null;
  }
  origSymlink.call(fs, target, destPath, type, (err) => {
    if (err && (err.code === 'EPERM' || err.code === 'EACCES')) {
      copyFallback(target, destPath);
      return callback && callback(null);
    }
    return callback && callback(err);
  });
};

fs.symlinkSync = function(target, destPath, type) {
  try {
    return origSymlinkSync.call(fs, target, destPath, type);
  } catch (err) {
    if (err.code === 'EPERM' || err.code === 'EACCES') {
      copyFallback(target, destPath);
      return;
    }
    throw err;
  }
};

fs.promises.symlink = async function(target, destPath, type) {
  try {
    return await origPromisesSymlink.call(fs.promises, target, destPath, type);
  } catch (err) {
    if (err.code === 'EPERM' || err.code === 'EACCES') {
      copyFallback(target, destPath);
      return;
    }
    throw err;
  }
};
