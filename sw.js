const VERSION = "v3.0";

// offline Resource List
const APP_STATIC_RESOURCES = [
    "index.html",
    // Other HTMLs would go here too
    "style.css",
    "app.js",
    "vaca-tracker.json",
    "assets/icons/icon-512x512.png"
];

const CACHE_NAME = `vaca-tracker-${VERSION}`;

//  handle install event and retrieve and store the files listed for the cache
self.addEventListener("install", (event) => {
    event.waitUntil(
        (async () => {
            const cache = await caches.open(CACHE_NAME);
            cache.addAll(APP_STATIC_RESOURCES);
        })
    );
});

// Use Activate event to delete any old caches so we don't run out of space. Going to delete all but the current one
// Then we set the service worker as controller for app.

self.addEventListener("activate", (event) => {
    event.waitUntil(
        (async ()=> {
            //Get the names of the existing caches
            const names = await caches.keys();

            // iterate through list and check each one to see if its the current cahce and delete if not 
            await Promise.all(
                names.map((name) => {
                    if (name !== CACHE_NAME)
                    {
                        return caches.delete(name);
                    }
                })
            ); // Promise all

            await clients.claim();
        })()
    );
});

// use fetch event to intercept requests to the server so we can serve up out cached pages or respond with an error or 404
self.addEventListener("fetch", (event) => {
    event.respondWith((async () => {
        const cachedResponse = await cache.match(event.request);
        if (cachedResponse) 
        {
            return cachedResponse;
        }

        // if not in thec cache try to fetch from the network
        try 
        {
            const networkResponse = await fetch(event.request);

            // cache the new response 
            cache.put(event.request, networkResponse.clone());

            return networkResponse;
        }
        catch (error)
        {
            console.log("Fetch Failed; Returning offline page instead.", error);

            // if the request is for a page, return index.html as a fallback
            if (event.request.mode === "navigate")
            {
                return cache.match("/index.html");
            }


            // for everything else, we're just going to throw an erro
            // you might want to return a default offline asset instead 

            throw error;
        }
    }));
    
});


// function sendMessageToPWA(message)
// {
//     self.clients.matchAll().then((clients) => {
//         clients.array.forEach(client => {
//             client.postMessage(message);
//         });
//     }); 
// }

// setInterval(() => {
//     sendMessageToPWA({type: "update", data: "New Data Available"});
// }, 10000);


// self.addEventListener("message", (event) => {
//     console.log('Service Worker received a message', event.data);

//     // you can respond back if needed
//     event.source.postMessage({type: "response", data: "Message Received by Service Worker!"});
// });

const channel = new BroadcastChannel("pwa_channel");

channel.onmessage = (event) => {
    console.log('Received a message in SW:', event.data);
    //echo the message back to the PWA
    channel.postMessage('Service worker received: ' + event.data);
};