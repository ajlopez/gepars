
const gepars = require('..');
const gelex = require('gelex');

// define lexer
const ldef = gelex.definition();

ldef.define('integer', '[0-9][0-9]*');
ldef.define('name', '[a-zA-Z][a-zA-Z]*');
ldef.define('operator', '+-*/'.split(''));

exports['parse add expression'] = function (test) {
    const pdef = gepars.definition();
    
    pdef.define('integer', 'integer:', function (value) { return parseInt(value); });
    pdef.define('expression', [ 'integer', 'operator:+', 'integer' ], function (values) { return values; });
    
    const lexer = ldef.lexer('42 + 1');
    const parser = pdef.parser(lexer);
    
    const result = parser.parse('expression');
    
    test.ok(result);
    test.deepEqual(result, [ 42, '+', 1 ]);
};

exports['not parse add expression'] = function (test) {
    const pdef = gepars.definition();
    
    pdef.define('integer', 'integer:', function (value) { return parseInt(value); });
    pdef.define('expression', [ 'integer', 'operator:+', 'integer' ], function (values) { return values; });
    
    const lexer = ldef.lexer('+ 1');
    const parser = pdef.parser(lexer);
    
    const result = parser.parse('expression');
    
    test.equal(result, null);
};

exports['not parse integer expression without integer'] = function (test) {
    const pdef = gepars.definition();
    
    pdef.define('integer', 'integer:', function (value) { return parseInt(value); });
    pdef.define('expression', 'integer', function (value) { return [ value ]; });
    
    const lexer = ldef.lexer('+ 1');
    const parser = pdef.parser(lexer);
    
    const result = parser.parse('expression');
    
    test.equal(result, null);
};

exports['parse multiply expression'] = function (test) {
    const pdef = gepars.definition();
    
    pdef.define('integer', 'integer:', function (value) { return parseInt(value); });
    pdef.define('expression', [ 'integer', 'operator:+', 'integer' ], function (values) { return values; });
    pdef.define('expression', [ 'integer', 'operator:*', 'integer' ], function (values) { return values; });
    
    const lexer = ldef.lexer('21 * 2');
    const parser = pdef.parser(lexer);
    
    const result = parser.parse('expression');
    
    test.ok(result);
    test.deepEqual(result, [ 21, '*', 2 ]);
};

exports['parse multiply expression using default function'] = function (test) {
    const pdef = gepars.definition();
    
    pdef.define('integer', 'integer:');
    pdef.define('expression', [ 'integer', 'operator:+', 'integer' ]);
    pdef.define('expression', [ 'integer', 'operator:*', 'integer' ]);
    
    const lexer = ldef.lexer('21 * 2');
    const parser = pdef.parser(lexer);
    
    const result = parser.parse('expression');
    
    test.ok(result);
    test.deepEqual(result, [ '21', '*', '2' ]);
};

exports['parse two add expressions with right associativity'] = function (test) {
    const pdef = gepars.definition();
    
    pdef.define('integer', 'integer:', function (value) { return parseInt(value); });
    pdef.define('expression', [ 'integer', 'operator:+', 'expression' ], function (values) { return values; });
    pdef.define('expression', 'integer', function (value) { return value; });
    
    const lexer = ldef.lexer('42 + 1 + 2');
    const parser = pdef.parser(lexer);
    
    const result = parser.parse('expression');
    
    test.ok(result);
    test.deepEqual(result, [ 42, '+', [ 1, '+', 2 ] ]);
};

exports['parse add expression and subtract expression with right associativity'] = function (test) {
    const pdef = gepars.definition();
    
    pdef.define('integer', 'integer:', function (value) { return parseInt(value); });
    pdef.define('expression', [ 'integer', 'operator:+', 'expression' ], function (values) { return values; });
    pdef.define('expression', [ 'integer', 'operator:-', 'expression' ], function (values) { return values; });
    pdef.define('expression', 'integer');
    
    const lexer = ldef.lexer('42 + 1 - 2');
    const parser = pdef.parser(lexer);
    
    const result = parser.parse('expression');
    
    test.ok(result);
    test.deepEqual(result, [ 42, '+', [ 1, '-', 2 ] ]);
};

exports['parse two add expressions with left associativity'] = function (test) {
    const pdef = gepars.definition();
    
    pdef.define('integer', 'integer:', function (value) { return parseInt(value); });
    pdef.define('expression', [ 'expression', 'operator:+', 'integer' ], function (values) { return values; });
    pdef.define('expression', 'integer');
    
    const lexer = ldef.lexer('42 + 1 + 2');
    const parser = pdef.parser(lexer);
    
    const result = parser.parse('expression');
    
    test.ok(result);
    test.deepEqual(result, [ [ 42, '+', 1 ], '+', 2 ]);
};

exports['parse add expression and multiply expression with left associativity and precedence'] = function (test) {
    const pdef = gepars.definition();
    
    pdef.define('integer', 'integer:', function (value) { return parseInt(value); });
    pdef.define('expression', [ 'expression', 'operator:+', 'expression1' ], function (values) { return values; });
    pdef.define('expression', [ 'expression', 'operator:-', 'expression1' ], function (values) { return values; });
    pdef.define('expression', 'expression1', function (value) { return value; });
    pdef.define('expression1', [ 'expression1', 'operator:*', 'integer' ], function (values) { return values; });
    pdef.define('expression1', [ 'expression1', 'operator:/', 'integer' ], function (values) { return values; });
    pdef.define('expression1', 'integer');
    
    const lexer = ldef.lexer('42 + 1 * 2');
    const parser = pdef.parser(lexer);
    
    const result = parser.parse('expression');
    
    test.ok(result);
    test.deepEqual(result, [ 42, '+', [ 1, '*', 2 ] ]);
};

exports['parse add expression and multiply expression with left associativity and precedence'] = function (test) {
    const pdef = gepars.definition();
    
    pdef.define('integer', 'integer:', function (value) { return parseInt(value); });
    pdef.define('expression', 'integer', function (value) { return value + 1; });
    
    const lexer = ldef.lexer('42');
    const parser = pdef.parser(lexer);
    
    const result = parser.parse('expression');
    
    test.ok(result);
    test.equal(result, 43);
};

