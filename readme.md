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

Compile HTML templates with prop placeholders into React JSX or JavaScript source at build time. Keep simple layouts in template files, pass data or components through React props, and import the generated component into your application. The compiler and PEG.js parser stay in your build dependencies when you use the generated source.

## When to use it

Use this package for repeatable code generation from simple, trusted templates: reusing a layout with different props, inserting React components into template slots, or converting a collection of controlled templates during a migration.

Choose based on the output you need:

| Need | Tool |
| --- | --- |
| Generate component source with `{prop}` bindings and `<{Component}>` slots | `template-to-react` |
| Render HTML received from a CMS or API at runtime | [html-react-parser](https://github.com/remarkablemark/html-react-parser) or [html-to-react](https://github.com/aknuds1/html-to-react) |
| Convert ordinary HTML to JSX once | [HTMLtoJSX](https://github.com/reactjs/react-magic/blob/master/README-htmltojsx.md) or a converter in your editor |
| Author a new React component directly | JSX/TSX |

This package accepts the template syntax described below. Raw HTML copied from a page may need adaptation, especially styles, boolean attributes, and void tags.

## Installation

```sh
npm install --save-dev template-to-react
# or
pnpm add --save-dev template-to-react
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

### Component slots

A tag placeholder lets the caller supply a React component:

```js
const code = compileTemplateToReact(
  '<section><{Heading}>{title}</{Heading}></section>',
  { componentName: 'Card' },
);
// function Card(props){const C$c0=props.Heading;return <section><C$c0>{props.title}</C$c0></section>}
```

Save and export the generated source as in the first example, then render `<Card Heading={YourHeadingComponent} title="Welcome" />`. No template parser is needed in the application at render time.

Templates and options must come from trusted sources. Compile during the build and import the result. The compiler is not a sanitizer; avoid evaluating remotely supplied templates. The parser currently generates its grammar at module initialization, which also requires dynamic code generation. Strict browser CSP environments should consume the generated component instead of loading this compiler.

## Template syntax

- Use lowercase tags, explicit closing tags, and self-closing void elements: `<div>…</div>`, `<input/>`, `<br/>`.
- Attribute values must be single- or double-quoted. Multiline attributes and whitespace around `=` are supported. Bare boolean attributes and unquoted values are not supported; use `disabled="{disabled}"` with a boolean prop.
- `{name}` references a prop. Text and attribute placeholders also support property keys such as `{user-name}` and `{3className}`. They are property names, not JavaScript expressions or nested paths.
- Dynamic tags accept identifier placeholders, including `$` and `_`: `<{_component}>{children}</{_component}>`. The corresponding prop supplies a React component or tag name. Opening and closing tag names must match.
- A single placeholder preserves its prop value. Mixed attribute values concatenate into strings; adjacent numeric placeholders such as `{a}{b}` produce `"12"` for `a: 1, b: 2`.
- `class` becomes `className`, and `for` becomes `htmlFor`. Supply other React attribute names directly, such as `tabIndex` and `readOnly`. Use a prop for object values: `style="{style}"`. CSS declaration strings are not converted into style objects.
- Comments are removed. Multiple roots and empty templates use a fragment. Doctypes, implicit tag closing, raw script contents, and general SVG conversion are not supported.
- Entity handling preserves the previous modes: JSX markup decodes HTML entities, while `jsx: true` treats entity spelling as literal text. For example, `&amp;` renders as `&` in markup mode and as `&amp;` in JavaScript mode. Use a prop when its literal value must be identical in both modes.
- Leading and trailing whitespace in text nodes is trimmed by default. `reserverWhitespace: true` preserves it in compact output. Pretty printing trims it; the template as a whole is always trimmed.

## API

```ts
compileTemplateToReact(template: string, options?: ITemplateToReactOptions): string
```

Returns component source code, without imports or exports. Parse errors include PEG.js location information; mismatched tag names and invalid component names or indentation throw an error.

```ts
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

The object form of `jsx` inserts the supplied JavaScript references for a fragment and two factory functions. `jsxs` handles the root and `jsx` handles nested elements. Custom factories retain the three-argument `(type, attributes, childrenArray)` contract, including an empty array for self-closing tags. References to `React.createElement` use its variadic children contract and omit children for self-closing tags. This is a custom factory contract, **not** the `react/jsx-runtime` API. The low-level `parser` and its AST types are also exported.

## Upgrading from 0.1.1

Version 1.0.0 includes compiler corrections that can change generated source and rendered output. Rebuild generated components and check your templates before upgrading.

- Public entry points, legacy deep imports, the `reserverWhitespace` spelling, JSX entity decoding, and the custom factory argument contract remain available.
- In JavaScript output, text placeholders are separate React children. React elements are no longer coerced into strings, and adjacent numbers render independently. In attributes, `{a}{b}` concatenates values instead of numerically adding them.
- Compact JSX output now preserves actual internal line breaks instead of emitting literal backslash-`n` text. Pretty JSX output retains JSX's whitespace normalization.
- Quotes, backslashes, braces, and unsupported identifier characters are escaped correctly. Valid Unicode component names remain supported; invalid function names and indentation fail early.
- Generated source formatting and React factory calls change. Custom factories may receive more children for a text node containing multiple placeholders; they should render the children array rather than assume one entry per original text node.
- Maintainer commands now require pnpm and Node.js 22.12+. This development requirement does not add a Node.js engine restriction to the published library or require consumers to upgrade React.

## Development

Use Node.js 22.12+ (22 or 24 LTS) and pnpm 12.8.1.

```sh
npm install --global pnpm@12.8.1
pnpm install --frozen-lockfile
pnpm typecheck
pnpm test:coverage
pnpm build
pnpm test:package
pnpm dev
```

`pnpm test` runs once; `pnpm test:watch` enables watch mode. The package smoke check installs a real tarball into an isolated temporary consumer, then verifies ESM/CommonJS loading and TypeScript declarations. It requires access to the npm registry. `prepublishOnly` runs the same checks before publication.

The toolchain uses TypeScript 5.9, Vite 8, and Vitest 5. TypeScript 5.9 matches the compiler bundled by the declaration generator and retains the APIs used by the rendering/package checks.

CI checks Node.js 22/24, React 18/19, coverage, the library build, and the packaged entry points. Before contributing a compiler fix, add a regression test that renders the generated component where possible.

## Maintenance

The supported template syntax and compiler options are documented above. Maintenance focuses on compiler correctness, compatibility, dependencies, and build reproducibility. Please report unsupported real-world templates with an input example and the expected component output.

## License

[MIT](./LICENSE)
