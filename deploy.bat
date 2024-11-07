@if "%SCM_TRACE_LEVEL%" NEQ "4" @echo off

:: Prerequisites
:: -------------

:: Verify node.js installed
where node 2>nul >nul
IF %ERRORLEVEL% NEQ 0 (
  echo Missing node.js executable, please install node.js, if already installed make sure it can be reached from current environment.
  goto error
)

setlocal enabledelayedexpansion

SET ARTIFACTS=%~dp0%..\artifacts

IF NOT DEFINED DEPLOYMENT_SOURCE (
  SET DEPLOYMENT_SOURCE=%~dp0%.
)

IF NOT DEFINED DEPLOYMENT_TARGET (
  SET DEPLOYMENT_TARGET=%ARTIFACTS%\wwwroot
)

IF NOT DEFINED NEXT_MANIFEST_PATH (
  SET NEXT_MANIFEST_PATH=%ARTIFACTS%\manifest

  IF NOT DEFINED PREVIOUS_MANIFEST_PATH (
    SET PREVIOUS_MANIFEST_PATH=%ARTIFACTS%\manifest
  )
)

IF NOT DEFINED KUDU_SYNC_CMD (
  :: Install kudu sync
  echo Installing Kudu Sync
  call npm install kudusync -g --silent
  IF !ERRORLEVEL! NEQ 0 goto error

  :: Locally just running "kuduSync" would also work
  SET KUDU_SYNC_CMD=%appdata%\npm\kuduSync.cmd
)

:: -----------------------
:: Deployment Script for Azure App Service (Windows)
:: -----------------------
:: Execute command routine that will echo out when error
echo Handling Basic Web Site deployment.

:: 1. KuduSync
IF /I "%IN_PLACE_DEPLOYMENT%" NEQ "1" (

  IF /I "%IGNORE_MANIFEST%" EQU "1" (
    SET IGNORE_MANIFEST_PARAM=-x
  )

  call :ExecuteCmd "%KUDU_SYNC_CMD%" -v 50 !IGNORE_MANIFEST_PARAM! -f "%DEPLOYMENT_SOURCE%" -t "%DEPLOYMENT_TARGET%" -n "%NEXT_MANIFEST_PATH%" -p "%PREVIOUS_MANIFEST_PATH%" -i ".git;.hg;.deployment;deploy.cmd"
  IF !ERRORLEVEL! NEQ 0 goto error

  IF EXIST package-lock.json (
    ECHO Using npm ci for a clean install...
    npm ci
  ) ELSE (
    ECHO Using npm install...
    npm install -g npm
    npm install
  )

)

::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
goto end

:ExecuteCmd
setlocal
set _CMD_=%*
call %_CMD_%
if "%ERRORLEVEL%" NEQ "0" echo Failed exitCode=%ERRORLEVEL%, command=%_CMD_%
exit /b %ERRORLEVEL%

:error
endlocal
echo An error has occurred during web site deployment.
call :exitSetErrorLevel
call :exitFromFunction 2>nul

:exitSetErrorLevel
exit /b 1

:exitFromFunction
()

:end
endlocal
echo Finished successfully.





:: Navigate to the deployment directory
::cd /d "%DEPLOYMENT_TARGET%"

::ECHO "%DEPLOYMENT_TARGET%"

:: Ensure that all dependencies are updated
::ECHO Updating Node.js modules...

:: Use npm install or npm ci to install modules
:: npm install installs and updates modules based on package.json
:: npm ci installs modules with a clean install based on package-lock.json

::IF EXIST package-lock.json (
::   ECHO Using npm ci for a clean install...
::    npm ci
::) ELSE (
::    ECHO Using npm install...
::    npm install -g npm
::    npm install
::)

:: Add any additional deployment steps here if needed

:: Exit script
::EXIT /B 0


::@echo off

:: DEPLOYMENT_SOURCE=C:\home
:: C:\home\site\wwwroot

:: Proceed with the standard Azure App Service deployment
::echo Running the standard Azure App Service deployment script...
::IF EXIST "%DEPLOYMENT_TARGET%\deploy.cmd" (
::    call "%DEPLOYMENT_TARGET%\deploy.cmd"
::) ELSE (
::   echo Default deployment script not found. Skipping...
::)

:: Install npm packages
::echo Installing npm packages...
::cd "%DEPLOYMENT_TARGET%"
::echo "%DEPLOYMENT_TARGET%"
::npm install
::npm install --force
:: Update npm
::echo Updating npm to the latest version...
::npm install -g npm