# gumbyJS

gumbyJS started as a concept around building a simpler way to manage and display data however you want it.  The features like data sorting, filtering and paging are attributed to fully featured Table or Grid solutions should be sharable between different "views" of the data.  Doing so would allow a developer a fully customizable view engine for data.


### template ###

The gumby.template library is also simple in concept.  The template engine uses a combination of the xiny (noted below) with simple string parsing and function generation to build out functions cached based on the template.  These generation functions just take in the raw data structure and returns an output string based on the template.

Lets say you have a json dataset that looks something like this:

```js

var data = [
  { first : "April", last: "Wonderful", details: { age: "23" } },
  { first : "Bobby", last: "Superbee",  details: { age: "51" } },
  { first : "Chris", last: "Brain",  details: { age: "47" } },
  { first : "Derik", last: "Dreams",  details: { age: "25" } },
  { first : "Emily", last: "May",  details: { age: "38" } },
  ...
];

```
To build a simple table from that dataset you would just pass a template string with the table structure into the gumby.template.generateFn method.  This method parses the string and builds a fn specifically for that template structure.

```js

var template = "" + 
  "<table>" + 
  "<thead><tr><th>First</th><th>Last</th><th>Age</th></tr></thead>" +
  "<tbody>{{[*]}}<tr><td>{{first}}</td><td>{{last}}</td><td>{{details.age}}</td></tr>{{/[*]}}</tbody>" +
  "</table>";

var generateTableFn = gumby.template.generateFn(template);

```
Few notes from the template above.  The "{{[\*]}}" is an opening, the "{{/[\*]}}" is its matching closure, this puts the template engine processing into the context of that wrapping tag.  For this example the tag "{{[*]}}" is the dot notation for select all from an array so the template in the wrapper will be applied to each of the items in that collection building the rows.

With generateTableFn primed and ready to roll, all you need to do is pass in the dataset and the result will be the desired output string.


### data ###

The gumby.data library is a simple data management library used to apply Filter, Sort and Paging functionality to any dataset.  example usage would be:

```js

var dataOptions = { 
  filter: {
    filterOp: "OR",
    rules: [
    {
        field: "first",
        op: "iin",
        value: "bob"
    }
    ]
  },
  sort: [
    {
      field: "details.age",
      direction: "asc"
    }
  ], 
  pager: { page: 0, size: 15 } 
};

// returns filtered/sorted/paged array of data array
var dataOutput = gumby.data.execute(data, dataOptions);

```


### xiny ###

The core of this library is really a simple recursive method called "xiny".  xiny's only purpose is to consume a variation of a "dot notation" or "JSONPath" string and track down the "X" in any object "Y".  An example of gumby.xiny usage would be:

```js

// return first name of first person in dataset from previous example
var firstName = gumby.xiny("[0].first", data);

// return first name array of all people in dataset from previous example
var firstNames = gumby.xiny("[*].first", data);

```
