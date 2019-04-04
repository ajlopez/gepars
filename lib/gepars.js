
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

function NullRule() {
    this.parse = function (lexer) {
        const p = lexer.position();
        const token = lexer.next();
        
        lexer.seek(p);
        return token == null;
    };
}

function CutRule() {
    this.parse = function (lexer) {
        return lexer.position();
    };
}

function ParseRule(name, fn) {
    if (name[0] === '?') {
        this.optional = true;
        name = name.substring(1);
    }
    
    this.parse = function (lexer, parser, inprocess) {
        const result = parser.parse(name, inprocess);

        if (result == null)
            return null;
        
        if (fn)
            return fn(result);
        
        return result;
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

        if (!fn)
            return token.value;
        
        return fn(token.value);
    } 
}

function CompositeRule(rules, fn) {
    this.parse = function (lexer, parser, inprocess, firstvalue) {
        const begin = lexer.position();
        let values = [];
        let cut = -1;
        
        if (firstvalue)
            values.push(firstvalue);
        
        for (let k = values.length; k < rules.length; k++) {
            const rule = rules[k];
            
            if (cut < 0 && rule instanceof CutRule)
                cut = k;
            
            const value = rule.parse(lexer, parser, k ? [] : inprocess);
            
            if (value == null && !rule.optional) {
                lexer.seek(begin);
                return null;
            }

            values.push(value);
        }
        
        if (cut >= 0) {
            lexer.seek(values[cut]);
            values = values.slice(0, cut);
        }

        if (!fn)
            return values;
        
        return fn.call(null, values);
    };
}

function Parser(lexer, rules) {
    const self = this;
    
    lexer = new Lexer(lexer);

    function expand(name, value) {
        const nrules = rules[name];
        
        if (!nrules)
            return null;

        const begin = lexer.position();
        
        for (let k = 0; k < nrules.length; k++) {
            lexer.seek(begin);

            const rule = nrules[k];
            
            if (!rule.leftassoc)
                continue;
            
            const result = rule.parse(lexer, self, null, value);
            
            if (result != null)
                return expand(name, result);
        }
        
        lexer.seek(begin);
        
        return value;
    }
    
    this.parse = function (name, inprocess) {
        inprocess = inprocess || [];
        
        const nrules = rules[name];
        
        if (!nrules)
            return null;

        const begin = lexer.position();
        
        for (let k = 0; k < nrules.length; k++) {
            lexer.seek(begin);

            const rule = nrules[k];
            
            let newinprocess = inprocess;
            
            if (rule.leftassoc) {
                if (inprocess.indexOf(rule) >= 0)
                    continue;
                
                newinprocess = newinprocess.slice();
                newinprocess.push(rule);
            }
            
            const result = rule.parse(lexer, self, newinprocess);
            
            if (result != null)
                return expand(name, result);
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

                if (element === '!')
                    rules.push(new CutRule());
                else if (element === 'null')
                    rules.push(new NullRule());
                else if (typeof element === 'object')
                    rules.push(element);   
                else if (isTokenElement(element))
                    rules.push(new TokenRule(element, function (value) { return value; }));
                else
                    rules.push(new ParseRule(element));
            }
            
            return new CompositeRule(rules, fn);
        }       

        if (typeof elements === 'object')
            return elements;

        if (isTokenElement(elements))
            return new TokenRule(elements, fn);

        return new ParseRule(elements, fn);
    }
    
    this.parser = function (lexer) {
        return new Parser(lexer, rules);
    };
    
    this.define = function (name, elements, fn) {
        const rule = createRule(elements, fn);

        if (Array.isArray(elements) && elements[0] === name)
            rule.leftassoc = true;
        
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

