#!/usr/bin/env node

const data = __dirname + "/../nwjs-v0.94.0-win-x64/package.json"
const fs = require('fs')
const { exec } = require('child_process')

try {
    let package = JSON.parse(fs.readFileSync(`${data}`))
    package.main = "www/index.html"
    package.window.icon = "www/icon/icon.png"
    fs.writeFileSync(`${data}`, JSON.stringify(package, null, 2))
} catch (err) {
    console.error(err)
    process.exit(1)
}