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
Vue.directive('drag-n-sort', {
  bind : function(el, binding) {

    let setDragNsort = function() {
      el.ondrop = function(ev) {
        let group = ev.dataTransfer.getData("group");
        console.log(group);
        if(binding.value.group == group) {
          ev.preventDefault();
          let dropIndex = ev.dataTransfer.getData("text");
          let selfIndex = this.dataset.index;
          let copy = binding.value.list[dropIndex];
          binding.value.list.splice(dropIndex,1);
          binding.value.list.splice(selfIndex,0,copy);
        }
      }
      el.ondragover = function(ev) {
        ev.preventDefault();
      }
      el.ondragstart = function(ev) {
          let index = ev.target.getAttribute("data-index");
          ev.dataTransfer.setData("text", index);
          ev.dataTransfer.setData("group", binding.value.group);
      }
      el.setAttribute("draggable", "true");
    }

    el.setAttribute("data-index", binding.value.index);
    if(binding.value.hasOwnProperty("exclude")) {
      if(el.dataset.index != binding.value.exclude) {
        setDragNsort();
      } else {
        el.setAttribute('draggable', 'false');
        el.ondrop = function(ev) {
          return false;
        }
      }
    } else {
      setDragNsort();
    }

  }
});
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
      if(this.searchInput == "") {
        let self = this;
        self.appCategories.forEach(function(v,k) {
          self.allApps = self.allApps.concat(v.apps);
        });
      }
      console.log(self.allApps);
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
          list[ind].apps.push(app);
        }
        console.log(this.files);
      }
    },
    handleKeyEvent: function(list, index, ev) {
      keys[ev.keyCode] = true;
      if(keys[18]&&keys[65]) { //alt+a - add application
        this.openFileDialog(list,index);
        keys = [];
      }
      if(keys[17]&&keys[46]) { //ctr+del - delete
        list.splice(index,1);
        keys = [];
      }
    }
  },
  computed : {
    filterSearch: function() {
      let ar = [];
      let l = this.allApps.length;
      for(let i=0;i<l;i++) {
        if(this.allApps[i].appName.toLowerCase().search(this.searchInput.toLowerCase()) !== -1) {
          ar.push(this.allApps[i]);
        }
      }
      return ar;
    }
  }
});
