import os
import platform
import json
import subprocess
import env

SCRIPT_DIR = os.path.dirname(__file__)
OUT_DIR = os.path.abspath(os.path.join(SCRIPT_DIR, "../out"))
LOG_PATH = os.path.join(OUT_DIR, "logs")
VERSION_PATH = os.path.abspath(os.path.join(SCRIPT_DIR, "../data/Version.json"))
CONFIG_PATH = os.path.abspath(os.path.join(SCRIPT_DIR, "config.json"))
with open(CONFIG_PATH, "r", encoding="utf-8") as f:
    DEMO = json.load(f).get("demo", False)

APP_ID = 3544920 if not DEMO else 3580480

DEPOTS = {
    "windows": {
        "id": str(APP_ID + 1),
        "folder": "../out/windows" if not DEMO else "../out/windows-demo"
    },
    "mac": {
        "id": str(APP_ID + 2),
        "folder": "../out/mac" if not DEMO else "../out/mac-demo"
    },
    "linux": {
        "id": str(APP_ID + 3),
        "folder": "../out/linux" if not DEMO else "../out/linux-demo"
    }
}


def detect_platform():
    system = platform.system()
    if system == "Windows":
        return ["windows", "linux"]
    elif system == "Darwin":
        return ["mac"]
    else:
        raise RuntimeError(f"Unsupported OS: {system}")


def get_git_info():
    try:
        branch = subprocess.run(
            ["git", "rev-parse", "--abbrev-ref", "HEAD"],
            cwd=os.path.abspath(os.path.join(SCRIPT_DIR, "..")),
            stdout=subprocess.PIPE,
            stderr=subprocess.DEVNULL,
            check=True,
            text=True
        ).stdout.strip()
        hash = subprocess.run(
            ["git", "rev-parse", "--short", "HEAD"],
            cwd=os.path.abspath(os.path.join(SCRIPT_DIR, "..")),
            stdout=subprocess.PIPE,
            stderr=subprocess.DEVNULL,
            check=True,
            text=True
        ).stdout.strip()
        return {
            "branch": branch,
            "hash": hash
        }
    except Exception:
        return "nogit"


def get_build_description():
    try:
        with open(VERSION_PATH, "r", encoding="utf-8") as f:
            version_data = json.load(f)
            version_id = version_data.get("id", "Unnamed Build")
    except Exception as e:
        print(f"⚠ Failed to read Version.json: {e}")
        version_id = "Unnamed Build"

    git_info = get_git_info()
    return f"{version_id} {git_info['branch']}@{git_info['hash']}"


def generate_depot_vdf(name, depot):
    content_root = os.path.abspath(os.path.join(SCRIPT_DIR, depot["folder"]))
    return f'''"DepotBuildConfig"
{{
    "DepotID" "{depot['id']}"
    "ContentRoot" "{content_root}"
    "FileMapping"
    {{
        "LocalPath" "*"
        "DepotPath" "."
        "recursive" "1"
    }}
    "FileExclusion" "*.pdb"
    "FileExclusion" ".DS_Store"
}}'''


def generate_app_build_vdf(platform_keys):
    desc = get_build_description()
    depots_block = "\n".join(
        [f'        "{DEPOTS[key]["id"]}" "depot_build_{DEPOTS[key]["id"]}.vdf"' for key in platform_keys]
    )
    return f'''"AppBuild"
{{
    "AppID" "{APP_ID}"
    "Desc" "{desc}"
    "BuildOutput" "{LOG_PATH}"
    "Depots"
    {{
{depots_block}
    }}
}}'''


def write_files(env):
    platform_keys = detect_platform()
    os.makedirs(OUT_DIR, exist_ok=True)

    for key in platform_keys:
        depot = DEPOTS[key]
        path = os.path.join(OUT_DIR, f'depot_build_{depot["id"]}.vdf')
        with open(path, "w", encoding="utf-8") as f:
            f.write(generate_depot_vdf(key, depot))
        print(f"✔ Wrote {path}")

    app_path = os.path.join(OUT_DIR, f'app_build_{APP_ID}.vdf')
    with open(app_path, "w", encoding="utf-8") as f:
        f.write(generate_app_build_vdf(platform_keys))
    print(f"✔ Wrote {app_path}")

    escaped_app_path = app_path.replace('"', '\\"')
    print("\n➡ Run this command to upload build:\n")
    print(f'steamcmd +login {env.get("STEAM_USERNAME")} +run_app_build "{escaped_app_path}" +quit\n')


if __name__ == "__main__":
    env.load()
    write_files(env)
