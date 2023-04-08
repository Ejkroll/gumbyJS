/*!
 * gumbyJS 1.0.0
 * https://github.com/Ejkroll/gumbyJS
 *
 * Released under the MIT license
 * https://github.com/Ejkroll/gumbyJS/blob/main/LICENSE
 * 
 * In Memory of Shaun "Gumby" Gumm
 * 
 * Goal: to be able to display data in any way
 */

gumby = (() => { 
    'use strict';

    let _this = {
        fns: {
            clone: (o) => {
                if (o === null || typeof (o) !== 'object') return o;
                let temp = o.constructor();
                for (let p in o) {
                    if (Object.prototype.hasOwnProperty.call(o, p)) {
                        o['isActiveClone'] = null;
                        temp[p] = _this.fns.clone(o[p]);
                        delete o['isActiveClone'];
                    }
                }
                return temp;
            },
            extend: function () {
                let s = _this.fns, e = {}, d = false, i = 0;
                if (Object.prototype.toString.call(arguments[0]) === '[object Boolean]') { d = arguments[0]; i++; }
                let m = function (o) {
                    for (var p in o) {
                        if (!Object.prototype.hasOwnProperty.call(o, p)) continue;
                        e[p] = d && Object.prototype.toString.call(o[p]) === '[object Object]' 
                            ? s.extend.apply(s, [true, e[p], o[p]]) 
                            : Array.isArray(o[p])
                                ? (e[p] || []).concat(o[p])
                                : o[p];
                    }
                };
                for (; i < arguments.length; i++)  m(arguments[i]);
                return e;
            },
            rnd: (min, max) => Math.floor((Math.random() * max) + min),
            xiny: (x, y, c) => {
                let ns = (x || "").replace(/\[|\]/g, '.').split(".").filter(n => { return n != ""; }),
                    fn = (ns, o, c) => {
                        let n = ns[0];
                        if (!n || !o) return o;
                        ns = ns.slice(1);
                        if (Array.isArray(o) && n === "*") return o.map(e => fn(ns, e, c));
                        if (!c) return fn(ns, o[n] !== undefined ? o[n] : undefined, c);
                        for (let f in o)
                            if (f.toLowerCase() === n.toLowerCase())
                                return fn(ns, o[f], c);
                    };
                return y ? fn(ns, y, c) : y;
            },
            xtoy: (x, y, e) => {
                x = x || {};
                y = y || {};
                for (let p in x)
                    y[p] = e ? y[p] ? x[p] : y[p] : x[p];
                return y;
            }
        }
    };

    return {
        clone: (o) => _this.fns.clone(o),
        extend: function () {
            return _this.fns.extend.apply(this, arguments);
        },
        rnd: (min, max) => _this.fns.rnd(min, max),
        xiny: (x, y, c) => _this.fns.xiny(x, y, c),
        xtoy: (x, y, e) => _this.fns.xtoy(x, y, e)
    };
})();

