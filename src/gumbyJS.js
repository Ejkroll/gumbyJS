/*!
 * gumbyJS 1.0.0
 * https://github.com/Ejkroll/gumbyJS
 *
 * Released under the MIT license
 * https://github.com/Ejkroll/gumbyJS/blob/main/LICENSE
 * 
 * In Memory of Shaun "Gumby" Gumm
 */

gumby = (() => { 
    'use strict';

    let _this = {
        fns: {
            extend: function () {
                let s = _this.fns, e = {}, d = false, i = 0;
                if (Object.prototype.toString.call(arguments[0]) === '[object Boolean]') { d = arguments[0]; i++; }
                let m = function (o) {
                    for (var p in o) {
                        if (!Object.prototype.hasOwnProperty.call(o, p)) continue;
                        e[p] = d && Object.prototype.toString.call(o[p]) === '[object Object]' ? s.extend.apply(s, [true, e[p], o[p]]) : o[p];
                    }
                };
                for (; i < arguments.length; i++)  m(arguments[i]);
                return e;
            },
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
            xiny: (x, y, i) => {
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
                return y ? fn(ns, y, i) : y;
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
        extend: function () {
            return _this.fns.extend.apply(this, arguments);
        },
        clone: (o) => _this.fns.clone(o),        
        xiny: (x, y, i) => _this.fns.xiny(x, y, i),
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
                get: (name) => {
                    return JSON.parse(decodeURI(_this.vars.cache[name]));
                },
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
                    this.add(name, undefined, -1);
                }
            },
            local: {
                add: (name, value) => {
                    _this.fns.local.remove(name);
                    localStorage.setItem(name, encodeURI(JSON.stringify(value)));
                },
                get: (name) => {
                    return JSON.parse(decodeURI(localStorage.getItem(name)));
                },
                remove: (name) => {
                    localStorage.removeItem(name);
                }
            },
            session: {
                add: (name, value) => {
                    _this.fns.session.remove(name);
                    sessionStorage.setItem(name, encodeURI(JSON.stringify(value)));
                },
                get: (name) => {
                    return JSON.parse(decodeURI(sessionStorage.getItem(name)));
                },
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
            add: (name, value) => {
                _this.fns.cache.add(name, value);
            },
            get: (name) => {
                return _this.fns.cache.get(name);
            },
            remove: (name)=> {
                _this.fns.cache.remove(name);
            },
            clr: ()=> {
                _this.fns.cache.clr();
            }
        },
        cookie: {
            add: (name, value, exDays, domain, path) => {
                _this.fns.cookies.add(name, value, exDays, domain, path);
            },
            get: (name) => {
                return _this.fns.cookies.get(name);
            },
            remove: (name) => {
                _this.fns.cookies.remove(name);
            }
        },
        local: {
            add: (name, value) => {
                _this.fns.local.add(name, value);
            },
            get: (name) => {
                return _this.fns.local.get(name);
            },
            remove: (name) => {
                _this.fns.local.remove(name);
            }
        },
        session: {
            add: (name, value) => {
                _this.fns.session.add(name, value);
            },
            get: (name) => {
                return _this.fns.session.get(name);
            },
            remove: (name) => {
                _this.fns.session.remove(name);
            },
            clr: () => {
                _this.fns.session.clr();
            }
        }
    };
})();

