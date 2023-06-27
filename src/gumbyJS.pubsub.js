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
            : factory((root.gumbyJS.pubsub = {}), root.gumbyJS);  // global
})(this, (exports, core) => {
    'use strict';

    let vars = {
        subscribers : {}
    },
    fns = {
        publish: function(name) {
            let args = [];
            for (var i in arguments)
                if (arguments.hasOwnProperty(i))
                    if (i > 0) args.push(arguments[i]);
                    
            if (!Array.isArray(vars.subscribers[name])) return
            vars.subscribers[name].forEach((callback) => { callback.apply(this, args); });
        },
        subscribe: (name, callback) => {
            if (!Array.isArray(vars.subscribers[name])) 
            vars.subscribers[name] = [];
    
            vars.subscribers[name].push(callback);
            return callback;
        },
        unsubscribe: (name, callback) => {
            let sub = vars.subscribers[name];
            if(!sub) return;
            let idx = sub.indexOf(callback);
            if(idx == -1) return;
            vars.subscribers[name].splice(idx, 1);
        }
    };
    
    exports.publish = function(name){
        fns.publish.apply(this, arguments);
    };
    exports.subscribe = function(name, callback){
        fns.subscribe.apply(this, [name, callback]);
    };
    exports.unsubscribe = function(name, callback){
        fns.unsubscribe.apply(this, [name, callback]);
    }
});