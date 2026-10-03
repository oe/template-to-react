import { describe, it, expect } from 'vitest'
import { compileTemplateToReact } from '../src'
import { buildJsxFrom } from '../src/build-jsx'

describe('simple jsx', () => { 
  it('simple text jsx', () => {
    const template = `Hello world!`
    const result = compileTemplateToReact(template, { jsx: true })
    const expected = `function TemplateComponent(props){const frg=React.Fragment;const jsx=React.createElement;const jsxs=React.createElement;return jsxs(frg,null,...["Hello world!"])}`
    expect(result).toBe(expected)
  })

  it('simple text jsx with pretty', () => {
    const template = `Hello world!`
    const result = compileTemplateToReact(template, { jsx: true, pretty: true })
    const expected = `function TemplateComponent(props) {
  const frg = React.Fragment;
  const jsx = React.createElement;
  const jsxs = React.createElement;
  return jsxs(frg, null, ...[
    "Hello world!"
  ])
}`
    expect(result).toBe(expected)
  })

  it('simple html jsx', () => {
    const template = `<div>Hello world!</div>`
    const result = compileTemplateToReact(template, { jsx: true })
    const expected = `function TemplateComponent(props){const frg=React.Fragment;const jsx=React.createElement;const jsxs=React.createElement;return jsxs("div",null,...["Hello world!"])}`
    expect(result).toBe(expected)
  })

  it('simple html jsx with attrs', () => {
    const template = `<div class='abc' title="hello" data-id="xxx">Hello world!<br/></div>`
    const result = compileTemplateToReact(template, { jsx: true })
    const expected = `function TemplateComponent(props){const frg=React.Fragment;const jsx=React.createElement;const jsxs=React.createElement;return jsxs("div",{className:"abc",title:"hello","data-id":"xxx"},...["Hello world!",jsx("br",null)])}`
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
  }, ...[
    "Hello world!"
  ])
}`
    expect(result).toBe(expected)
  })

  it('simple html jsx with attrs', () => {
    const template = `<div>Hello world!<span>abc</span></div>`
    const result = compileTemplateToReact(template, { jsx: true })
    const expected = `function TemplateComponent(props){const frg=React.Fragment;const jsx=React.createElement;const jsxs=React.createElement;return jsxs("div",null,...["Hello world!",jsx("span",null,...["abc"])])}`
    expect(result).toBe(expected)
  })
})


describe('jsx edge case', () => {
  it('comment', () => {
    expect(buildJsxFrom({type: 'comment', comment: 'xxx'}, false, false, 0,2).code).toBe('')
    // @ts-ignore
    expect(buildJsxFrom({type: 'xx', comment: 'xxx'}, false, false, 0,2).code).toBe('')
    expect(buildJsxFrom({type: 'text', value: 'hello'}, false, false, 0,2).code).toBe('jsxs(frg,null,"hello")')
    expect(buildJsxFrom({type: 'text', value: 'hello'}, false, true, 0,2).code).toBe('jsxs(frg, null, "hello")')
  })
})
