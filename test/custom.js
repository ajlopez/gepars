
const gepars = require('..');
const gelex = require('gelex');

function CustomRule() {
    this.parse = function (lexer) {
        let result = '';
        
        let token = lexer.next();
        
        while (token && token.type === 'digit') {
            result += token.value;
            token = lexer.next();
        }
        
        return result;
    }
}

exports['parse using custom rule'] = function (test) {
    const ldef = gelex.definition();

    ldef.define('digit', '[0-9]');
    
    const lexer = ldef.lexer('42');
    
    const pdef = gepars.definition();
    
    pdef.define('integer', new CustomRule());
    
    const parser = pdef.parser(lexer);
    
    const result = parser.parse('integer');
    
    test.ok(result);
    test.strictEqual(result, '42');
}

