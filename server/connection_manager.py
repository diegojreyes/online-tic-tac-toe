from game import Game
from fastapi import WebSocket

class ConnectionManager:
    def __init__(self):
        self.connections: Dict[str, Game] = {}

    async def connect(self, ws: WebSocket, room: str) -> str | None:
        await ws.accept()
        if room not in self.connections:
            self.connections[room] = Game()
            print(f"Created room {room}")
        
        game = self.connections[room]
        symbol = game.add_player(ws)
        print(f"Player {symbol} joined room {room}. Total: {len(game.players)}")
        
        if symbol is None:
            await ws.close(code=4000, reason="Room full")
            return None
            
        return symbol
        
    def disconnect(self, ws: WebSocket, room: str):
        if room in self.connections:
            self.connections[room].remove_player(ws)
            print(f"Player left room {room}. Total: {len(self.connections[room].players)}")
            if not self.connections[room].players:
                del self.connections[room]
                print(f"Room {room} deleted")

    async def broadcast(self, room: str, message: str):
        if room in self.connections:
            for ws in self.connections[room].players:
                try:
                    await ws.send_text(message)
                except:
                    pass

    def get_game(self, room: str) -> Game:
        return self.connections.get(room)

