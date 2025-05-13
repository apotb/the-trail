const fs = require("fs");
const path = require("path");
const { dlNwjs, copy, deployment } = require("./deployment.js");

const platform = "linux-x64";
const extension = "tar.gz";

const wwwSrc = ['audio', 'data', 'fonts', 'icon', 'img', 'js', 'lib', 'scripts', 'greenworks.js', 'index.html'];
const nwjsSrc = ['node_modules', 'CHANGELOG.md', 'package.json', 'package-lock.json'];

async function main() {
    const rootPath = path.join(__dirname, "..", "..");
    const nwjsPath = await dlNwjs(platform, rootPath, "out", extension);
    const wwwPath = path.join(nwjsPath, "www");
    const scriptsPath = path.join(wwwPath, "scripts");

    for (const src of wwwSrc) {
        const srcPath = path.join(rootPath, src);
        await copy(srcPath, wwwPath);
    }

    for (const src of nwjsSrc) {
        const srcPath = path.join(rootPath, src);
        await copy(srcPath, nwjsPath);
    }

    const executablePath = path.join(__dirname, "linux", "thetrail");
    const desktopPath = path.join(__dirname, "linux", "thetrail.desktop");
    await copy(executablePath, nwjsPath);
    await copy(desktopPath, nwjsPath);

    await deployment(path.join(scriptsPath, "deployment"));

    require(path.join(scriptsPath, "pre-commit.js"));

    fs.rmSync(scriptsPath, { recursive: true, force: true });
    fs.rmSync(path.join(nwjsPath, "nw"), { recursive: true, force: true });
}

main().catch(err => {
    console.error(err);
});
