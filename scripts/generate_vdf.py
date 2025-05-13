import os
import platform
import json
import subprocess

APP_ID = "3544920"
LOG_PATH = r"C:\SteamCMD\logs"

DEPOTS = {
    "windows": {
        "id": "3544921",
        "folder": "../out/windows"
    },
    "mac": {
        "id": "3544922",
        "folder": "../out/mac"
    },
    "linux": {
        "id": "3544923",
        "folder": "../out/linux"
    }
}

SCRIPT_DIR = os.path.dirname(__file__)
OUT_DIR = os.path.abspath(os.path.join(SCRIPT_DIR, "../out"))
VERSION_PATH = os.path.abspath(os.path.join(SCRIPT_DIR, "../data/Version.json"))


def detect_platform():
    system = platform.system()
    if system == "Windows":
        return ["windows", "linux"]
    elif system == "Darwin":
        return ["mac"]
    else:
        raise RuntimeError(f"Unsupported OS: {system}")


def get_git_hash():
    try:
        result = subprocess.run(
            ["git", "rev-parse", "--short", "HEAD"],
            cwd=os.path.abspath(os.path.join(SCRIPT_DIR, "..")),
            stdout=subprocess.PIPE,
            stderr=subprocess.DEVNULL,
            check=True,
            text=True
        )
        return result.stdout.strip()
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

    git_hash = get_git_hash()
    return f"{version_id} ({git_hash})"


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


def write_files():
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
    print("\n➡ Run this command to upload build:")
    print(f'steamcmd +login STEAM_USERNAME +run_app_build "{escaped_app_path}" +quit')


if __name__ == "__main__":
    write_files()
