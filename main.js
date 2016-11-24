const electron = require('electron');
const {app, BrowserWindow} = electron;
const {shell} = electron;

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
});



exports.openFile = (filePath) => {
  shell.openItem(filePath);
}
