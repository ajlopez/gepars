
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

exports['parse specific name'] = function (test) {
    const pdef = gepars.definition();
    
    pdef.define('integer', 'integer:', function (value) { return parseInt(value); });
    pdef.define('if', 'name:if', function () { return 'if'; });
    pdef.define('for', 'name:for', function () { return 'for'; });
    pdef.define('name', 'name:', function (value) { return value; });
    
    const lexer = ldef.lexer('if');
    const parser = pdef.parser(lexer);
    
    const result = parser.parse('if');
    
    test.ok(result);
    test.strictEqual(result, 'if');
    
    const lexer2 = ldef.lexer('for');
    const parser2 = pdef.parser(lexer2);
    
    const result2 = parser2.parse('if');
    
    test.equal(result2, null);
    
    const result3 = parser2.parse('for');
    
    test.ok(result3);
    test.strictEqual(result3, 'for');
}

exports['parse specific name using default function in definition'] = function (test) {
    const pdef = gepars.definition();
    
    pdef.define('integer', 'integer:', function (value) { return parseInt(value); });
    pdef.define('if', 'name:if');
    pdef.define('for', 'name:for');
    pdef.define('name', 'name:');
    
    const lexer = ldef.lexer('if');
    const parser = pdef.parser(lexer);
    
    const result = parser.parse('if');
    
    test.ok(result);
    test.strictEqual(result, 'if');
    
    const lexer2 = ldef.lexer('for');
    const parser2 = pdef.parser(lexer2);
    
    const result2 = parser2.parse('if');
    
    test.equal(result2, null);
    
    const result3 = parser2.parse('for');
    
    test.ok(result3);
    test.strictEqual(result3, 'for');
}

exports['parse two specific tokens'] = function (test) {
    const pdef = gepars.definition();
    
    pdef.define('integer', 'integer:', function (value) { return parseInt(value); });
    pdef.define('each', 'name:each', function (value) { return value; });
    pdef.define('for', 'name:for', function (value) { return value; });
    pdef.define('foreach', [ 'name:for', 'name:each' ], function (values) { return values.join(''); });
    pdef.define('name', 'name:', function (value) { return value; });
    
    const lexer = ldef.lexer('for each');
    const parser = pdef.parser(lexer);
    
    const result = parser.parse('foreach');
    
    test.ok(result);
    test.strictEqual(result, 'foreach');
}

exports['parse new line as char'] = function (test) {
    const pdef = gepars.definition();
    
    pdef.define('endofline', 'char:\n');
    
    const lexer = ldef.lexer('\n');
    const parser = pdef.parser(lexer);
    
    const result = parser.parse('endofline');
    
    test.ok(result);
    test.strictEqual(result, '\n');
}

exports['no new line as char'] = function (test) {
    const pdef = gepars.definition();
    
    pdef.define('endofline', 'char:\n');
    pdef.define('name', 'name:', function (value) { return value; });
    
    const lexer = ldef.lexer('a');
    const parser = pdef.parser(lexer);
    
    const result = parser.parse('endofline');    
    test.ok(!result);
    
    const result2 = parser.parse('name');    
    test.equal(result2, 'a');
}

exports['retract char'] = function (test) {
    const pdef = gepars.definition();
    
    pdef.define('abc', [ 'char:a', 'char:b', 'char:c' ]);
    pdef.define('name', 'name:', function (value) { return value; });
    
    const lexer = ldef.lexer('abd');
    const parser = pdef.parser(lexer);
    
    const result = parser.parse('abc');    
    test.ok(!result);
    
    const result2 = parser.parse('name');    
    test.equal(result2, 'abd');
}

