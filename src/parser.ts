import peg from 'pegjs'

const htmlSyntax = `
  start
    = document:document { return document; }

  document
    = elements:(element / comment)* { return elements; }

  element
    = tag:tag { return tag; }
    / selfClosingTag:selfClosingTag { return selfClosingTag; }
    / text:text { return { type: 'text', value: text }; }

  tag
    = "<" startTagName:tagName attributes:attributes space* ">" children:document "</" endTagName:tagName ">" 
      { 
        if (startTagName.name !== endTagName.name) {
          throw new Error('Tag names do not match: ' + startTagName.name + ' vs. ' + endTagName.name);
        }
        return { type: 'tag', name: startTagName.name, attributes, children }; 
      }

  selfClosingTag
    = "<" name:tagName attributes:attributes space* "/>" 
      { return { type: 'selfClosingTag', name, attributes }; }

  tagName
    = identifier:tagIdentifier { return {type: 'tag', name: identifier}; }
    / placeholder:placeholder { return placeholder; }

  identifier
    = start:[a-zA-Z] rest:[a-zA-Z0-9_]* { return start + rest.join(''); }
  
  tagIdentifier
    = start:[a-zA-Z] rest:[a-zA-Z0-9_-]*
      {
        if (start.toLowerCase() !== start || rest.some(c => c.toLowerCase() !== c)) {
          throw new Error('Tag name ' + (start + rest.join('')) + ' must be lowercase');
        }
        return start + rest.join('');
      }
  
  dashIdentifier
    = start:[a-zA-Z] rest:[a-zA-Z0-9_-]* { return start + rest.join(''); }

  placeholder
    = "{" identifier:identifier "}" { return { type: 'placeholder', name: identifier }; }

  attributes
    = attributes:attribute* { return attributes; }

  attribute
    = space* name:dashIdentifier "=" value:quotedValue 
      { return { name, value }; }

  quotedValue
    = "\\"" value:[^"]* "\\""
      { return value.join(''); }

  text
    = text:[^<]+ { return text.join(''); }

  space
    = " "

  comment
    = "<!--" comment:(!"-->" .)* "-->"
      { return { type: 'comment', comment: comment.join('') }; }
`;

// Load the PEG.js grammar from the generated file
// const grammar = fs.readFileSync('./grammar.js', 'utf8');

// Create a PEG.js parser
export const parser = peg.generate(htmlSyntax);
// Parse some input
const input = `
<{p13} class="demo" data-id="</{p1-23}>">xxxx</{p13}>
<div class="test">Hello, world!</div>
"Hello, world!" {p222}
<{p24} />
`;
const output = parser.parse(input);

console.log('parser:');
console.log(JSON.stringify(output, null, 2));