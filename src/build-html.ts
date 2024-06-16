import type { INode, IElement, ISelfClosingElement } from './parser';
import { getIndent, isFragName, getIndentContent, convertTextToExpression } from './common';


/**
 * create React element string
 * @param tag tag name
 * @param attributes attributes object
 * @param children children string
 * @returns React element string
 */
function getOpenTag(node: IElement | ISelfClosingElement, pretty: boolean, attrIndent: number, indentSize: number) {
  let tag = node.name.name
  if (isFragName(tag)) {
    tag = ''
  }
  let attrString = node.attributes.map(({name, value}) =>
    getIndentContent(pretty, attrIndent, `${name}=${convertTextToExpression(value, { pretty, prefixProp: true, wrapStr: true, wrapExp: true })}`))
    .join(pretty ? '\n' : ' ').trim();
  
  if (pretty && attrString && attrString.length > 20) {
    attrString = `\n${getIndent(attrIndent)}` + attrString + '\n' + getIndent(attrIndent - indentSize);
  }

  return { tag, tagWithAttrs: attrString ? `${tag} ${attrString}` : `${tag}`};
}

/**
 * build html string from node array
 * @param nodes node array
 * @returns string
 */
function buildHtmlFromInner(node: INode, pretty: boolean, indent: number, indentSize: number): string {
  const leadingIndent = pretty ? `\n${getIndent(indent)}` : '';
  switch (node.type) {
    case 'comment':
      return '';
    case 'text':
      return leadingIndent + (pretty ? node.value : node.value.replace(/\n/g, '\\n'))
    case 'tag':
    case 'selfClosingTag':
      const { tag, tagWithAttrs } = getOpenTag(node, pretty, indent + indentSize, indentSize);
      if (node.type === 'selfClosingTag') {
        return `${leadingIndent}<${tagWithAttrs}/>`;
      }
      return `${leadingIndent}<${tagWithAttrs}>${node.children.map(child => buildHtmlFromInner(child, pretty, indent + indentSize, indentSize)).join('')}${leadingIndent}</${tag}>`;
    default:
      return '';
  }
}

export function buildHtmlFrom(node: INode, pretty: boolean, indent: number, indentSize: number): string {
  const content = buildHtmlFromInner(node, pretty, indent, indentSize).trim();
  return pretty ? `(${content})` : content;
}
