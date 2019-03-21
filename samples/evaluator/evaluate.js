
const gepars = require('../..');
const geast = require('geast');
const gelex = require('gelex');

const code = process.argv[2];

const ldef = gelex.definition();
ldef.define('integer', '[0-9][0-9]*');
ldef.define('name', '[a-z][a-z]*');
ldef.define('operator', '+-*/'.split(''));
ldef.define('delimiter', '()'.split(''));

const pdef = gepars.definition();

pdef.define('expression', 'expression0');
pdef.define('expression0', [ 'expression0', 'operator:+', 'expression1' ], function (values) { return geast.binary(values[1], values[0], values[2]); });
pdef.define('expression0', [ 'expression0', 'operator:-', 'expression1' ], function (values) { return geast.binary(values[1], values[0], values[2]); });
pdef.define('expression0', 'expression1');
pdef.define('expression1', [ 'expression1', 'operator:*', 'term' ], function (values) { return geast.binary(values[1], values[0], values[2]); });
pdef.define('expression1', [ 'expression1', 'operator:/', 'term' ], function (values) { return geast.binary(values[1], values[0], values[2]); });
pdef.define('expression1', 'term');
pdef.define('term', 'integer:', function (value) { return geast.constant(parseInt(value)); });
pdef.define('term', [ 'delimiter:(', 'expression', 'delimiter:)' ], function (values) { return values[1]; });

const lexer = ldef.lexer(code);
const parser = pdef.parser(lexer);

const expression = parser.parse('expression');

function Interpreter() {
    this.processConstant = function (node) { return node.value(); };
    this.processBinary = function (node) {
        const lvalue = node.left().process(this);
        const rvalue = node.right().process(this);
        
        if (node.operator() === '+')
            return lvalue + rvalue;
        if (node.operator() === '-')
            return lvalue - rvalue;
        if (node.operator() === '*')
            return lvalue * rvalue;
        if (node.operator() === '/')
            return lvalue / rvalue;
    }
}

const interpreter = new Interpreter();

console.log(expression.process(interpreter));


