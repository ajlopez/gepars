
function TokenRule(tokendef, fn) {
    const p = tokendef.indexOf(':');
    const type = tokendef.substring(0, p);
    const value = tokendef.substring(p + 1);
    
    this.parse = function (lexer) {
        const token = lexer.next();
        
        if (!token)
            return null;
        
        if (token.type !== type)
            return null;
        
        if (value.length && token.value !== value)
            return null;
        
        return fn(token.value);
    } 
}

function Parser(lexer, rules) {
    this.parse = function (name) {
        const nrules = rules[name];
        
        if (!nrules)
            return null;
        
        for (let k = 0; k < nrules.length; k++) {
            const rule = nrules[k];
            const result = rule.parse(lexer);
            
            if (result != null)
                return result;
        }
        
        return null;
    }
}

function ParserDefinition() {
    const rules = {};
    
    function createRule(elements, fn) {
        return new TokenRule(elements, fn);
    }
    
    this.parser = function (lexer) {
        return new Parser(lexer, rules);
    };
    
    this.define = function (name, elements, fn) {
        const rule = createRule(elements, fn);
        
        if (!rules[name])
            rules[name] = [];
        
        rules[name].push(rule);
    };
}

function createDefinition() {
    return new ParserDefinition();
}

module.exports = {
    definition: createDefinition
}
