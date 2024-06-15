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
        return { type: 'tag', name: startTagName, attributes, children }; 
      }

  selfClosingTag
    = "<" name:tagName attributes:attributes space* "/>" 
      { return { type: 'selfClosingTag', name, attributes }; }

  tagName
    = identifier:tagIdentifier { return { type: 'tag', name: identifier }; }
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
    = "\\"" value:[^"]* "\\"" { return value.join(''); }
    / "\\'" value:[^']* "\\'" { return value.join(''); }

  text
    = text:[^<]+ { return text.join(''); }

  space
    = " "

  comment
    = "<!--" comment:(!"-->" .)* "-->"
      { return { type: 'comment', comment: comment.flat().join('') }; }
`;

/**
 * html attribute
 */
export interface IAttribute {
  name: string;
  value: string;
}

/**
 * html comment node
 */
export interface IComment {
  type: 'comment';
  comment: string;
}

/**
 * html text node
 */

export interface IText {
  type: 'text';
  value: string;
}

/**
 * html element node
 */
export interface IElement {
  type: 'tag';
  name: {
    type: 'tag' | 'placeholder';
    name: string 
  }
  attributes: IAttribute[];
  children: INode[];
}

/**
 * html self closing tag node
 */
export interface ISelfClosingTag {
  type: 'selfClosingTag';
  name: {
    type: 'tag' | 'placeholder';
    name: string 
  }
  attributes: IAttribute[];
}

/**
 * html node
 */
export type INode = IElement | IText | IComment | ISelfClosingTag


/**
 * html custom parser support placeholder as tag name
 */
export const parser = peg.generate(htmlSyntax) as {
  parse: (input: string) => INode[];
};

/**
 * build html string from node array
 * @param nodes node array
 * @returns string
 */
export function buildHtmlFrom(nodes: INode[]): string {
  return nodes.map(node => {
    switch (node.type) {
      case 'comment':
        return
      case 'text':
        return node.value;
      case 'tag':
        return `<${node.name.name} ${node.attributes.map(({name, value}) => `${name}="${value}"`).join(' ')}>${buildHtmlFrom(node.children)}</${node.name.name}>`;
      case 'selfClosingTag':
        return `<${node.name.name} ${node.attributes.map(({name, value}) => `${name}="${value}"`).join(' ')}/>`;
    }
  }).filter(Boolean).join('');
}


// const content = parser.parse('<{p1}>xxx</{p1}>')
// console.log(JSON.stringify(content))