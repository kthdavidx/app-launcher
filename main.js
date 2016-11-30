const electron = require('electron');
const {app, BrowserWindow} = electron;
const {shell} = electron;
const {ipcMain} = require('electron');


app.on("ready",()=>{

  let win = new BrowserWindow({
    width:1016,
    height:638,
    //transparent: true,
    resizable:false,
    maximizable:false,
    show:false,
    title: 'App Launcher'
    //thickFrame:false
  });
  //win.setMenu(null);
  win.loadURL("file://" + __dirname + "/index.html");
  win.once('ready-to-show', () => {
    win.show()
  })
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
    return shell.openItem(filePath);
  }

  ipcMain.on('hide-set-password', (event, arg) => {
    child.hide();
  })

});
