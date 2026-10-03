import type { IText, INode, IElement, ISelfClosingElement, IAttribute } from './parser';
import { getIndent, isFragName, isValidVariableName, convertTextToExpression } from './common';

function getTextNode(node: IText, pretty: boolean, isRoot: boolean) {
  const content = convertTextToExpression(node.value,{
    pretty, wrapExp: false, wrapStr: true, prefixProp: true
  })
  if (!isRoot) return content
  const space = pretty ? ' ' : ''
  return `jsxs(frg,${space}null,${space}${content})`
}

function getTagName(node: IElement | ISelfClosingElement) {
  let tag = node.name.name
  if (isFragName(tag)) {
    return 'frg'
  }
  if (node.name.type === 'placeholder') {
    return tag.slice(1, -1)
  }
  return `"${tag}"`
}

function getPropName(name: string) {
  return isValidVariableName(name) ? name : JSON.stringify(name)
}


function getAttributes(attributes: IAttribute[], pretty: boolean, indent: number, indentSize: number) {
  if (!attributes.length) return 'null'
  const space = pretty ? ' ' : ''
  const attrs = attributes.map(({ name, value }) => {
    return `${getPropName(name)}:${space}${convertTextToExpression(value, { pretty, wrapExp: false, prefixProp: true, wrapStr: true })}`;
  })
  if (!pretty || attrs.join('').length < 20) return `{${space}${attrs.join(`,${space}`)}${space}}`
  const leadingIndent = `\n${getIndent(indent)}`
  return `{${leadingIndent}${attrs.join(`,${leadingIndent}`)}\n${getIndent(indent - indentSize)}}`
}


type FactoryModes = { root: boolean; nested: boolean };

function getElement(node: IElement | ISelfClosingElement, pretty: boolean, indent: number, indentSize: number, isRoot: boolean, factories: FactoryModes) {
  const fn = isRoot ? 'jsxs' : 'jsx'
  const space = pretty ? ' ' : ''
  const isCustomFactory = isRoot ? factories.root : factories.nested;
  const children = node.type === 'tag'
    ? `,${space}${isCustomFactory ? '' : '...'}${getChildren(node.children, pretty, indent + indentSize, indentSize, factories)}`
    : isCustomFactory ? `,${space}[]` : '';
  const attrString = getAttributes(node.attributes, pretty, indent + indentSize, indentSize)
  return `${fn}(${getTagName(node)},${space}${attrString}${children})`
}

function getChildren(nodes: INode[], pretty: boolean, indent: number, indentSize: number, factories: FactoryModes) {
  // Keep text placeholders as separate React children, including element props.
  const items = nodes.flatMap(node => {
    if (node.type !== 'text') return [buildJsxFromInner(node, pretty, indent, indentSize, false, factories)];
    return node.value.split(/({[^{}\r\n]+})/g).filter(part => part !== '').map(value =>
      buildJsxFromInner({ type: 'text', value }, pretty, indent, indentSize, false, factories));
  })
  if (!pretty) return `[${items.join(',')}]`
  return `[\n${getIndent(indent)}${items.join(`,\n${getIndent(indent)}`)}\n${getIndent(indent - indentSize)}]`
}

function buildJsxFromInner(node: INode, pretty: boolean, indent: number, indentSize: number, isRoot = false, factories: FactoryModes = { root: false, nested: false }): string {
  switch (node.type) {
    case 'comment':
      return '';
    case 'text':
      return getTextNode(node, pretty, isRoot)
    case 'tag':
    case 'selfClosingTag':
      return getElement(node, pretty, indent, indentSize, isRoot, factories);
    default:
      return '';
  }
}
export function buildJsxFrom(node: INode, jsx: IJsxOptions, pretty: boolean, indent: number, indentSize: number) {
  const options = typeof jsx === 'object' ? jsx : undefined;
  const factories = {
    root: !!options?.jsxs && options.jsxs !== 'React.createElement',
    nested: !!options?.jsx && options.jsx !== 'React.createElement',
  };
  const code = buildJsxFromInner(node, pretty, indent, indentSize, true, factories)
  const injectedCode = generateJsxStatement(jsx, pretty, indent)
  return {
    code,
    injectedCode
  }
}

/**
 * JSX options
 */
export type IJsxOptions = boolean | undefined | {
  /**
   * Fragment component name
   * use `React.Fragment` for default
   * @default false
   */
  fragment: string;
  /**
   * function name to create React element
   * use `React.createElement` for default
   * @default false
   */
  jsx: string;
  /**
   * function name to create React element root
   * use `React.createElement` for default
   */
  jsxs: string;
}

function generateJsxStatement (jsx: undefined | boolean | IJsxOptions, pretty: boolean, indent: number) {
  if (!jsx) return ''
  const space = pretty ? ' ' : ''
  const factories = typeof jsx === 'object' ? jsx : undefined;
  const options = [
    `const frg${space}=${space}${factories?.fragment || `React.Fragment`};`,
    `const jsx${space}=${space}${factories?.jsx || `React.createElement`};`,
    `const jsxs${space}=${space}${factories?.jsxs || `React.createElement`};`,
  ]
  if (!pretty) return options.join('')
  return '\n' + options.map(option => `${getIndent(indent)}${option}`).join('\n')
}