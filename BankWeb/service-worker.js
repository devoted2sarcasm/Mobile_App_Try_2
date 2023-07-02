self.addEventListener("install", function(event) {
    event.waitUntil(
      caches.open("ftw-bank").then(function(cache) {
        return cache.addAll([
          "/",
          "index.html",
          "style.css",
          "images/bank-icon.png"
          // Add other files you want to cache
        ]);
      })
    );
  });
  
  self.addEventListener("fetch", function(event) {
    event.respondWith(
      caches.match(event.request).then(function(response) {
        return response || fetch(event.request);
      })
    );
  });
  