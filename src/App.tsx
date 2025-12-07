import { useState, useEffect, useRef } from 'react'
import './App.css'

function App() {
  const [circle, setCircle] = useState(true)
  const [tiles, setTiles] = useState(Array.from({length : 9}, () => ""))
  const [roomName, setRoomName] = useState("")
  const [joined, setJoined] = useState(false)
  const [winner, setWinner] = useState<string | null>(null)
  const [mySymbol, setMySymbol] = useState<string | null>(null)
  const [isReady, setIsReady] = useState(false)
  const [messages, setMessages] = useState<string[]>([])
  const [message, setMessage] = useState<string>("")
  const ws = useRef<WebSocket | null>(null)

  const joinRoom = () => {
    if (!roomName) return
    const trimmedRoom = roomName.trim()
    ws.current = new WebSocket(`ws://localhost:8000/ws/${trimmedRoom}`)
    
    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data)
      
      if (data.type === "init") {
        setMySymbol(data.symbol)
      } else if (data.type === "update") {
        setTiles(data.board)
        setCircle(data.circle)
        setWinner(data.winner)
        setIsReady(data.ready)
      } else if (data.type === "msg"){
        console.log("message received")
        setMessages((prev) => [...prev, data.msg])
      }
    }
    
    ws.current.onclose = (event) => {
        if (event.code === 4000) {
            alert("Room is full!")
            setJoined(false)
            setRoomName("")
        }
    }
    
    setJoined(true)
  }

  useEffect(() => {
    return () => {
      ws.current?.close()
    }
  }, [])

  if (!joined) {
    return (
      <div className='h-screen flex flex-col items-center justify-center bg-gray-800 gap-4'>
        <h1 className='text-white text-4xl font-bold'>Tic Tac Toe</h1>
        <input 
          type="text" 
          placeholder="Enter Room Name" 
          className="p-2 rounded text-black text-center"
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
        />
        <button 
          onClick={joinRoom}
          className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
        >
          Join Game
        </button>
      </div>
    )
  }

  if (!isReady) {
    return (
      <div className='h-screen flex flex-col items-center justify-center bg-gray-800 gap-4'>
        <h1 className='text-white text-2xl'>Waiting for opponent...</h1>
        <p className='text-gray-400'>You are playing as: <span className='font-bold text-white'>{mySymbol}</span></p>
        <p className='text-gray-400'>Share room name: <span className='font-bold text-white'>{roomName}</span></p>
      </div>
    )
  }

  const isMyTurn = (circle && mySymbol === "O") || (!circle && mySymbol === "X")

  return (
    <div className='flex flex-row w-screen h-screen'>
      <div className='flex-1 flex flex-col justify-center items-center bg-gray-800'>
        <div className='mb-4 text-center'>
          <h1 className='text-white text-2xl mb-2'>
            {winner ? (winner === "Draw" ? "It's a Draw!" : `Winner: ${winner}`) : 
            (isMyTurn ? "Your Turn" : "Opponent's Turn")}
          </h1>
          <p className='text-gray-400'>You are: <span className='font-bold text-white'>{mySymbol}</span></p>
        </div>
        
        <div className='grid grid-cols-3 gap-2 w-full max-w-md p-4'>
          {
            tiles.map( (t, i) =>       
              <button 
              key={i}
              disabled={!!winner || t !== "" || !isMyTurn}
              className={`h-48 text-4xl font-bold text-gray-800 rounded transition-colors ${
                t === "" && !winner && isMyTurn ? 'bg-pink-300 hover:bg-pink-400 cursor-pointer' : 
                t === "" ? 'bg-pink-200 cursor-not-allowed opacity-70' : 'bg-pink-200'
              }`}
              onClick={() => {
                if (t !== "" || winner || !isMyTurn) return
                ws.current?.send(JSON.stringify({ type: "move", index: i }))
              }}>{t}
              </button>
              )
            
          }
          {winner && (
          <div className='col-span-3 flex justify-center w-full'>          
            <button 
            onClick={() => ws.current?.send(JSON.stringify({type : "reset"}))}
            className="mt-4 bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600 "
            >
            Play Again
            </button>
        </div>
        )}
        </div>
      </div>
      
      <div className='w-1/4 flex flex-col bg-gray-900 border-l border-gray-700 shadow-xl'>
        
        <div className="p-4 border-b border-gray-700 bg-gray-800 shadow-sm">
          <h2 className="font-bold text-white text-lg tracking-wide flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            Live Chat
          </h2>
        </div>

        <div className='flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar'>
          {messages.length === 0 && (
            <p className="text-gray-500 text-center text-sm mt-10 italic">No messages yet...</p>
          )}
          {
            messages.map((m, i) => (
              <div key={i} className='bg-gray-800 text-gray-200 p-3 rounded-lg text-sm shadow-sm border border-gray-700 break-words'>
                {m}
              </div>
            ))
          }
        </div>

        <div className='p-4 bg-gray-900 border-t border-gray-700'>
          <input 
            type="text" 
            value={message} 
            onChange={(e) => setMessage(e.target.value)}
            placeholder='Type a message...'
            className='w-full bg-gray-800 text-white border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500 transition-all'
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                if (!message.trim()) return               
                ws.current?.send(JSON.stringify({
                  type: "msg",
                  msg: message, 
                  player: mySymbol 
                }))
                setMessage("")
              }
            }} 
           />
           <p className="text-xs text-gray-500 mt-2 text-right">Press Enter to send</p>
        </div>
      </div>
        
  </div>
  )
}

export default App