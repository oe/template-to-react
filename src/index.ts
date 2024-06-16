import { parser, type INode, type IAttribute } from './parser';
import { getIndent, FRG_NAME, getIndentContent, standardizeProp, hasRootNode } from './common';
import { buildHtmlFrom } from './build-html';
import { buildJsxFrom, type IJsxOptions } from './build-jsx'
export * from './parser';
/**
 * jsx special attributes mapping
 */
const jsxAttributeMap: Record<string, string> = {
  'class': 'className',
  'for': 'htmlFor',
};

/**
 * convert HTML attributes to React attributes
 * @param attributes attributes object
 * @returns React attributes object
 */
function convertAttributes(attributes: IAttribute[]): IAttribute[] {
  return attributes.map(({ name, value }) => {
    let newKey = jsxAttributeMap[name] || name;
    return { name: newKey, value };
  })
}

/**
 * convert DOM node to React component string recursively
 * @param node DOM node
 * @returns React component string
 */
function convertNode(node: INode, reserverWhitespace?: boolean): INode | undefined {
  if (node.type === 'comment') return
  if (node.type === 'text') {
    node.value = node.value.replace(/{(\w+)}/g, (_, $1) => `{${standardizeProp($1)}}`)
    if (!reserverWhitespace) {
      node.value = node.value.trim();
    }
    if (node.value === '') return
    return node
  }
  if (node.type === 'selfClosingTag' || node.type === 'tag') {
    if (node.name.type === 'placeholder') {
      node.name.name = `{${standardizeProp(node.name.name)}}`;
    }

    node.attributes = convertAttributes(node.attributes);
    if (node.type === 'tag') {
      node.children = node.children.map(item => convertNode(item, reserverWhitespace)).filter(Boolean) as INode[];
    }
    return node
  }
}

/**
 * options for templateToReact
 */
export interface ITemplateToReactOptions {
  /**
   * whether reserve leading and trailing whitespace in text node
   *  invalid when pretty is true and jsx is true
   */
  reserverWhitespace?: boolean;
  /**
   * component name
   * @default TemplateComponent
   */
  componentName?: string;
  /**
   * pretty print
   * @default false, true for 2 spaces, number for custom spaces
   */
  pretty?: boolean | number | { initialIndent: number, indentSize: number };
  /**
   * whether convert to jsx function call
   * @default false, true for React, object for custom jsx function
   */
  jsx?: IJsxOptions
}

/**
 * convert template string to React component string
 * @param template template string
 * @returns React component string
 */
export function compileTemplateToReact(template: string, options?: ITemplateToReactOptions): string {
  const { componentName = 'TemplateComponent', jsx, pretty, reserverWhitespace } = options || {};
  const ast = parser.parse(template.trim());
  const isPretty = !!pretty

  const convertedAst = ast.map(item => convertNode(item, !isPretty && reserverWhitespace)).filter(Boolean) as INode[];
  
  const astTree: INode = !hasRootNode(convertedAst)
    ? { type: 'tag', name: { type: 'placeholder', name: FRG_NAME }, attributes: [], children: convertedAst }
    : convertedAst[0];

  const indentSize = typeof pretty === 'object' ? pretty.indentSize : typeof pretty === 'number' ? pretty : 2;
  const initialIndent = typeof pretty === 'object' ? pretty.initialIndent : 0;
  const leadingIndent = getIndentContent(isPretty, initialIndent, '');
  const fnContentIndent = initialIndent + indentSize;

  const { code, injectedCode } = jsx
    ? buildJsxFrom(astTree, jsx, isPretty, fnContentIndent, indentSize)
    : buildHtmlFrom(astTree, isPretty, fnContentIndent, indentSize);

  const space = isPretty ? ' ' : '';
  return `${leadingIndent}function ${componentName}(props)${space}{${injectedCode}${
    isPretty
    ? `\n${getIndent(fnContentIndent)}return ${code}\n${leadingIndent}}`
    : `return ${code}}`}`;
}
