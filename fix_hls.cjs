const fs = require('fs');

let content = fs.readFileSync('src/app/vdotv/VDOtvClient.tsx', 'utf8');

// Change import to type import
content = content.replace('import Hls from "hls.js";', 'import type Hls from "hls.js";');

// Update useEffect for setupPlayer
const useEffectStart = 'useEffect(() => {\n    if (!activeChannel || !videoRef.current) return;';
const newUseEffectStart = `useEffect(() => {
    if (!activeChannel || !videoRef.current) return;

    let destroyed = false;
    const setupPlayer = async () => {`;
content = content.replace(useEffectStart, newUseEffectStart);

// Update Hls.isSupported() to use dynamic import
const hlsSupportCheck = 'if (Hls.isSupported()) {';
const newHlsSupportCheck = `const HlsModule = (await import("hls.js")).default;
      if (destroyed) return;
      if (HlsModule.isSupported()) {`;
content = content.replace(hlsSupportCheck, newHlsSupportCheck);

// Replace new Hls with new HlsModule
content = content.replace(/new Hls\(/g, 'new HlsModule(');
content = content.replace(/Hls\.Events/g, 'HlsModule.Events');
content = content.replace(/Hls\.ErrorTypes/g, 'HlsModule.ErrorTypes');

const useEffectEnd = '    return () => {\n      if (hlsRef.current) {';
const newUseEffectEnd = `    };
    setupPlayer();

    return () => {
      destroyed = true;
      if (hlsRef.current) {`;
content = content.replace(useEffectEnd, newUseEffectEnd);

fs.writeFileSync('src/app/vdotv/page.tsx', content);
fs.unlinkSync('src/app/vdotv/VDOtvClient.tsx');
if (fs.existsSync('src/app/vdotv/VDOtvWrapper.tsx')) {
  fs.unlinkSync('src/app/vdotv/VDOtvWrapper.tsx');
}
console.log("Done refactoring VDOtv!");
