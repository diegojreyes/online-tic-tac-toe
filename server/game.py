from typing import Dict
from fastapi import WebSocket

class Game:
    def __init__(self):
        self.circle = True
        self.board = ["" for _ in range(9)]
        self.players: Dict[WebSocket, str] = {}     

    def add_player(self, ws: WebSocket) -> str | None:
        if len(self.players) == 0:
            self.players[ws] = "O"
            return "O"
        elif len(self.players) == 1:
            self.players[ws] = "X"
            return "X"
        return None

    def remove_player(self, ws: WebSocket):
        if ws in self.players:
            del self.players[ws]

    def is_ready(self):
        return len(self.players) == 2

    def check_winner(self):
        wins = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],
            [0, 3, 6], [1, 4, 7], [2, 5, 8], 
            [0, 4, 8], [2, 4, 6]             
        ]
        for w in wins:
            if self.board[w[0]] and self.board[w[0]] == self.board[w[1]] == self.board[w[2]]:
                return self.board[w[0]]
        if "" not in self.board:
            return "Draw"
        return None

    def update_board(self, i: int, player_ws: WebSocket):
        current_turn_symbol = "O" if self.circle else "X"
        if self.players.get(player_ws) != current_turn_symbol:
            return False

        if self.board[i] == "":
            self.board[i] = current_turn_symbol
            self.circle = not self.circle
            return True
        return False
    
    def reset_board(self):
        self.board = ["" for _ in range(9)]

