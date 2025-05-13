#!/usr/bin/env node

const { exec } = require('child_process');
const https = require('https');
const fs = require('fs');
const fsp = fs.promises;
const path = require('path');
const yauzl = require('yauzl');

function dlNwjs(platform, directory, extract) {
    const name = `nwjs-v0.94.0-${platform}`;
    const zipName = `${name}.zip`;
    const file = fs.createWriteStream(zipName);
    let zipPath = path.join(directory, zipName);
    let extractPath = path.join(directory, extract);

    const unzip = () => {
        return new Promise((resolve, reject) => {
            console.log("Unzipping...");
            yauzl.open(zipPath, {lazyEntries: true}, function(err, zipfile) {
                if (err) return reject(err);
                zipfile.readEntry();

                zipfile.on("entry", function(entry) {
                    if (/\/$/.test(entry.fileName)) {
                        zipfile.readEntry();
                    } else {
                        fs.mkdir(
                            path.join(extractPath, path.dirname(entry.fileName)),
                            { recursive: true },
                            (err) => {
                                if (err) return reject(err);
                                zipfile.openReadStream(entry, function (err, readStream) {
                                    if (err) return reject(err);
                                    readStream.on("end", function () {
                                        zipfile.readEntry();
                                    });
                                    const writer = fs.createWriteStream(
                                        path.join(extractPath, entry.fileName)
                                    );
                                    readStream.pipe(writer);
                                });
                            }
                        );
                    }
                });

                zipfile.on("end", () => {
                    console.log("Unzipped!");
                    resolve();
                });

                zipfile.on("error", reject);
            });
        });
    }

    return new Promise((resolve, reject) => {
        https.get(`https://dl.nwjs.io/v0.94.0/nwjs-v0.94.0-${platform}.zip`, function(response) {
            console.log("Downloading...");
            response.pipe(file);
            
            file.on("finish", () => {
                file.close(() => {
                    console.log("Download finished!");
                    unzip().then(() => {
                        fs.unlinkSync(zipPath);
                        resolve(path.join(extractPath, name));
                    }).catch(reject);
                });

            });
        });        
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

function deployment(directory, fixPackage=false) {
    return new Promise((resolve, reject) => {
        try {
            // Config edits
            const path_config = path.join(directory, '..', 'config.json');
            let config = JSON.parse(fs.readFileSync(path_config));

            // # Force all files to be mini-fied
            config['pre-commit'].minify = true;
            
            // # Make sure the pre-commit is being run in the right path
            config.deployment.extraPath = path.join(directory, '..', '..');

            fs.writeFileSync(path_config, JSON.stringify(config, null, 0));

            // Fix package.json
            if (fixPackage) {
                const path_package = path.join(directory, '..', '..', '..', 'package.json');
                let package = JSON.parse(fs.readFileSync(path_package));
                package.main = "www/index.html";
                package.window.icon = "www/icon/icon.png";
                fs.writeFileSync(path_package, JSON.stringify(package, null, 0));
            }

            exec('npm prune --omit=dev', { cwd: path.join(directory, '..', '..', '..') }, (err, stdout, stderr) => {
                if (err) {
                    console.error('Error running npm prune:', err);
                    return;
                }
                console.log('npm prune output:\n', stdout);
                if (stderr) console.warn('npm warnings:\n', stderr);
            });

            resolve();
        } catch (err) {
            console.error(err);
            reject(err);
        }
    });
}

module.exports = { dlNwjs, copy, deployment };
