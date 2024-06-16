import type { INode, IElement, ISelfClosingElement } from './parser';
import { getIndent, isFragName, getIndentContent, convertTextToExpression } from './common';

const customTagMng = {
  index: 0,
  cachedMap: {} as Record<string, { tagName: string, code: string }>,
  reset() {
    customTagMng.index = 0;
    customTagMng.cachedMap = {};
  },
  getTag(tag: string, pretty: boolean) {
    if (!/^{([^\b}]+)}$/.test(tag)) return tag;
    const propName = RegExp.$1;
    if (customTagMng.cachedMap[propName]) {
      return customTagMng.cachedMap[propName].tagName;
    }
    const tagName = `C$c${customTagMng.index++}`;
    const space = pretty ? ' ' : '';
    customTagMng.cachedMap[propName] = {
      tagName,
      code: `const ${tagName}${space}=${space}${propName};`
    }
    return tagName;
  },
  getTagCode(pretty: boolean, indent: number) {
    const codes = Object.values(customTagMng.cachedMap).map(({ code }) => code);
    if (!codes.length) return '';
    if (!pretty) return codes.join('');
    const leadingIndent = `\n${getIndent(indent)}`;
    return leadingIndent + codes.join(leadingIndent);
  }
}


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
  } else {
    tag = customTagMng.getTag(tag, pretty);
  }
  const attrs = node.attributes.map(({name, value}) =>
    getIndentContent(pretty, attrIndent, `${name}=${convertTextToExpression(value, { pretty, prefixProp: true, wrapStr: true, wrapExp: true })}`))
  let attrString = attrs.map(item => item.trim()).join(' ').trim()
  if (pretty && attrString && attrString.length > 20) {
    attrString = `\n` + attrs.join('\n') + '\n' + getIndent(attrIndent - indentSize);
  } else if (attrString) {
    attrString = ' ' + attrString
  }

  return { tag, tagWithAttrs: attrString ? `${tag}${attrString}` : `${tag}`};
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
  }
  return '';
}

export function buildHtmlFrom(node: INode, pretty: boolean, indent: number, indentSize: number) {
  customTagMng.reset()
  const content = buildHtmlFromInner(node, pretty, indent, indentSize).trim();
  const tagCode = customTagMng.getTagCode(pretty, indent);
  const code = pretty && content ? `(${content})` : content;
  return {
    code,
    injectedCode: tagCode
  }
}
