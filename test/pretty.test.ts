import { describe, it, expect } from 'vitest'
import { compileTemplateToReact } from '../src'

describe('pretty test', () => { 
    it('compile text', () => {
    const template = `Hello world!`
    const result = compileTemplateToReact(template, { pretty: { initialIndent: 2, indentSize: 1 }})
    expect(result).toBe(`  function TemplateComponent(props) {
   return (<>
    Hello world!
   </>)
  }`)
  })
    it('compile text indent 4', () => {
    const template = `Hello world!`
    const result = compileTemplateToReact(template, { pretty: 4})
    expect(result).toBe(`function TemplateComponent(props) {
    return (<>
        Hello world!
    </>)
}`)
  })
})