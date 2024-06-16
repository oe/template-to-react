import { describe, it, expect } from 'vitest'
import { compileTemplateToReact } from '../src'

describe('simple compile test', () => { 
  
  it('simple compile test', () => {
    const template = `Hello world!`
    const result = compileTemplateToReact(template)
    expect(result).toBe(`function TemplateComponent(props}{return <>Hello world!</>}`)
  })

})
