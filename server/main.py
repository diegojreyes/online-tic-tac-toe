from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from connection_manager import ConnectionManager
import json

app = FastAPI()
manager = ConnectionManager()

@app.websocket("/ws/{room_id}")
async def websocket_endpoint(websocket: WebSocket, room_id: str):
    symbol = await manager.connect(websocket, room_id)
    if not symbol: return

    game = manager.get_game(room_id)
    
    try:
        await websocket.send_text(json.dumps({
            "type": "init",
            "symbol": symbol
        }))

        await manager.broadcast(room_id, json.dumps({
            "type": "update",
            "board": game.board,
            "circle": game.circle,
            "winner": game.check_winner(),
            "ready": game.is_ready()
        }))
        
        while True:
            data = await websocket.receive_text()
            payload = json.loads(data)
            msg_type = payload.get("type")
            
            if msg_type == "move":
                print("hello")
                index = payload.get("index")
                if index is not None and 0 <= index < 9:
                    if game.update_board(index, websocket):
                        await manager.broadcast(room_id, json.dumps({
                            "type": "update",
                            "board": game.board,
                            "circle": game.circle,
                            "winner": game.check_winner(),
                            "ready": game.is_ready()
                        }))
            elif msg_type == "msg":
                msg = payload.get("msg")
                await manager.broadcast(room_id, json.dumps({
                    "type": "msg",
                    "msg": ": ".join(["O" if payload.get("player") == "O" else "X", msg])
                }))
            
            else:
                game.reset_board()
                await manager.broadcast(room_id, json.dumps({
                    "type": "update",
                    "board": game.board,
                    "circle": game.circle,
                    "winner": game.check_winner(),
                    "ready": game.is_ready()
                }))
                
                        
    except WebSocketDisconnect:
        manager.disconnect(websocket, room_id)
        if manager.get_game(room_id):
             await manager.broadcast(room_id, json.dumps({
                "type": "update",
                "board": game.board,
                "circle": game.circle,
                "winner": None,
                "ready": False
            }))


        
        
