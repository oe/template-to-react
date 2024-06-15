import { parseDocument } from 'htmlparser2';
import { Element, Text, Node } from 'domhandler';

// 将特殊属性从 HTML 转换为 React
const attributeMap: Record<string, string> = {
  'class': 'className',
  'for': 'htmlFor',
};

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
    const tag = node.name;
    const attributes = convertAttributes(node.attribs);
    const children = node.children.map(convertNode).join('');

    return createElementString(tag, attributes, children);
  }

  return '';
}

/**
 * 将模板字符串转换为 React 组件字符串
 * @param template 模板字符串
 * @returns React 组件字符串
 */
function templateToReactComponent(template: string): string {
  const document = parseDocument(template);
  const componentBody = document.children.map(convertNode).join('');

  return `function R(props) { return <>${componentBody}</>; }`;
}

// 示例使用
const template = `Hello, {user}! You Got <{p1} class="{className}" data-id="{id}">{score}</{p1}>! <span class="hilight">Great!</span>`;
const reactComponentString = templateToReactComponent(template);
console.log(reactComponentString);