import { describe, it, expect } from 'vitest'
import { compileTemplateToReact } from '../src'

describe('simple jsx', () => { 
  it('simple text jsx', () => {
    const template = `Hello world!`
    const result = compileTemplateToReact(template, { jsx: true })
    const expected = `function TemplateComponent(props){const frg=React.Fragment;const jsx=React.createElement;const jsxs=React.createElement;return jsxs(frg,null,["Hello world!"])}`
    expect(result).toBe(expected)
  })

  it('simple html jsx', () => {
    const template = `<div>Hello world!</div>`
    const result = compileTemplateToReact(template, { jsx: true })
    const expected = `function TemplateComponent(props){const frg=React.Fragment;const jsx=React.createElement;const jsxs=React.createElement;return jsxs("div",null,["Hello world!"])}`
    expect(result).toBe(expected)
  })
})
