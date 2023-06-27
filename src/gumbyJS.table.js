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
        ? define(['gumbyJS'], factory)
        : typeof exports === 'object' && typeof module !== 'undefined' // common
            ? factory(require("gumbyJS")) 
            : factory(gumbyJS);  // global
})(this, (core) => {
    'use strict';

    let _defaults = {
        column: { key: false, field: "", class: "", title: "", render: (val, row, cell) => { return val; }, filter: () => {} },
        columns: [],
        data: undefined,

        verbose: true
    },
    _options = core.extend({}, _defaults),    
    vars = {
        element: undefined,
    },
    fns = {
        getTR: (container, id, index) => {
            if(!container || !id) return;
            let row = container.querySelector(`[id='${id}']`);
            if(row !== null) return row;            
            row = container.insertRow(index || -1);
            row.setAttribute("id", id);
            return row;
        },
        getTD: (container, name, index) => {
            if(!container || !name) return;
            let cell = container.querySelector(`[name='${name}']`);
            if(cell === null) cell = container.insertCell(index);
            cell.setAttribute("name", name);
            return cell;
        },
        getTH: (container, name, index) => {
            if(!container || !name) return;
            let cell = container.querySelector(`[name='${name}']`);
            if(cell === null) {
                cell = container.insertCell(index);
                let th = document.createElement("th");
                cell.replaceWith(th);
                cell = th;
            }
            cell.setAttribute("name", name);
            return cell;
        },
        clearDomChildren: (node) => {
            while(node.firstChild)
                node.removeChild(node.firstChild);
        },

        init: (o) => {
            if(!o) throw "options are required";
            _options = core.extend({}, _defaults, _options, o);

            var elements = document.querySelectorAll("#" + _options.id);
            if(elements.length !== 1) throw "Id matched multiple elements";
            vars.element = elements[0];

            fns.initTable();
            fns.renderTable();
        },
        initTable: () => {
            if(vars.element.tagName !== "TABLE") throw `'${_options.id}' is not a table`;
            
            vars.element.classList.add("gumbyTable");
            
            vars.thead = vars.element.createTHead();            
            vars.tbody = vars.element.querySelector("tbody") || vars.element.createTBody();
            vars.tfoot = vars.element.createTFoot();
        },
        
        renderTable: () => {
            fns.renderHeader();
            fns.renderFilter();
            fns.renderBody();
            fns.renderFooter();
            fns.renderPaginator();
        },
        renderHeader: () => {
            let row = fns.getTR(vars.thead, "gumbyHeader");
            gumbyJS.shape("$.[*]", _options.columns, (o, i, a) => {
                var th = fns.getTH(row, o.field, i);
                th.setAttribute("class", o.class);
                th.innerHTML = o.title || o.field;
            });
        },
        renderFilter: () => {
            let row = fns.getTR(vars.thead, "gumbyFilter");
            gumbyJS.shape("$.[*]", _options.columns, (o, i, a) => {
                var td = fns.getTD(row, o.field, i);
                td.setAttribute("class", o.class);
                td.innerHTML = typeof o.filter === "function" ? o.filter.call() : o.field;
            });
        },
        renderBody: () => {
            fns.clearDomChildren(vars.tbody);

            gumbyJS.shape("$.[*]", _options.data, (rec, rIdx) => {
                let key = gumbyJS.shape("$.[?(@.key)]", _options.columns, (c) => gumbyJS.xiny(c.field, rec)) || `row_${rIdx}`,
                    row = fns.getTR(vars.tbody, key);

                gumbyJS.shape("$.[*]", _options.columns, (col, cIdx) => {
                    var td = fns.getTD(row, col.field, cIdx)
                    let val = gumbyJS.xiny(col.field, rec);
                    if(col.render && typeof col.render === "function")
                        val = col.render.apply(gumbyJS, [val, rec]);

                    td.setAttribute("class", col.class);
                    td.innerHTML = val;
                    return td;
                });
            });
        },
        renderFooter: () => {
            let row = fns.getTR(vars.tfoot, "gumbyFooter");
            gumbyJS.shape("$.[*]", _options.columns, (o, i, a) => {
                var th = fns.getTD(row, o.field, i);
                th.setAttribute("class", o.class);
                th.innerHTML = o.title || o.field;
            });
        },
        renderPaginator: () => {
            let row = fns.getTR(vars.tfoot, "gumbyPaginator");
            gumbyJS.shape("$.[*]", _options.columns, (o, i, a) => {
                var th = fns.getTD(row, o.field, i);
                th.setAttribute("class", o.class);
                th.innerHTML = o.title || o.field;
            });
        }
    };

    core.table = (o) => {
        fns.init(o);
        return {
            renderTable: () => fns.renderTable(),
            renderHeader: () => fns.renderHeader(),
            renderFilter: () => fns.renderFilter(),
            renderBody: (d) => fns.renderBody(d)
        };
    };
});
