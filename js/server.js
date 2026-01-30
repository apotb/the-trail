// server.js
const WebSocket = require('ws');
const readline = require('readline');
const { RegExpMatcher, englishDataset, englishRecommendedTransformers } = require('obscenity');

// Setup profanity filter
const matcher = new RegExpMatcher({
    ...englishDataset.build(),
    ...englishRecommendedTransformers,
});

const wss = new WebSocket.Server({ port: 8080 });
const clients = new Map();

console.log("! Server running on port 8080");

// Lobbies and Parties
const lobbies = {
    "laeryidyean_ex": {
        name: "Laeryidyean EX",
        level: 35,
        troop: 53,
        parties: []
    }
};

const parties = [];

function findPartyById(partyId) {
    return parties.find(p => p.id === partyId);
}

// Ping interval, prevents idle timeouts
const pingInterval = setInterval(() => {
    wss.clients.forEach((ws) => {
        if (ws.isAlive === false) return ws.terminate();
        ws.isAlive = false;
        ws.ping();
    });
}, 30 * 1000); // Ping every 30 seconds

wss.on('close', () => {
    clearInterval(pingInterval);
});

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
            const partyName = player.partyId ? findPartyById(player.partyId)?.name || "Unknown" : "No Party";
            console.log(` - ${player.name} | ${player.id} | ${partyName} | ${player.mapName}`);
        }
    } else if (command === 'lobbies') {
        console.log(`Lobbies: ${Object.keys(lobbies).length}`);
        for (const [_, lobby] of Object.entries(lobbies)) {
            console.log(` - ${lobby.name} | Parties: ${lobby.parties.length}`);
            for (const party of lobby.parties) {
                const memberNames = party.members.map(ws => {
                    const client = clients.get(ws);
                    const ready = client?.ready ? '✓' : '✗';
                    return `${client?.name} ${ready}`;
                }).join(', ');
                console.log(`   ~ ${party.name}: ${memberNames}`);
            }
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
    } else if (command === 'stop') {
        console.log("! Shutting down server...");
        broadcast({
            type: "message",
            message: "[SERVER] Server is shutting down.",
            time: Date.now()
        });

        for (const client of clients.keys()) {
            client.close();
        }

        wss.close(() => {
            log("! Server stopped.");
            process.exit(0);
        });
    } else if (command === 'help') {
        console.log(`\nAvailable commands:
  players               List all connected players
  lobbies               List all lobbies and parties
  say <message>         Broadcast a message to all players
  kick <id>             Kick a player by ID
  stop                  Stops the server
  help                  Show this help message
        `);
    } else {
        console.log(`Unknown command: ${command}. Type 'help' for list of commands.`);
    }

    rl.prompt();
});

