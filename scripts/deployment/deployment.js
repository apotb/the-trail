#!/usr/bin/env node

const { exec } = require('child_process');
const https = require('https');
const fs = require('fs');
const fsp = fs.promises;
const path = require('path');
const yauzl = require('yauzl');
const tar = require('tar');
const util = require('util');
const execPromise = util.promisify(exec);

function dlNwjs(platform, directory, extract=".", extension="zip") {
    const versionName = `nwjs-v0.94.0-${platform}`;
    const archiveName = `${versionName}.${extension}`;
    const archivePath = path.join(directory, archiveName);
    const extractPath = path.join(directory, extract);
    const file = fs.createWriteStream(archivePath);

    const extractArchive = async () => {
        if (extension === "zip") {
            return new Promise((resolve, reject) => {
                console.log("Unzipping...");
                yauzl.open(archivePath, { lazyEntries: true }, function (err, zipfile) {
                    if (err) return reject(err);
                    zipfile.readEntry();

                    zipfile.on("entry", function (entry) {
                        const destination = path.join(extractPath, entry.fileName);
                        if (/\/$/.test(entry.fileName)) {
                            fs.mkdir(destination, { recursive: true }, (err) => {
                                if (err) return reject(err);
                                zipfile.readEntry();
                            });
                        } else {
                            fs.mkdir(path.dirname(destination), { recursive: true }, (err) => {
                                if (err) return reject(err);
                                zipfile.openReadStream(entry, (err, readStream) => {
                                    if (err) return reject(err);
                                    const writer = fs.createWriteStream(destination);
                                    readStream.pipe(writer);
                                    writer.on("finish", () => zipfile.readEntry());
                                    writer.on("error", reject);
                                    readStream.on("error", reject);
                                });
                            });
                        }
                    });

                    zipfile.on("end", () => {
                        console.log("Unzip complete.");
                        resolve();
                    });

                    zipfile.on("error", reject);
                });
            });
        } else if (extension === "tar.gz") {
            console.log("Extracting tar.gz...");
            await fsp.mkdir(extractPath, { recursive: true });
            await tar.x({
                file: archivePath,
                cwd: extractPath,
            });
        } else throw new Error(`Unsupported extension: ${extension}`);
    }

    return new Promise((resolve, reject) => {
        const url = `https://dl.nwjs.io/v0.94.0/${archiveName}`;
        https.get(url, (response) => {
            console.log("Downloading...");
            response.pipe(file);
            file.on("finish", () => {
                file.close(async () => {
                    console.log("Download finished!");
                    try {
                        await extractArchive();
                        fs.unlinkSync(archivePath);
                        resolve(path.join(extractPath, versionName));
                    } catch (err) {
                        reject(err);
                    }
                });
            });
            file.on("error", reject);
        }).on("error", reject);
    });
}

async function copy(src, dest) {
    if (!fs.existsSync(src)) {
        console.warn(`Warning: source path does not exist: ${src}`);
        return;
    }

    const stats = fs.statSync(src);
    const isFile = stats.isFile();
    const isDir = stats.isDirectory();

    if (isDir) {
        dest = path.join(dest, path.basename(src));
    } else if (isFile && fs.existsSync(dest) && fs.statSync(dest).isDirectory()) {
        dest = path.join(dest, path.basename(src));
    }

    try {
        await fsp.cp(src, dest, { recursive: true, force: true });
        console.log(`${src} copied to ${dest} successfully.`);
    } catch (err) {
        console.error(`Failed to copy ${src} → ${dest}:`, err);
        throw err;
    }
}

async function deployment(directory, fixPackage=true) {
    try {
        // Config edits
        const path_config = path.join(directory, '..', 'config.json');
        let config = JSON.parse(fs.readFileSync(path_config));
        config['pre-commit'].minify = true; // Force all files to be mini-fied
        config.deployment.extraPath = path.join(directory, '..', '..'); // Make sure the pre-commit is being run in the right path
        fs.writeFileSync(path_config, JSON.stringify(config, null, 0));

        // Fix package.json
        if (fixPackage) {
            const path_package = path.join(directory, '..', '..', '..', 'package.json');
            let package = JSON.parse(fs.readFileSync(path_package));
            package.main = "www/index.html";
            package.window.icon = "www/icon/icon.png";
            fs.writeFileSync(path_package, JSON.stringify(package, null, 0));
        }

        // Run npm prune --omit=dev
        const { stdout, stderr } = await execPromise('npm prune --omit=dev', {
            cwd: path.join(directory, '..', '..', '..'),
        });
        console.log('npm prune output:\n', stdout);
        if (stderr) console.warn('npm warnings:\n', stderr);
    } catch (err) {
        console.error(err);
        throw err;
    }
}

(async function main() {
    const args = process.argv.slice(2);
    const platform = args[0];
    
    if (!["windows", "mac", "linux"].includes(platform)) {
        console.error("Usage: node deployment.js <windows|mac|linux>");
        process.exit(1);
    }

    const rootPath = path.join(__dirname, "..", "..");
    const config = {
        windows: {
            platform: "win-x64",
            extension: "zip",
            execFile: "windows/thetrail.exe",
            extraFiles: [],
            nwBinary: "nw.exe"
        },
        linux: {
            platform: "linux-x64",
            extension: "tar.gz",
            execFile: "linux/thetrail",
            extraFiles: ["linux/thetrail.desktop"],
            nwBinary: "nw"
        }
    }[platform];

    if (!config) throw new Error(`Unsupported build target: ${platform}`);

    const nwjsPath = await dlNwjs(config.platform, rootPath, "out", config.extension);
    const wwwPath = path.join(nwjsPath, "www");
    const scriptsPath = path.join(wwwPath, "scripts");

    const wwwSrc = ['audio', 'data', 'fonts', 'icon', 'img', 'js', 'lib', 'scripts', 'greenworks.js', 'index.html'];
    const nwjsSrc = ['node_modules', 'CHANGELOG.md', 'package.json', 'package-lock.json'];

    for (const src of wwwSrc) {
        await copy(path.join(rootPath, src), wwwPath);
    }

    for (const src of nwjsSrc) {
        await copy(path.join(rootPath, src), nwjsPath);
    }

    await copy(path.join(__dirname, config.execFile), nwjsPath);
    for (const extra of config.extraFiles) {
        await copy(path.join(__dirname, extra), nwjsPath);
    }

    await deployment(path.join(scriptsPath, "deployment"));
    require(path.join(scriptsPath, "pre-commit.js"));

    fs.rmSync(scriptsPath, { recursive: true, force: true });
    fs.rmSync(path.join(nwjsPath, config.nwBinary), { force: true });

    console.log(`${platform.toUpperCase()} build completed.`);
})();
