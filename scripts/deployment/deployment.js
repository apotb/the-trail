#!/usr/bin/env node

const DEMO = false;

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
            if (process.platform === "win32") {
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
            } else {
                console.log("Extracting with system unzip...");
                await execPromise(`unzip -q "${archivePath}" -d "${extractPath}"`);
            }
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

async function deployment(directory, platform) {
    try {
        // Config edits
        const path_config = path.join(directory, '..', 'config.json');
        let config = JSON.parse(fs.readFileSync(path_config));
        config['pre-commit'].minify = true; // Force all files to be mini-fied
        config.deployment.extraPath = path.join(directory, '..', '..'); // Make sure the pre-commit is being run in the right path
        fs.writeFileSync(path_config, JSON.stringify(config, null, 0));

        // Fix package.json
        if (platform !== "mac") {
            const path_package = path.join(directory, '..', '..', '..', 'package.json');
            let package = JSON.parse(fs.readFileSync(path_package));
            package.main = "www/index.html";
            package.window.icon = "www/icon/icon.png";
            fs.writeFileSync(path_package, JSON.stringify(package, null, 0));
        }

        // Run npm prune --omit=dev
        const { stdout, stderr } = await execPromise('npm prune --omit=dev', {
            cwd: platform !== "mac" ? path.join(directory, '..', '..', '..') : path.join(directory, '..'),
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
    const configPath = path.join(__dirname, '..', 'config.json');
    const config = JSON.parse(fs.readFileSync(configPath)).deployment.platforms[platform];

    if (!config) throw new Error(`Unsupported build target: ${platform}`);

    const extractedPath = await dlNwjs(config.platform, rootPath, "out", config.extension);
    const finalPath = path.join(rootPath, "out", `${platform}${DEMO ? "-demo" : ""}`);
    if (fs.existsSync(finalPath)) fs.rmSync(finalPath, { recursive: true, force: true });
    try {
        fs.renameSync(extractedPath, finalPath);
    } catch (err) {
        if (err.code === "EPERM") {
            console.warn("Rename failed (possibly locked). Retrying...");
            await new Promise(res => setTimeout(res, 500));
            fs.renameSync(extractedPath, finalPath);
        } else {
            throw err;
        }
    }
    const nwjsPath = finalPath;

    if (platform === "mac") {
        fs.renameSync(path.join(nwjsPath, "nwjs.app"), path.join(nwjsPath, "The Trail.app"));
        console.log("Renamed nwjs.app → The Trail.app");
        
        const plistPath = path.join(nwjsPath, "The Trail.app", "Contents", "Info.plist");
        let plistContent = fs.readFileSync(plistPath, "utf8");
        plistContent = plistContent
            .replace(/<key>CFBundleDisplayName<\/key>\s*<string>.*?<\/string>/, `<key>CFBundleDisplayName</key>\n\t<string>The Trail${DEMO ? " Demo": ""}</string>`)
            .replace(/<key>CFBundleName<\/key>\s*<string>.*?<\/string>/, `<key>CFBundleName</key>\n\t<string>The Trail${DEMO ? " Demo": ""}</string>`)
            .replace(/<key>CFBundleIdentifier<\/key>\s*<string>.*?<\/string>/, `<key>CFBundleIdentifier</key>\n\t<string>com.thetrailteam.thetrail${DEMO ? "demo": ""}</string>`);
        fs.writeFileSync(plistPath, plistContent);
        console.log("Updated Info.plist with display name, name, and identifier.");
    }

    const wwwPath = platform !== "mac" ? path.join(nwjsPath, "www") : path.join(nwjsPath, "The Trail.app", "Contents", "Resources", "app.nw");
    if (!fs.existsSync(wwwPath)) await fsp.mkdir(wwwPath, { recursive: true });
    const scriptsPath = path.join(wwwPath, "scripts");
    
    let wwwSrc, nwjsSrc;
    if (platform !== "mac") {
        wwwSrc = ['audio', 'data', 'fonts', 'icon', 'img', 'js', 'lib', 'scripts', 'greenworks.js', 'index.html'];
        nwjsSrc = ['node_modules', 'CHANGELOG.md', 'package.json', 'package-lock.json'];
    } else {
        wwwSrc = ['audio', 'data', 'fonts', 'icon', 'img', 'js', 'lib', 'node_modules', 'scripts', 'greenworks.js', 'index.html', 'package.json', 'package-lock.json'];
        nwjsSrc = ['CHANGELOG.md'];
    }

    for (const src of wwwSrc) {
        await copy(path.join(rootPath, src), wwwPath);
    }

    for (const src of nwjsSrc) {
        await copy(path.join(rootPath, src), nwjsPath);
    }

    if (config.execFile) await copy(path.join(__dirname, config.execFile), nwjsPath);

    const extraPath = path.join(nwjsPath, config.extraPath);
    for (const extra of config.extraFiles) {
        await copy(path.join(__dirname, extra), extraPath);
    }

    await deployment(path.join(scriptsPath, "deployment"), platform);
    require(path.join(scriptsPath, "pre-commit.js"));

    fs.rmSync(scriptsPath, { recursive: true, force: true });
    if (config.nwBinary) fs.rmSync(path.join(nwjsPath, config.nwBinary), { force: true });

    console.log(`${platform.toUpperCase()} build completed.`);
})();
