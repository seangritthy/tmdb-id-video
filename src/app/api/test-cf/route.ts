export const runtime = 'edge';
export async function GET() {
  const diagnostics: any = {};
  try {
    const res = await fetch('https://asiadrama.net/tvshows/kampoul-nak-saeub-kdei-ti-yean-chea-s4/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      }
    });
    diagnostics.status = res.status;
    diagnostics.ok = res.ok;
    diagnostics.text = (await res.text()).substring(0, 500);
  } catch (e: any) {
    diagnostics.error = e.message;
    diagnostics.stack = e.stack;
  }
  return Response.json(diagnostics);
}
