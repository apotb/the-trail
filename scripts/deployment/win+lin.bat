@echo off
echo Move the OS deployment files to the NW.js folder
pause

call node "%CD%"\deployment.js

cd ..

call node "%CD%"\pre-commit.js

cd ..

call npm prune --production

move "%CD%"\CHANGELOG.md ..
move "%CD%"\node_modules ..
move "%CD%"\package.json ..
move "%CD%"\package-lock.json ..

rmdir /s /q nwjs-v0.94.0-win-x64

del /f .gitignore
del /f CONTRIBUTING.md
del /f PLAYTEST.bat
del /f README.md
del /f steam_appid.txt
del /f supertoolsengine.html

cd ..

del /f Game.exe

rmdir /s /q "%CD%"\www\scripts