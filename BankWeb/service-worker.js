const cacheName = 'ftw-bank';

self.addEventListener("install", function(event) {
    event.waitUntil(
      caches.open(cacheName).then(function(cache) {
        cache.add("./");
        console.log("cache added");
        cache.add("./index.html");
        console.log('index.html added');
        cache.add("./style.css");
        console.log('style.css added');
        cache.add("./accountinfo.html");
        console.log('accountinfo.html added');
        cache.add("./createaccount.html");
        console.log('createaccount.html added');
        cache.add("./accounthistory.html");
        console.log('accounthistory.html added');
        cache.add("./script-history.js");
        console.log('script-history.js added');
        cache.add("./script-create-mk4.js");
        console.log('script-create-mk4.js added');
        cache.add("./script-account-mk3.js");
        console.log('script-account-mk3.js added');
        cache.add("./script-index-mk3.js");
        console.log('script-index-mk3.js added');
        cache.add("./manifest.json");
        console.log('manifest.json added');
        cache.add("./service-worker.js");
        console.log('service-worker.js added');
        cache.add("images/acct_bg.png");
        console.log('./images/acct_bg.png added');
        cache.add("images/bank2.ico");
        console.log('./images/bank2.ico added');
        cache.add("images/bank2.png");
        console.log('./images/bank2.png added');
        cache.add("images/blank.png");
        console.log('./images/blank.png added');

        return cache;
        })
    );
      });
  
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.filter(name => name !== cacheName)
            .map(name => caches.delete(name))
        );
      })
      .then(() => {
        self.clients.claim();
      })
  );
});
  
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        return response || fetch(event.request);
      })
  );
});