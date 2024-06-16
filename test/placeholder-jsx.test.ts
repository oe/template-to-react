import { describe, it, expect } from 'vitest'
import { compileTemplateToReact } from '../src'

describe('placeholder jsx', () => { 
  it('html jsx', () => {
    const template = `<{p1}>Hello world!</p1>`
    const result = compileTemplateToReact(template, { jsx: true })
    const expected = `function TemplateComponent(props){const frg=React.Fragment;const jsx=React.createElement;const jsxs=React.createElement;return jsxs(props.p1,null,["Hello world!"])}`
    expect(result).toBe(expected)
  })
  it('html jsx', () => {
    const template = `<{p1}>Hello world!</p1><span>123</span>`
    const result = compileTemplateToReact(template, { jsx: true })
    const expected = `function TemplateComponent(props){const frg=React.Fragment;const jsx=React.createElement;const jsxs=React.createElement;return jsxs(frg,null,[jsx(props.p1,null,["Hello world!"]),jsx("span",null,["123"])])}`
    expect(result).toBe(expected)
  })

  it('simple html jsx with attrs', () => {
    const template = `<div class='abc' title="hello" data-id="xxx">Hello world!<br/></div>`
    const result = compileTemplateToReact(template, { jsx: true })
    const expected = `function TemplateComponent(props){const frg=React.Fragment;const jsx=React.createElement;const jsxs=React.createElement;return jsxs("div",{className:"abc",title:"hello","data-id":"xxx"},["Hello world!",jsx("br",null,[])])}`
    expect(result).toBe(expected)
  })

  it('simple html jsx with attrs and pretty', () => {
    const template = `<div class='abc' title="hello" data-id="xxx">Hello world!</div>`
    const result = compileTemplateToReact(template, { jsx: true, pretty: true })
    const expected = `function TemplateComponent(props) {
  const frg = React.Fragment;
  const jsx = React.createElement;
  const jsxs = React.createElement;
  return jsxs("div", {
    className: "abc",
    title: "hello",
    "data-id": "xxx"
  }, [
    "Hello world!"
  ])
}`
    expect(result).toBe(expected)
  })


  it('simple html jsx with attrs', () => {
    const template = `<div>Hello world!<span>abc</span></div>`
    const result = compileTemplateToReact(template, { jsx: true })
    const expected = `function TemplateComponent(props){const frg=React.Fragment;const jsx=React.createElement;const jsxs=React.createElement;return jsxs("div",null,["Hello world!",jsx("span",null,["abc"])])}`
    expect(result).toBe(expected)
  })
})
