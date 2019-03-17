
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