gumby.storage = (() => {
    'use strict';
    let _this = {
        vars: {
            cache: { }
        },
        fns: {
            cache: {
                add: (name, value) => {
                    _this.vars.cache[name] = encodeURI(JSON.stringify(value));
                },
                get: (name) => JSON.parse(decodeURI(_this.vars.cache[name])),
                remove: (name) => {
                    delete _this.vars.cache[name];
                },
                clr: () => {
                    _this.vars.cache = {};
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
                    _this.fns.cookies.add(name, undefined, -1);
                }
            },
            local: {
                add: (name, value) => {
                    _this.fns.local.remove(name);
                    localStorage.setItem(name, encodeURI(JSON.stringify(value)));
                },
                get: (name) => JSON.parse(decodeURI(localStorage.getItem(name))),
                remove: (name) => {
                    localStorage.removeItem(name);
                }
            },
            session: {
                add: (name, value) => {
                    _this.fns.session.remove(name);
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
        }
    };
    return {
        cache: {
            add: (name, value) => _this.fns.cache.add(name, value),
            get: (name) => _this.fns.cache.get(name),
            remove: (name)=> _this.fns.cache.remove(name),
            clr: () => _this.fns.cache.clr()
        },
        cookie: {
            add: (name, value, exDays, domain, path) => _this.fns.cookies.add(name, value, exDays, domain, path),
            get: (name) => _this.fns.cookies.get(name),
            remove: (name) => _this.fns.cookies.remove(name)
        },
        local: {
            add: (name, value) => _this.fns.local.add(name, value),
            get: (name) => _this.fns.local.get(name),
            remove: (name) => _this.fns.local.remove(name)
        },
        session: {
            add: (name, value) => _this.fns.session.add(name, value),
            get: (name) => _this.fns.session.get(name),
            remove: (name) => _this.fns.session.remove(name),
            clr: () => _this.fns.session.clr()
        }
    };
})();

gumby.pubsub = (() => {
    'use strict';
    let _this = {
        vars: {
            subscribers : {}
        },
        fns: {
            publish: function(name){
                var args = [];
                    for (var i in arguments)
                        if (arguments.hasOwnProperty(i))
                            if (i > 0) args.push(arguments[i]);
                        
                if (!Array.isArray(_this.vars.subscribers[name])) return
                _this.vars.subscribers[name].forEach((callback) => { callback.apply(this, args); });
            },
            subscribe: (name, callback) => {
                if (!Array.isArray(_this.vars.subscribers[name])) 
                _this.vars.subscribers[name] = [];
        
                _this.vars.subscribers[name].push(callback);
                return callback;
            },
            unsubscribe: (name, callback) => {
                var sub = _this.vars.subscribers[name];
                if(!sub) return;
                var idx = sub.indexOf(callback);
                if(idx == -1) return;
                _this.vars.subscribers[name].splice(idx, 1);
            }
        }
    };
    return {
        publish: function(name){
            _this.fns.publish.apply(this, arguments);
        },
        subscribe: function(name, callback){
            _this.fns.subscribe.apply(this, [name, callback]);
        },
        unsubscribe: function(name, callback){
            _this.fns.unsubscribe.apply(this, [name, callback]);
        }
    }
})();

gumby.data = (() => {
    'use strict';
    let _defaults = {
        sort: [],
        pager: { page: 0, size: 25 },
        filter: undefined,
        operations : {
            groupings: {
                "and"	:	"&&",
                "or" 	:	"||"
            },
            equations: {
                "eq": "a === b",
                "ne": "a !== b",
                "in": "a.indexOf(b) > -1",
                "ni": "a.indexOf(b) === -1",
                "gt": "a > b",
                "lt": "a < b",
                "ge": "a >= b",
                "le": "a <= b",
                "nu": "a === null",
                "nn": "a !== null",
                // invariant
                "ieq": "a.toUpperCase() === b.toUpperCase()",
                "ine": "a.toUpperCase() !== b.toUpperCase()",
                "iin": "a.toUpperCase().indexOf(b.toUpperCase()) > -1",
                "ini": "a.toUpperCase().indexOf(b.toUpperCase()) === -1"                
            }	
        },
        verbose: false
    },
    _options = gumby.extend({}, _defaults),
    _this = {
        fns: {
            bindOptions: (opts) => {
            	_options = gumby.extend({}, _defaults, _options, opts);
            	for(var i = 0; i < _options.sort.length; i++)
            		if(typeof _options.sort[i].direction == "string"){
            			_options.sort[i].direction = _options.sort[i].direction.toLowerCase().indexOf("d")  > -1 ? -1 : 1;
            		}
            	return _options;
            },
            load: (data) => {
                var d = gumby.clone(data);
                d = _this.fns.filter(d, _options.filter);
                d = _this.fns.sort(d, _options.sort);
                d = _this.fns.page(d, _options.pager);
                return d;
            },
            filter: (data, filter) => {
                // needs rewritten, rule fn ends up bloated and duplicated.
                if (data == undefined || filter == undefined || filter["filterOp"] == undefined) return data;
                let filterFn = function (f) {
                    let q = [],
                        valFn = (v) => { return typeof v === "string" ? "'" + v + "'" : v; },
                        ruleFn = function (r) {
                            var e = gumby.xiny(r.op, _options.operations.equations, true);
                            return "" +
                                "((a, b) => { " +
                                    "a = a === undefined ? null : \"\" + a; " +
                                    "b = b === undefined ? null : \"\" + b; " +
                                    "return " + e + ";" + 
                                "})(gumby.xiny(" + valFn(r.field) + ", o), " + valFn(r.value) + ")";
                        };

                    for (var i in f.rules)
                        q.push(ruleFn(f.rules[i]));
                    
                    for (var i in f.filters)
                        q.push(filterFn(f.filters[i]));

                    return q.length > 0
                        ? "(" + q.join(" " + gumby.xiny(f.filterOp, _options.operations.groupings, true) + " ") + ")"
                        : "true";
                },
                fn = new Function("o", "debugger; return " + filterFn(filter) + ";");
                _this.fns.verbose("gumby.data.filter", fn);
                return data.filter(fn);
            },
            sort: (data, sort) => {
                if (data === undefined || sort === undefined || sort.length === 0) return data;
                var cmp = (a, b) => (a > b) - (a < b);
                data.sort(function (a, b) {
                    let r = 0;
                    for (let i = 0; i < sort.length; i++) {
                        let f = sort[i]["field"];
                        let d = sort[i]["direction"];
                        if (f === undefined || f === "" || d === undefined || d === "") continue;
                        let av = gumby.xiny(f, a);
                        let bv = gumby.xiny(f, b);
                        d = (d === -1 || d === "desc" || d === "descending") ? -1 : 1;
                        r = cmp(av, bv) * d;
                        if (r !== 0) break;
                    }
                    return r === 0 ? 0 : r > 0 ? 1 : -1;
                });
                _this.fns.verbose("gumby.data.sort", sort);
                return data;
            },
            page: (data, pager) => {
                if(data === undefined || pager === undefined) return data;
                if (isNaN(pager.page) || isNaN(pager.size) || pager.size === 0) return;

                let max = Math.floor(data.length / pager.size);				
                pager.page = pager.page < 0 ? 0 : pager.page;
                pager.page = pager.page > max ? max : pager.page;
                let 
                    start = Math.max(pager.page * pager.size, 0),
                    end = start + pager.size;
                    _this.fns.verbose("gumby.data.page", {
                        start: start,
                        end: end,
                        min: 0,
                        max: max,
                        total: data.length
                    });
                    
                return data.slice(start, end);
            },
            verbose: (n, o) => {
                if(!_options.verbose) return;
                console.info(n, o ? JSON.stringify(o) : "");
            }
        }
    };
    return {
        options : (o) => _this.fns.bindOptions(o),
		execute : (d, o) => {
            if(o)
                _this.fns.bindOptions(o);
			return _this.fns.load(d);
		},
        help : () => {
            return {
                sort: [ { "field" : "fieldnamegoeshere", "direction" : "desc"} ],
                pager: { page: 0, size: 25 },
                filter: {
                    filterOp: "AND",
                    rules: [{
                        field: "fieldnamegoeshere",
                        op: "eq",
                        value: "exactvalue"
                    }],
                    filters: []
                }
            }
        }
    };
})();

gumby.template = (() => {
    'use strict';
    var _defaults = {
        tagOpen: "{{",
        tagClose: "}}",
        tagClosure: "/"
    },
    _options = gumby.extend({}, _defaults),
    _this = {
        vars: {
            cache: {}
        },
        fns: {
            bindOptions: (opts) => {
                _options = gumby.extend({}, _defaults, _options, opts);
                return _options;
            },
            generateFn: (template) => {
                if (_this.vars.cache[template]) return _this.vars.cache[template];

                var t = template.slice().replace(/\r/g, "\\r").replace(/\n/g, "\\n");

                let tagOpenLn = _options.tagOpen.length,
                    tagCloseLn = _options.tagClose.length,
                    tagClosurelLn = _options.tagClosure.length,
                    tagFunction = ((template, index) => {
                        index = index || -1;
                        let tagStart = template.indexOf(_options.tagOpen, index),
                            tagEnd = template.indexOf(_options.tagClose, index);

                        if (tagStart == -1 || tagEnd == -1) return template;

                        tagEnd += tagCloseLn;

                        let tag = template.substr(tagStart, tagEnd - tagStart),
                            isClosure = tag.indexOf(_options.tagClosure) == tagOpenLn,
                            field = isClosure
                                ? tag.substr(tagOpenLn + tagClosurelLn, tag.length - (tagOpenLn + tagClosurelLn + tagCloseLn))
                                : tag.substr(tagOpenLn, tag.length - (tagOpenLn + tagCloseLn)),
                            closureStart = template.indexOf(_options.tagOpen + _options.tagClosure + field + _options.tagClose, tagEnd),
                            mod = "";
                                                        
                        if (closureStart !== -1) {
                            // is a complex start
                            mod = "\" + ((o) => { return (Array.isArray(o) ? o : [o]).map((o) => { return \"";
                        } else if (isClosure) {
                            // is a complex closure
                            mod = "\"; }).join(''); })(gumby.xiny(\"" + field + "\", o)) + \"";
                        } else {
                            // is a normal field
                            mod = "\" + gumby.xiny(\"" + field + "\", o) + \"";
                        }

                        template = template.substr(0, tagStart) + mod + template.substr(tagEnd);

                        return tagFunction(template, tagEnd);
                    });

                var fn = new Function("o", "return \"" + tagFunction(t) + "\";");

                _this.vars.cache[template] = fn;

                return fn;
            },
            generateDom: (str) => {
                try {
                    var d = new DOMParser().parseFromString(str, 'text/html');
                    return d.body.children;
                }
                catch (err) {
                    var d = document.createElement('div');
                    d.innerHTML = str;
                    return d.children;
                }
            }
        }
    };
    return {
        options: (o) => _this.fns.bindOptions(o),
        generateFn: (t) => _this.fns.generateFn(t.replaceAll('"', '\\"')),
        generateDom: (s) => _this.fns.generateDom(s)
    }
})();
