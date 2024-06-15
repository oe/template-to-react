import { parseDocument } from 'htmlparser2';
import { Element, Text, Node } from 'domhandler';

// 将特殊属性从 HTML 转换为 React
const attributeMap: Record<string, string> = {
  'class': 'className',
  'for': 'htmlFor',
};

const TAG_PROP = `data-${crypto.randomUUID()}`;
const TEMP_TAG = `tag-${crypto.randomUUID()}`;
/**
 * 将 HTML 属性转换为 React 属性
 * @param attributes HTML 属性对象
 * @returns React 属性对象
 */
function convertAttributes(attributes: Record<string, string>): Record<string, string> {
  const convertedAttributes: Record<string, string> = {};
  for (const [key, value] of Object.entries(attributes)) {
    let newKey = attributeMap[key] || key;
    let newValue = value;

    // Convert template placeholders to JSX expressions
    if (/{\w+}/.test(value)) {
      newValue = `{props.${value.slice(1, -1)}}`;
    } else {
      // Wrap string values in quotes
      newValue = `"${newValue}"`;
    }

    convertedAttributes[newKey] = newValue;
  }
  return convertedAttributes;
}

/**
 * 创建 React 元素字符串
 * @param tag 标签名
 * @param attributes 属性对象
 * @param children 子元素字符串
 * @returns React 元素字符串
 */
function createElementString(tag: string, attributes: Record<string, string>, children: string): string {
  const attrString = Object.entries(attributes)
    .map(([key, value]) => `${key}=${value}`)
    .join(' ');

  if (children) {
    return `<${tag} ${attrString}>${children}</${tag}>`;
  } else {
    return `<${tag} ${attrString} />`;
  }
}

/**
 * 递归地将 DOM 节点转换为 React 组件字符串
 * @param node DOM 节点
 * @returns React 组件字符串
 */
function convertNode(node: Node): string {
  if (node instanceof Text) {
    return node.data.replace(/{(\w+)}/g, '{props.$1}');
  }

  if (node instanceof Element) {
    let tag = node.name;
    if (tag === TEMP_TAG) {
      tag = `{props.${node.attribs[TAG_PROP]}}`;
      delete node.attribs[TAG_PROP];
    }

    const attributes = convertAttributes(node.attribs);
    const children = node.children.map(convertNode).join('');

    return createElementString(tag, attributes, children);
  }

  return '';
}

/**
 * 替换模板中的占位符标签名
 * @param template 模板字符串
 * @returns 替换后的模板字符串
 */
function replaceTagPlaceholders(template: string): string {
  return template.replace(/<\{(\w+)\}/g, `<${TEMP_TAG} ${TAG_PROP}="$1"`).replace(/<\/\{(\w+)\}>/g, `</${TEMP_TAG}>`);
}

/**
 * 将模板字符串转换为 React 组件字符串
 * @param template 模板字符串
 * @returns React 组件字符串
 */
function templateToReactComponent(template: string): string {
  const transformedTemplate = replaceTagPlaceholders(template);
  const document = parseDocument(transformedTemplate);
  const componentBody = document.children.map(convertNode).join('');

  return `function R(props) { return <>${componentBody}</>; }`;
}

// 示例使用
const template = `Hello, {user}! You Got 
<{p1} class="{className}" data-id="{id} haha">{score}</{p1}>!
<{w31} class="{className}" data-id="{id}">{score}</{w31}>!
<span class="hilight">Great!</span>`;
const reactComponentString = templateToReactComponent(template);
console.log(reactComponentString);