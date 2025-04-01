mkdir "%CD%"\nwjs-v0.94.0-win-x64\www

copy "%CD%"\package.json "%CD%"\nwjs-v0.94.0-win-x64
copy "%CD%"\package-lock.json "%CD%"\nwjs-v0.94.0-win-x64
copy "%CD%"\thetrail.exe "%CD%"\nwjs-v0.94.0-win-x64

xcopy /E /I /Y "%CD%"\node_modules "%CD%"\nwjs-v0.94.0-win-x64\node_modules

xcopy /E /I /Y "%CD%"\audio "%CD%"\nwjs-v0.94.0-win-x64\www\audio
xcopy /E /I /Y "%CD%"\data "%CD%"\nwjs-v0.94.0-win-x64\www\data
xcopy /E /I /Y "%CD%"\fonts "%CD%"\nwjs-v0.94.0-win-x64\www\fonts
xcopy /E /I /Y "%CD%"\icon "%CD%"\nwjs-v0.94.0-win-x64\www\icon
xcopy /E /I /Y "%CD%"\img "%CD%"\nwjs-v0.94.0-win-x64\www\img
xcopy /E /I /Y "%CD%"\js "%CD%"\nwjs-v0.94.0-win-x64\www\js
copy "%CD%"\index.html "%CD%"\nwjs-v0.94.0-win-x64\www

node "%CD%\scripts\playtest.js

"%CD%"\nwjs-v0.94.0-win-x64\thetrail.exe