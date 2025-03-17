@echo off
echo Move the files in the 'mac' folder to the Resources folder
pause
echo Open Contents/Info.plist and change CFBundleDisplayName CFBundleExecutable CFBundleName from nwjs to The Trail
pause

call node "%CD%"\deployment.js

cd ..

call node "%CD%"\pre-commit.js

cd ..

call npm prune --production

move "%CD%"\CHANGELOG.md ..\..\..\..

rmdir /s /q nwjs-v0.94.0-win-x64

del /f .gitignore
del /f CONTRIBUTING.md
del /f PLAYTEST.bat
del /f README.md
del /f steam_appid.txt
del /f supertoolsengine.html

rmdir /s /q "%CD%"\scripts