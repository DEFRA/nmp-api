@echo off

:: Install npm packages
echo Installing npm packages...
cd "%DEPLOYMENT_TARGET%"
npm install --force

:: Update npm
echo Updating npm to the latest version...
npm install -g npm

:: DEPLOYMENT_SOURCE=C:\home
:: C:\home\site\wwwroot

:: Proceed with the standard Azure App Service deployment
echo Running the standard Azure App Service deployment script...
IF EXIST "%DEPLOYMENT_TARGET%\deploy.cmd" (
    call "%DEPLOYMENT_TARGET%\deploy.cmd"
) ELSE (
    echo Default deployment script not found. Skipping...
)
