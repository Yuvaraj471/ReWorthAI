from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, Query
from app.websocket.manager import manager
from app.core.security import decode_token

router = APIRouter(prefix="/ws", tags=["WebSockets"])

@router.websocket("/connect")
async def websocket_endpoint(
    websocket: WebSocket,
    token: str = Query(...)
):
    """
    WebSocket connection endpoint.
    Client must provide JWT access token as query param: ?token=<access_token>
    """
    # Validate token
    payload = decode_token(token)
    user_id_str = payload.get("sub")
    token_type = payload.get("type")

    if not user_id_str or token_type != "access":
        await websocket.accept()
        await websocket.close(code=4001)
        return

    await websocket.accept()
    user_id = int(user_id_str)
    await manager.connect(websocket, user_id)

    try:
        # Keep connection alive; listen for client pings
        while True:
            data = await websocket.receive_text()
            # Echo heartbeats back
            if data == "ping":
                await websocket.send_text("pong")
    except WebSocketDisconnect:
        manager.disconnect(websocket, user_id)
