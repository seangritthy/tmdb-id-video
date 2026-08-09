const fs = require('node:fs');
const path = require('node:path');

function safeCopy(target, dest) {
  try {
    const resolved = path.isAbsolute(target) ? target : path.resolve(path.dirname(dest), target);
    if (!fs.existsSync(resolved)) return;
    if (fs.statSync(resolved).isDirectory()) {
      fs.cpSync(resolved, dest, { recursive: true, force: true });
    } else {
      fs.copyFileSync(resolved, dest);
    }
  } catch (e) {}
}

const origSymlinkSync = fs.symlinkSync;
fs.symlinkSync = function(target, pathParam, type) {
  try {
    return origSymlinkSync.call(fs, target, pathParam, type);
  } catch (err) {
    if (err && (err.code === 'EPERM' || err.code === 'EACCES')) {
      safeCopy(target, pathParam);
      return;
    }
    throw err;
  }
};

const origSymlink = fs.symlink;
fs.symlink = function(target, pathParam, type, callback) {
  const cb = typeof type === 'function' ? type : callback;
  const actualType = typeof type === 'string' ? type : undefined;
  
  if (typeof cb === 'function') {
    return origSymlink.call(fs, target, pathParam, actualType, (err) => {
      if (err && (err.code === 'EPERM' || err.code === 'EACCES')) {
        safeCopy(target, pathParam);
        return cb(null);
      }
      return cb(err);
    });
  }

  return origSymlink.call(fs, target, pathParam, actualType).catch((err) => {
    if (err && (err.code === 'EPERM' || err.code === 'EACCES')) {
      safeCopy(target, pathParam);
      return;
    }
    throw err;
  });
};

if (fs.promises) {
  const origPromisesSymlink = fs.promises.symlink;
  fs.promises.symlink = async function(target, pathParam, type) {
    try {
      return await origPromisesSymlink.call(fs.promises, target, pathParam, type);
    } catch (err) {
      if (err && (err.code === 'EPERM' || err.code === 'EACCES')) {
        safeCopy(target, pathParam);
        return;
      }
      throw err;
    }
  };
}
