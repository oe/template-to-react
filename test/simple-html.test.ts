import { describe, it, expect } from 'vitest'
import { compileTemplateToReact } from '../src'
import { buildHtmlFrom } from '../src/build-html'

describe('simple html', () => { 
  it('compile text', () => {
    const template = `Hello world!`
    const result = compileTemplateToReact(template)
    expect(result).toBe(`function TemplateComponent(props){return <>Hello world!</>}`)
  })
  it('simple html', () => {
    const template = `<div>Hello world!</div>`
    const result = compileTemplateToReact(template)
    expect(result).toBe(`function TemplateComponent(props){return <div>Hello world!</div>}`)
  })

  it('simple selfclose html', () => {
    const template = `<br/>`
    const result = compileTemplateToReact(template)
    expect(result).toBe(`function TemplateComponent(props){return <br/>}`)
  })
  it('simple selfclose html with comment', () => {
    const template = `<br/><!-- xxx -->`
    const result = compileTemplateToReact(template)
    expect(result).toBe(`function TemplateComponent(props){return <br/>}`)
  })

  it('simple html with attr', () => {
    const template = `<div class='good' title="heel">Hello world!</div>`
    const result = compileTemplateToReact(template)
    expect(result).toBe(`function TemplateComponent(props){return <div className="good" title="heel">Hello world!</div>}`)
  })

  it('nested html', () => {
    const template = `<div><span>Hello</span> world!<br/>  </div>`
    const result = compileTemplateToReact(template)
    expect(result).toBe(`function TemplateComponent(props){return <div><span>Hello</span>world!<br/></div>}`)
  })

  it('nested html reserve space', () => {
    const template = `<div><span>Hello</span> world!<br/>  </div>`
    const result = compileTemplateToReact(template, { reserverWhitespace: true })
    expect(result).toBe(`function TemplateComponent(props){return <div><span>Hello</span> world!<br/>  </div>}`)
  })
})

describe('simple html pretty', () => { 
  it('compile text', () => {
    const template = `Hello world!`
    const result = compileTemplateToReact(template, {pretty: true})
    expect(result).toBe(`function TemplateComponent(props) {
  return (<>
    Hello world!
  </>)
}`)
  })

  it('simple html', () => {
    const template = `<div>Hello world!</div>`
    const result = compileTemplateToReact(template, { pretty: true })
    expect(result).toBe(`function TemplateComponent(props) {
  return (<div>
    Hello world!
  </div>)
}`)
  })
})

describe('other edge case', () => {
  it('buildHtmlFrom', () => {
    expect(buildHtmlFrom({type: 'comment', comment: 'xxx'}, true, 2, 2).code).toBe('')
    // @ts-ignore
    expect(buildHtmlFrom({type: 'xxx', comment: 'xxx'}, true, 2, 2).code).toBe('')
    // @ts-ignore
    expect(buildHtmlFrom({abc: 'xxx', comment: 'xxx'}, true, 2, 2).code).toBe('')
  })
})
