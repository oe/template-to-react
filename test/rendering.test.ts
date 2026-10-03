import { describe, expect, it } from 'vitest'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import ts from 'typescript'
import { compileTemplateToReact } from '../src'

function compile(template: string, jsx: boolean, pretty = false) {
  const source = compileTemplateToReact(template, { jsx, pretty })
  const { outputText } = ts.transpileModule(`const Component = ${source}`, {
    compilerOptions: { jsx: ts.JsxEmit.React, target: ts.ScriptTarget.ES2020 },
  })
  return new Function('React', `${outputText}; return Component`)(React) as React.ComponentType<Record<string, unknown>>
}

for (const jsx of [false, true]) {
  for (const pretty of [false, true]) {
    describe(`rendering (jsx: ${jsx}, pretty: ${pretty})`, () => {
      it('renders multiline attributes and whitespace around equals', () => {
        const Component = compile('<div\n class = "{className}"\n\tdata-id = \'{id}\'>Hello, {name}!</div>', jsx, pretty)
        expect(renderToStaticMarkup(React.createElement(Component, { className: 'greeting', id: '42', name: 'Ada' })))
          .toBe('<div class="greeting" data-id="42">Hello, Ada!</div>')
      })

      it('renders void elements without children', () => {
        const Component = compile('<input key="input" value="{value}" readOnly="{readOnly}"/><br key="br"/>', jsx, pretty)
        expect(renderToStaticMarkup(React.createElement(Component, { value: 'hello', readOnly: true })))
          .toMatch(/^<input read[oO]nly="" value="hello"\/><br\/>$/)
      })

      it('supports dollar and underscore placeholders in tags and text', () => {
        const Component = compile('<{_tag}>{_name} {$name}</{_tag}>', jsx, pretty)
        expect(renderToStaticMarkup(React.createElement(Component, { _tag: 'strong', _name: 'Ada', $name: 'Lovelace' })))
          .toBe('<strong>Ada Lovelace</strong>')
      })

      it('renders a supplied React component in a template slot', () => {
        const Component = compile('<section><{Heading}>{title}</{Heading}></section>', jsx, pretty)
        const Heading = (props: { children?: React.ReactNode }) => React.createElement('h2', null, props.children)
        expect(renderToStaticMarkup(React.createElement(Component, { Heading, title: 'Welcome' })))
          .toBe('<section><h2>Welcome</h2></section>')
      })

      it('treats placeholder keys as property names and concatenates numbers', () => {
        const Component = compile('<div data-count="{a}{b}">{user-name} {a}{b}</div>', jsx, pretty)
        expect(renderToStaticMarkup(React.createElement(Component, { 'user-name': 'Ada', a: 1, b: 2 })))
          .toBe('<div data-count="12">Ada 12</div>')
      })

      it('preserves React element placeholders next to literal text', () => {
        const Component = compile('<div>Hello {child}!</div>', jsx, pretty)
        const child = React.createElement('strong', { key: 'child' }, 'Ada')
        expect(renderToStaticMarkup(React.createElement(Component, { child })))
          .toBe('<div>Hello <strong>Ada</strong>!</div>')
      })

      it('renders placeholder keys containing quotes without generating invalid code', () => {
        const Component = compile('<div>{say"hello}</div>', jsx, pretty)
        expect(renderToStaticMarkup(React.createElement(Component, { 'say"hello': 'safe' })))
          .toBe('<div>safe</div>')
      })

      it('keeps unmatched braces and internal line breaks literal', () => {
        const Component = compile('<div>first\nsecond {</div>', jsx, pretty)
        expect(renderToStaticMarkup(React.createElement(Component)))
          .toBe(!jsx && pretty ? '<div>first second {</div>' : '<div>first\nsecond {</div>')
      })

      it('preserves quotes, backslashes, ampersands and greater-than characters', () => {
        const Component = compile(`<div title='say "hello" \\ &amp;'>A > B &amp;</div>`, jsx, pretty)
        expect(renderToStaticMarkup(React.createElement(Component)))
          .toBe(jsx
            ? '<div title="say &quot;hello&quot; \\ &amp;amp;">A &gt; B &amp;amp;</div>'
            : '<div title="say &quot;hello&quot; \\ &amp;">A &gt; B &amp;</div>')
      })
    })
  }
}
