"use strict";var precacheConfig=[["/index.html","59d337326d079e671070e6835a11a610"],["/static/css/main.7f33b368.css","4878ade395bb621a7771f01fb3eaf9c2"],["/static/media/10.da91679c.svg","da91679c42ad2bf8a4c63a603460c515"],["/static/media/11.3da8abd7.svg","3da8abd74a6d5c6ac19f4725700da6f8"],["/static/media/5.3a3c85e1.svg","3a3c85e1d0cd1c1f7365a480571b4084"],["/static/media/6.80f53422.svg","80f5342278d148ed81d9bc20ad177610"],["/static/media/7.cde1f9a0.svg","cde1f9a05f878870f31cc61df85e816f"],["/static/media/8.c71541bd.svg","c71541bda49064e96f8e6afd9c944cc8"],["/static/media/9.227a60e8.svg","227a60e88581ffada388a7729ecf24bb"],["/static/media/Block.7f82dc0c.svg","7f82dc0cb672b25d8c54d43726668d0a"],["/static/media/BlockHeight.3649d949.svg","3649d94957765ee151379157415c37ba"],["/static/media/EnglishCertificate.03ba12af.jpg","03ba12af4ec291be4f5cf1e68bf418b2"],["/static/media/Missmatching.75add2b9.svg","75add2b9c8220717e01fb9c11f50d9ea"],["/static/media/Montserrat-Light.100b38fa.ttf","100b38fa184634fc89bd07a84453992c"],["/static/media/Notfound.1a60ec65.svg","1a60ec65adb43d1222865e696ffec775"],["/static/media/Peer.856a9e4f.svg","856a9e4f8dc7a59bcd958d8fa59c2cfe"],["/static/media/Tx.be75d85a.svg","be75d85a50befd44d2d90f05fda87848"],["/static/media/certificate.3034659b.jpg","3034659b876ba36116fac067c1f020eb"],["/static/media/logo.2ba8b746.svg","2ba8b74664efc34a2e75c1498b67877e"],["/static/media/switch.2082b040.svg","2082b0402b3363b1a2b0e01933eea9c4"]],cacheName="sw-precache-v3-sw-precache-webpack-plugin-"+(self.registration?self.registration.scope:""),ignoreUrlParametersMatching=[/^utm_/],addDirectoryIndex=function(e,t){var a=new URL(e);return"/"===a.pathname.slice(-1)&&(a.pathname+=t),a.toString()},cleanResponse=function(t){return t.redirected?("body"in t?Promise.resolve(t.body):t.blob()).then(function(e){return new Response(e,{headers:t.headers,status:t.status,statusText:t.statusText})}):Promise.resolve(t)},createCacheKey=function(e,t,a,n){var c=new URL(e);return n&&c.pathname.match(n)||(c.search+=(c.search?"&":"")+encodeURIComponent(t)+"="+encodeURIComponent(a)),c.toString()},isPathWhitelisted=function(e,t){if(0===e.length)return!0;var a=new URL(t).pathname;return e.some(function(e){return a.match(e)})},stripIgnoredUrlParameters=function(e,a){var t=new URL(e);return t.hash="",t.search=t.search.slice(1).split("&").map(function(e){return e.split("=")}).filter(function(t){return a.every(function(e){return!e.test(t[0])})}).map(function(e){return e.join("=")}).join("&"),t.toString()},hashParamName="_sw-precache",urlsToCacheKeys=new Map(precacheConfig.map(function(e){var t=e[0],a=e[1],n=new URL(t,self.location),c=createCacheKey(n,hashParamName,a,/\.\w{8}\./);return[n.toString(),c]}));function setOfCachedUrls(e){return e.keys().then(function(e){return e.map(function(e){return e.url})}).then(function(e){return new Set(e)})}self.addEventListener("install",function(e){e.waitUntil(caches.open(cacheName).then(function(n){return setOfCachedUrls(n).then(function(a){return Promise.all(Array.from(urlsToCacheKeys.values()).map(function(t){if(!a.has(t)){var e=new Request(t,{credentials:"same-origin"});return fetch(e).then(function(e){if(!e.ok)throw new Error("Request for "+t+" returned a response with status "+e.status);return cleanResponse(e).then(function(e){return n.put(t,e)})})}}))})}).then(function(){return self.skipWaiting()}))}),self.addEventListener("activate",function(e){var a=new Set(urlsToCacheKeys.values());e.waitUntil(caches.open(cacheName).then(function(t){return t.keys().then(function(e){return Promise.all(e.map(function(e){if(!a.has(e.url))return t.delete(e)}))})}).then(function(){return self.clients.claim()}))}),self.addEventListener("fetch",function(t){if("GET"===t.request.method){var e,a=stripIgnoredUrlParameters(t.request.url,ignoreUrlParametersMatching),n="index.html";(e=urlsToCacheKeys.has(a))||(a=addDirectoryIndex(a,n),e=urlsToCacheKeys.has(a));var c="/index.html";!e&&"navigate"===t.request.mode&&isPathWhitelisted(["^(?!\\/__).*"],t.request.url)&&(a=new URL(c,self.location).toString(),e=urlsToCacheKeys.has(a)),e&&t.respondWith(caches.open(cacheName).then(function(e){return e.match(urlsToCacheKeys.get(a)).then(function(e){if(e)return e;throw Error("The cached response that was expected is missing.")})}).catch(function(e){return console.warn('Couldn\'t serve response for "%s" from cache: %O',t.request.url,e),fetch(t.request)}))}});