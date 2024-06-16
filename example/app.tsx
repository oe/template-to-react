import { useState } from 'react'
import { CompiledComponent, Another } from './compiled-component'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <CompiledComponent />
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
      <Another user="Saiya" score={100} id="123" className="test" p1={'div'} p3="p3" w31="div" pp="pp" />
    </>
  )
}

export default App
