self.addEventListener("install", function(event) {
    event.waitUntil(
      caches.open("ftw-bank").then(function(cache) {
        return cache.addAll([
          "/",
          "index.html",
          "style.css",
          "images/bank-icon.png",
          "accountinfo.html",
          "createaccount.html",
          "script.js",
          "manifest.json",
          "service-worker.js",
          "acct_bg.png",
          "images/bank2.ico",
          "images/bank2.png",
          "images/blank.png"
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
  