set nwjs=%CD%\nwjs-v0.94.0-win-x64
set www=%nwjs%\www

cd ..
mkdir "%www%"

xcopy /E /I /Y "%CD%\audio" "%www%\audio"
xcopy /E /I /Y "%CD%\data" "%www%\data"
xcopy /E /I /Y "%CD%\fonts" "%www%\fonts"
copy "%CD%\greenworks.js" "%www%"
xcopy /E /I /Y "%CD%\icon" "%www%\icon"
xcopy /E /I /Y "%CD%\img" "%www%\img"
xcopy /E /I /Y "%CD%\js" "%www%\js"
xcopy /E /I /Y "%CD%\lib" "%www%\lib"
xcopy /E /I /Y "%CD%\node_modules" "%nwjs%\node_modules"
copy "%CD%\index.html" "%www%"
copy "%CD%\package-lock.json" "%nwjs%"
copy "%CD%\package.json" "%nwjs%"
copy "%CD%\scripts\deployment\win\thetrail.exe" "%nwjs%"

node "%CD%\scripts\playtest.js"

"%nwjs%\thetrail.exe"