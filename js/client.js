// client.js
let socket;

window.players = {};
window.chat = [];

const CHAT_LIMIT = 10;

function startMultiplayerConnection(playerName = "Player") {
    if (socket && socket.readyState === WebSocket.OPEN) return; // prevent duplicates

    socket = new WebSocket("ws://192.168.8.128:54000");

    socket.onopen = () => {
        console.log("✅ Connected to server!");
        sendPlayer();
        sendMessage(`${playerName} joined the game`);        
    };

    socket.onmessage = (event) => {
        try {
            const data = JSON.parse(event.data);

            if (data.type === "chat") {
                const text = `${data.name}: ${data.text}`;
                console.log(`💬 ${text}`);
                window.chat.push(text);
            }

            if (data.type === "message") {
                const text = `${data.message}`
                console.log(`💬 ${text}`)
                window.chat.push(text);
            }

            if (data.type === "player") {
                if (data.id === API_STEAM.userId()) return;

                let player = window.players[data.id];
                if (!player) {
                    if (!(SceneManager._scene instanceof Scene_Map)) return;
                    Yanfly.SpawnEventTemplateAt('Player', data.x, data.y, true);
                    player = $gameMap.LastSpawnedEvent();
                    window.players[data.id] = player;
                    SceneManager._scene._spriteset.createBShadow(player.eventId(), player);
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
                    player.x = data.x;
                    player.y = data.y;
                }
            }

            if (data.type === "vanity") {
                let player = window.players[data.id];
                if (player) player.setImage(data.spriteName, data.spriteIndex);
            }

            if (data.type === "disconnect") {
                Yanfly.DespawnEvent(window.players[data.id]);
                delete window.players[data.id];
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

function sendMessage(message) {
    if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({
            type: "message",
            message
        }))
    }
}

function getChat() {
    let chatString = "";
    window.chat.slice(-CHAT_LIMIT).forEach(chat => {
        chatString += chat + "\n";
    });
    return chatString;
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
        window.chat = [];
    } else {
        console.warn("⚠️ No active connection to disconnect.");
    }
}

// Expose to RPG Maker
window.startMultiplayerConnection = startMultiplayerConnection;
window.disconnectFromServer = disconnectFromServer;
window.sendChat = sendChat;
window.sendMessage = sendMessage;
window.getChat = getChat;
window.sendPlayer = sendPlayer;
window.sendMove = sendMove;
window.sendVanity = sendVanity;
