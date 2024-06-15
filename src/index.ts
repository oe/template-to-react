import { parser, type INode, type IAttribute } from './parser';

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
function convertAttributes(attributes: IAttribute[]): Record<string, string> {
  const convertedAttributes: Record<string, string> = {};

  attributes.forEach(({ name, value }) => {
    let newKey = jsxAttributeMap[name] || name;
    let newValue = value;
    if (/{\w+}/.test(value)) {
      const parts = value.split(/({\w+})/g);
      const convertedParts = parts.map(part => {
        if (part.startsWith('{') && part.endsWith('}')) {
          const prop = part.slice(1, -1); // remove the curly braces
          return standardizeProp(prop);
        } else {
          if (part === '') return null;
          return `'${part}'`;
        }
      });
      newValue = `{${convertedParts.filter(Boolean).join(' + ')}}`;
    } else {
      newValue = `"${newValue}"`;
    }

    convertedAttributes[newKey] = newValue;
  })

  return convertedAttributes;
}

/**
 * standardize the prop reference 
 * @param prop prop name
 */
function standardizeProp(prop: string): string {
  // valid variable name
  if (/^[$a-z][\da-z]*$/i.test(prop)) {
    return `props.${prop}`;
  }
  return `props['${prop}']`;
}

/**
 * create React element string
 * @param tag tag name
 * @param attributes attributes object
 * @param children children string
 * @returns React element string
 */
function createElementString(tag: string, attributes: Record<string, string>, children: string): string {
  const attrString = Object.entries(attributes)
    .map(([key, value]) => `${key}=${value}`)
    .join(' ').trim();

  const openTag = attrString ? `${tag} ${attrString}` : `${tag}`;
  if (children) {
    return `<${openTag}>${children}</${tag}>`;
  } else {
    return `<${openTag}/>`;
  }
}

/**
 * convert DOM node to React component string recursively
 * @param node DOM node
 * @returns React component string
 */
function convertNode(node: INode): string {
  if (node.type === 'comment') return ''
  if (node.type === 'text') {
    return node.value.replace(/{(\w+)}/g, (_, $1) => `{${standardizeProp($1)}}`)
  }
  if (node.type === 'selfClosingTag' || node.type === 'tag') {
    let tag = node.name.name;
    if (node.name.type === 'placeholder') {
      tag = `{${standardizeProp(node.name.name)}}`;
    }

    const attributes = convertAttributes(node.attributes);
    let children = '';
    if (node.type === 'tag') {
      children = node.children.map(convertNode).join('');
    }
    return createElementString(tag, attributes, children);
  }

  return '';
}

/**
 * options for templateToReact
 */
export interface ITemplateToReactOptions {
  /**
   * component name
   * @default 'TemplateComponent'
   */
  componentName?: string;
  /**
   * pretty print
   * @default false, true for 2 spaces, number for custom spaces
   */
  pretty?: boolean | number;
  /**
   * whether convert to jsx function call
   * @default false, true for React, object for custom jsx function
   */
  jsx?: boolean | {
    /**
     * Fragment component
     * use React.Fragment for default
     * @default false
     */
    fragment: Function;
    /**
     * function to create React element
     * use React.createElement for default
     * @default false
     */
    jsx: Function;
    /**
     * function to create React element root
     * use React.createElement for default
     */
    jsxs: Function;
  }
}

/**
 * convert template string to React component string
 * @param template template string
 * @returns React component string
 */
export function templateToReact(template: string, options?: ITemplateToReactOptions): string {
  const { componentName = 'TemplateComponent', pretty = false, jsx = false } = options || {};
  const ast = parser.parse(template.trim());
  const componentBody = ast.map(convertNode).filter(Boolean)

  // if the template has only one root node, no need for extra <> </>
  const needsFragmentWrapper = componentBody.length > 1;
  const componentString = componentBody.join('');

  return `function ${componentName}(props) { return ${needsFragmentWrapper ? `<>${componentString}</>` : componentString}; }`;
}

// sample
// const template = `ww<span>Hello, {user}! You Got 
// <{p1} class="{className}" data-id="{id} haha" data-tag="</{p3}>">{score}</{p1}>!
// <{w31} class="{className}" data-id="{id}">{score}</{w31}>!
// <span class="hilight" data-id="{pp} sss">Great!</span></span>`;
// const reactComponentString = templateToReactComponent(template);
// console.log(reactComponentString);
