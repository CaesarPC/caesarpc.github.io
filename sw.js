// CaesarBase PWA Service Worker - 全面离线支持 v3
const CACHE_NAME = 'caesarbase-v4';
// 预缓存全部核心功能页(47项) + 访问过的页面自动实时缓存(含全部文章)
const ASSETS = [
  '/',
  '/index.html',
  '/welcome.html',
  '/admin.html',
  '/sponsor.html',
  '/404.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/cb-article-tech-ai-agent-dev-intro.html',
  '/cb-article-tech-db-sharding-practice.html',
  '/cb-article-tech-distributed-lock.html',
  '/cb-article-tech-graphql-api.html',
  '/cb-article-tech-rw-split-ha.html',
  '/cr/404.html',
  '/cr/admin.html',
  '/cr/all-articles.html',
  '/cr/api-design.html',
  '/cr/browser-extension.html',
  '/cr/cloud_index.html',
  '/cr/codec.html',
  '/cr/combiner.html',
  '/cr/echarts-basics.html',
  '/cr/en.html',
  '/cr/file-convert.html',
  '/cr/finder.html',
  '/cr/frontend-security.html',
  '/cr/games.html',
  '/cr/image-host.html',
  '/cr/index.html',
  '/cr/mobile-responsive.html',
  '/cr/paint.html',
  '/cr/paste.html',
  '/cr/pomodoro.html',
  '/cr/pwa-intro.html',
  '/cr/remote.html',
  '/cr/share.html',
  '/cr/software.html',
  '/cr/tools.html',
  '/cr/topic-backend.html',
  '/cr/topic-frontend.html',
  '/cr/topics.html',
  '/cr/wall.html',
  '/cr/wasm-intro.html',
  '/cr/web-performance.html',
  '/cr/webrtc-intro.html'
];

// 安装: 预缓存核心功能页
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

// 激活: 清理旧缓存 + 立即接管
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// 请求: HTML页面网络优先(保证更新), 其他资源缓存优先
self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;

  // HTML页面: 网络优先, 失败时用缓存
  if (req.headers.get('accept') && req.headers.get('accept').includes('text/html')) {
    event.respondWith(
      fetch(req).then(res => {
        if (res.ok) {
          const copy = res.clone();
          caches.open(CACHE_NAME).then(c => c.put(req, copy));
        }
        return res;
      }).catch(() => caches.match(req).then(cached => cached || caches.match('/index.html')))
    );
    return;
  }

  // 其他资源: 缓存优先
  event.respondWith(
    caches.match(req).then(cached => {
      if (cached) return cached;
      return fetch(req).then(res => {
        if (res.ok) {
          const copy = res.clone();
          caches.open(CACHE_NAME).then(c => c.put(req, copy));
        }
        return res;
      });
    })
  );
});
