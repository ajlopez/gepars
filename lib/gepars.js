
function isTokenElement(element) {
    return element.indexOf(':') > 0;
}

function Lexer(lexer) {
    const tokens = [];
    let position = 0;
    
    this.next = function () {
        if (position < tokens.length)
            return tokens[position++];
        
        const newtoken = lexer.next();
        
        if (!newtoken)
            return null;
        
        tokens.push(newtoken);
        position = tokens.length - 1;
        
        return tokens[position++];
    };
    
    this.position = function () { return position; };
    
    this.seek = function (newposition) { position = newposition; };
}

function ParseRule(name) {
    this.parse = function (lexer, parser) {
        return parser.parse(name);
    }
}

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

function CompositeRule(rules, fn) {
    this.parse = function (lexer, parser) {
        const begin = lexer.position();
        const values = [];
        
        for (let k = 0; k < rules.length; k++) {
            const value = rules[k].parse(lexer, parser);
            
            if (value == null) {
                lexer.seek(begin);
                return null;
            }

            values.push(value);
        }
        
        return fn.call(null, values);
    };
}

function Parser(lexer, rules) {
    const self = this;
    
    lexer = new Lexer(lexer);
    
    this.parse = function (name) {
        const nrules = rules[name];
        
        if (!nrules)
            return null;

        const begin = lexer.position();
        
        for (let k = 0; k < nrules.length; k++) {
            lexer.seek(begin);
            
            const rule = nrules[k];
            const result = rule.parse(lexer, self);
            
            if (result != null)
                return result;
        }
        
        lexer.seek(begin);
        
        return null;
    }
}

function ParserDefinition() {
    const rules = {};
    
    function createRule(elements, fn) {
        if (Array.isArray(elements)) {
            const rules = [];
            
            for (let k = 0; k < elements.length; k++) {
                const element = elements[k];
                
                if (isTokenElement(element))
                    rules.push(new TokenRule(element, function (value) { return value; }));
                else
                    rules.push(new ParseRule(element));
            }
            
            return new CompositeRule(rules, fn);
        }
        
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

