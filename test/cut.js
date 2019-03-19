
const gepars = require('..');
const gelex = require('gelex');

exports['parse using cut'] = function (test) {
    const ldef = gelex.definition();

    ldef.define('digit', '[0-9]');
    
    const lexer = ldef.lexer('0 1');
    
    const pdef = gepars.definition();
    
    pdef.define('zerobeforeone', ['digit:0', gepars.cut(), 'digit:1'], function (values) { return values[0]; });
    pdef.define('one', 'digit:1');
    
    const parser = pdef.parser(lexer);
    
    const result = parser.parse('zerobeforeone');
    
    test.ok(result);
    test.strictEqual(result, '0');
    
    const result2 = parser.parse('one');
    
    test.ok(result2);
    test.strictEqual(result2, '1');
}

