import { describe, it, expect } from 'vitest'
import { FRG_NAME, getIndent,
  getIndentContent, isValidVariableName, isFragName,
  standardizeProp, convertTextToExpression, hasRootNode } from '../src/common'

describe('common utils', () => { 
  it('frag name', () => {
    expect(FRG_NAME.length > 8).toBe(true)
  })

  it('isFragName', () => {
    expect(isFragName('Ggg')).toBe(false)
    expect(isFragName(FRG_NAME)).toBe(true)
  })

  it('getIndent', () => {
    expect(getIndent(0)).toBe('')
    expect(getIndent(1)).toBe(' ')
    expect(getIndent(8)).toBe('        ')
  })

  it('getIndentContent', () => {
    expect(getIndentContent(false, 0, '')).toBe('')
    expect(getIndentContent(false, 2, 'xxx')).toBe('xxx')
    expect(getIndentContent(true, 2, 'xxx')).toBe('  xxx')
    expect(getIndentContent(true, 0, 'xxx')).toBe('xxx')
  })

  it('isValidVariableName', () => {
    expect(isValidVariableName('isAb')).toBe(true)
    expect(isValidVariableName('isAb$')).toBe(true)
    expect(isValidVariableName('9isAb$')).toBe(false)
    expect(isValidVariableName('')).toBe(false)
    expect(isValidVariableName('w')).toBe(true)
    expect(isValidVariableName('$')).toBe(true)
    expect(isValidVariableName('-isAb$')).toBe(false)
  })

  it('standardizeProp', () => {
    expect(standardizeProp('w3s')).toBe('props.w3s')
    expect(standardizeProp('$w3s')).toBe('props.$w3s')
    expect(standardizeProp('-$w3s')).toBe('props["-$w3s"]')
    expect(standardizeProp('- ')).toBe('props["- "]')
    expect(standardizeProp('9')).toBe('props["9"]')
  })

  it('convertTextToExpression', () => {
    expect(convertTextToExpression('www')).toBe('www')
    expect(convertTextToExpression('www', { wrapStr: true })).toBe('"www"')
    expect(convertTextToExpression('{www}')).toBe('www')
    expect(convertTextToExpression('{www}', { prefixProp: true })).toBe('props.www')
    expect(convertTextToExpression('{www}', { prefixProp: true, wrapExp: true })).toBe('{props.www}')
    expect(convertTextToExpression('{www}ww', { prefixProp: true, wrapExp: true })).toBe('{props.www+"ww"}')
    expect(convertTextToExpression('{www}ww', { prefixProp: true, wrapExp: true, pretty: true })).toBe('{props.www + "ww"}')
  })

  it('hasRootNode', () => {
    expect(hasRootNode([])).toBe(false)
    expect(hasRootNode([{type: 'tag', name: {type: 'tag', name: 'div'}, attributes: [], children: []}])).toBe(true)
    expect(hasRootNode([{type: 'selfClosingTag', name: {type: 'tag', name: 'br'}, attributes: []}])).toBe(true)
    expect(hasRootNode([{type: 'text', value: 'xxx'}])).toBe(false)
    expect(hasRootNode([{type: 'text', value: 'xxx'},{type: 'selfClosingTag', name: {type: 'tag', name: 'br'}, attributes: []}])).toBe(false)
  })
})
