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
        ? define(['exports'], factory)
        : typeof exports === 'object' && typeof module !== 'undefined' // common
            ? factory(exports) 
            : factory((root.gumbyJS = {}));  // global
})(this, (exports) => {
    'use strict';

    let fns = {
        _isArr: o => Array.isArray(o),
        _isWrapped: (o, s, c) => o ? o[0] === s && o[o.length - 1] === c : false,
        _arrProxy: (o) => new Proxy(o, {
            get(target, prop) {
                if (!isNaN(prop)) {
                    prop = parseInt(prop, 10);
                    if (prop < 0) prop += target.length;
                }
                return target[prop];
            }
        }),
        _hasProp: (o, p) => Object.prototype.hasOwnProperty.call(o, p),
        _rnd: (min, max) => Math.floor((Math.random() * max) + min),
        _type: o => Object.prototype.toString.call(o),
        _typeMatch: (x, y) => fns._type(x) === _fns._type(y),

        clone: (o) => {
            if (o === null || typeof (o) !== 'object') return o;
            let temp = o.constructor();
            for (let p in o) {
                if (Object.prototype.hasOwnProperty.call(o, p)) {
                    o['isActiveClone'] = null;
                    temp[p] = fns.clone(o[p]);
                    delete o['isActiveClone'];
                }
            }
            return temp;
        },
        combine: function () {
            let s = fns, e = {}, d = false, i = 0;
            if (s._type(arguments[0]) === '[object Boolean]') { d = arguments[0]; i++; }
            let m = function (o) {
                for (var p in o) {
                    if (!s._hasProp(o, p)) continue;
                    e[p] = d && s._type(o[p]) === '[object Object]' 
                        ? s.combine.apply(s, [d, c, e[p], o[p]]) 
                        : s._isArr(o[p])
                            ? (e[p] || []).concat(o[p])
                            : o[p];
                }
            };
            for (; i < arguments.length; i++)  m(arguments[i]);
            return e;
        },     
        extend: function () {
            let s = fns, e = {}, d = false, i = 0;
            if (s._type(arguments[0]) === '[object Boolean]') { d = arguments[0]; i++; }
            let m = function (o) {
                for (var p in o) {
                    if (!s._hasProp(o, p)) continue;
                    e[p] = d && s._type(o[p]) === '[object Object]' 
                        ? s.extend.apply(s, [d, e[p], o[p]])
                        : o[p];
                }
            };
            for (; i < arguments.length; i++)  m(arguments[i]);
            return e;
        },            
        xiny: (x, y, c) => {
            let s = fns, ns = (x || "").replace(/\[|\]/g, '.').split(".").filter(n => { return n != ""; }),
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
        xtoy: (x, y, e) => {
            let s = fns;
            if(!s._typeMatch(x, y)) return console.error("object type mismatch!");
            y = y || (s._isArr(x) ? [] : {});
            for (let p in x)
                y[p] = typeof x[p] == "object" 
                    ? fns.xtoy(x[p], y[p], e) 
                    : e 
                        ? y[p] 
                            ? x[p]
                            : y[p] 
                        : x[p];
            return y;
        },
        findMatchingClosure: (opn, cls, str, pos) => {
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
     
        shape: (x, y, callback) => {
            if(!x) throw "no path found!";  
            let ns = fns.shapeParse(x),
                fn = (ns, o) => {
                    let n = ns[0];
                    if(!n || !o) return fns.shapeResult(o, callback);
                    ns = ns.slice(1);

                    if(n === "*") return o;                    
                    if(n === "$") return fn(ns, y);
                    if(n === "..") return fn(ns, fns.shapeRecursiveDescendantOperator(o));
                    if(fns._isWrapped(n, "[", "]")) return fn(ns, fns.shapeSubscriptOperator(n.substr(1, n.length - 2), o));

                    // catch all, handle array as mapping or dir obj
                    return fns._isArr(o) 
                        ? o.filter(i => i[n]).map(i => fn(ns, i[n])) 
                        : fn(ns, o[n]);
                };
            return y ? fn(ns, y, callback) : y;
        },
        shapeParse: (path) => path ? path.split(/(\$|\.\.|\.|\[.+\])/g).filter(n => n && n.length > 0 && n !== '.') : [],
        shapeResult: (result, callback) => { 
            if(!result) return result;
            var ret = fns._isArr(result) ? result : [result];
            if(typeof callback === "function")
                ret = ret.map(o => callback.call(exports, o));
            return ret.length > 1 ? ret : ret[0];
        },
        shapeRecursiveDescendantOperator: (obj) => {
            let ret = [];
            for(var p in obj)
            {
                if(typeof obj[p] !== "object") continue;                
                (!fns._isArr(obj[p]) ? [obj[p]] : obj[p])
                    .forEach(o => {
                        ret.push(o);
                        ret = ret.concat(fns.shapeRecursiveDescendantOperator(o));
                    });
            }
            return ret;
        },
        shapeSubscriptOperator: (command, arr) => {
            if(!command) throw "invalid array command";
            if(command === "*") return arr;
            if(!isNaN(command)) return arr[command]; // assume standard index operator
            return command.indexOf('(') > -1 && command.indexOf(')') > -1
                ? fns.shapeEvaluationOperator(command, arr)
                : fns.shapeArrayOperator(command, arr);
        },
        shapeArrayOperator: (command, arr) => {
            if(!command) throw "invalid array command";
            let isUnion = command.indexOf(',') > -1,
                isSlice = command.indexOf(':') > -1;
            if(isUnion === isSlice)  throw "invalid array command";
            if(isUnion) return fns.shapeUnionOperator(command, arr);
            if(isSlice) return fns.shapeSliceOperator(command, arr);
        },
        shapeSliceOperator: (command, arr) => {
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
        shapeUnionOperator: (command, arr) => {
            let ret = [],
                proxy = fns._arrProxy(arr),
                idxs = command.split(',');
            for(var i = 0; i < idxs.length; i++)
            {
                let val = proxy[idxs[i]];
                if(val) ret.push(val);
            }
            return ret;
        },
        shapeEvaluationOperator: (command, arr) => {
            let isFilter = command.indexOf("?") === 0,
                cmd = command.replace(/\?/g, "").replace(/@/g, "_o_");
            var fn = Function("_o_", `"use strict"; return ${cmd};`);
            return isFilter ? arr.filter(fn) : arr[fn(arr)];
        }
    };

    exports.rnd = (min, max) => fns._rnd(min, max);
    exports.clone = (o) => fns.clone(o);
    exports.combine = function() { return fns.combine.apply(this, arguments); };
    exports.extend = function () { return fns.extend.apply(this, arguments); };
    exports.xiny = (x, y, caseInsensitive) => fns.xiny(x, y, caseInsensitive);
    exports.xtoy = (x, y, existingOnly) => fns.xtoy(x, y, existingOnly);
    exports.shape = (path, obj, callback) => fns.shape(path, obj, callback);
});
