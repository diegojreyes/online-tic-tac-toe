import { useState } from 'react'
import './App.css'





function App() {
  const [circle,setCircle] = useState(true)
  const [tiles, setTiles] = useState(Array.from({length : 9}, () => ""))
  return (
    <div className='h-screen flex items-center justify-center bg-gray-800'>
      <div className='grid grid-cols-3 gap-2 w-full max-w-md p-4'>
        {
          tiles.map( (t, i) =>       
            <button 
             key={i}
             className='bg-pink-300 h-48 text-4xl font-bold text-gray-800 rounded hover:bg-pink-400 transition-colors'
             onClick={() => {
              if (tiles.every((t) => t)){
                alert("GG")
                setTiles(Array.from({length : 9}, () => ""))
              }
              if (t !== "") return              
              const newTiles = [...tiles]
              newTiles[i] = circle ? "O" : "X"
              setCircle(!circle)
              setTiles(newTiles)
             }}>{t}
            </button>
            )
          
        }
      </div>
    </div>
  )
}

export default App
