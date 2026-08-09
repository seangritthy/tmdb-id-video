const fs = require('fs');
let content = fs.readFileSync('src/app/khmer/player/[id]/KhmerPlayer.tsx', 'utf8');

content = content.replace('import Hls from "hls.js";', 'import type Hls from "hls.js";');

const useEffectStart = '  useEffect(() => {\n    if (!videoUrl || !videoRef.current || !seen) return;';
const newUseEffectStart = `  useEffect(() => {
    if (!videoUrl || !videoRef.current || !seen) return;

    let destroyed = false;
    const setupPlayer = async () => {`;
content = content.replace(useEffectStart, newUseEffectStart);

const hlsSupportCheck = 'if (Hls.isSupported()) {';
const newHlsSupportCheck = `const HlsModule = (await import("hls.js")).default;
      if (destroyed) return;
      if (HlsModule.isSupported()) {`;
content = content.replace(hlsSupportCheck, newHlsSupportCheck);

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

fs.writeFileSync('src/app/khmer/player/[id]/KhmerPlayer.tsx', content);
if (fs.existsSync('src/app/khmer/player/[id]/PlayerWrapper.tsx')) {
  fs.unlinkSync('src/app/khmer/player/[id]/PlayerWrapper.tsx');
}
console.log("Done refactoring KhmerPlayer!");
