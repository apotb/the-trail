// client.js
let socket;

function startMultiplayerConnection(playerName = "Player") {
    if (socket && socket.readyState === WebSocket.OPEN) return; // prevent duplicates

    socket = new WebSocket("ws://localhost:54000");

    socket.onopen = () => {
        console.log("✅ Connected to server!");
        sendChat(`${playerName} has joined.`);
    };

    socket.onmessage = (event) => {
        try {
            const data = JSON.parse(event.data);
            if (data.type === "chat") {
                console.log(`💬 ${data.name}: ${data.text}`);
                // TODO: show in UI
            }
        } catch (e) {
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
