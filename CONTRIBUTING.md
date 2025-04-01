# Platform notice
Most of the instructions in this file have only been tested for Windows.

If you use either MacOS or Linux, you might be on your own.

# Contributors using RPG Maker MV

## Requirements
- [node.js](https://nodejs.org/en/download/)

## pre-commit Hook

### Enabling hidden folders
- [Windows](https://support.microsoft.com/en-us/windows/view-hidden-files-and-folders-in-windows-97fbc472-c603-9d90-91d0-1166d1d9f4b5)
- Mac: Cmd + Shift + .

### Setting up the hook
1. In the root of the cloned repository, navigate to `.git/hooks`.
2. If it doesn't already exist, create a file titled `pre-commit` (note that there is no file extension).
3. After creating `pre-commit`, open it via a text editor and paste in the hook below.

### Using the hook
1. Before beginning to stage files for a commit, run `git commit` inside the terminal to activate the hook.
2. After the hook runs, stage files and complete your commit.

### Hook configuration
All configurations are edited within the `scripts/config.json` file.

#### Minify
Determines whether .json files are readable (`false`) or condensed (`true`). Default is `false`.

### The hook
```
#!/usr/bin/env node

var childProcess = require('child_process')

function runScript(scriptPath, callback) {

    var invoked = false

    var process = childProcess.fork(scriptPath)

    process.on('error', function (err) {
        if (invoked) return
        invoked = true
        callback(err)
    })

    process.on('exit', function (code) {
        if (invoked) return
        invoked = true
        var err = code === 0 ? null : new Error('exit code ' + code)
        callback(err)
    })

}

runScript('./scripts/pre-commit.js', function (err) {
    if (err) throw err
    console.log('Finished running pre-commit.js')
})
```

# Contributors NOT using RPG Maker MV

## Compiling the game

### Windows

#### Method #1 (requires node.js)
Download and install [node.js](https://nodejs.org/en/download/).

Afterwards, go to the `scripts` folder and run the file titled `dlnwjs.bat`. NW.js will automatically download and unzip in the root of the repository.

To play the game, run `PLAYTEST.bat`, located in the repository's root.

#### Method #2 (no extra downloads)
1. Download and extract [NW.js v0.94.0 for Windows](https://dl.nwjs.io/v0.94.0/nwjs-v0.94.0-win-x64.zip).
2. Move `package.json`, `package-lock.json`, and `node_modules` from the repository to the root of `nwjs-v0.94.0-win-x64`.
3. Open `package.json` with your text editor of choice. Change the value of `"main"` to `"www/index.html"`, and the value of `"icon"` to `"www/icon/icon.png"`. Do NOT delete the commas.
4. Create a folder titled `www` inside `nwjs-v0.94.0-win-x64`.
5. Move every folder and `index.html` from the download of The Trail to `www`.
6. Run `nw.exe` to launch the game. If you receive a [Windows SmartScreen error](https://techcommunity.microsoft.com/t5/image/serverpage/image-id/236239i5BF05C3634826BFC/image-dimensions/484x457?v=v2), dismiss it by clicking "More info" and "Run anyways".
