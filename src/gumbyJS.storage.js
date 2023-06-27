/*!
 * gumbyJS 1.0.0
 * https://github.com/Ejkroll/gumbyJS
 *
 * Released under the MIT license
 * https://github.com/Ejkroll/gumbyJS/blob/main/LICENSE
 * 
 * In Memory of Shaun "Gumby" Gumm
 */

((root, factory) => {
    typeof define === 'function' && define.amd // amd
        ? define(['exports', 'gumbyJS'], factory)
        : typeof exports === 'object' && typeof module !== 'undefined' // common
            ? factory(exports, require("gumbyJS")) 
            : factory((root.gumbyJS.storage = {}), root.gumbyJS);  // global
})(this, (exports, core) => {
    'use strict';

    let vars = {
        cache: { }
    },
    fns = {
        cache: {
            add: (name, value) => {
                vars.cache[name] = encodeURI(JSON.stringify(value));
            },
            get: (name) => JSON.parse(decodeURI(vars.cache[name])),
            remove: (name) => {
                delete vars.cache[name];
            },
            clr: () => {
                vars.cache = {};
            }
        },
        cookies: {
            add: (name, value, exDays, domain, path) => {
                let d = new Date();
                d.setTime(d.getTime() + ((exDays || 30) * 24 * 60 * 60 * 1000));
                let v = encodeURI(JSON.stringify(value || "")),
                    e = d.toUTCString(),
                    c = [
                        name + "=" + v,
                        "expires=" + e,
                        "domain=" + (domain || window.location.host),
                        "path=" + (path || "/")
                    ].join(";");
                document.cookie = c;
            },
            get: (name) => {
                name += "=";
                let ca = document.cookie.split(';');
                for (let i = 0; i < ca.length; i++) {
                    let c = ca[i];
                    while (c.charAt(0) == ' ') c = c.substr(1);
                    if (c.indexOf(name) == 0)
                        return JSON.parse(decodeURI(c.substr(name.length, c.length)));
                }
                return "";
            },
            remove: (name) => {
                fns.cookies.add(name, undefined, -1);
            }
        },
        local: {
            add: (name, value) => {
                fns.local.remove(name);
                localStorage.setItem(name, encodeURI(JSON.stringify(value)));
            },
            get: (name) => JSON.parse(decodeURI(localStorage.getItem(name))),
            remove: (name) => {
                localStorage.removeItem(name);
            }
        },
        session: {
            add: (name, value) => {
                fns.session.remove(name);
                sessionStorage.setItem(name, encodeURI(JSON.stringify(value)));
            },
            get: (name) => JSON.parse(decodeURI(sessionStorage.getItem(name))),
            remove: (name) => {
                sessionStorage.removeItem(name);
            },
            clr: () => {
                sessionStorage.clear();
            }
        }
    };
    exports.cache = {
        add: (name, value) => fns.cache.add(name, value),
        get: (name) => fns.cache.get(name),
        remove: (name)=> fns.cache.remove(name),
        clr: () => fns.cache.clr()
    };
    exports.cookie = {
        add: (name, value, exDays, domain, path) => fns.cookies.add(name, value, exDays, domain, path),
        get: (name) => fns.cookies.get(name),
        remove: (name) => fns.cookies.remove(name)
    };
    exports.local = {
        add: (name, value) => fns.local.add(name, value),
        get: (name) => fns.local.get(name),
        remove: (name) => fns.local.remove(name)
    };
    exports.session = {
        add: (name, value) => fns.session.add(name, value),
        get: (name) => fns.session.get(name),
        remove: (name) => fns.session.remove(name),
        clr: () => fns.session.clr()
    };
});
