const SW_VERSION = "V1";
const offline_page_url = "/pages/offline_page.html";

// URLS to save in cache.
const urls_to_save = [
    offline_page_url,
    "/scripts/online_offline_management.js",
    "/scripts/interract_with_preferences.js", 
    "/scripts/interract_with_learning_database.js", 
    "/styles/common_styles.css",

    // Lesson homepage.
    "/pages/lessons/lesson_homepage.html", 
    "/styles/lessons/lesson_homepage.css",
    "/scripts/lessons/lesson_homepage.js",
    "/images/logos/house-door-fill1.png",

];
const lesson_homepage_to_save = [

];


// CACHE KEYS : 
// => PREFIX + "_cache_files"
// => PREFIX + "_lesson_ressources"

async function save_in_cache(key,url_data){
    try {
        const cache = await caches.open(key);
        cache.add(new Request(url_data));
        return true;
    }
    catch(e){
        console.log(`Error when saving \"${url_data}\" in cache`);
        return false;
    }
}

async function clear_old_cache(){
    const keys = await caches.keys();
    await Promise.all(
        keys.map(key => {
            if(!key.includes(SW_VERSION)){
                return caches.delete(key);
            }
        })                
    );
    console.log(`Cached data with a version different than ${SW_VERSION} were deleted.`);
    return true;
}

async function read_page_cache(key, url){
    try {
        const cache = await caches.open(key);
        return cache.match(url);
    }
    catch(e){
        console.log(`Error when reading \"${url}\" in cache : ${e}.`);
        return undefined;
    }
}

self.addEventListener("install", () => {
    self.skipWaiting();
    for(let i=0; i<urls_to_save.length; i++){
        save_in_cache(SW_VERSION+"_cache_files", urls_to_save[i]).then((resp) => {
            /*
            if(resp){
                console.log(`=> "${urls_to_save[i]}" successfully saved in cache`);
            }
            else{
                console.log(`ERROR : "${urls_to_save[i]}" successfully saved in cache`);
            }
            */
        });
    }
});

self.addEventListener("activate", (event) => {
    clients.claim();
    event.waitUntil(clear_old_cache());

});

self.addEventListener("fetch", (event)=> {
    // Loading of pages for navigation.
    event.respondWith((async () => {
        try{
            const preload_response = await event.preloadResponse;
            if(preload_response){
                return preload_response;
            }
            const content =  await fetch(event.request);
            if(content){
                const url = new URL(event.request.url);
                if(urls_to_save.includes(url.pathname)){
                    save_in_cache(SW_VERSION+"_cache_files",url.pathname);
                }
                return content;
            }
        }
        // Handling of requests in offline mode.
        catch(e){
            /*
            const url = new URL(event.request.url);
            // console.log(`Urlpathname : ${url.pathname}, cached : ${urls_to_save.includes(url.pathname)  || lesson_homepage_to_save.includes(url.pathname)}`);
            if(urls_to_save.includes(url.pathname) || lesson_homepage_to_save.includes(url.pathname)){        // Loading of data from cache.
                for(let i=0; i<2; i++){
                    cache_key = [SW_VERSION+"_cache_files",SW_VERSION+"_lesson_ressources"][i];
                    const ressource = await read_page_cache(cache_key, url.pathname);
                    if(ressource != undefined){
                        // console.log(`Loaded from cache ${event.request.url}, ${ressource}`)
                        return ressource;
                    }  
                }
            }
            else if(event.request.mode == "navigate"){                                                  // Fetching of offline page if the page wanted is not cached.
                const ressource = await read_page_cache(SW_VERSION+"_cache_files", offline_page_url);
                if(ressource != undefined){
                    // console.log(`Offline page loaded from cache ${ressource}`);
                    return ressource;
                }  
            }
            */
            return new Response("Offline");
        }
    }
    )())
    
})
