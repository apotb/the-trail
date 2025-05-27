// server.js
const WebSocket = require('ws');

// Create a WebSocket server on port 54000
const wss = new WebSocket.Server({ port: 54000 });
const clients = new Set();

console.log("✅ Server running at ws://localhost:54000");

// Handle new connections
wss.on('connection', (ws) => {
    console.log("🔌 New client connected.");
    clients.add(ws);

    // Handle messages from clients
    ws.on('message', (raw) => {
        try {
            const data = JSON.parse(raw.toString());
            if (data.type === "chat" && data.name && data.text) {
                console.log(`[CHAT] ${data.name}: ${data.text}`);

                const payload = JSON.stringify({
                    type: "chat",
                    name: data.name,
                    text: data.text
                });

                for (const client of clients) {
                    if (client.readyState === WebSocket.OPEN) {
                        client.send(payload);
                    }
                }
            } else if (["player", "move", "vanity"].includes(data.type)) {
                const payload = JSON.stringify(data); // relay as-is to all clients

                for (const client of clients) {
                    if (client.readyState === WebSocket.OPEN && client !== ws) {
                        client.send(payload);
                    }
                }
            }
        } catch (err) {
            console.warn("❌ Invalid message:", raw);
        }
    });

    // Handle disconnection
    ws.on('close', () => {
        console.log("❎ Client disconnected.");
        clients.delete(ws);
    });
});
