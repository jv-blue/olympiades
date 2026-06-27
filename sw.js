/* Service worker — Olympiades
   Stratégie "stale-while-revalidate" : on sert toujours depuis le cache (instantané,
   100% hors-ligne) et on met à jour le cache en arrière-plan quand il y a du réseau.
   => l'app marche sans réseau ; une mise à jour poussée est prise au prochain lancement. */
const CACHE = 'olympiades-v1';
const ASSETS = ['./', './index.html', './manifest.webmanifest', './icon.svg'];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(cache => Promise.all(ASSETS.map(u => cache.add(u).catch(() => {}))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  let url;
  try { url = new URL(req.url); } catch (_) { return; }
  if (url.origin !== self.location.origin) return;   // on ne gère que notre propre origine

  e.respondWith(
    caches.open(CACHE).then(async cache => {
      const cached = await cache.match(req);
      const network = fetch(req)
        .then(res => { if (res && res.status === 200) cache.put(req, res.clone()); return res; })
        .catch(() => null);
      // cache d'abord (instantané + hors-ligne), sinon réseau, sinon repli sur la page
      return cached || (await network) || (req.mode === 'navigate' ? cache.match('./index.html') : Response.error());
    })
  );
});
