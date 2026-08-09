const SOURCES = ['126', '127', '128', '129', '130', '131', '132'];
const TOKEN = 'UYHTFxxZcONCWrcxvB39KCKwjlvqj8dfinfAVWrVPa1Y9UBl';
const UUID = '9534abf5-a3a0-48c3-a54c-5afa55ca4446'; // jeueh

async function testAll() {
  for (const src of SOURCES) {
    const url = `https://admin168kh.com/api/streams/hls/${TOKEN}/hls/movies/${UUID}/source-${src}/master.m3u8`;
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    console.log(`Source ${src}: ${res.status}`);
  }
}
testAll();
