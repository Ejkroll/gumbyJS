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
    typeof define === 'function' && define.amd
        ? define(['exports'], factory)
        : typeof exports === 'object' && typeof module !== 'undefined'
            ? factory(exports) 
            : (root = root || self, factory(root));
})(this, (exports) => {
    'use strict';

    exports.gumby = (function(){
        let vars = {

            },
            fns = {
                _isArr: function(o){ 
                    return Array.isArray(o); 
                },
                _isWrapped: function(o, s, c) { 
                    return o ? o[0] === s && o[o.length - 1] === c : false; 
                },
                _arrProxy: function(o) { 
                    return new Proxy(o, {
                        get(target, prop) {
                            if (!isNaN(prop)) {
                                prop = parseInt(prop, 10);
                                if (prop < 0) prop += target.length;
                            }
                            return target[prop];
                        }
                    });
                },
                _hasProp: function(o, p) { 
                    return Object.prototype.hasOwnProperty.call(o, p); 
                },
                _type: function(o) { 
                    return Object.prototype.toString.call(o); 
                },
    
                clone: function(o) {
                    if (o === null || typeof (o) !== 'object') return o;
                    let s = gumby, temp = o.constructor();
                    for (let p in o) {
                        if (Object.prototype.hasOwnProperty.call(o, p)) {
                            o['isActiveClone'] = null;
                            temp[p] = s.clone(o[p]);
                            delete o['isActiveClone'];
                        }
                    }
                    return temp;
                },
                combine: function () {
                    let s = gumby, e = {}, d = false, i = 0;
                    if (s._type(arguments[0]) === '[object Boolean]') { d = arguments[0]; i++; }
                    let m = function (o) {
                        for (var p in o) {
                            if (!s._hasProp(o, p)) continue;
                            e[p] = d && s._type(o[p]) === '[object Object]' 
                                ? s.combine(d, c, e[p], o[p]) 
                                : s._isArr(o[p])
                                    ? (e[p] || []).concat(o[p])
                                    : o[p];
                        }
                    };
                    for (; i < arguments.length; i++)  m(arguments[i]);
                    return e;
                },     
                extend: function () {
                    let s = gumby, e = {}, d = false, i = 0;
                    if (s._type(arguments[0]) === '[object Boolean]') { d = arguments[0]; i++; }
                    let m = function (o) {
                        for (var p in o) {
                            if (!s._hasProp(o, p)) continue;
                            e[p] = d && s._type(o[p]) === '[object Object]' 
                                ? s.extend(d, e[p], o[p])
                                : o[p];
                        }
                    };
                    for (; i < arguments.length; i++)  m(arguments[i]);
                    return e;
                },            
                xiny: function(x, y, c) {
                    let s = gumby, ns = (x || "").replace(/\[|\]/g, '.').split(".").filter(n => { return n != ""; }),
                        fn = (ns, o, c) => {
                            let n = ns[0];
                            if (!n || !o) return o;
                            ns = ns.slice(1);
                            if (s._isArr(o) && n === "*") return o.map(e => fn(ns, e, c));
                            if (!c) return fn(ns, o[n] !== undefined ? o[n] : undefined, c);
                            for (let f in o)
                                if (f.toLowerCase() === n.toLowerCase())
                                    return fn(ns, o[f], c);
                        };
                    return y ? fn(ns, y, c) : y;
                },
                xtoy: function(x, y, e) {
                    let s = gumby;
                    if(!s._type(x) === s._type(y)) return console.error("object type mismatch!");
                    y = y || (s._isArr(x) ? [] : {});
                    for (let p in x)
                        y[p] = typeof x[p] == "object" 
                            ? s.xtoy(x[p], y[p], e) 
                            : e 
                                ? y[p] 
                                    ? x[p]
                                    : y[p] 
                                : x[p];
                    return y;
                },
                rnd: function(min, max) { 
                    return Math.floor((Math.random() * max) + min); 
                },
                findMatchingClosure: function(opn, cls, str, pos) {
                    if(!opn || opn.length === 0) throw new Error(`Invalid open '${opn}'`);
                    if(!cls || cls.length === 0) throw new Error(`Invalid closure '${cls}'`);
                    if(!str || str.length === 0) throw new Error(`Invalid string`);
                    if(pos < 0 || pos + opn.length > str.length) throw new Error(`Invalid position '${pos}'`);
                    if (str.substr(pos, opn.length) != opn) throw new Error(`No '${opn}' at index ${pos}`);
    
                    let depth = 1;
                    for (let i = pos + opn.length; i < str.length; i++) {
                        let opnVal = str.substr(i, opn.length),
                            clsVal = str.substr(i, cls.length);
                        if(opnVal === opn){
                            depth++;
                        } else if(clsVal === cls){
                            if (--depth === 0) return i;
                        }
                    }
                    return -1;
                },
    
                shape: function(x, y, callback) {
                    if(!x) throw "no path found!";  
                    let c = this, g = gumby, ns = g.shapeParse(x),
                        fn = (ns, o) => {
                            let n = ns[0];
                            if(!n || !o) return g.shapeResult.apply(c, [o, callback]);
                            ns = ns.slice(1);
    
                            if(n === "*") return o;                    
                            if(n === "$") return fn.apply(g, [ns, y]);
                            if(n === "..") return fn.apply(g, [ns, g.shapeRecursiveDescendantOperator(o)]);
                            if(g._isWrapped(n, "[", "]")) return fn.apply(g, [ns, g.shapeSubscriptOperator(n.substr(1, n.length - 2), o)]);
    
                            // catch all, handle array as mapping or dir obj
                            return g._isArr(o) 
                                ? o.filter(i => i[n]).map(i => fn.apply(g, [ns, i[n]])) 
                                : fn.apply(g, [ns, o[n]]);
                        };
                    return y ? fn.apply(g, [ns, y, callback]) : y;
                },
                shapeParse: function(path) {
                    return path ? path.split(/(\$|\.\.|\.|\[.+\])/g).filter(n => n && n.length > 0 && n !== '.') : [];
                },
                shapeResult: function(result, callback) { 
                    if(!result) return result;
                    let c = this, g = gumby, ret = g._isArr(result) ? result : [result];
                    if(typeof callback === "function")
                        ret = ret.map((e, i, a) => callback.apply(c, [e, i, a]));
                    return ret.length > 1 ? ret : ret[0];
                },
                shapeRecursiveDescendantOperator: function(obj) {
                    let g = gumby, ret = [];
                    for(var p in obj)
                    {
                        if(typeof obj[p] !== "object") continue;                
                        (!g._isArr(obj[p]) ? [obj[p]] : obj[p])
                            .forEach(o => {
                                ret.push(o);
                                ret = ret.concat(g.shapeRecursiveDescendantOperator(o));
                            });
                    }
                    return ret;
                },
                shapeSubscriptOperator: function(command, arr){
                    let g = gumby;
                    if(!command) throw "invalid array command";
                    if(command === "*") return arr;
                    if(!isNaN(command)) return arr[command]; // assume standard index operator
                    return command.indexOf('(') > -1 && command.indexOf(')') > -1
                        ? g.shapeEvaluationOperator(command, arr)
                        : g.shapeArrayOperator(command, arr);
                },
                shapeArrayOperator: function(command, arr) {
                    let g = gumby;
                    if(!command) throw "invalid array command";
                    let isUnion = command.indexOf(',') > -1,
                        isSlice = command.indexOf(':') > -1;
                    if(isUnion === isSlice)  throw "invalid array command";
                    if(isUnion) return g.shapeUnionOperator(command, arr);
                    if(isSlice) return g.shapeSliceOperator(command, arr);
                },
                shapeSliceOperator: function(command, arr) {
                    let ret = [],
                        len = arr.length,
                        parts = command.split(':'),
                        start = parseInt(parts[0] || 0),
                        end = parseInt(parts[1] || len),
                        step = parseInt(parts[2] || 1);
    
                        if(start < 0) start = len + start;
                        if(end < 0) end = len + end;
    
                    for(let i = start; i < end; i = i + step)
                        if(arr[i]) ret.push(arr[i]);
    
                    return ret;
                },
                shapeUnionOperator: function(command, arr) {
                    let g = gumby, ret = [],
                        proxy = g._arrProxy(arr),
                        idxs = command.split(',');
                    for(var i = 0; i < idxs.length; i++)
                    {
                        let val = proxy[idxs[i]];
                        if(val) ret.push(val);
                    }
                    return ret;
                },
                shapeEvaluationOperator: function(command, arr) {
                    let isFilter = command.indexOf("?") === 0,
                        cmd = command.replace(/\?/g, "").replace(/@/g, "_o_"),
                        fn = Function("_o_", `"use strict"; return ${cmd};`);
                    return isFilter ? arr.filter(fn) : arr[fn(arr)];
                },
    
                scope: function(data, scoping, callback) {
                    let c = this,
                        g = gumby,
                        _defaults = {
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
                            }
                        },
                        _options = g.extend({}, _defaults, scoping),
                        _data = data;
    
                    if(typeof data === "function")
                    {
                        _data = data.apply(c, [_options.filter, _options.sort, _options.pager]);
                    } else {
                        _data = g.scopeFilter(_data, _options.filter, _options);
                        _data = g.scopeSort(_data, _options.sort, _options);
                        _data = g.scopePage(_data, _options.pager, _options);
                    }
    
                    if(typeof callback === "function")
                        callback.apply(g, [_data, scoping]);
    
                    return _data;
                },
                scopeFilter: function(data, filter, _options) {
                    // needs rewritten, rule fn ends up bloated and duplicated.
                    // filter = { filterOp: "and", rules: [ { field: "fieldName", value: "fieldValue", op: "in" } ], filter: [] }
                    if (data == undefined || filter == undefined || filter["filterOp"] == undefined) return data;
                    let g = gumby,
                        filterFn = (f) => {
                        let q = [],
                            valFn = (v) => { return typeof v === "string" ? "'" + v + "'" : v; },
                            ruleFn = (r) => {
                                let e = g.xiny(r.op, _options.operations.equations, true);
                                return "" +
                                    "((a, b) => { " +
                                        "a = a === undefined ? null : \"\" + a; " +
                                        "b = b === undefined ? null : \"\" + b; " +
                                        "return " + e + ";" + 
                                    "})(gumby.xiny(" + valFn(r.field) + ", o), " + valFn(r.value) + ")";
                            };
    
                        for (let i in f.rules)
                            q.push(ruleFn(f.rules[i]));
                        
                        for (let i in f.filters)
                            q.push(filterFn(f.filters[i]));
    
                        return q.length > 0
                            ? "(" + q.join(" " + g.xiny(f.filterOp, _options.operations.groupings, true) + " ") + ")"
                            : "true";
                    },
                    fn = new Function("o", "return " + filterFn(filter) + ";");
                    return data.filter(fn);
                },
                scopeSort: function(data, sort) {
                    if (data === undefined || sort === undefined || sort.length === 0) return data;
                    let g = gumby, cmp = (a, b) => (a > b) - (a < b);
                    data.sort(function (a, b) {
                        let r = 0;
                        for (let i = 0; i < sort.length; i++) {
                            let f = sort[i]["field"];
                            let d = sort[i]["direction"];
                            if (f === undefined || f === "" || d === undefined || d === "") continue;
                            let av = g.xiny(f, a);
                            let bv = g.xiny(f, b);
                            d = (d === -1 || d === "desc" || d === "descending") ? -1 : 1;
                            r = cmp(av, bv) * d;
                            if (r !== 0) break;
                        }
                        return r === 0 ? 0 : r > 0 ? 1 : -1;
                    });
                    return data;
                },
                scopePage: function(data, pager) {
                    let g = gumby;
                    if(data === undefined || pager === undefined || !g._isArr(data)) return data;
                    if (isNaN(pager.page) || isNaN(pager.size) || pager.size === 0) return;
    
                    let max = Math.floor(data.length / pager.size);				
                    pager.page = pager.page < 0 ? 0 : pager.page;
                    pager.page = pager.page > max ? max : pager.page;
                    let 
                        start = Math.max(pager.page * pager.size, 0),
                        end = start + pager.size;
                    return data.slice(start, end);
                },
    
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
        return fns;
    })();

    let GumbyJS = function(){
        'use strict';
        
        let self = this,
            core = gumby.extend({}, gumby, {
                vars : {
                    events: {}
                },
                fns : {
                    trigger: function(name) {
                        let args = [];
                        for (var i in arguments)
                            if (arguments.hasOwnProperty(i))
                                if (i > 0) args.push(arguments[i]);
                                
                        if (!Array.isArray(vars.events[name])) return
                        core.vars.events[name].forEach((callback) => { callback.apply(self, args); });
                    },
                    on: function(name, callback) {
                        if (!Array.isArray(vars.events[name])) 
                        core.vars.events[name] = [];
                
                        core.vars.events[name].push(callback);
                        return callback;
                    },
                    off: function(name, callback) {
                        let sub = vars.events[name];
                        if(!sub) return;
    
                        let idx = sub.indexOf(callback);
                        if(idx == -1) return;
    
                        core.vars.events[name].splice(idx, 1);
                    }
                }
            });

        self.rnd = function(min, max){ return core.fns._rnd(min, max); };
        self.clone = function(o){ return core.fns.clone.call(self, o); };
        self.combine = function () { return core.fns.combine.apply(self, arguments); };
        self.extend = function () { return core.fns.extend.apply(self, arguments); };
        self.xiny = function(x, y, caseInsensitive) { return core.fns.xiny.apply(self, [x, y, caseInsensitive]); };
        self.xtoy = function(x, y, existingOnly) { return core.fns.xtoy.apply(self, [x, y, existingOnly]); };        

        self.shape = function(query, data, callback) { return core.fns.shape.apply(self, [query, data, callback]); };
        self.scope = function(data, scoping, callback) { return core.fns.scope.apply(self, [data, scoping, callback]); };
        
        self.events = {
            trigger : function(name) { core.fns.trigger.call(self, name); },
            on : function(name, callback) { core.fns.on.apply(self, [name, callback]); },
            off : function(name, callback) { core.fns.off.apply(self, [name, callback]); }
        };

        self.cache = {
            add: (name, value) => core.fns.cache.add(name, value),
            get: (name) => core.fns.cache.get(name),
            remove: (name) => core.fns.cache.remove(name),
            clr: () => core.fns.cache.clr()
        };
        self.cookies = {
            add: (name, value, exDays, domain, path) => core.fns.cookies.add(name, value, exDays, domain, path),
            get: (name) => core.fns.cookies.get(name),
            remove: (name) => core.fns.cookies.remove(name)
        };
        self.local = {
            add: (name, value) => core.fns.local.add(name, value),
            get: (name) => core.fns.local.get(name),
            remove: (name) => core.fns.local.remove(name)
        };
        self.session = {
            add: (name, value) => core.fns.session.add(name, value),
            get: (name) => core.fns.session.get(name),
            remove: (name) => core.fns.session.remove(name),
            clr: () => core.fns.session.clr()
        };

        return self;
    }

    exports.Gumby = GumbyJS;
});
