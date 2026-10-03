import { describe, expect, it, vi } from 'vitest'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import ts from 'typescript'
import { compileTemplateToReact } from '../src'

function component(template: string, jsx: boolean) {
  const code = compileTemplateToReact(template, { jsx })
  const { outputText } = ts.transpileModule(`const Component = ${code}`, {
    compilerOptions: { jsx: ts.JsxEmit.React, target: ts.ScriptTarget.ES2020 },
  })
  return new Function('React', `${outputText}; return Component`)(React) as React.ComponentType
}

describe('legacy compatibility', () => {
  it('keeps JSX entity decoding for text and quoted attributes', () => {
    const Component = component('<div title="&quot;A&amp;B&quot;">&lt; &amp; &#123; &#x1F600;</div>', false)
    expect(renderToStaticMarkup(React.createElement(Component)))
      .toBe('<div title="&quot;A&amp;B&quot;">&lt; &amp; { 😀</div>')
  })

  it('keeps JavaScript mode entity spelling unchanged', () => {
    const Component = component('<div title="&amp;">&amp;</div>', true)
    expect(renderToStaticMarkup(React.createElement(Component)))
      .toBe('<div title="&amp;amp;">&amp;amp;</div>')
  })

  it('keeps valid Unicode component names', () => {
    expect(compileTemplateToReact('<div/>', { componentName: 'Greeting_日本' }))
      .toContain('function Greeting_日本(props)')
  })

  it('keeps legacy parsing of adjacent quoted attributes', () => {
    expect(compileTemplateToReact('<div class="a"title="b"/>'))
      .toContain('className="a" title="b"')
  })

  it.each(['<br/>', '<div><br/></div>'])('keeps the three-argument custom factory contract for %s', template => {
    const source = compileTemplateToReact(template, {
      jsx: { fragment: 'Factory', jsx: 'Factory', jsxs: 'Factory' },
    })
    type Result = { count: number; children: Result[] }
    const Factory = (...args: unknown[]): Result => ({ count: args.length, children: args[2] as Result[] })
    const Component = new Function('Factory', `return (${source})`)(Factory) as () => Result
    const result = Component()
    expect(result.count).toBe(3)
    if (template.startsWith('<div>')) {
      expect(result.children[0].count).toBe(3)
      expect(result.children[0].children).toEqual([])
    } else {
      expect(result.children).toEqual([])
    }
  })

  it('passes static React children as separate arguments without list-key warnings', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    try {
      const Component = component('<div><span>A</span><span>B</span></div>', true)
      expect(renderToStaticMarkup(React.createElement(Component)))
        .toBe('<div><span>A</span><span>B</span></div>')
      expect(error).not.toHaveBeenCalled()
    } finally {
      error.mockRestore()
    }
  })
})
