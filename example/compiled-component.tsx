import React from 'react';
import { compileTemplateToReact } from '../src';

// make React available globally, make sure compiled component can access it
window.React = React;

const template = `<div>ww<span>Hello, {user}! You Got 
dsdsd
<{p1} class="{3className}" data-id="{id} haha" data-tag="</{p3}>">{score}</{p1}>!
<{w31} class="{className}" data-id="{id}">{score} good</{w31}>!
<span class="hilight" data-id="{pp} sss">Great!</span></span></div>`;

const compiledCode = compileTemplateToReact(template, { jsx: true, pretty: true })

console.log(compiledCode)

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

// @ts-ignore
window.aaa = Another

export function Another(props: any) {
  const C$c0 = props.p1;
  const C$c1 = props.w31;
  return (<div>
    ww
    <span>
      Hello, {props.user}! You Got
      dsdsd
      <C$c0
        className={props["3className"]}
        data-id={props.id + " haha"}
        data-tag={"</" + props.p3 + ">"}
      >
        {props.score}
      </C$c0>
      !
      <C$c1
        className={props.className}
        data-id={props.id}
      >
        {props.score} good
      </C$c1>
      !
      <span
        className="hilight"
        data-id={props.pp + " sss"}
      >
        Great!
      </span>
    </span>
  </div>)
}