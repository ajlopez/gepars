
const gepars = require('..');
const gelex = require('gelex');

// define lexer
const ldef = gelex.definition();

ldef.define('integer', '[0-9][0-9]*');
ldef.define('name', '[a-zA-Z][a-zA-Z]*');

exports['parse integer'] = function (test) {
    const pdef = gepars.definition();
    
    pdef.define('integer', 'integer:', function (value) { return parseInt(value); });
    pdef.define('name', 'name:', function (value) { return value; });
    
    const lexer = ldef.lexer('42');
    const parser = pdef.parser(lexer);
    
    const result = parser.parse('integer');
    
    test.ok(result);
    test.strictEqual(result, 42);
}

exports['parse name'] = function (test) {
    const pdef = gepars.definition();
    
    pdef.define('integer', 'integer:', function (value) { return parseInt(value); });
    pdef.define('name', 'name:', function (value) { return value; });
    
    const lexer = ldef.lexer('foo');
    const parser = pdef.parser(lexer);
    
    const result = parser.parse('name');
    
    test.ok(result);
    test.strictEqual(result, 'foo');
}
