
const gepars = require('../..');
const geast = require('geast');
const gelex = require('gelex');
const fs = require('fs');

geast.node('print', [ 'expression' ]);

const code = fs.readFileSync(process.argv[2]).toString();

const ldef = gelex.definition();
ldef.define('integer', '[0-9][0-9]*');
ldef.define('name', '[a-z][a-z]*');
ldef.define('operator', '+-*/='.split(''));
ldef.define('operator', '=== == <= < > =>'.split(' '));
ldef.define('delimiter', '();,'.split(''));
ldef.defineText('string', '"', '"');

const pdef = gepars.definition();

pdef.define('program', 'commandlist', function (value) { return geast.sequence(value); });

pdef.define('commandlist', [ 'commandlist', 'command' ], function (values) { values[0].push(values[1]); return values[0]; });
pdef.define('commandlist', 'command', function (value) { return [ value ]; });

pdef.define('command', [ 'simplecommand', 'delimiter:;' ], function (values) { return values[0]; });

pdef.define('simplecommand', [ 'name:print', 'expression' ], function (values) { return geast.print(values[1]); });
pdef.define('simplecommand', [ 'name:let', 'name:' ], function (values) { return geast.variable(values[1]); });
pdef.define('simplecommand', [ 'name:', 'operator:=', 'expression' ], function (values) { return geast.assignment(geast.name(values[0]), values[2]); });

pdef.define('expression', 'expression0');
pdef.define('expression0', [ 'expression0', 'operator:==', 'expression2' ], function (values) { return geast.binary(values[1], values[0], values[2]); });
pdef.define('expression0', [ 'expression0', 'operator:===', 'expression2' ], function (values) { return geast.binary(values[1], values[0], values[2]); });
pdef.define('expression0', [ 'expression0', 'operator:<=', 'expression2' ], function (values) { return geast.binary(values[1], values[0], values[2]); });
pdef.define('expression0', [ 'expression0', 'operator:<', 'expression2' ], function (values) { return geast.binary(values[1], values[0], values[2]); });
pdef.define('expression0', [ 'expression0', 'operator:>=', 'expression2' ], function (values) { return geast.binary(values[1], values[0], values[2]); });
pdef.define('expression0', [ 'expression0', 'operator:>', 'expression2' ], function (values) { return geast.binary(values[1], values[0], values[2]); });
pdef.define('expression0', 'expression1');
pdef.define('expression1', [ 'expression1', 'operator:+', 'expression2' ], function (values) { return geast.binary(values[1], values[0], values[2]); });
pdef.define('expression1', [ 'expression1', 'operator:-', 'expression2' ], function (values) { return geast.binary(values[1], values[0], values[2]); });
pdef.define('expression1', 'expression2');
pdef.define('expression2', [ 'expression2', 'operator:*', 'term' ], function (values) { return geast.binary(values[1], values[0], values[2]); });
pdef.define('expression2', [ 'expression2', 'operator:/', 'term' ], function (values) { return geast.binary(values[1], values[0], values[2]); });
pdef.define('expression2', 'term');

pdef.define('term', 'integer:', function (value) { return geast.constant(parseInt(value)); });
pdef.define('term', 'string:', function (value) { return geast.constant(value); });
pdef.define('term', 'name:', function (value) { return geast.name(value); });
pdef.define('term', [ 'delimiter:(', 'expression', 'delimiter:)' ], function (values) { return values[1]; });

const lexer = ldef.lexer(code);
const parser = pdef.parser(lexer);

const program = parser.parse('program');

function Interpreter() {
    const context = {};
    
    this.processSequence = function (node) {
        const nodes = node.nodes();
        let result;
        
        for (let k = 0; k < nodes.length; k++)
            result = nodes[k].process(this);
        
        return result;
    };
    
    this.processVariable = function (node) {
        context[node.name()] = null;
    };
    
    this.processName = function (node) {
        return context[node.name()];
    }
    
    this.processAssignment = function (node) {
        const value = node.value().process(this);
        
        context[node.lefthand().name()] = value;
        
        return value;
    ;}
    
    this.processConstant = function (node) { return node.value(); };
    
    this.processPrint = function (node) {
        const value = node.expression().process(this);
        
        console.log(value);
        
        return value;
    }
    
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
        if (node.operator() === '===')
            return lvalue === rvalue;
        if (node.operator() === '==')
            return lvalue == rvalue;
        if (node.operator() === '<=')
            return lvalue <= rvalue;
        if (node.operator() === '<')
            return lvalue < rvalue;
        if (node.operator() === '>')
            return lvalue > rvalue;
        if (node.operator() === '>=')
            return lvalue >= rvalue;
    }
}

const interpreter = new Interpreter();

program.process(interpreter);
