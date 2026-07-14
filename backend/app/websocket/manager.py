from typing import Dict, List
from fastapi import WebSocket

class ConnectionManager:
    def __init__(self):
        # Maps user_id -> List of active WebSockets
        self.active_connections: Dict[int, List[WebSocket]] = {}
        # Global connection list
        self.global_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket, user_id: int):
        # Add to user specific mapping
        if user_id not in self.active_connections:
            self.active_connections[user_id] = []
        self.active_connections[user_id].append(websocket)
        
        # Add to global list
        self.global_connections.append(websocket)

    def disconnect(self, websocket: WebSocket, user_id: int):
        if user_id in self.active_connections:
            if websocket in self.active_connections[user_id]:
                self.active_connections[user_id].remove(websocket)
            if not self.active_connections[user_id]:
                del self.active_connections[user_id]
                
        if websocket in self.global_connections:
            self.global_connections.remove(websocket)

    def broadcast_to_user(self, user_id: int, message: dict):
        import asyncio
        if user_id in self.active_connections:
            for connection in self.active_connections[user_id]:
                try:
                    # Synchronous-like trigger or async tasks scheduler
                    asyncio.create_task(connection.send_json(message))
                except Exception as e:
                    print(f"Error sending message to user {user_id}: {str(e)}")

    def broadcast_global(self, message: dict):
        import asyncio
        for connection in self.global_connections:
            try:
                asyncio.create_task(connection.send_json(message))
            except Exception as e:
                print(f"Error broadcasting global message: {str(e)}")

manager = ConnectionManager()
