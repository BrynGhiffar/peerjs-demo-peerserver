import express, { Express, Request, Response, NextFunction, json } from 'express';
import dotenv from 'dotenv';
import { z } from "zod";
import { ExpressPeerServer, MessageType } from 'peer';
import cors from "cors";

dotenv.config();

const app: Express = express();
const port = 5000;

app.use(json());
app.use(cors());

type RoomId = string;
type PeerId = string;

const rooms: Map<RoomId, PeerId[]> = new Map();

const CreateRoomRequest = z.object({
    "peerId": z.string()
});

const JoinRoomRequest = z.object({ 
    "peerId": z.string()
});

const LeaveRoomRequest = z.object({
    "peerId": z.string()
});

const removeMember = (peerId: string) => {
    for (const [ roomId, members ] of rooms) {
        if (members.includes(peerId)) {
            const newMembers = members.filter(m => m !== peerId);
            if (newMembers.length > 0) {
                rooms.set(roomId, newMembers);
                return;
            } else {
                rooms.delete(roomId);
                return;
            }
        }
    }
};

app.get("/members/:roomId", (req: Request, res: Response) => {
    const roomId = req.params["roomId"];
    const members = rooms.get(roomId) ?? [];
    console.log("Rooms");
    console.log(rooms);
    res.json(members);
});

app.post("/join-room/:roomId", (req: Request, res: Response) => {
    // A user should only be able to join one room at a time.
    const roomId = req.params["roomId"];
    const body = JoinRoomRequest.parse(req.body);
    const { peerId } = body;
    removeMember(peerId);
    const members = rooms.get(roomId) ?? [];
    if (!members.includes(peerId)) {
        members.push(peerId);
    }
    rooms.set(roomId, members);
    return res.json(members);
});

app.post("/leave-room/:roomId", (req: Request, res: Response) => {
    const roomId = req.params["roomId"];
    const body = LeaveRoomRequest.parse(req.body);
    const { peerId } = body;
    const members = rooms.get(roomId);
    if (!members) {
        return res.json([]);
    };
    const newMembers = members.filter(m => m !== peerId);
    if (newMembers.length === 0) {
        rooms.delete(roomId);
        return res.json([]);
    } else {
        rooms.set(roomId, newMembers);
        return res.json(newMembers);
    }
});

app.get('/', (req: Request, res: Response, next: NextFunction) => {
    res.send("Hello World, my name is Bryn");
    next();
});

const server = app.listen(port, () => {
    console.log(`[server]: Server is running at https://localhost:${port}`);
});

const peerServer = ExpressPeerServer(server, {
    path: "/app",
    key: "ps",
    allow_discovery: true,
});

app.use("/peerjs", peerServer);

peerServer.on('connection', (client) => {
    console.log(`Client ${client.getId()} connected`);
    console.log("Current rooms");
    console.log(rooms);
});

peerServer.on("disconnect", (client) => {
    console.log(`Client ${client.getId()} disconnected`);
    // If a client disconnects then remove from a room.
    const peerId = client.getId();
    removeMember(peerId);
    console.log("Current rooms");
    console.log(rooms);
});