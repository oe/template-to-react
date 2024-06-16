import { describe, it, expect } from 'vitest'
import { compileTemplateToReact } from '../src'

describe('placeholder html', () => { 
  it('simple html', () => {
    const template = `<{p1}>Hello world!</{p1}>`
    const result = compileTemplateToReact(template)
    expect(result).toBe(`function TemplateComponent(props){const C$c0=props.p1;return <C$c0>Hello world!</C$c0>}`)
  })
  it('simple html attrs', () => {
    const template = `<{p1} class="12" title='what'>Hello world!</{p1}>`
    const result = compileTemplateToReact(template)
    expect(result).toBe(`function TemplateComponent(props){const C$c0=props.p1;return <C$c0 className="12" title="what">Hello world!</C$c0>}`)
  })
  it('simple html attrs pretty short', () => {
    const template = `<{p1} c="12" d='what'>Hello world!</{p1}>`
    const result = compileTemplateToReact(template, { pretty: true })
    expect(result).toBe(`function TemplateComponent(props) {
  const C$c0 = props.p1;
  return (<C$c0 c="12" d="what">
    Hello world!
  </C$c0>)
}`)
  })
  it('simple html attrs pretty', () => {
    const template = `<{p1} class="12" title='what'>Hello world!</{p1}>`
    const result = compileTemplateToReact(template, { pretty: true })
    expect(result).toBe(`function TemplateComponent(props) {
  const C$c0 = props.p1;
  return (<C$c0
    className="12"
    title="what"
  >
    Hello world!
  </C$c0>)
}`)
  })
  it('simple selfclose html', () => {
    const template = `<{p1} />`
    const result = compileTemplateToReact(template)
    expect(result).toBe(`function TemplateComponent(props){const C$c0=props.p1;return <C$c0/>}`)
  })
  it('simple selfclose html pretty', () => {
    const template = `<{p1} /><{p1} />`
    const result = compileTemplateToReact(template, { pretty: true })
    expect(result).toBe(`function TemplateComponent(props) {
  const C$c0 = props.p1;
  return (<>
    <C$c0/>
    <C$c0/>
  </>)
}`)
  })

  
})

// describe('simple html pretty', () => { 

// })