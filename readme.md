# Template to React

This project provides a utility function `compileTemplateToReact` that compiles HTML templates into React components.

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
const ReactComponent = compileTemplateToReact(htmlTemplate);
```


In the above example, className and name are placeholders that will be replaced with the corresponding props when the React component is rendered.

Here's another example with a more complex template:
```js
const htmlTemplate = `
  <div class="{className}">
    <h1>{title}</h1>
    <p>{description}</p>
  </div>
`;
const ReactComponent = compileTemplateToReact(htmlTemplate);
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
MIT
