import { parseDocument } from 'htmlparser2';
import { Element, Text, Node } from 'domhandler';

/**
 * jsx special attributes mapping
 */
const jsxAttributeMap: Record<string, string> = {
  'class': 'className',
  'for': 'htmlFor',
};
// random tag and prop to replace the placeholder tag, to avoid conflict with the original tag
const TAG_PROP = `data-${crypto.randomUUID()}`;
const TEMP_TAG = `tag-${crypto.randomUUID()}`;

/**
 * convert HTML attributes to React attributes
 * @param attributes attributes object
 * @returns React attributes object
 */
function convertAttributes(attributes: Record<string, string>): Record<string, string> {
  const convertedAttributes: Record<string, string> = {};

  for (const [key, value] of Object.entries(attributes)) {
    let newKey = jsxAttributeMap[key] || key;
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
  }

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
function convertNode(node: Node): string {
  if (node instanceof Text) {
    return node.data.replace(/{(\w+)}/g, (_, $1) => `{${standardizeProp($1)}}`);
  }

  if (node instanceof Element) {
    let tag = node.name;
    if (tag === TEMP_TAG) {
      tag = `{${standardizeProp(node.attribs[TAG_PROP])}}`;
      delete node.attribs[TAG_PROP];
    }

    const attributes = convertAttributes(node.attribs);
    const children = node.children.map(convertNode).join('');

    return createElementString(tag, attributes, children);
  }

  return '';
}

/**
 * replace tag placeholders with temporary tag and prop
 * @param template template string
 * @returns replaced template string
 */
function replaceTagPlaceholders(template: string): string {
  return template.replace(/<\{(\w+)\}/g, `<${TEMP_TAG} ${TAG_PROP}="$1"`).replace(/<\/\{(\w+)\}>/g, `</${TEMP_TAG}>`);
}

/**
 * convert template string to React component string
 * @param template template string
 * @returns React component string
 */
function templateToReactComponent(template: string): string {
  const transformedTemplate = replaceTagPlaceholders(template);
  const document = parseDocument(transformedTemplate);
  const componentBody = document.children.map(convertNode).join('');

  // if the template has only one root node, no need for extra <> </>
  const needsFragmentWrapper = document.children.length > 1;

  return `function R(props) { return ${needsFragmentWrapper ? `<>${componentBody}</>` : componentBody}; }`;
}

// 示例使用
const template = `<span>Hello, {user}! You Got 
<{p1} class="{className}" data-id="{id} haha">{score}</{p1}>!
<{w31} class="{className}" data-id="{id}">{score}</{w31}>!
<span class="hilight">Great!</span></span>`;
const reactComponentString = templateToReactComponent(template);
console.log(reactComponentString);