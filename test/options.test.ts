import { describe, expect, it } from 'vitest'
import { compileTemplateToReact } from '../src'

describe('compiler options', () => {
  it.each(['bad-name', 'return', 'class', '1Component', 'A;throw new Error()'])('rejects invalid component name %s', componentName => {
    expect(() => compileTemplateToReact('<div/>', { componentName })).toThrow('componentName')
  })

  it.each([-1, 1.5, NaN, Infinity])('rejects invalid indentation %s', pretty => {
    expect(() => compileTemplateToReact('<div/>', { pretty })).toThrow('Indentation')
  })

  it('rejects invalid initial indentation', () => {
    expect(() => compileTemplateToReact('<div/>', { pretty: { initialIndent: -1, indentSize: 2 } })).toThrow('Indentation')
  })
})
