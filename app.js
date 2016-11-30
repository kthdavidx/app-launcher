require("./directives/add-autosize.js")
var _ = require('lodash');
const {remote} = require('electron');
const main = remote.require("./main.js");
const storage = require('electron-json-storage');
let lastCatId = 0;
let lastAppId = 0;
let scrollDist = 400;
let keys = [];
let appsLength = 0;
let app = new Vue({
  el:'#app',
  data:{
    appCategories:null,
    selectedCat :null,
    appIndex:null,
    catIndex:0,
    scrollStyle: {marginTop:"0px"},
    searchInput: "",
    allApps : [],
    searchApps:[],
    isInputPass: false,
    isEdit : false,
    isEditAppName:false,
    isShowPageDown : false,
    isShowPageUp : false,
    pageNum : 1,
    password:""
  },
  methods: {
    setCatIndex: function(index,res) {
      if(res=='reset' || this.catIndex !== index) {
        this.catIndex = index;
        this.searchInput = '';
        this.allApps = [];
        appsLength = this.appCategories[this.catIndex].apps.length;
        this.resetPage();
      }
      //this.editable(ev);
      console.log(this.catIndex);
    },
    setAppIndex : function(ind,ev) {
      this.appIndex = ind;
      console.log(this.appIndex);
      ev.stopPropagation();
    },
    pageUp: function() {
      this.pageNum--;
      this.isShowPageDown = true;
      let val = parseInt(this.scrollStyle.marginTop);
      console.count("page up");
      this.scrollStyle.marginTop = (val + scrollDist)+"px";
      if(this.pageNum == 1) this.isShowPageUp = false;
    },
    pageDown: function() {
      this.pageNum++;
      this.isShowPageUp = true;
      let val = parseInt(this.scrollStyle.marginTop);
      this.scrollStyle.marginTop = (val - scrollDist)+"px";
      if((this.pageNum * 12) >= (appsLength)) {
        this.isShowPageDown = false;
      }
      //console.log(e);
    },
    scrollUp: _.throttle(function() {
      this.pageUp();
    }, 1000, { 'trailing': false }),

    scrollDown: _.throttle(function() {
      this.pageDown();
    }, 1000, { 'trailing': false }),

    getAllApps : function() {
      if(this.allApps.length === 0) {
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
      }
      //console.log(this.allApps);
    },
    searchHandleKeyEvent: function(app, ev) {
      keys[ev.keyCode] = true;
      if(this.isEdit) {
        if(keys[17]&&keys[46]) { //ctr+del delete
          this.appCategories[app.catIndex].apps.splice(app.appIndex,1);
          this.allApps = [];
          this.getAllApps();
          appsLength--;
          keys = [];
        }

        if(keys[18]&&keys[73]) { //alt+i - change app icon
          let self = this;
          let file = document.createElement("INPUT");
          file.setAttribute("type", "file");
          file.setAttribute("accept","image/*");
          file.click();
          file.onchange = function(ev) {
            self.appCategories[app.catIndex].apps[app.appIndex].imagePath = this.files[0].path;
            self.allApps = [];
            self.getAllApps();
          }
          keys = [];
        }
      }
    },
    clearAllApps : function() {
      this.allApps=[];
    },
    appHandleKeyEvent: function(list, index, ev) {
      keys[ev.keyCode] = true;
      if(this.isEdit) {
        if(keys[18]&&keys[73]) { //alt+i - change app icon
          let file = document.createElement("INPUT");
          file.setAttribute("type", "file");
          file.setAttribute("accept","image/*");
          file.click();
          file.onchange = function(ev) {
            list[index].imagePath = this.files[0].path;
          }
        }
        if(keys[17]&&keys[46]) { //ctr+del delete app
          list.splice(index,1);
          appsLength--;
          if((this.pageNum * 12) >= (appsLength)) {
            this.isShowPageDown = false;
          }
        }
      }
    },
    resetKeys: function(ev) {
      keys[ev.keyCode] = false;
      keys.splice(0);
      //console.log("keyup");
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
        if(appsLength > self.pageNum*12) {
          self.isShowPageDown = true;
        }
        console.log(files);
      }
    },
    catHandleKeyEvent: function(list, index, ev) {
      keys[ev.keyCode] = true;
      if(this.isEdit) {
        if(keys[17]&&keys[46]) { //ctr+del - delete category
          list.splice(index,1);

          keys.splice(0);
        }
        if(ev.keyCode == 13) {
          ev.preventDefault();
          list[index].categoryName = ev.currentTarget.innerText;
          ev.target.setAttribute("contenteditable", "false");
          //ev.currentTarget.parentNode.parentNode.focus();
          keys.splice(0);
        }
      }
      //console.log(keys);
    },
    mainHandleKeyEvent: function(ev) {
      keys[ev.keyCode] = true;
      if(this.isEdit) {
        if(keys[17]&&keys[83]) { //ctrl+s - save data
          storage.set('app-launcher-data', {
            categories:this.appCategories,
            lastAppId:lastAppId,
            lastCatId:lastCatId
          },
          function(error) {
            if (error)
              alert(error);
            else {
              alert("Changes is successfully save!")
            }
          });
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
          alert("Edit Mode deactivated!");
        } else {
          this.toggleInputPass(); //toggle show password
        }
        keys = [];
      }
      if(this.appIndex!==null) {
        if(ev.keyCode==37) { //arrow left
          if(this.appIndex>0) {
            this.appIndex--;
            if(this.appIndex < ((this.pageNum*12)-12)) {
              this.pageUp();
            }
          } else {
            this.appIndex = null;
            if(this.catIndex==null) {
              this.setCatIndex(0);
            }
          }
        } else if (ev.keyCode==39) {//arrow right
          //console.log(appsLength);
          if(this.appIndex < (appsLength-1)) {
            this.appIndex++;
            if(this.appIndex > ((this.pageNum*12)-1)) {
              this.pageDown();
            }
          }
        } else if (ev.keyCode==40) {//arrow down
          if((this.appIndex+6) < appsLength)
            this.appIndex += 6;
          else
            this.appIndex = appsLength - 1;
          if(this.appIndex > ((this.pageNum*12)-1))
            this.pageDown();
        } else if (ev.keyCode==38) {//arrow up
          if(this.appIndex-6>=0)
            this.appIndex -= 6;
          else
            this.appIndex = 0;
          if(this.appIndex < ((this.pageNum*12)-12))
            this.pageUp();
        } else if (ev.keyCode==13) {
          if(this.catIndex !== null) {
            main.openFile(this.appCategories[this.catIndex].apps[this.appIndex].appPath) || alert("Cannot open file!");
          } else {
            if(this.searchApps[this.appIndex]) main.openFile(this.searchApps[this.appIndex].appPath) || alert("Cannot open file!");
          }
        }
        ev.stopPropagation();
      } else {
        if(ev.keyCode==39) {//arrow right
          if(this.catIndex==null&&appsLength)
            this.appIndex = 0;
          else
            this.appIndex = this.appCategories[this.catIndex].apps.length ? 0 : null;
        } else if (ev.keyCode==40) {
          if(this.catIndex < (this.appCategories.length-1)) {
            let ind = this.catIndex + 1;
            this.setCatIndex(ind);
          }
        } else if (ev.keyCode==38) {
          if(this.catIndex > 0) {
            this.setCatIndex(this.catIndex-1);
          }
        }
        ev.stopPropagation();
      }
      setTimeout(function() {
        keys = [];
      },500);
    },
    toggleInputPass : function() {
      this.isInputPass = !this.isInputPass;
      this.password = "";
    },
    enterEditMode: function(ev) {
      let pass = localStorage.getItem("password");
      if (pass === this.password) {
        alert("Edit Mode Activated!");
        this.isEdit = true;
      } else {
        alert("Incorrect password")
        this.toggleInputPass();
      }
      ev.stopPropagation();
    },
    updateAppName: function() {
      if (this.searchInput) { //update app from search
        //this.appCategories[app.catIndex].apps[app.appIndex].appName = ev.currentTarget.innerText;
        this.allApps = [];
        this.getAllApps();
        this.isEditAppName = false;
      } else {
        this.isEditAppName = false;
      }
      console.log("updateApp");
    },
    appUpdateEnter: function(ev) {
      if(ev.keyCode==13) {
        this.isEditAppName = false;
      }
      ev.stopPropagation();
    },
    updateCatName: function(cat,ev) {
      let name = ev.currentTarget.innerText
      if(name)
        cat.categoryName = name;
      else
        ev.currentTarget.innerText = cat.categoryName;
      ev.target.setAttribute("contenteditable", "false");
      console.log(cat.categoryName);
    },
    srchAppUpdate: function(app,ev) {
      if(ev.type=="focusout") {
        app.appName = ev.target.value;
        this.isEditAppName = false;
      } else if(ev.keyCode==13) {
        app.appName = ev.target.value;
        this.isEditAppName = false;
      }
      ev.stopPropagation();
    },
    setActive: function(ev) {
      //ev.currentTarget.parentNode.setAttribute("class", "app-name edit");
    },
    resetData: function() {
      this.appIndex = null;
      this.isEditAppName = false;
    },
    blurOnEnter: function(app,ev) {
      if(ev.keyCode == 13) {
        ev.preventDefault();
        app.appName = ev.currentTarget.innerText;
        ev.target.setAttribute("contenteditable", "false");
        //ev.currentTarget.parentNode.parentNode.focus();
      }
    },
    editable: function(ev) {
      if(this.isEdit) {
        ev.target.setAttribute("contenteditable", "true");
        ev.target.focus();
      }
    },
    openApp: function(app) {
      main.openFile(app.appPath) || alert("Cannot open file!");
    },
    resetPage: function() {
      this.scrollStyle = {marginTop:"0px"};
      this.pageNum = 1;
      this.isShowPageUp = false;
      this.appIndex = null;
      if((this.pageNum * 12) >= (appsLength)) {
        this.isShowPageDown = false;
      } else {
        this.isShowPageDown = true;
      }
    }
  },
  computed : {
    filterSearch: function() {
      this.catIndex = null;
      let allApps = this.allApps;
      this.searchApps = [];
      let l = allApps.length;
      for(let i=0;i<l;i++) {
        if(allApps[i].appName.toLowerCase().search(this.searchInput.toLowerCase()) !== -1) {
          this.searchApps.push(allApps[i]);
        }
      }
      appsLength = this.searchApps.length;
      this.resetPage();
      return this.searchApps;
    }
  }
});
storage.get('app-launcher-data', function(er, data) {
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
        },
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
      lastAppId = data.lastAppId;
      lastCatId = data.lastCatId;
    }
    //app.selectedCat = app.appCategories[0];
    if(app.appCategories.length) {
      appsLength = app.appCategories[0].apps.length;
      if(app.appCategories[0].apps.length > 12) {
        app.isShowPageDown = true;
      }
    }
  }
});

//document.onkeydown = function(ev) {
  //ev.preventDefault();
//}
