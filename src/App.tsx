import { useState } from 'react'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-4">Mas Poll</h1>
        <p className="text-lg mb-6">Welcome to Mas Poll application!</p>
        
        <div className="bg-card p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">Getting Started</h2>
          <p className="mb-4">Your React + TypeScript + Vite + Tailwind CSS app is ready!</p>
          
          <button
            onClick={() => setCount((count) => count + 1)}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:opacity-90 transition-opacity"
          >
            Count is {count}
          </button>
        </div>
      </div>
    </div>
  )
}

export default App

