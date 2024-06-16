import { parser, type INode, type IAttribute } from './parser';
import { getIndent, FRG_NAME, getIndentContent, standardizeProp } from './common';
import { buildHtmlFrom } from './build-html';
import { generateJsxStatement, buildJsxFrom } from './build-jsx'
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
    // let newValue = convertTextToExpression(value, { wrapExp: true, wrapStr: true, prefixProp: true });
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
  return
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
   * @default 'TemplateComponent'
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
  jsx?: boolean | {
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

  const convertedAst = ast.map(item => convertNode(item, reserverWhitespace || (isPretty && !!jsx))).filter(Boolean) as INode[];
  
  const astTree: INode = convertedAst.length > 1
    ? { type: 'tag', name: { type: 'placeholder', name: FRG_NAME }, attributes: [], children: convertedAst }
    : convertedAst[0];

  const initialIndent = typeof pretty === 'object' ? pretty.initialIndent : 0;
  const indentSize = typeof pretty === 'object' ? pretty.indentSize : typeof pretty === 'number' ? pretty : 2;
  const leadingIndent = getIndentContent(isPretty, initialIndent, '');
  const fnContentIndent = initialIndent + indentSize;

  const space = isPretty ? ' ' : '';
  const fnTemplate = (code: string) => {
    return `${leadingIndent}function ${componentName}(props)${space}{${generateJsxStatement(jsx, isPretty, fnContentIndent)}${
      isPretty
      ? `\n${getIndent(fnContentIndent)}return ${code}\n${leadingIndent}}`
      : `return ${code}}` }`;
  }

  if (jsx) {
    return fnTemplate(buildJsxFrom(astTree, isPretty, initialIndent + indentSize, indentSize).trim())
  } else {
    return fnTemplate(buildHtmlFrom(astTree, isPretty, initialIndent + indentSize, indentSize).trim())
  }
}

// sample
// const template = `<div>ww<span>Hello, {user}! You Got 
// dsdsd
// <{p1} class="{3className}" data-id="{id} haha" data-tag="</{p3}>">{score}</{p1}>!
// <{w31} class="{className}" data-id="{id}">{score} good</{w31}>!
// <span class="hilight" data-id="{pp} sss">Great!</span></span></div>`;
// const reactComponentString = compileTemplateToReact(template, { pretty: false, jsx: true, reserverWhitespace: false });
// console.log(reactComponentString);
// console.log('\ndone')
