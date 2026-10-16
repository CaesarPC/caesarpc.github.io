/**
 * Cloudflare Worker — 远程控制固定入口
 * 永久地址（示例）：https://remote.your-subdomain.workers.dev
 *
 * 作用：从 GitHub Pages 读取当前隧道地址，302 跳转过去。
 * 比 GitHub Pages 跳转更快（Cloudflare 边缘节点）。
 *
 * 部署：
 *   1. Cloudflare Dashboard → Workers & Pages → Create → 粘贴本文件
 *   2. 把下面 GITHUB_RAW 改成你仓库的 raw 地址
 *   3. Deploy，得到固定 *.workers.dev 地址
 */

const GITHUB_RAW = 'https://raw.githubusercontent.com/CaesarPC/CaesarPC.github.io/main/remote/url.json';

async function getTunnelUrl() {
  // 边缘缓存 10 秒，避免每次都打 GitHub
  const cache = caches.default;
  let res = await cache.match('https://internal/tunnel-url');
  if (res) return await res.text();

  const r = await fetch(GITHUB_RAW + '?ts=' + Date.now(), { cf: { cacheTtl: 0 } });
  if (!r.ok) throw new Error('GitHub fetch failed');
  const data = await r.json();
  if (!data.url) throw new Error('Tunnel offline');

  const text = data.url;
  const cached = new Response(text, { headers: { 'cache-control': 'no-store' } });
  // 手动缓存 10 秒
  await cache.put('https://internal/tunnel-url', new Response(text, { headers: { 'cache-control': 'max-age=10' } }));
  return text;
}

export default {
  async fetch(request) {
    try {
      const url = await getTunnelUrl();
      // 302 跳转到当前隧道
      return Response.redirect(url, 302);
    } catch (e) {
      return new Response(
        '<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'
        + '<title>远程控制</title>'
        + '<style>body{background:#000;color:#fff;font-family:sans-serif;text-align:center;padding-top:80px}'
        + '</style></head><body>'
        + '<h3>电脑未在线</h3><p>请确认对方已启动「一键公网」服务。</p>'
        + '<p><a href="" style="color:#0a84ff">点击重试</a></p>'
        + '</body></html>',
        { status: 503, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
      );
    }
  }
};
