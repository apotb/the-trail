// server.js
const WebSocket = require('ws');

// Create a WebSocket server on port 54000
const wss = new WebSocket.Server({ port: 54000 });
const clients = new Map();

console.log("✅ Server running at ws://localhost:54000");

// Handle new connections
wss.on('connection', (ws) => {
    console.log("🔌 New client connected.");

    function broadcast(data) {
        const payload = JSON.stringify(data);
        for (const client of clients.keys()) {
            if (client.readyState === WebSocket.OPEN && client !== ws) {
                client.send(payload);
            }
        }
    }

    ws.on('message', (raw) => {
        try {
            const data = JSON.parse(raw.toString());
            if (data.type === "chat" && data.name && data.text) {
                console.log(`[CHAT] ${data.name}: ${data.text}`);
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

            }

            broadcast(data);
        } catch (err) {
            console.warn("❌ Invalid message:", raw);
        }
    });

    // Handle disconnection
    ws.on('close', () => {
        console.log("❎ Client disconnected.");
        const player = clients.get(ws);
        clients.delete(ws);
        broadcast({
            type: "disconnect",
            id: player.id
        });
    });
});
