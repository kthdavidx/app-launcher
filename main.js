const electron = require('electron');
const fs = require('fs');
const {app, BrowserWindow} = electron;
const {shell} = electron;
const {ipcMain} = require('electron');
const storage = require('electron-json-storage');
const dialog = require('electron').dialog;

app.on('window-all-closed', function() {
  if (process.platform != 'darwin')
    app.quit();
});

app.on("ready",()=>{
  let win = new BrowserWindow({
    width:1016,
    height:638,//670
    //transparent: true,
    resizable:false,
    maximizable:false,
    show:false,
    title: 'G7 App Launcher',
    icon:__dirname + "/images/app.ico"
    //thickFrame:false
  });

  //win.setMenu(null);
  let fileBuffer = null;
  try {
    fileBuffer = fs.readFileSync('C:/Program Files/kigs.txt');
  } catch (e) {
    dialog.showErrorBox('Error!','You are not authorized to run this app!');
    app.quit();
  }

  if(fileBuffer)
    win.loadURL("file://" + __dirname + "/index.html");

  win.once('ready-to-show', () => {
    win.show();
    sendAppData(win);
  })

  let passwordWindow = new BrowserWindow({
    parent: win,
    modal: true,
    show: false,
    width:350,
    height:350,
    frame: false,
    resizable: false,
  });

  let announceWindow = new BrowserWindow({
    parent: win,
    modal: true,
    show: false,
    width:550,
    height:450,
    resizable: true,
    icon:__dirname + "/images/app.ico"
  });
  announceWindow.setMenu(null);
  passwordWindow.loadURL("file://" + __dirname + "/set-password.html");
  announceWindow.loadURL("file://" + __dirname + "/announcement.html");

  announceWindow.onbeforeunload = function(e) {
    console.log("hide");
    return false;
  }
  announceWindow.on('close', (e) => {

      /* the user only tried to close the window */
      console.log("hide");
      e.preventDefault();
      announceWindow.hide();
  });

  exports.showSetPassword = () => {
    passwordWindow.show();
  }

  exports.showSetAnnounce = () => {
    announceWindow.show();
  }

  exports.openFile = (filePath) => {
    return shell.openItem(filePath);
  }

  ipcMain.on('hide-set-password', (event, arg) => {
    passwordWindow.hide();
  })
  ipcMain.on('show-set-announce', (event, arg) => {
    console.log(arg);
    announceWindow.show();
    announceWindow.webContents.send('send-announcements',arg);
  })
  ipcMain.on('hide-set-announce', (event, arg) => {
    announceWindow.hide();
  })
  ipcMain.on('apply-announcements',(event, arg) => {
    announceWindow.hide();
    win.webContents.send('apply-announcements',arg);
  })
  ipcMain.on('open-error-dialog', function (event,msg) {
    dialog.showErrorBox('Error!',msg);
  })
  ipcMain.on('open-information-dialog', function (event,msg,btn,typ) {
    const options = {
      type: typ||'info',
      title: 'Information',
      message: msg,
      buttons: btn
    }
    dialog.showMessageBox(options, function (index) {
      event.sender.send('information-dialog-selection', index);
    })
  })
});

function sendAppData(win) {
  let appData;
  /*storage.get('app-launcher-data', function(er, data) {
    if(er)
      console.log(er) ;
    else {
      if(Object.keys(data).length == 0 ) {
        console.log(data);
        appData = {
          categories: [
            { categoryName:"Favorite apps", apps:[], id:1
                /*{
                  imagePath:"images/Garena_128px_555222_easyicon.net.ico",
                  appName: "Lorem ipsum dolor sit amet, consectetua",
                  appPath:"",
                }*/
            /*},
            { categoryName:"Online games",apps:[],id:2 },
            { categoryName:"Offline games",apps:[],id:3 },
            { categoryName:"Internet apps",apps:[],id:4 },
            { categoryName:"Office apps",apps:[],id:5 },
            { categoryName:"Movies",apps:[],id:6 }
          ],
          lastAppId : 0,
          lastCatId : 6,
          announcements:[]
        }
      }
      else appData = data;
      win.webContents.send('send-app-data',appData);
    }
  });*/
  let path = app.getPath('exe');
  path += "/../";
  fs.stat( path + 'config.json', function(err, stat) {
    if(err === null) {
      fs.readFile(path+'config.json', function (err, data) {
         if (err) {
            dialog.showErrorBox('Error!',"Error in config!");
         }
         appData = JSON.parse(data.toString());
         win.webContents.send('send-app-data',path,appData);
      });
    } else if(err.code == 'ENOENT') {
      appData = {
        categories: [
          { categoryName:"Favorite apps", apps:[], id:1},
          { categoryName:"Online games",apps:[],id:2 },
          { categoryName:"Offline games",apps:[],id:3 },
          { categoryName:"Internet apps",apps:[],id:4 },
          { categoryName:"Office apps",apps:[],id:5 },
          { categoryName:"Movies",apps:[],id:6 }
        ],
        lastAppId : 0,
        lastCatId : 6,
        announcements:[]
      }
    } else {
        dialog.showErrorBox('Error!',"Error in config!");
    }
    win.webContents.send('send-app-data',path,appData);
  });
}