gumby.events = (() => {
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
            subscribe: function(name, callback){
                if (!Array.isArray(_this.vars.subscribers[name])) 
                _this.vars.subscribers[name] = [];
        
                _this.vars.subscribers[name].push(callback);
                return callback;
            },
            unsubscribe: function(name, callback){
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
            _this.fns.publish.apply(this, [name]);
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
                "eq"	:	"a === b",
                "ne"	:	"a !== b",
                "in"	:	"a.indexOf(b) > -1",
                "ni"	:	"a.indexOf(b) === -1",
                "gt"	:	"a > b",
                "lt"	:	"a < b",
                "ge"	:	"a >= b",
                "le"	:	"a <= b",
                "nu"	:	"a === null",
                "nn"	:	"a !== null",
            }	
        },
        verbose: false
    },
    _options = gumby.extend({}, _defaults),
    _this = {
        fns: {
            bindOptions: function(opts){
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
            filter: function (data, filter) {                
                if (data == undefined || filter == undefined || filter["filterOp"] == undefined) return data;
                let filterFn = function (f) {
                    let q = [],
                        valFn = (v) => { return typeof v === "string" ? "'" + v + "'" : v; },
                        ruleFn = function (r) {
                            var e = gumby.xiny(r.op, _options.operations.equations, true);
                            return "" +
                                "((a, b) => { " +
                                    "if(!a) return false; " +
                                    "if(!b) b = null; " +
                                    "return " + e + ";" +
                                " })(gumby.xiny(" + valFn(r.field) + ", o), " + valFn(r.value) + ")";
                        };

                    for (var i in f.rules)
                        q.push(ruleFn(f.rules[i]));
                    
                    for (var i in f.filters)
                        q.push(filterFn(f.filters[i]));

                    return q.length > 0
                        ? "(" + q.join(" " + gumby.xiny(f.filterOp, _options.operations.groupings, true) + " ") + ")"
                        : "true";
                },
                fn = new Function("o", "return " + filterFn(filter) + ";");
                _this.fns.verbose("gumby.data.filter", fn);
                return data.filter(fn);
            },
            sort: function(data, sort){						
                if(data === undefined || sort === undefined) return data;

                var cmp = (a, b) => (a > b) - (a < b);
                data.sort(function(a, b){
                    let r = 0;
                    for(let i = 0; i < sort.length; i++)
                    {
                        let f = sort[i]["field"];
                        let d = sort[i]["direction"];
                        if(f != undefined && f != "" && d != undefined && d != ""){
                            let av = gumby.xiny(f, a);
                            let bv = gumby.xiny(f, b);
                            sort[i]["direction"] = (d == "desc" || d == "descending") ? -1 : 1;
                            r = r || (cmp(av, bv) * sort[i]["direction"]);
                        }
                    }
                    return r;
                });
                _this.fns.verbose("gumby.data.sort", sort);
                return data;
            },
            page: function(data, pager){
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
        options : (o) => {  
			return _this.fns.bindOptions(o);			 
		},
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
        tagOpen		:	"{{",
        tagClose	:	"}}",
        tagArray	:	"[]",
        tagClosure	:	 "/"
    },
    _options = gumby.extend({}, _defaults),
    _this = {        
        vars : {
            cache: {}
        },
        fns : {
            bindOptions: function(opts){
            	_options = gumby.extend({}, _defaults, _options, opts);
            	return _options;
            },
            tagFn: function(d, idx, ot, pt){
                idx = idx || -1;
                ot = ot || [];
                pt = pt || [];
                var 
                    oi = d.indexOf(_options.tagOpen, idx),
                    ci = d.indexOf(_options.tagClose, idx);
                if(oi !== -1 && oi < ci){
                    ot.unshift(oi);
                    idx = oi + _options.tagOpen.length;
                } else {
                    var o = ot.shift();
                    if(ot.length == 0){
                        var
                            s	=	o,
                            e	=	ci + _options.tagClose.length,
                            t	=	d.substr(s, e - s),
                            f	=	_this.fns.fieldFn(t),
                            a	=	t.indexOf(f + _options.tagArray) > -1,
                            c	=	t.indexOf(_options.tagClosure + f + _options.tagArray) > -1,
                            x	=	f.indexOf(_options.tagOpen) > -1 && f.indexOf(_options.tagClose) > -1,
                            xf =	x ? _this.fns.fieldFn(f) : f;
                        if(!a && !c && xf.length > 0){
                            d = d.substr(0, s) + (x ? '" + (function(){ var v = ""; debugger; with(p){ try{ v = eval(' + xf + '); } catch(e) { console.warn(e); } return v; }; })() + "' : '" + ' + xf + ' + "') + d.substr(e);
                        }
                        if(a)
                            if(!c){
                                pt.unshift(f);
                                d = d.substr(0, s) + '" + (function(o, p){ var t = ""; for(var i = 0; i < o.length; i++){ var itm = o[i]; debugger; with(itm){ t += "' + d.substr(e);
                            }else {
                                pt.shift();
                                d = d.substr(0, s) + '"; } } return t; })(' + f + (pt.length > 0 ? ', itm' : '') + ') + "' + d.substr(e);
                            }
                    }
                    idx = ci + _options.tagClose.length;
                }					
                if(oi !== -1 && ci !== -1)
                    d = _this.fns.tagFn(d, idx, ot, pt);
                
                return d;
            },
            fieldFn : function(f){
                if(f.indexOf(_options.tagOpen) === 0)
                    f = f.substr(_options.tagOpen.length, f.length - _options.tagOpen.length);
                if(f.indexOf(_options.tagClosure) === 0)
                    f = f.substr(_options.tagClosure.length, f.length - _options.tagClosure.length);
                if(f.indexOf(_options.tagClose, f.length - _options.tagClose.length) > -1)
                    f = f.substr(0, f.length - _options.tagClose.length);
                if(f.indexOf(_options.tagArray, f.length - _options.tagArray.length) > -1)
                    f = f.substr(0, f.length - _options.tagArray.length);
                return f;
            },
            generateFn: function(template){
                if(_this.vars.cache[template]) return _this.vars.cache[template];				
                var d = template.slice().replace(/\r/g, "\\r").replace(/\n/g,"\\n");
                    
                var f = _this.fns.tagFn(d);
                var fn = new Function("r", "debugger; with(r){ return \"" + f + "\"; };");
                _this.vars.cache[template] = fn;
                return fn;
            },
            generateDom: function(str){
                try
                {
                    var d = new DOMParser().parseFromString(str, 'text/html');
                    return d.body.children;
                }
                catch(err)
                {
                    var d = document.createElement('div');
                        d.innerHTML = str;
                    return d.children;
                }
            }
        }
    };
    return {
        options : (o) => {  
			return _this.fns.bindOptions(o);			 
		},
		generateFn: (t) => {
			return _this.fns.generateFn(t);
		},
		generateDom: (s) => {
			return _this.fns.generateDom(s);
		}    
    }
})();
