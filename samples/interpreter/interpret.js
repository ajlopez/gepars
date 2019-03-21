
const gepars = require('../..');
const geast = require('geast');
const gelex = require('gelex');

const ldef = gelex.definition();
ldef.define('integer', '[0-9][0-9]*');
ldef.define('name', '[a-z][a-z]*');
ldef.define('operator', '+-*/'.split(''));

const pdef = gepars.definition();

pdef.define('term', 'integer:', function (value) { return geast.constant(parseInt(value)); });
pdef.define('expression', [ 'term', 'operator:', 'term' ], function (values) { return geast.binary(values[1], values[0], values[2]); });

const lexer = ldef.lexer('1 + 2');
const parser = pdef.parser(lexer);

const expression = parser.parse('expression');
console.dir(expression);

function Interpreter() {
    this.processConstant = function (node) { return node.value(); };
    this.processBinary = function (node) {
        if (node.operator() === '+')
            return node.left().process(this) + node.right().process(this);
    }
}

const interpreter = new Interpreter();

console.log(expression.process(interpreter));