wss.on('connection', (ws) => {
    ws.isAlive = true;

    ws.on('pong', () => {
        ws.isAlive = true;
    });

    ws.on('message', (raw) => {
        try {
            const data = JSON.parse(raw.toString());
            let exclude = [ws];
            let player = clients.get(ws);
            if (data.type === "chat") {
                // Check and censor profanity
                if (matcher.hasMatch(data.message)) {
                    data.message = matcher.getAllMatches(data.message)
                        .reduce((text, match) => {
                            return text.slice(0, match.startIndex) + 
                                   '*'.repeat(match.endIndex - match.startIndex) + 
                                   text.slice(match.endIndex);
                        }, data.message);
                }
                log(`${data.name}: ${data.message}`);
            } else if (data.type === "message") {
                log(data.message);
            } else if (data.type === "player") {
                clients.set(ws, data);
                player = data;

                const otherPlayers = Array.from(clients.entries())
                    .map(([_, pdata]) => pdata)
                    .filter((pdata) => pdata.id !== data.id);

                for (const p of otherPlayers) {
                    ws.send(JSON.stringify({
                        type: "player",
                        ...p
                    }));
                }
            } else if (data.type === "move") {
                if (!player) return;
                player.x = data.x;
                player.y = data.y;
                player.direction = data.direction;
                clients.set(ws, player);
            } else if (data.type === "turn") {
                if (!player) return;
                player.direction = data.direction;
                clients.set(ws, player);
            } else if (data.type === "transfer") {
                if (!player) return;
                player.mapId = data.mapId;
                player.x = data.x;
                player.y = data.y;
                player.direction = data.direction;
                clients.set(ws, player);
                exclude.concat(...(Array.from(clients.entries())
                    .map(([_, pdata]) => pdata)
                    .filter((pdata) => pdata.mapId !== data.mapId)));
            } else if (data.type === "jump") {
                if (!player) return;
                player.x += data.xPlus;
                player.y += data.yPlus;
                clients.set(ws, player);
            } else if (data.type === "vanity") {
                // Empty
            } 

            // Lobbies and Parties
            else if (data.type === "lobby") {
                ws.send(JSON.stringify({
                    type: "lobby",
                    lobby: lobbies[data.lobbyId]
                }, (key, value) => {
                    // Replace WebSocket with player data
                    if (value instanceof WebSocket) return clients.get(value) || null;
                    return value;
                }));
            } else if (data.type === "party-create") {
                const lobby = lobbies[data.lobbyId];
                if (lobby && player) {
                    const party = {
                        id: player.id, // Party ID is just party leader's Steam ID
                        name: `${player.name}'s Party`,
                        members: [ws],
                        lobbyId: data.lobbyId,
                        createdAt: Date.now()
                    };

                    player.ready = false;
                    player.partyId = party.id;
                    clients.set(ws, player);
                    parties.push(party);
                    lobby.parties.push(party);
                    log(`+ Party created in ${lobby.name} by ${player.name}`);
                }
            } else if (data.type === "party-join") {
                const lobby = lobbies[data.lobbyId];
                if (lobby && player) {
                    const party = findPartyById(data.partyId);
                    if (party && !party.members.includes(ws)) {
                        // Sucessful join
                        player.ready = false;
                        player.partyId = party.id;
                        clients.set(ws, player);

                        party.members.push(ws);
                        ws.send(JSON.stringify({
                            type: "party-join",
                            partyId: party.id
                        }));
                        log(`+ ${player.name} joined ${party.name} in ${lobbies[party.lobbyId].name}`);
                    }
                }
            } else if (data.type === "party-ready") {
                if (!player) return;
                player.ready = true;
                clients.set(ws, player);
                const party = findPartyById(player.partyId);
                log(`✓ ${player.name} of ${party?.name} has readied up!`);
            } else if (data.type === "party-unready") {
                if (!player) return;
                player.ready = false;
                clients.set(ws, player);
                const party = findPartyById(player.partyId);
                log(`✗ ${player.name} of ${party?.name} has unreadied.`);
            } else if (data.type === "party-start") {
                if (!player) return;
                const party = findPartyById(player?.partyId);
                if (party) {
                    if (party.members.every(m => {
                        const memberPlayer = clients.get(m);
                        return memberPlayer?.ready;
                    })) {
                        // Notify all party members
                            for (const memberWS of party.members) {
                                if (memberWS.readyState === WebSocket.OPEN) {
                                    memberWS.send(JSON.stringify({
                                        type: "party-start",
                                        success: true
                                    }));
                                }
                            }
                            log(`! ${party.name} is starting: ${lobbies[party.lobbyId].name}!`);
                    } else {
                        ws.send(JSON.stringify({
                            type: "party-start",
                            success: false
                        }));
                        log(`! ${party.name} cannot start, not all members are ready.`);
                    }
                }
            } 

            // Other
            else if (data.type === "ping") {
                return ws.send(JSON.stringify({
                    type: "pong",
                    serverTime: Date.now()
                }));
            }

            broadcast(data, exclude);
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
