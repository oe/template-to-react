import { type INode } from './parser';
/**
 * fragment name, random string
 */
export const FRG_NAME = typeof crypto === 'object' ? crypto.randomUUID() : Math.random().toString(36).slice(2);

/**
 * is fragment node
 */
export const isFragName = (name: string) => name === FRG_NAME;

/**
 * generate indent string
 * @param indent number
 * @returns space string with indent length
 */
export function getIndent(indent: number): string {
  return Array(indent + 1).join(' ');
}

export function getIndentContent(pretty: boolean, indent: number, content: string) {
  return pretty ? getIndent(indent) + content : content;
}

export function isValidVariableName(name: string) {
  return /^[$a-z][\da-z$]*$/i.test(name);
}

/**
 * standardize the prop reference 
 * @param prop prop name
 */
export function standardizeProp(prop: string): string {
  // valid variable name
  if (isValidVariableName(prop)) {
    return `props.${prop}`;
  }
  return `props["${prop}"]`;
}

/**
 * convert a text with placeholder to expression
 * @param text string
 * @param options
 * @param options.wrapExp wrap the expression with curly braces
 * @param options.wrapStr wrap the string with double quotes
 * @param options.prefixProp prefix the placeholder with `props.`
 * @param options.pretty add space between parts
 * @returns expression string
 */
export function convertTextToExpression(text: string, options?: { wrapExp?: boolean, wrapStr?: boolean, prefixProp?: boolean, pretty?: boolean}) {
  if (/{[^\b}]+}/.test(text)) {
    const parts = text.split(/({[^\b}]+})/g);
    const convertedParts = parts.map(part => {
      if (part.startsWith('{') && part.endsWith('}')) {
        const prop = part.slice(1, -1); // remove the curly braces
        return options?.prefixProp ? standardizeProp(prop) : prop;
      } else {
        if (part === '') return null;
        return JSON.stringify(part)
      }
    });
    const joiner = options?.pretty ? ' + ' : '+'
    const exp = convertedParts.filter(Boolean).join(joiner)
    return options?.wrapExp ? `{${exp}}` : exp;
  } else {
    return options?.wrapStr ? JSON.stringify(text) : text;
  }
}

/**
 * whether nodes array has its own root node
 * @param nodes 
 * @returns 
 */
export function hasRootNode(nodes: INode[]) {
  if (nodes.length === 1) return nodes[0].type === 'tag' || nodes[0].type === 'selfClosingTag';
  return false;
}