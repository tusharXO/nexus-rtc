import express, { Request, Response } from "express";
import { WebSocketServer, WebSocket } from "ws";
import { SignalingMessage } from "./types";
import { createServer } from "http";
import * as dotenv from 'dotenv';
import cors from "cors";

dotenv.config();

const PORT = process.env.PORT || 8080;

const app = express();
app.use(cors())
app.use(express.json())

app.get('/health', (_req: Request, res: Response) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() })
})

const server = createServer(app);

const wss = new WebSocketServer({ server });

const rooms = new Map<string, Set<WebSocket>>();

wss.on('connection', (ws: WebSocket) => {
    let currentRoom: string | null = null;

    ws.on('message', (rawMessage: string) => {
        try {
            const mesage: SignalingMessage = JSON.parse(rawMessage)
            const { type, roomId, payload } = mesage

            switch (type) {
                case 'join': {
                    if (!roomId) return;
                    currentRoom = roomId;

                    if (!rooms.has(roomId)) {
                        rooms.set(roomId, new Set())
                    }

                    const room = rooms.get(roomId)!;

                    if (room.size >= 2) {
                        const fullMsg: SignalingMessage = { type: 'full', message: 'Room is full' };
                        ws.send(JSON.stringify(fullMsg))
                        return
                    }

                    room.add(ws);
                    console.log(`[Room ${roomId}] Peer joined. Total peers: ${room.size}`);

                    const joinedMsg: SignalingMessage = { type: 'join', roomId, peerCount: room.size };
                    ws.send(JSON.stringify(joinedMsg));

                    if (room.size === 2) {
                        broadcastToOthers(room, ws, { type: 'ready' })
                    }
                    break;
                }

                case 'offer':
                case 'answer':
                case 'ice-candidate': {
                    if (!currentRoom || !rooms.has(currentRoom)) return;
                    broadcastToOthers(rooms.get(currentRoom)!, ws, { type, payload });
                    break;
                }
            }

        } catch (error) {
            console.log('failed to proces mesage', error)
        }
    })

    ws.on('close', () => {
        if (currentRoom && rooms.has(currentRoom)) {
            const room = rooms.get(currentRoom)!
            room.delete(ws);
            console.log(`[Room ${currentRoom}] Peer left. Remaining: ${room.size}`);

            if (room.size === 0) {
                rooms.delete(currentRoom)
            } else {
                broadcastToOthers(room, ws, { type: 'peer-disconnected' })
            }
        }
    })
})

function broadcastToOthers(room: Set<WebSocket>, senderWs: WebSocket, data: SignalingMessage): void {
    for (const client of room) {
        if (client !== senderWs && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data))
        }
    }
}

server.listen(PORT, () => {
    console.log(`🚀 NexusRTC Backend running on http://localhost:${PORT}`)
})