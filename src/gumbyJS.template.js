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
            : factory((root.gumbyJS.template = {}), root.gumbyJS);  // global
})(this, (exports, core) => {
    'use strict';

    let _defaults = {
        tagOpen: "{{",
        tagClose: "}}",
        tagClosure: "/",
        tagFnOpen: "(",
        tagFnClose: ")",
        verbose: true
    },
    _options = core.extend({}, _defaults),    
    vars = {
        cache: {}
    },
    fns = {
        bindOptions: (opts) => {
            _options = core.extend({}, _defaults, _options, opts);
            return _options;
        },
        processTags: (template, index, isFunction) => {
            index = index || -1;
            if(!template) return index;

            let oStart = template.indexOf(_options.tagOpen, index),
                oEnd = oStart + _options.tagOpen.length;
            if(oStart === -1) return template;

            let isFunc = template.substr(oEnd, _options.tagFnOpen.length) == _options.tagFnOpen,
                isClosure = template.substr(oEnd, _options.tagClosure.length) == _options.tagClosure;

            if(isClosure) oEnd += 1;

            let cStart = template.indexOf((isFunc ? _options.tagFnClose : "") + _options.tagClose) + (isFunc ? _options.tagFnClose.length : 0),
                cEnd = cStart + _options.tagClose.length,
                tag = template.substr(oEnd, cStart - oEnd),
                hasClosure = template.indexOf(_options.tagOpen + _options.tagClosure + tag + _options.tagClose, cEnd) > -1,
                hasTagTag = tag.indexOf(_options.tagOpen) == 0 && tag.indexOf(_options.tagClose) == tag.length - _options.tagClose.length,
                front = template.substr(0, oStart),
                back =  template.substr(cEnd);

            // functional wrappers
            if (hasClosure) { // is a complex start
                template = front + (isFunction ? "" : "\" + ") + "((o) => (Array.isArray(o) ? o : [o]).map((o) => " + (isFunction ? "" : "\"") + back;
            } else if (isClosure) { // is a complex closure                    
                template = front + "\").join(''))(gumbyJS.xiny(\"" + tag + "\", o)) + \"" + back;
            } else if (isFunc){ // is a custom function
                template = front + "\" + " + fns.processTags(tag, -1, true) + " + \"" + back;
            } else if (hasTagTag){ // is a tag tag, i.e. {{{{tag}}}}
                template = front + tag + back;
            } else { // is a normal field
                template = front + (isFunction ? "" : "\" + ") + "gumbyJS.xiny(\"" + tag + "\", o)" + (isFunction ? "" : " + \"") + back;
            }

            return fns.processTags(template, cEnd);;
        },


        generateFn: (template) => {
            if (vars.cache[template]) return vars.cache[template];
            let t = template.slice()
                .replace(/\"/g, '\\"')
                .replace(/\&lt;/g, '<')
                .replace(/\&gt;/g, '>')
                .replace(/\r/g, "\\r")
                .replace(/\n/g, "\\n")
                .replace(/\t/g, "\\t"),
                o = fns.processTags(t);

            if(_options.verbose)
                console.info(o.toString());

            let fn = new Function("o", `return \"${o}\";`);
            vars.cache[template] = fn;
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
    };
    exports.options = (o) => fns.bindOptions(o);
    exports.generateFn = (t) => fns.generateFn(t);
    exports.generateDom = (s) => fns.generateDom(s);
});
