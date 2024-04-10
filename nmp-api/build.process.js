// eslint-disable-next-line @typescript-eslint/no-var-requires
const shell = require('shelljs');
shell.cp('web.config', 'dist');
shell.cp('package.json', 'dist');
shell.cp('scripts/install.ps1', 'dist');
shell.cp('scripts/uninstall.ps1', 'dist');
shell.cp('scripts/deploy.bat', 'dist');
shell.cp('scripts/.deployment', 'dist');
