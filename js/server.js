// server.js
const WebSocket = require('ws');
const readline = require('readline');

const wss = new WebSocket.Server({ port: 17404 });
const clients = new Map();

console.log("! Server running on port 17404");

// Setup command interface
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.setPrompt('> ');
rl.prompt();

// Broadcast to all clients except those excluded
function broadcast(data, exclude = []) {
    const payload = JSON.stringify(data);
    for (const client of clients.keys()) {
        if (client.readyState === WebSocket.OPEN && !exclude.includes(client)) {
            client.send(payload);
        }
    }
}

function log(message) {
    readline.clearLine(process.stdout, 0); // Clear current input line
    readline.cursorTo(process.stdout, 0); // Move cursor to start
    console.log(message); // Print the message
    rl.prompt(true); // Re-show prompt on new line
}

// Command handler
rl.on('line', (input) => {
    const args = input.trim().split(' ');
    const command = args.shift();

    if (command === 'players') {
        console.log(`Players connected: ${clients.size}`);
        for (const [_, player] of clients.entries()) {
            console.log(` - ${player.name} | ${player.id} | ${player.mapName}`);
        }
    } else if (command === 'say') {
        const message = `[SERVER] ${args.join(' ')}`;
        broadcast({
            type: 'message',
            message,
            time: Date.now()
        });
        log(message);
    } else if (command === 'kick') {
        const targetId = args.join(' ').toLowerCase();
        let kicked = false;
        for (const [ws, player] of clients.entries()) {
            if (player.id === targetId) {
                if (ws.readyState === WebSocket.OPEN) {
                    ws.send(JSON.stringify({
                        type: "message",
                        message: "You were kicked from the server",
                        time: Date.now()
                    }));

                    setTimeout(() => {
                        ws.close();
                    }, 10);
                } else {
                    ws.close();
                }
                kicked = true;
                console.log(`! Kicked ${player.name}`);
                break;
            }
        }
        if (!kicked) console.log(`No player named "${targetId}" found.`);
    } else if (command === 'help') {
        console.log(`\nAvailable commands:
  players               List all connected players
  say <message>         Broadcast a message to all players
  kick <id>             Kick a player by ID
  help                  Show this help message
        `);
    } else {
        console.log(`Unknown command: ${command}. Type 'help' for list of commands.`);
    }

    rl.prompt();
});

wss.on('connection', (ws) => {
    ws.on('message', (raw) => {
        try {
            const data = JSON.parse(raw.toString());
            if (data.type === "chat") {
                log(`${data.name}: ${data.message}`);
            } else if (data.type === "message") {
                log(data.message);
            } else if (data.type === "player") {
                clients.set(ws, data);

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
                player.y = data.y;
                player.direction = data.direction;
                clients.set(ws, player);
            } else if (data.type === "transfer") {
                let player = clients.get(ws);
                if (!player || player.mapId === data.mapId) return;
                player.mapId = data.mapId;
                player.x = data.x;
                player.y = data.y;
                player.direction = data.direction;
                clients.set(ws, player);
            } else if (data.type === "vanity") {

            } else if (data.type === "ping") {
                return ws.send(JSON.stringify({
                    type: "pong",
                    serverTime: Date.now()
                }));
            }

            broadcast(data, [ws]);
        } catch (err) {
            console.warn("❌ Invalid message:", raw);
        }
    });

    ws.on('close', () => {
        const player = clients.get(ws);
        log(`${player.name} left the game`);
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
