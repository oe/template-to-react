import React from 'react';
import { compileTemplateToReact } from '../src';

// make React available globally, make sure compiled component can access it
window.React = React;

const template = `<div>ww<span>Hello, {user}! You Got 
dsdsd
<{p1} class="{3className}" data-id="{id} haha" data-tag="</{p3}>">{score}</{p1}>!
<{w31} class="{className}" data-id="{id}">{score} good</{w31}>!
<span class="hilight" data-id="{pp} sss">Great!</span></span></div>`;

const compiledCode = compileTemplateToReact(template, { jsx: true })

const evFn = eval(`(function fn() { console.log('xxx') })`)
console.log('evFn:', evFn)

const TemplateComponent = eval(`(${compiledCode})`);

console.log('TemplateComponent:', TemplateComponent)

function C1(props: any) {
  const [count, setCount] = React.useState(0)
  return <div className="card">
    <button onClick={() => setCount(prev => prev + 1)}>
      count is {count}
    </button>
    <p>
      Edit <code>src/App.tsx</code> and save to test HMR
      {props.children}
    </p>
  </div>

}

export function CompiledComponent() {
  return <TemplateComponent user="John" score={100} id="123" className="test" p1={C1} p3="p3" w31="div" pp="pp" />
}
