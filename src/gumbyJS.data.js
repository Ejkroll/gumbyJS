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
            : factory((root.gumbyJS.data = {}), root.gumbyJS);  // global
})(this, (exports, core) => {
    'use strict';

    let GumbyJSData = function (core) {
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
        _options = core.extend({}, _defaults),
        fns = {
            bindOptions: (opts) => {
                _options = core.extend({}, _defaults, _options, opts);
                for(let i = 0; i < _options.sort.length; i++)
                    if(typeof _options.sort[i].direction == "string"){
                        _options.sort[i].direction = _options.sort[i].direction.toLowerCase().indexOf("d")  > -1 ? -1 : 1;
                    }
                return _options;
            },
            load: (data) => {
                let d = core.clone(data);
                d = fns.filter(d, _options.filter);
                d = fns.sort(d, _options.sort);
                d = fns.page(d, _options.pager);
                return d;
            },
            filter: (data, filter) => {
                // needs rewritten, rule fn ends up bloated and duplicated.
                if (data == undefined || filter == undefined || filter["filterOp"] == undefined) return data;
                let filterFn = (f) => {
                    let q = [],
                        valFn = (v) => { return typeof v === "string" ? "'" + v + "'" : v; },
                        ruleFn = (r) => {
                            let e = core.xiny(r.op, _options.operations.equations, true);
                            return "" +
                                "((a, b) => { " +
                                    "a = a === undefined ? null : \"\" + a; " +
                                    "b = b === undefined ? null : \"\" + b; " +
                                    "return " + e + ";" + 
                                "})(gumbyJS.xiny(" + valFn(r.field) + ", o), " + valFn(r.value) + ")";
                        };

                    for (let i in f.rules)
                        q.push(ruleFn(f.rules[i]));
                    
                    for (let i in f.filters)
                        q.push(filterFn(f.filters[i]));

                    return q.length > 0
                        ? "(" + q.join(" " + core.xiny(f.filterOp, _options.operations.groupings, true) + " ") + ")"
                        : "true";
                },
                fn = new Function("o", "return " + filterFn(filter) + ";");
                fns.verbose("gumbyJS.data.filter", filter);
                return data.filter(fn);
            },
            sort: (data, sort) => {
                if (data === undefined || sort === undefined || sort.length === 0) return data;
                let cmp = (a, b) => (a > b) - (a < b);
                data.sort(function (a, b) {
                    let r = 0;
                    for (let i = 0; i < sort.length; i++) {
                        let f = sort[i]["field"];
                        let d = sort[i]["direction"];
                        if (f === undefined || f === "" || d === undefined || d === "") continue;
                        let av = core.xiny(f, a);
                        let bv = core.xiny(f, b);
                        d = (d === -1 || d === "desc" || d === "descending") ? -1 : 1;
                        r = cmp(av, bv) * d;
                        if (r !== 0) break;
                    }
                    return r === 0 ? 0 : r > 0 ? 1 : -1;
                });
                fns.verbose("gumbyJS.data.sort", sort);
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
                    fns.verbose("gumbyJS.data.page", {
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
        };

        return {
            options : (o) => fns.bindOptions(o),
            execute : (d, o) => {
                if(o) fns.bindOptions(o);
                return fns.load(d);
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
    }

    var gumbyJSData = new GumbyJSData(core);

    exports.options = (o) => gumbyJSData.bindOptions(o);
    exports.execute = (d, o) => gumbyJSData.execute(d, o);
    exports.help = () => gumbyJSData.help();
});