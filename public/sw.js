// Service worker minimal — cache hors-ligne pour Calendrier et Signaux
// (cahier des charges, section 8 : "mode hors-ligne minimal").
const CACHE = "rof-connect-v1";
const ROUTES_HORS_LIGNE = ["/membres/calendrier", "/membres/signaux"];

function estRouteHorsLigne(url) {
  return ROUTES_HORS_LIGNE.some((r) => url.pathname === r || url.pathname.startsWith(r + "?"));
}

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if (event.request.method !== "GET" || url.origin !== self.location.origin) return;
  if (!estRouteHorsLigne(url)) return;

  event.respondWith(
    fetch(event.request)
      .then((reponse) => {
        const copie = reponse.clone();
        caches.open(CACHE).then((cache) => cache.put(event.request, copie));
        return reponse;
      })
      .catch(() => caches.match(event.request)),
  );
});
