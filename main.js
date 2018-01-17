const electron = require('electron');
const url = require('url');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');
const qrcode = require('qrcode-generator');

const {app, BrowserWindow, Menu, dialog, ipcMain} = electron;

let mainWindow;

app.on('ready', function() {
  mainWindow = new BrowserWindow({width: 600, height: 700, maximizable: false, resizable: false});

  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'main.html'),
    protocol: 'file:',
    slashes: true
  }));

  mainWindow.on('closed', function() { app.quit(); });

  const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
  Menu.setApplicationMenu(mainMenu);
});

function openFile() {
  dialog.showOpenDialog({properties: ['openFile', 'multiSelections']}, function(filenames) {
    if (filenames === undefined) return;

    fs.readFile(filenames[0], 'utf-8', function(err, data) {
      mainWindow.webContents.send('display:file', data);
      //document.getElementById("inputData").value = data;
    });
  });
}

ipcMain.on('password:mismatch', function(e) {
  dialog.showErrorBox("Password mismatch", "Passwords do not match, please enter the same password into both fields");
});

ipcMain.on('encrypt:data', function(e, inputData, password) {
  const cipher = crypto.createCipher('aes256', password);
  let encrypted = cipher.update(inputData, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const size = encrypted.length
  var qrSize = 40;

  if (size <= 7) qrSize = 1;
  else if (size <= 14) qrSize = 2;
  else if (size <= 24) qrSize = 3;
  else if (size <= 34) qrSize = 4;
  else if (size <= 44) qrSize = 5;
  else if (size <= 58) qrSize = 6;
  else if (size <= 64) qrSize = 7;
  else if (size <= 84) qrSize = 8;
  else if (size <= 98) qrSize = 9;
  else if (size <= 119) qrSize = 10;
  else if (size <= 137) qrSize = 11;
  else if (size <= 155) qrSize = 12;
  else if (size <= 177) qrSize = 13;
  else if (size <= 194) qrSize = 14;
  else if (size <= 220) qrSize = 15;
  else if (size <= 250) qrSize = 16;
  else if (size <= 280) qrSize = 17;
  else if (size <= 310) qrSize = 18;
  else if (size <= 338) qrSize = 19;
  else if (size <= 382) qrSize = 20;
  else if (size <= 403) qrSize = 21;
  else if (size <= 439) qrSize = 22;
  else if (size <= 461) qrSize = 23;
  else if (size <= 511) qrSize = 24;
  else if (size <= 535) qrSize = 25;
  else if (size <= 593) qrSize = 26;
  else if (size <= 625) qrSize = 27;
  else if (size <= 658) qrSize = 28;
  else if (size <= 698) qrSize = 29;
  else if (size <= 742) qrSize = 30;
  else if (size <= 790) qrSize = 31;
  else if (size <= 842) qrSize = 32;
  else if (size <= 898) qrSize = 33;
  else if (size <= 958) qrSize = 34;
  else if (size <= 983) qrSize = 35;
  else if (size <= 1051) qrSize = 36;
  else if (size <= 1093) qrSize = 37;
  else if (size <= 1139) qrSize = 38;
  else if (size <= 1219) qrSize = 39;
  //else if (size <= 1273) qrSize = 40;

  console.log("qrVersion: " + qrSize + '\nstring size: ' + size);

  const qr = qrcode(qrSize, 'H');
  qr.addData(encrypted.toUpperCase());
  qr.make();

  mainWindow.webContents.send('display:encrypted', encrypted.toUpperCase(), qr.createImgTag(4));
});

ipcMain.on('decrypt:data', function(e, inputData, password) {
  const cipher = crypto.createDecipher('aes256', password);
  let decrypted = cipher.update(inputData, 'hex', 'utf8');
  decrypted += cipher.final('utf8');
  mainWindow.webContents.send('display:decrypted', decrypted);
});

const mainMenuTemplate = [
  {
    label: 'File',
    submenu: [
      {
        label: 'Open File',
        accelerator: process.platform == 'darwin' ? 'Command+O' : 'Ctrl+O',
        click() { openFile(); }
      },
      {
        label: 'Quit',
        accelerator: process.platform == "darwin" ? 'Command+Q' : 'Ctrl+Q',
        click() { app.quit(); }
      }
    ]
  }
];

if (process.platform == 'darwin') { mainMenuTemplate.unshift({}); }

if (process.env.NODE_ENV !== 'production') {
  mainMenuTemplate.push({
    label: 'Developer',
    submenu: [{
      label: 'Toggle DevTools',
      accelerator: process.platform == 'darwin' ? 'Command+I' : 'Ctrl+I',
      click(item, focusedWindow) { focusedWindow.toggleDevTools(); }
    },
    { role: 'reload' }]
  });
}
