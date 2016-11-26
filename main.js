const electron = require('electron');
const {app, BrowserWindow} = electron;
const {shell} = electron;
const {ipcMain} = require('electron');

app.on("ready",()=>{
  let win = new BrowserWindow({
    width:910,
    height:655,
    //transparent: true,
    resizable:true,
    maximizable:true,
    //thickFrame:false
  });
  win.loadURL("file://" + __dirname + "/index.html");
  let child = new BrowserWindow({
    parent: win,
    modal: true,
    show: false,
    width:350,
    height:350,
    frame: false,
    resizable: false,
  });
  child.loadURL("file://" + __dirname + "/set-password.html");

  exports.showSetPassword = () => {
    child.show();
  }

  exports.openFile = (filePath) => {
    shell.openItem(filePath);
  }

  ipcMain.on('hide-set-password', (event, arg) => {
    child.hide();
  })

});
