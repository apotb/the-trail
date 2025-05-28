// server.js
const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 54000 });
const clients = new Map();

console.log("Server running at ws://localhost:54000");

wss.on('connection', (ws) => {
    function broadcast(data, exclude=[ws]) {
        const payload = JSON.stringify(data);
        for (const client of clients.keys()) {
            if (client.readyState === WebSocket.OPEN && !exclude.includes(client)) {
                client.send(payload);
            }
        }
    }

    ws.on('message', (raw) => {
        try {
            const data = JSON.parse(raw.toString());
            if (data.type === "chat") {
                console.log(`[CHAT] ${data.name}: ${data.message}`);
            } else if (data.type === "message") {
                console.log(data.message);
            } else if (data.type === "player") {
                clients.set(ws, data);

                // Send the full player list to the new client
                const otherPlayers = Array.from(clients.entries())
                    .map(([_, pdata]) => pdata)
                    .filter((pdata) => pdata.id !== data.id);
                
                for (const player of otherPlayers) {
                    ws.send(JSON.stringify({
                        type: "player",
                        ...player
                    }));
                }
            } else if (data.type === "move") {
                let player = clients.get(ws);
                player.x = data.x;
                player.y = data.y
                player.direction = data.direction;
                clients.set(ws, player);
            } else if (data.type === "vanity") {

            } else if (data.type === "ping") {
                return ws.send(JSON.stringify({
                    type: "pong",
                    serverTime: Date.now()
                }));
            }

            broadcast(data);
        } catch (err) {
            console.warn("❌ Invalid message:", raw);
        }
    });

    ws.on('close', () => {
        const player = clients.get(ws);
        console.log(`${player.name} left the game`);
        clients.delete(ws);
        broadcast({
            type: "message",
            message: `${player.name} left the game`,
            time: Date.now()
        });
        broadcast({
            type: "disconnect",
            name: player.name,
            id: player.id
        });
    });
});
