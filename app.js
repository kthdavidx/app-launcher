var _ = require('lodash');
let appCategories = [
  {
    categoryName:"All apps",
    apps:[
      {
        imagePath:"images/Garena_128px_555222_easyicon.net.ico",
        appName: "Lorem ipsum dolor sit amet, consectetua",
        appPath:"",
      },
      {
        imagePath:"images/Garena_128px_555222_easyicon.net.ico",
        appName: "ipsum dolor",
        appPath:""
      },
      {
        imagePath:"images/Garena_128px_555222_easyicon.net.ico",
        appName: "sit Amet",
        appPath:""
      },
      {
        imagePath:"images/Garena_128px_555222_easyicon.net.ico",
        appName: "Kigwa way ayo",
        appPath:""
      }
    ],
  },
  {
    categoryName:"Online games",
    apps:[
      {
        imagePath:"images/Garena_128px_555222_easyicon.net.ico",
        appName: "VLC",
        appPath:""
      },
      {
        imagePath:"images/Garena_128px_555222_easyicon.net.ico",
        appName: "VLC",
        appPath:""
      },
      {
        imagePath:"images/Garena_128px_555222_easyicon.net.ico",
        appName: "VLC",
        appPath:""
      },
      {
        imagePath:"images/Garena_128px_555222_easyicon.net.ico",
        appName: "VLC",
        appPath:""
      }
    ],
  },
  {
    categoryName:"Offline games",
    apps:[
      {
        imagePath:"http://imgc.allpostersimages.com/images/P-473-488-90/86/8630/IP9M300Z/posters/call-of-duty-black-ops-zombie-video-game-poster.jpg",
        appName: "VLC",
        appPath:""
      },
      {
        imagePath:"images/Garena_128px_555222_easyicon.net.ico",
        appName: "VLC",
        appPath:""
      },
      {
        imagePath:"images/Garena_128px_555222_easyicon.net.ico",
        appName: "VLC",
        appPath:""
      },
      {
        imagePath:"images/Garena_128px_555222_easyicon.net.ico",
        appName: "VLC",
        appPath:""
      }
    ]
  }
];
let scrollDist = 400;
let keys = [];

let app = new Vue({
  el:'#app',
  data:{
    appCategories:appCategories,
    selectedCat : appCategories[0],
    selectedApp : {},
    scrollStyle: {marginTop:"0px"},
    searchInput: "",
    allApps : []
  },
  methods: {
    setSelectedCat: function(category) {
      this.selectedCat = category;
      this.scrollStyle.marginTop = "0px";
      this.searchInput = '';
      this.allApps = [];
    },
    pageUp: function() {
      let val = parseInt(this.scrollStyle.marginTop);
      console.count("page up");
      this.scrollStyle.marginTop = (val + scrollDist)+"px";
    },
    pageDown: function() {
      let val = parseInt(this.scrollStyle.marginTop);
      this.scrollStyle.marginTop = (val - scrollDist)+"px";
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
      console.log(this.allApps);
    },
    searchHandleKeyEvent: function(app, ev) {
      keys[ev.keyCode] = true;
      if(keys[17]&&keys[46]) { //ctr+del delete
        this.appCategories[app.catIndex].apps.splice(app.appIndex,1);
        this.allApps = [];
        this.getAllApps();
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

    },

    clearAllApps : function() {
      this.allApps=[];
    },
    appHandleKeyEvent: function(list, index, ev) {
      keys[ev.keyCode] = true;
      if(keys[18]&&keys[73]) { //alt+i - change app icon
        let file = document.createElement("INPUT");
        file.setAttribute("type", "file");
        file.setAttribute("accept","image/*");
        file.click();
        file.onchange = function(ev) {
          list[index].imagePath = this.files[0].path;
        }
        keys = [];
      }

      if(keys[17]&&keys[46]) { //ctr+del delete
        list.splice(index,1);
        keys = [];
      }
    },
    resetKeys: function() {
      keys = [];
    },
    openFileDialog : function(list,ind) {
      let files = document.createElement("INPUT");
      files.setAttribute("type", "file");
      //files.setAttribute("accept","application/octet-stream");
      files.setAttribute("multiple", true);
      files.click();
      files.onchange = function(ev) {
        let l = this.files.length;
        for(let i=0; i<l; i++) {
          let app = {
            imagePath:this.files[i].path,
            appName:this.files[i].name,
            appPath:this.files[i].path
          };
          list[ind].apps.unshift(app);
        }
        console.log(this.files);
      }
    },
    catHandleKeyEvent: function(list, index, ev) {
      keys[ev.keyCode] = true;
      if(keys[18]&&keys[65]) { //alt+a - add application
        this.openFileDialog(list,index);
        keys = [];
      }
      if(keys[17]&&keys[46]) { //ctr+del - delete
        list.splice(index,1);
        keys = [];
      }
    },
    mainHandleKeyEvent: function(ev) {
      keys[ev.keyCode] = true;
      if(keys[18]&&keys[67]) { //alt+c - add category
        this.appCategories.push({
          categoryName:'New category',
          apps:[]
        });
        this.selectedCat = this.appCategories[this.appCategories.length-1];
        keys = [];
      }
    }
  },
  computed : {
    filterSearch: function() {
      let allApps = this.allApps;
      let ar = [];
      let l = allApps.length;
      for(let i=0;i<l;i++) {
        if(allApps[i].appName.toLowerCase().search(this.searchInput.toLowerCase()) !== -1) {
          ar.push(allApps[i]);
        }
      }
      return ar;
    }
  }
});
