import type { IText, INode, IElement, ISelfClosingElement, IAttribute } from './parser';
import { getIndent, isFragName, isValidVariableName, convertTextToExpression } from './common';



function getTextNode(node: IText, pretty: boolean, isRoot: boolean) {
  const content = convertTextToExpression(node.value,{
    pretty, wrapExp: false, wrapStr: true, prefixProp: false
  })
  if (!isRoot) return content
  const space = pretty ? ' ' : ''
  return `jsx(frg,${space}null,${space}${content})`
}

function getTagName(node: IElement | ISelfClosingElement) {
  let tag = node.name.name
  if (isFragName(tag)) {
    return 'frg'
  }
  if (/^{([\w.]+)}$/.test(tag)) {
    return RegExp.$1
  }
  return `"${tag}"`
}

function getPropName(name: string) {
  return isValidVariableName(name) ? name : `"${name}"`
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


function getElement(node: IElement | ISelfClosingElement, pretty: boolean, indent: number, indentSize: number, isRoot: boolean) {
  const fn = isRoot ? 'jsxs' : 'jsx'
  const space = pretty ? ' ' : ''
  const children = node.type === 'tag' ? getChildren(node.children, pretty, indent + indentSize, indentSize) : '[]'
  const attrString = getAttributes(node.attributes, pretty, indent + indentSize, indentSize)
  return `${fn}(${getTagName(node)},${space}${attrString},${space}${children})`
}

function getChildren(nodes: INode[], pretty: boolean, indent: number, indentSize: number) {
  const items = nodes.map(node => buildJsxFromInner(node, pretty, indent, indentSize))
  if (!pretty) return `[${items.join(',')}]`
  return `[\n${getIndent(indent)}${items.join(`,\n${getIndent(indent)}`)}\n${getIndent(indent - indentSize)}]`
}

function buildJsxFromInner(node: INode, pretty: boolean, indent: number, indentSize: number, isRoot = false): string {
  switch (node.type) {
    case 'comment':
      return '';
    case 'text':
      return getTextNode(node, pretty, isRoot)
    case 'tag':
    case 'selfClosingTag':
      return getElement(node, pretty, indent, indentSize, isRoot);
    default:
      return '';
  }
}
export function buildJsxFrom(node: INode, jsx: IJsxOptions, pretty: boolean, indent: number, indentSize: number) {
  const code = buildJsxFromInner(node, pretty, indent, indentSize, true)
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
  const options = [
    // @ts-ignore
    `const frg${space}=${space}${jsx.fragment || `React.Fragment`};`,
    // @ts-ignore
    `const jsx${space}=${space}${jsx.jsx || `React.createElement`};`,
    // @ts-ignore
    `const jsxs${space}=${space}${jsx.jsxs || `React.createElement`};`,
  ]
  if (!pretty) return options.join('')
  return '\n' + options.map(option => `${getIndent(indent)}${option}`).join('\n')
}