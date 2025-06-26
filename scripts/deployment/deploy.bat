@echo off

:: Variables
for /f %%i in ('python -c "import os; print([line.split('=')[1].strip() for line in open('.env') if line.startswith('MAC_HOST=')][0])"') do set MAC_HOST=%%i
for /f %%i in ('python -c "import json; print('mac-demo' if json.load(open('scripts/config.json')).get('demo', False) else 'mac')"') do set MAC_DIR=%%i
for /f %%i in ('git rev-parse --abbrev-ref HEAD') do set BRANCH=%%i

:: Connect to MAC_HOST and get build
ssh %MAC_HOST% "caffeinate -i zsh -l -c 'cd ~/GitHub/the-trail && git fetch && git checkout %BRANCH% && git pull && npm run mac && cd out && rm -f %MAC_DIR%.zip && zip -rq %MAC_DIR%.zip %MAC_DIR% -x \"*.DS_Store\" \"*.dSYM/*\" \"*.map\" \"__MACOSX*\" \"*.log\"'"
scp %MAC_HOST%:~/GitHub/the-trail/out/%MAC_DIR%.zip ./out/%MAC_DIR%.zip
ssh %MAC_HOST% "rm ~/GitHub/the-trail/out/%MAC_DIR%.zip"

:: Unzip the build copied from MAC_HOST
rmdir /s /q .\out\%MAC_DIR%
powershell -Command "Expand-Archive -Force './out/%MAC_DIR%.zip' './out'"
del /f /q .\out\%MAC_DIR%.zip

:: Run Windows and Linux builds
call npm run windows
call npm run linux

:: Generate VDF files for all platforms, upload builds, and open Steamworks website
python scripts\generate_vdf.py -p -u -s
