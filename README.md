# gumbyJS #

gumbyJS started as a concept around building a simpler way to manage and display data however you want it.  The features like data sorting, filtering and paging are attributed to fully featured Table or Grid solutions should be sharable between different "views" of the data.  Doing so would allow a developer a fully customizable view engine for data.

The gumbyJS library has some simple but powerful functions built in to simplify object management. The functions clone, combine, extend, xiny, xtoy and of course rnd are all default and shared as fundamental underpinnings to the modules.


### `gumby.clone` ###

The Clone function is very similar to jquery `$.clone` in that it makes a copy of the object.


### `gumby.extend` vs `gumby.combine` ###

gumby.extend is heavily based on jquery `$.extend` and pretty much replicates the behavior, Combine on the other hand was built to merge objects together similar to extend but with array concatenation.  This may seem trivial but it can have huge impacts if you deal with complex object configurations for various libraries. 

Lets say you have objects that looks something like this:

```js

var defaults = { 
  columns: [ 
    { name: "Id", visible: false },
    { name: "Action", visible: true } 
  ]
};

var options = { 
  title : "My Test Table", 
  columns: [ 
    { name: "Name" },
    { name: "Address" } 
  ]
};

```
If you were to use the gumby.extend or even jquery extend, the options "columns" would override the defaults "columns" like so:

```js

var opts = $.extend(true, {}, defaults, options);

// result
opts = { 
  title : "My Test Table", 
  columns: [ 
    { name: "Name" },
    { name: "Address" } 
  ]
};

```
Using the gumby.combine function however:

```js

var opts = gumby.combine(true, {}, defaults, options);

// result
opts = { 
  title : "My Test Table", 
  columns: [ 
    { name: "Id", visible: false },
    { name: "Action", visible: true },
    { name: "Name" },
    { name: "Address" } 
  ]
};

```


### `gumby.xiny` ###

The xiny functions only purpose is to consume a variation of a "dot notation" or "JSONPath" string and track down the "X" in any object "Y".  An example of gumby.xiny usage would be:

```js

var data = [
  { first : "April", last: "Wonderful", details: { age: "23" } },
  { first : "Bobby", last: "Superbee",  details: { age: "51" } },
  { first : "Chris", last: "Brain",  details: { age: "47" } },
  { first : "Derik", last: "Dreams",  details: { age: "25" } },
  { first : "Emily", last: "May",  details: { age: "38" } },
  ...
];

// return first name of first person in data array
var firstName = gumby.xiny("[0].first", data);
firstName === "April" // true

// return a first name array of all people in data array
var firstNames = gumby.xiny("[*].first", data);
firstNames === [ "April", "Bobby", "Chris", "Derik", "Emily", ...]; // true

// return an array of all ages in data array
var ages = gumby.xiny("[*].details.age", data);
ages === [ "23", "51", "47", "25", "38", ...]; // true

```


### `gumby.xtoy` ###

The xtoy function copies properties from a source object "X" to a destination object "Y", returning the updated "Y" parameter.  The method also allows you to only use fields existing on the destination object. An example of gumby.xiny usage would be:

```js

// this takes test1source fields and maps them to test1destination
var test1source = { name : "source", confirmed: true };
var test1destination = { name : "destination", location: 1 };

var test1result = gumby.xtoy(test1source, test1destination);
test1result === test1destination // true
test1destination === { name : "source", location: 1, confirmed: true }; // true


// this takes test2source fields and maps them to test2destination but only if destination has the same fields
var test2source = { name : "source", confirmed: true };
var test2destination = { name : "destination", location: 1 };

var test2result = gumby.xtoy(test2source, test2destination, true);
test2result === test2destination // true
test2destination === { name : "source", location: 1 }; // true

```



# gumby.template #

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

With generateTableFn primed and ready to roll, all you need to do is pass in the dataset and the result will be the desired output HTML string.



# gumby.data #

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