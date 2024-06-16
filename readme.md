<h1 align="center">Template to React</h1>
<div align="center">
  <a href="https://github.com/oe/template-to-react/actions/workflows/build.yml">
    <img src="https://github.com/oe/template-to-react/actions/workflows/build.yml/badge.svg" alt="Github Workflow">
  </a>
  <a href="#readme">
    <img src="https://badges.frapsoft.com/typescript/code/typescript.svg?v=101" alt="code with typescript" height="20">
  </a>
  <a href="#readme">
    <img src="https://badge.fury.io/js/template-to-react.svg" alt="npm version" height="20">
  </a>
  <a href="https://www.npmjs.com/package/template-to-react">
    <img src="https://img.shields.io/npm/dm/template-to-react.svg" alt="npm version" height="20">
  </a>
</div>
Compiles HTML templates into React components, you may use it to convert HTML templates into React components at build time(or prebuild/predev).


> [!CAUTION]
> This package is still in development and may not be stable. Please report any issues you encounter.

## Installation

```bash
# use npm
npm install template-to-react -D

# use yarn
yarn add template-to-react -D
```

## Usage
Import the `compileTemplateToReact` function from the package:

```js
import { compileTemplateToReact } from 'template-to-react';
```

Then, you can use it to compile an HTML template into a React component:

```js
const htmlTemplate = '<div class="{className}">Hello, {name}!</div>';
const reactComponentCode = compileTemplateToReact(htmlTemplate);
// code:  `function TemplateComponent(props){return <div className={props.className}>Hello, {props.name}!</div>}`
```

In the above example, className and name are placeholders that will be replaced with the corresponding props when the React component is rendered.

Here's another example with a more complex template:
```js
const htmlTemplate = `
  <div class="{className}" data-title="Hello {user}">
    <h1>{title}</h1>
    <p>{description}</p>
    <{c1}>{c2}</{c1}>
    <{c3}/>
  </div>
`;
// compile the template to a React component
const reactComponentCode = compileTemplateToReact(htmlTemplate, {
  componentName: 'MyComponent',
  pretty: true,
});
// will output:
reactComponentCode = `
function MyComponent (props) {
  const C$c0 = props.c1;
  const C$c0 = props.c3;
  return (<div className={props.className} data-title={"Hello" + props.user}>
    <h1>{props.title}</h1>
    <p>{props.description}</p>
    <C$c0>{props.c2}</C$c0>
    <C$c1/>
  </div>)
}`;

// compile the template to a React component with custom jsx options
const reactComponentCodeJsx = compileTemplateToReact(htmlTemplate, {
  componentName: 'MyComponent',
  pretty: true,
  jsx: true,
});

// will output:
reactComponentCodeJsx = `
function MyComponent(props) {
  const frg = React.Fragment;
  const jsx = React.createElement;
  const jsxs = React.createElement;
  return jsxs("div", {
    className: props.className,
    "data-title": "Hello " + props.user
  }, [
    jsx("h1", null, [
      props.title
    ]),
    jsx("p", null, [
      props.description
    ]),
    jsx(props.c1, null, [
      props.c2
    ]),
    jsx(props.c3, null, [])
  ])
}`;
```

In this example, className, title, and description are placeholders that will be replaced with the corresponding props when the React component is rendered.

## API
`compileTemplateToReact(template: string, options?: ITemplateToReactOptions): string`

This function takes an HTML template as a string and an optional options object, and returns a React component. The HTML template can contain placeholders in the form {propName} that will be replaced with the corresponding props when the React component is rendered.

The `ITemplateToReactOptions` object can have the following properties:
```ts
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
```

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License
[MIT](./LICENSE)
