from fastapi import WebSocket
from typing import Dict, List
import json
import logging

logger = logging.getLogger(__name__)


class ConnectionManager:
    """Manages active WebSocket connections for RFQ updates."""

    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, rfq_id: str):
        """Accepts a connection and tracks it by RFQ ID."""
        await websocket.accept()
        if rfq_id not in self.active_connections:
            self.active_connections[rfq_id] = []
        self.active_connections[rfq_id].append(websocket)
        logger.info(f"[WS] Client connected to RFQ {rfq_id}. Total: {len(self.active_connections[rfq_id])}")

    def disconnect(self, websocket: WebSocket, rfq_id: str):
        """Removes a connection from the tracking list."""
        if rfq_id in self.active_connections:
            if websocket in self.active_connections[rfq_id]:
                self.active_connections[rfq_id].remove(websocket)
            if not self.active_connections[rfq_id]:
                del self.active_connections[rfq_id]
            logger.info(f"[WS] Client disconnected from RFQ {rfq_id}.")

    async def broadcast_to_rfq(self, rfq_id: str, message: dict):
        """Broadcasts a message to all connections for a specific RFQ."""
        if rfq_id not in self.active_connections:
            return

        # Ensure the message is JSON-serializable
        try:
            safe_message = json.loads(json.dumps(message, default=str))
        except Exception as e:
            logger.error(f"[WS] Failed to serialize message for {rfq_id}: {e}")
            return

        dead_connections = []
        for connection in self.active_connections[rfq_id]:
            try:
                await connection.send_json(safe_message)
            except Exception as e:
                logger.warning(f"[WS] Failed to send to client on {rfq_id}: {e}")
                dead_connections.append(connection)

        for dead in dead_connections:
            self.disconnect(dead, rfq_id)

        if self.active_connections.get(rfq_id):
            logger.info(f"[WS] Broadcast to {len(self.active_connections[rfq_id])} client(s) on {rfq_id}")


manager = ConnectionManager()
