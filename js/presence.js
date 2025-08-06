const clientId = '1004968765815005215';
const DiscordRPC = require('discord-rpc');
const RPC = new DiscordRPC.Client({
    transport: 'ipc'
});

const startTimestamp = Date.now();
var refreshes = -1;
const smallImageKeys = [`power`, `quests`, `bits`, `hammer`, `chest`];

DiscordRPC.register(clientId);

async function setActivity() {
    if (!RPC) return;

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
        largeImageText: `Saving the world!`,
        smallImageKey: smallImageKey,
        smallImageText: smallImageText,
        instance: false,
    });
}

RPC.on('ready', async () => {
    setActivity();

    setInterval(() => {
        setActivity();
    }, 15 * 1000);
});

RPC.login({
    clientId: clientId
}).catch(err => console.error(err));