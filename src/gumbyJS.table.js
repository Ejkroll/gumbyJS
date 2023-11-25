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
        ? define(['exports','gumbyJS'], factory)
        : typeof exports === 'object' && typeof module !== 'undefined' // common
            ? factory(exports, require("gumbyJS"))
            : (root = root || self, factory(root, root.gumbyJS));  // global
})(this, (root, exports) => {
    'use strict';

    root.GumbyJSTable = function (core) {
        'use strict';

        let _defaults = {
            column: { key: false, field: "", class: "", title: "", render: (val, row, cell) => val, filter: () => { } },
            columns: [],
            data: undefined,

            verbose: true
        },
        _options = core.extend({}, _defaults),
        vars = {
            element: undefined,
            thead: undefined,
            tbody: undefined,
            tfoot: undefined
        },
        fns = {
            init: (o) => {
                if (!o) throw "options are required";
                _options = core.extend({}, _defaults, _options, o);

                var elements = document.querySelectorAll("#" + _options.id);
                if (elements.length === 0) throw "Id matched no elements";
                if (elements.length !== 1) throw "Id matched multiple elements";
                vars.element = elements[0];

                fns.initTable();
                fns.renderTable();
            },
            initTable: () => {
                if (vars.element.tagName !== "TABLE") throw `'${_options.id}' is not a table`;

                vars.element.classList.add("gumbyTable");

                vars.thead = vars.element.createTHead();
                vars.tbody = vars.element.querySelector("tbody") || vars.element.createTBody();
                vars.tfoot = vars.element.createTFoot();
            },

            renderTable: () => {
                fns.renderHeader();
                //fns.renderFilter();
                fns.renderBody(_options.data);
                //fns.renderFooter();
                //fns.renderPaginator();
            },
            renderHeader: () => {
                let row = fns.getTR(vars.thead, "gumbyHeader");
                gumbyJS.shape("$.[*]", _options.columns, (o, i, a) => {
                    let th = fns.getTH(row, o.field, i);
                    th.setAttribute("class", o.class);
                    th.innerHTML = o.title != undefined ? o.title : o.Title || o.field;
                });
            },
            renderFilter: () => {
                let row = fns.getTR(vars.thead, "gumbyFilter");
                gumbyJS.shape("$.[*]", _options.columns, (o, i, a) => {
                    let td = fns.getTD(row, o.field, i);
                    td.setAttribute("class", o.class);
                    td.innerHTML = typeof o.filter === "function" ? o.filter.call() : o.field;
                });
            },
            renderBody: (d) => {
                fns.clearDomChildren(vars.tbody);

                d = d || [];

                let data = typeof d === "function" ? d() : d;

                if (data.length === 0) {                    
                    let row = fns.getTR(vars.tbody, "nodata"),
                        cell = fns.getTD(row, "nodata", 0),
                        ths = vars.thead.querySelectorAll('th'),
                        vCnt = 0;

                    for (let i = 0; i < ths.length; i++)
                    {                        
                        let style = window.getComputedStyle(ths[i]);
                        if (style.display !== "none" && style.visibility !== "hidden")
                            vCnt++;
                    }
                    cell.setAttribute("colspan", vCnt);
                    cell.setAttribute("align", "center");
                    cell.innerHTML = "<h3>No Data</h3>";
                } else {
                    gumbyJS.shape("$.[*]", data, (rec, rIdx) => {
                        let key = gumbyJS.shape("$.[?(@.key)]", _options.columns, (c) => gumbyJS.xiny(c.field, rec)) || `row_${rIdx}`,
                            row = fns.getTR(vars.tbody, key);

                        gumbyJS.shape("$.[*]", _options.columns, (col, cIdx) => {
                            let td = fns.getTD(row, col.field, cIdx),
                                val = gumbyJS.xiny(col.field, rec);

                            if (col.class) td.setAttribute("class", col.class);

                            td.innerHTML = val;

                            if (col.render && typeof col.render === "function")
                                td.innerHTML = col.render.apply(gumbyJS, [val, rec, td]);

                            return td;
                        });
                    });
                }
            },
            renderFooter: () => {
                let row = fns.getTR(vars.tfoot, "gumbyFooter");
                gumbyJS.shape("$.[*]", _options.columns, (o, i, a) => {
                    let th = fns.getTD(row, o.field, i);
                    th.setAttribute("class", o.class);
                    th.innerHTML = o.title || o.field;
                });
            },
            renderPaginator: () => {
                let row = fns.getTR(vars.tfoot, "gumbyPaginator");

                //gumbyJS.shape("$.[*]", _options.columns, (o, i, a) => {
                //    let th = fns.getTD(row, o.field, i);
                //    th.setAttribute("class", o.class);
                //    th.innerHTML = o.title || o.field;
                //});
            },

            getTR: (container, name, index) => {
                if (!container || !name) return;
                let row = container.querySelector(`[name='${name}']`);
                if (row !== null) return row;
                row = container.insertRow(index || -1);
                row.setAttribute("name", name);
                return row;
            },
            getTD: (container, name, index) => {
                if (!container || !name) return;
                let cell = container.querySelector(`[name='${name}']:nth-of-type(${index + 1})`);
                if (cell === null) cell = container.insertCell(index);
                cell.setAttribute("name", name);
                return cell;
            },
            getTH: (container, name, index) => {
                if (!container || !name) return;
                let cell = container.querySelector(`[name='${name}']:nth-of-type(${index + 1})`);
                if (cell === null) {
                    cell = container.insertCell(index);
                    let th = document.createElement("th");
                    cell.replaceWith(th);
                    cell = th;
                }
                cell.setAttribute("name", name);
                return cell;
            },
            clearDomChildren: (node) => {
                while (node.firstChild)
                    node.removeChild(node.firstChild);
            }
        };;

        return (o) => {
            fns.init(o);
            return {
                renderTable: () => fns.renderTable(),
                renderHeader: () => fns.renderHeader(),
                //renderFilter: () => fns.renderFilter(),
                renderBody: (d) => fns.renderBody(d)
            };
        };
    };

    exports.table = (o) => (new root.GumbyJSTable(exports))(o);
});
