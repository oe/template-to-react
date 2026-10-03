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

Compiles a small HTML template language into React component source code. Use it at build time to turn static templates and `{propName}` placeholders into `.jsx` files or plain JavaScript functions.

## Maintenance status

This is a small, experimental utility maintained on a best-effort basis. Maintenance focuses on compiler correctness, React compatibility, dependency updates, and reproducible builds. The current API is intended for simple templates; a full HTML parser, arbitrary JavaScript expressions, and framework integrations are outside its scope.

## Installation

```sh
npm install --save-dev template-to-react
# or
yarn add --dev template-to-react
```

The package exports ESM and CommonJS entry points and TypeScript declarations. React is used by the generated component and is supplied by your application. Rendering tests cover React 18 and 19.

## Build-time usage

```js
import { writeFile } from 'node:fs/promises';
import { compileTemplateToReact } from 'template-to-react';

const template = '<div class="{className}">Hello, {name}!</div>';
const code = compileTemplateToReact(template, { componentName: 'Greeting' });

await writeFile(
  './Greeting.jsx',
  `import React from 'react';\nexport ${code}\n`,
);
// function Greeting(props){return <div className={props.className}>Hello, {props.name}!</div>}
```

Compile the generated JSX with your application's existing JSX toolchain. For output that is already valid JavaScript, use `jsx: true`; the generated function references `React.Fragment` and `React.createElement`:

```js
const code = compileTemplateToReact(
  '<div class="{className}">Hello, {name}!</div>',
  { componentName: 'Greeting', jsx: true, pretty: true },
);
// Save it with `import React from 'react';` and an export, as above.
```

Templates and options must come from trusted sources. Compile during the build and import the result. The compiler is not a sanitizer; avoid evaluating remotely supplied templates. The parser currently generates its grammar at module initialization, which also requires dynamic code generation. Strict browser CSP environments should consume the generated component instead of loading this compiler.

## Template syntax

- Use lowercase tags, explicit closing tags, and self-closing void elements: `<div>…</div>`, `<input/>`, `<br/>`.
- Attribute values must be single- or double-quoted. Multiline attributes and whitespace around `=` are supported. Bare boolean attributes and unquoted values are not supported; use `disabled="{disabled}"` with a boolean prop.
- `{name}` references a prop. Text and attribute placeholders also support property keys such as `{user-name}` and `{3className}`. They are property names, not JavaScript expressions or nested paths.
- Dynamic tags accept identifier placeholders, including `$` and `_`: `<{_component}>{children}</{_component}>`. The corresponding prop supplies a React component or tag name. Opening and closing tag names must match.
- A single placeholder preserves its prop value. Mixed attribute values concatenate into strings; adjacent numeric placeholders such as `{a}{b}` produce `"12"` for `a: 1, b: 2`.
- `class` becomes `className`, and `for` becomes `htmlFor`. Supply other React attribute names directly, such as `tabIndex` and `readOnly`. Use a prop for object values: `style="{style}"`. CSS declaration strings are not converted into style objects.
- Comments are removed. Multiple roots and empty templates use a fragment. Doctypes, implicit tag closing, raw script contents, and general SVG conversion are not supported.
- Literal text and attribute values are preserved without HTML entity decoding. Write `&` when you want an ampersand; `&amp;` remains the literal text `&amp;` in both output modes.
- Leading and trailing whitespace in text nodes is trimmed by default. `reserverWhitespace: true` preserves it in compact output. Pretty printing trims it; the template as a whole is always trimmed.

## API

```ts
compileTemplateToReact(template: string, options?: ITemplateToReactOptions): string
```

Returns component source code, without imports or exports. Parse errors include PEG.js location information; mismatched tag names and invalid component names or indentation throw an error.

```ts
import type { ITemplateToReactOptions, IJsxOptions } from 'template-to-react';

interface ITemplateToReactOptions {
  // Historical spelling retained for compatibility; defaults to false.
  reserverWhitespace?: boolean;
  // JavaScript function identifier; defaults to 'TemplateComponent'.
  componentName?: string;
  // true uses 2 spaces; numeric indentation must be a non-negative integer.
  pretty?: boolean | number | { initialIndent: number; indentSize: number };
  // false outputs JSX markup; true outputs React.createElement calls.
  jsx?: IJsxOptions;
}

type IJsxOptions = boolean | undefined | {
  fragment: string;
  jsx: string;
  jsxs: string;
};
```

The object form of `jsx` inserts the supplied JavaScript references for a fragment and two factory functions. `jsxs` handles the root and `jsx` handles nested elements. Factories receive `(type, attributes, childrenArray)` for paired tags and `(type, attributes)` for self-closing tags. This is a custom factory contract, **not** the `react/jsx-runtime` API. The low-level `parser` and its AST types are also exported.

## Development

Use Node.js 22.12+ (22 or 24 LTS) and Yarn 1.22.22.

```sh
npm install --global yarn@1.22.22
yarn install --frozen-lockfile
yarn test:coverage
yarn build
yarn test:package
yarn dev
```

`yarn test` runs once; `yarn test:watch` enables watch mode. The package smoke check installs a real tarball into an isolated temporary consumer, then verifies ESM/CommonJS loading and TypeScript declarations. It requires access to the npm registry. `prepublishOnly` runs the same checks before publication.

CI checks Node.js 22/24, React 18/19, coverage, the library build, and the packaged entry points. Before contributing a compiler fix, add a regression test that renders the generated component where possible.

## License

[MIT](./LICENSE)
