"use-strict";
require("./directives/add-autosize.js")
var _ = require('lodash');
const {remote} = require('electron');
const {ipcRenderer} = require('electron');
const main = remote.require("./main.js");
const storage = require('electron-json-storage');
//let appData = require("./app-data.js");
let catSound = new Audio("audio/click.wav");
let appSound = new Audio("audio/app.wav");
let openSound = new Audio("audio/open.mp3");
let lastCatId = 0;
let lastAppId = 0;
let scrollDist = 400;
let keys = [];
let appsLength = 0;
var timeout;

let app = new Vue({
  el:'#app',
  data:{
    appCategories:null,
    appIndex:null,
    catIndex:0,
    scrollStyle: {marginTop:"0px"},
    searchInput: "",
    allApps : [],
    searchApps:[],
    isInputPass: false,
    isEdit : false,
    isShowPageDown : false,
    isShowPageUp : false,
    pageNum : 1,
    password:"",
    viewMode:'',
    pageItems:12,
    rowItems:6,
    announcements:[],
    announceIndex:0,
    isShowAnnounce:false
  },
  methods: {
    setCatIndex: function(index,res) {
      if(res=='reset' || this.catIndex !== index) {
        console.log(index);
        this.catIndex = index;
        this.searchInput = '';
        this.allApps = [];
        appsLength = this.appCategories[this.catIndex].apps.length;
        this.resetPage();
      }
      //this.editable(ev);
      catSound.cloneNode(false).play();
      //console.log(this.appCategories);
    },

    setView: function(vm, pgItems, rwItems) {
      this.viewMode = vm;
      this.pageItems = pgItems;
      this.rowItems = rwItems;
      this.resetPage();
      //if(this.catIndex!==null) this.setCatIndex(this.catIndex,'reset');
      if(vm = 'med')
        scrollDist = 399;
      else
        scrollDist = 400;
    },
    setAppIndex : function(ind,ev) {
      this.appIndex = ind;
      appSound.cloneNode(false).play();
      ev.stopPropagation();
    },
    pageUp: function() {
      if(this.isShowPageUp) {
        this.pageNum--;
        this.isShowPageDown = true;
        let val = parseInt(this.scrollStyle.marginTop);
        console.count("page up");
        this.scrollStyle.marginTop = (val + scrollDist)+"px";
        if(this.pageNum == 1) this.isShowPageUp = false;
      }
    },
    pageDown: function() {
      if(this.isShowPageDown) {
        this.pageNum++;
        this.isShowPageUp = true;
        let val = parseInt(this.scrollStyle.marginTop);
        this.scrollStyle.marginTop = (val - scrollDist)+"px";
        if((this.pageNum * this.pageItems) >= (appsLength)) {
          this.isShowPageDown = false;
        }
        console.log(this.scrollStyle.marginTop);
      }
    },
    scrollUp: _.throttle(function() {
      this.pageUp();
    }, 1000, { 'trailing': false }),

    scrollDown: _.throttle(function() {
      this.pageDown();
    }, 1000, { 'trailing': false }),

    getAllApps : function() {
      this.allApps = [];
      this.catIndex = null;
      let catLen = this.appCategories.length;
      for(let y=0;y<catLen;y++) {
        let appLen = this.appCategories[y].apps.length;
        let copyAr = this.appCategories[y].apps.slice(0);
        for(let x=0;x<appLen;x++) {
          copyAr[x].catIndex = y;
          copyAr[x].appIndex = x;
        }
        this.allApps = this.allApps.concat(copyAr);
      }
      //console.log(this.allApps);
    },
    clearAllApps : function() {
      this.allApps=[];
    },
    resetKeys: function(ev) {
      keys[ev.keyCode] = false;
      keys.splice(0);
      //console.log("keyup");
    },
    resetAllApps: function() {
      //this.clearAllApps();
      this.getAllApps();
    },
    openFileDialog : function() {
      let self = this;
      let fileInput = document.createElement("INPUT");
      fileInput.setAttribute("type", "file");
      //files.setAttribute("accept","application/octet-stream");
      fileInput.setAttribute("multiple", true);
      fileInput.click();
      fileInput.onchange = function(ev) {
        let files = ev.target.files;
        let l = files.length;
        for(let i=0; i<l; i++) {
          let name = files[i].name;
          let index = name.lastIndexOf(".");
          if(index !== -1) {
            name = files[i].name.slice(0, index);
          }
          lastAppId++;
          let app = {
            imagePath:"images/default.png",
            appName:name,
            appPath:files[i].path,
            id:lastAppId
          };

          self.appCategories[self.catIndex].apps.unshift(app);
        }
        appsLength = self.appCategories[self.catIndex].apps.length;
        if(appsLength > self.pageNum*this.pageItems) {
          self.isShowPageDown = true;
        }
        console.log(files);
      }
    },
    deleteCategory: function() {
      this.appCategories.splice(this.catIndex,1);
    },
    moveCatIndex: function(move) {
      if(move>0) {
        if(this.catIndex < (this.appCategories.length-1))
          this.setCatIndex(this.catIndex+move);
      } else if(move<0) {
        if(this.catIndex>0) this.setCatIndex(this.catIndex + move);
      }
    },
    moveAppIndex: function(move) {
      if(move<0) {
        if((this.appIndex+move) >= 0 ) {
          this.appIndex += move;
        } else {
          this.appIndex = 0;
        }
        if(this.appIndex < ((this.pageNum*this.pageItems)-this.pageItems)) {
          this.pageUp();
        }
      } else if(move>0) {
        if((this.appIndex+move) < appsLength)
          this.appIndex += move;
        else
          this.appIndex = appsLength - 1;
        if(this.appIndex > ((this.pageNum*this.pageItems)-1))
          this.pageDown();
      }
      appSound.cloneNode(false).play();
    },
    mainHandleKeyEvent: function(ev) {
      keys[ev.keyCode] = true;
      if(this.isEdit) {
        if(keys[17]&&keys[83]) { //ctrl+s - save data
          storage.set('app-launcher-data', {
            categories:this.appCategories,
            lastAppId:lastAppId,
            lastCatId:lastCatId,
            announcements:this.announcements
          },
          function(error) {
            if (error)
              ipcRenderer.send("open-error-dialog",error);
            else {
              ipcRenderer.send("open-information-dialog","Changes is successfully save!",['Ok']);
              //alert("Changes is successfully save!")
            }
          });
          keys = [];
        }
        if(this.appIndex!==null) {
          if(keys[18]&&keys[73]) { //alt+i - change app icon
            let self = this;
            let file = document.createElement("INPUT");
            file.setAttribute("type", "file");
            file.setAttribute("accept","image/*");
            file.click();
            file.onchange = function(ev) {
              if(self.catIndex===null && self.searchApps.length) {
                let searchApp = self.searchApps[self.appIndex];
                if(self.viewMode=="sml") {
                  //self.appCategories[searchApp.catIndex].apps[searchApp.appIndex].iconPath = this.files[0].path;
                  searchApp.iconPath = this.files[0].path;
                } else {
                  //self.appCategories[searchApp.catIndex].apps[searchApp.appIndex].imagePath = this.files[0].path;
                  searchApp.imagePath = this.files[0].path;
                }
                //searchApp.imagePath = this.files[0].path;
              } else {
                if(self.viewMode=="sml")
                  self.appCategories[self.catIndex].apps[self.appIndex].iconPath = this.files[0].path;
                else
                  self.appCategories[self.catIndex].apps[self.appIndex].imagePath = this.files[0].path;
              }
              document.getElementById('app').click();
            }
            keys = [];
          }
        }
        if(keys[17]&&keys[46]) { //ctr+del delete
          if(this.appIndex!==null) {
            if(this.catIndex===null && this.searchApps.length) {
              let searchApp = this.searchApps[this.appIndex];
              this.deleteApp(searchApp.catIndex,searchApp.appIndex);
              this.getAllApps();
              this.searchApps.splice(this.appIndex,1);
            } else {
              this.deleteApp(this.catIndex,this.appIndex);
            }
          } else if(this.catIndex!==null){
            let msg = 'Warning! Deleting "'+this.appCategories[this.catIndex].categoryName+'" will delete all application inside this category. Are you sure you want to delete this category?';
            ipcRenderer.send('open-information-dialog', msg,["No","Yes"],"warning");
            //this.appCategories.splice(this.catIndex,1);
          }
          keys = [];
        }

        if(keys[18]&&keys[67]) { //alt+c - add category
          lastCatId++;
          this.appCategories.push({
            categoryName:'New category',
            apps:[],
            id:lastCatId
          });
          this.catIndex = this.appCategories.length-1;
          keys = [];
        }

        if(keys[18]&&keys[65]) { //alt+a - add application
          this.openFileDialog();
          keys.splice(0);
        }
        if(keys[17]&&keys[16]&&keys[80]) {
          main.showSetPassword();
          keys = [];
        }
      }
      if(keys[17]&&keys[16]&&keys[69]) { //ctrl+shift+e
        if(this.isEdit) {
          this.isEdit = !this.isEdit; //toggle edit mode
          ipcRenderer.send("open-information-dialog","Edit Mode deactivated!",['Ok']);
          //alert("Edit Mode deactivated!");
        } else {
          this.toggleInputPass(); //toggle show password
        }
        keys = [];
      }
      if(this.appIndex!==null) {
        if(ev.keyCode==37) { //arrow left
          if(this.appIndex===0) {
            this.appIndex = null;
            document.getElementById('app').focus();
            if(this.catIndex==null) {
              this.setCatIndex(0);
            }
          } else
            this.moveAppIndex(-1);
        } else if (ev.keyCode==39) {//arrow right
          this.moveAppIndex(1);
        } else if (ev.keyCode==40) {//arrow down
          this.moveAppIndex(this.rowItems);
        } else if (ev.keyCode==38) {//arrow up
          this.moveAppIndex(-this.rowItems);
        } else if (ev.keyCode==13) {// key enter
          if(this.catIndex !== null) {
            /*if(main.openFile(this.appCategories[this.catIndex].apps[this.appIndex].appPath))
              openSound.play();
            else
              ipcRenderer.send("open-error-dialog","Cannot open file!");*/
            this.openApp(this.appCategories[this.catIndex].apps[this.appIndex]);
          } else {
            if(this.searchApps[this.appIndex]) {
              /*if(main.openFile(this.searchApps[this.appIndex].appPath))
                openSound.play();
              else
                ipcRenderer.send("open-error-dialog","Cannot open file!");
                //alert("Cannot open file!");*/
              this.openApp(this.searchApps[this.appIndex]);
            }
          }
        }
        ev.stopPropagation();
      } else {
        if(ev.keyCode==39) {//arrow right
          if(this.catIndex==null&&appsLength)
            this.appIndex = 0;
          else
            this.appIndex = this.appCategories[this.catIndex].apps.length ? 0 : null;
        } else if (ev.keyCode==40) {//arrow down
          this.moveCatIndex(1)
        } else if (ev.keyCode==38) {//arrow up
          this.moveCatIndex(-1);
        }
        ev.stopPropagation();
      }
      /*setTimeout(function() {
        keys = [];
      },500);*/
    },
    mouseWheelEvent: function(ev) {
      console.log(ev);
      if(ev.deltaY>0) {
        this.pageDown();
      } else {
        this.pageUp();
      }
    },
    toggleInputPass : function() {
      this.isInputPass = !this.isInputPass;
      this.password = "";
    },
    enterEditMode: function(ev) {
      let pass = localStorage.getItem("password");
      if (pass === this.password) {
        ipcRenderer.send("open-information-dialog","Edit Mode Activated!",["Ok"]);
        this.isEdit = true;
      } else if(pass !== null) {
        ipcRenderer.send("open-information-dialog","Incorrect password",["Ok"]);
        this.toggleInputPass();
      } else {
        ipcRenderer.send("open-information-dialog","No password is set! Edit Mode Activated!",["Ok"]);
        this.isEdit = true;
      }
      ev.stopPropagation();
    },
    changeAppName: function(name,catIndex,appIndex) {
      this.appCategories[catIndex].apps[appIndex].appName = name;
    },
    deleteApp: function(catIndex, appIndex) {
      this.appCategories[catIndex].apps.splice(appIndex,1);
      appsLength--;
      if(appsLength<(appIndex+1)) {
        this.appIndex = null;
      }
      if((this.pageNum * this.pageItems) >= (appsLength)) {
        this.isShowPageDown = false;
      }
    },
    resetData: function() {
      this.appIndex = null;
      this.isEditAppName = false;
    },
    openApp: function(app) {
      main.openFile(app.appPath) ? openSound.play() : ipcRenderer.send("open-error-dialog","Cannot open file!");//alert("Cannot open file!");
    },
    addDragApps: function(ev) {
      ev.preventDefault();
      if(this.isEdit) {
        let files = ev.dataTransfer.files;
        let l = files.length;
        for(let i=0; i<l; i++) {
          let name = files[i].name;
          let index = name.lastIndexOf(".");
          if(index !== -1) {
            name = files[i].name.slice(0, index);
          }
          lastAppId++;
          let app = {
            imagePath:"images/default.png",
            appName:name,
            appPath:files[i].path,
            id:lastAppId
          };
          this.appCategories[this.catIndex].apps.unshift(app);
        }
        appsLength = this.appCategories[this.catIndex].apps.length;
        if(appsLength > this.pageNum*this.pageItems) {
          this.isShowPageDown = true;
        }
      }
    },
    resetPage: function() {
      this.scrollStyle = {marginTop:"0px"};
      this.pageNum = 1;
      this.isShowPageUp = false;
      this.appIndex = null;
      if((this.pageNum * this.pageItems) >= (appsLength)) {
        this.isShowPageDown = false;
      } else {
        this.isShowPageDown = true;
      }
      console.log(appsLength);
    },
    showSetAnnounce: function() {
      ipcRenderer.send('show-set-announce', this.announcements);
    },
    cycleAnnounce : function() {
      if(this.announcements.length>0) {
        if(this.isShowAnnounce) {
          this.isShowAnnounce = false;
          timeout = setTimeout(this.cycleAnnounce, 3000);
        } else {
          this.isShowAnnounce = true;
          timeout = setTimeout(this.cycleAnnounce, 7000);
          if( (this.announceIndex+1) === this.announcements.length)
            this.announceIndex = 0;
          else
            this.announceIndex++;
        }
      }
    }
  },
  watch : {
    searchInput: function() {
      //this.catIndex = null;
      let allApps = this.allApps;
      this.searchApps.splice(0);
      let l = allApps.length;
      if(this.searchInput) {
        for(let i=0;i<l;i++) {
          if(allApps[i].appName.toLowerCase().search(this.searchInput.toLowerCase()) !== -1) {
            this.searchApps.push(allApps[i]);
          }
        }
      }
      if(this.catIndex===null) { // if no category selected
        appsLength = this.searchApps.length;
        this.resetPage();
        console.log(appsLength);
        console.log('reset');
      }
      //return this.searchApps;
    }
  },
  created : function() {
    var self = this;
    setTimeout(this.cycleAnnounce, 2000);
  }
});
/*storage.get('app-launcher-data', function(er, data) {
  if(er)
    alert(er) ;
  else {
    if(Object.keys(data).length == 0 ) {
      console.log(data);
      app.appCategories = [
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
      ];
      lastAppId = 0;
      lastCatId = 6;
    } else {
      app.appCategories = data.categories;
      app.announcements = data.announcements||[];
      lastAppId = data.lastAppId;
      lastCatId = data.lastCatId;
    }
    //app.selectedCat = app.appCategories[0];
    if(app.appCategories.length) {//determine isShowPageDown;
      appsLength = app.appCategories[0].apps.length;
      if(app.appCategories[0].apps.length > app.pageItems) {
        app.isShowPageDown = true;
      }
    }
  }
});*/
ipcRenderer.on('apply-announcements',(event,arg) => {
  clearTimeout(timeout);
  app.announcements = arg;
  app.isShowAnnounce = true;
  app.cycleAnnounce();
  console.log(app.announcements);
});
ipcRenderer.on('send-app-data',(event,data) => {
  console.log(data);
  app.appCategories = data.categories;
  app.announcements = data.announcements||[];
  lastAppId = data.lastAppId;
  lastCatId = data.lastCatId;
  if(app.appCategories.length) {//determine isShowPageDown;
    appsLength = app.appCategories[0].apps.length;
    if(app.appCategories[0].apps.length > app.pageItems) {
      app.isShowPageDown = true;
    }
  }
});
ipcRenderer.on('information-dialog-selection', function (event, index) {
  if(index === 1)
    app.appCategories.splice(app.catIndex,1);
  document.getElementById('app').focus();
})
//document.onkeydown = function(ev) {
  //ev.preventDefault();
//}
