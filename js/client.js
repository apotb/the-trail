// client.js
let socket;
window.players = {};

function startMultiplayerConnection(playerName = "Player") {
    if (socket && socket.readyState === WebSocket.OPEN) return; // prevent duplicates

    socket = new WebSocket("ws://192.168.8.128:54000");

    socket.onopen = () => {
        console.log("✅ Connected to server!");
        sendChat(`${playerName} has joined.`);
        sendPlayer();
    };

    socket.onmessage = (event) => {
        try {
            const data = JSON.parse(event.data);
            if (data.type === "chat") {
                console.log(`💬 ${data.name}: ${data.text}`);
                // TODO: show in UI
            }

            if (data.type === "player") {
                if (data.name === API_STEAM.username()) return; // skip own data

                let player = window.players[data.id];
                if (!player) {
                    Yanfly.SpawnEventTemplateAt('Player', data.x, data.y, true);
                    player = $gameMap.LastSpawnedEvent();
                    players[data.id] = player;
                    $gameMap._events[data.userId] = player;
                    /*if (SceneManager._scene instanceof Game_Map) {
                        SceneManager._scene._spriteset.destroyAllBShadows();
                        SceneManager._scene._spriteset.createCharacterShadows();
                    }*/
                }

                player.setImage(data.spriteName, data.spriteIndex);
                player._mapId = data.mapId;
                player.locate(data.x, data.y);
                player.setDirection(data.direction);
            }

            if (data.type === "move") {
                let player = window.players[data.id];
                if (player) {
                    player.setMoveSpeed(data.speed);
                    player.moveToPoint(data.x, data.y);
                }
            }

            if (data.type === "vanity") {
                let player = window.players[data.id];
                if (player) player.setImage(data.spriteName, data.spriteIndex);
            }

        } catch (e) {
            console.error(e);
            console.log("📩 Raw:", event.data);
        }
    };

    socket.onerror = (err) => console.error("❌ WebSocket error:", err);
    socket.onclose = () => console.warn("🔌 Disconnected.");
}

function sendChat(text) {
    if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({
            type: "chat",
            name: API_STEAM.username(),
            text
        }));
    }
}

function sendPlayer() {
    if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({
            type: "player",
            name: API_STEAM.username(),
            id: API_STEAM.userId(),
            mapId: $gameMap.mapId(),
            x: $gamePlayer.x,
            y: $gamePlayer.y,
            direction: $gamePlayer.direction(),
            spriteName: $gamePlayer._characterName,
            spriteIndex: $gamePlayer._characterIndex
        }));
    }
}

function sendMove(direction) {
    if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({
            type: "move",
            id: API_STEAM.userId(),
            x: $gamePlayer.x,
            y: $gamePlayer.y,
            direction: direction,
            speed: $gamePlayer.realMoveSpeed()
        }));
    }
}

function sendVanity(characterName, characterIndex) {
    if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({
            type: "vanity",
            id: API_STEAM.userId(),
            spriteName: characterName,
            spriteIndex: characterIndex
        }));
    }
}

function disconnectFromServer() {
    if (socket && socket.readyState === WebSocket.OPEN) {
        socket.close(1000, "Client closed connection"); // Normal close code
        console.log("🔌 Disconnected from server.");
    } else {
        console.warn("⚠️ No active connection to disconnect.");
    }
}

// Expose to RPG Maker
window.startMultiplayerConnection = startMultiplayerConnection;
window.disconnectFromServer = disconnectFromServer;
window.sendChat = sendChat;
window.sendPlayer = sendPlayer;
window.sendMove = sendMove;
window.sendVanity = sendVanity;
