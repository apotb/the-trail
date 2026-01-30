const clientId = '1004968765815005215';
const DiscordRPC = require('discord-rpc');
const RPC = new DiscordRPC.Client({
    transport: 'ipc'
});

const startTimestamp = Date.now();
var refreshes = -1;
const smallImageKeys = [`power`, `quests`, `bits`, `hammer`, `chest`];
let rpcReady = false;
let activityInterval = null;
let loginRetryTimeout = null;
let isShuttingDown = false;

DiscordRPC.register(clientId);

async function setActivity() {
    if (!RPC || !rpcReady) return;

    refreshes++;

    var details = "Launching game...";
    var state = "Playing ";
    var smallImageKey = smallImageKeys[refreshes % smallImageKeys.length];
    var smallImageText = "No save loaded";

    if ($dataVersion) {
        state += $dataVersion.name;
    } else {
        state += "the game";
    }

    if ($gameMap) {
        if ($gameMap._mapId === 0 || !$gameTemp._isGameLoaded) {
            details = "In the main menu";
        } else {
            if ($gameParty.inBattle()) {
                details = `Fighting ${$dataTroops[$gameTroop._troopId].name}`;
                state = `Turn ${Math.max($gameTroop.turnCount(), 1)}`;
            } else details = `Location: ${$gameMap.displayName() ? $gameMap.displayName() : '???'}`;

            switch(smallImageKey) {
                case `power`:
                    smallImageText = "Party Levels: ";
                    for (i = 0; i < $gameParty.members().length; i++) smallImageText += ($gameParty.members()[i]._level + ", ");
                    smallImageText = smallImageText.slice(0, -2);
                    break;
                case `quests`:
                    smallImageText = "Quests Completed: " + $gameSystem.questCompletionRate() + "%";
                    break;
                case `bits`:
                    smallImageText = "Bits: " + $gameParty.gold();
                    break;
                case `hammer`:
                    smallImageText = "Crafting Completion: " + Math.round((($gameSystem.synthedTotal()) / Yanfly.IS.SynthesisRecipeCount) * 100) + "%";
                    break;
                case `chest`:
                    smallImageText = "Small Chests Opened: " + $gameVariables.value(50);
                    break;
                default:
                    smallImageText = "That wasn't supposed to happen!";
            }
        }
    }

    RPC.setActivity({
        details: details,
        state: state,
        startTimestamp: startTimestamp,
        largeImageKey: `large_image`,
        largeImageText: $gameParty?.teamName() ?? "Loading...",
        smallImageKey: smallImageKey,
        smallImageText: smallImageText,
        instance: false,
    });
}

RPC.on('ready', async () => {
    rpcReady = true;
    setActivity();

    if (activityInterval) clearInterval(activityInterval);
    activityInterval = setInterval(() => {
        setActivity();
    }, 15 * 1000);
});

RPC.on('disconnected', () => {
    rpcReady = false;
    if (activityInterval) {
        clearInterval(activityInterval);
        activityInterval = null;
    }
    scheduleLoginRetry();
});

RPC.on('error', () => {
    rpcReady = false;
    if (activityInterval) {
        clearInterval(activityInterval);
        activityInterval = null;
    }
    scheduleLoginRetry();
});

function scheduleLoginRetry() {
    if (isShuttingDown) return;
    if (loginRetryTimeout) return;
    loginRetryTimeout = setTimeout(() => {
        loginRetryTimeout = null;
        login();
    }, 10 * 1000);
}

function login() {
    RPC.login({ clientId: clientId }).catch(() => {
        scheduleLoginRetry();
    });
}

async function cleanupPresence() {
    if (isShuttingDown) return;
    isShuttingDown = true;
    try {
        if (activityInterval) clearInterval(activityInterval);
        if (loginRetryTimeout) clearTimeout(loginRetryTimeout);
        if (rpcReady) {
            await RPC.clearActivity();
        }
    } catch (e) {
        // ignore cleanup errors
    } finally {
        try {
            RPC.destroy();
        } catch (e) {
            // ignore destroy errors
        }
    }
}

process.on('exit', () => {
    cleanupPresence();
});
process.on('SIGINT', () => {
    cleanupPresence();
    process.exit(0);
});
process.on('SIGTERM', () => {
    cleanupPresence();
    process.exit(0);
});
process.on('uncaughtException', (err) => {
    console.error(err);
    cleanupPresence();
    process.exit(1);
});
process.on('unhandledRejection', (err) => {
    console.error(err);
    cleanupPresence();
});

login();