Vue.component('my-app', {
  props:['app','index','appIndex','viewMode','isEdit'],
  template:
  `<div class="app-container" tabindex="-1" v-bind:draggable="isEdit" @dblclick="openApp(app)" @click="setAppIndex(index,$event)" v-bind:class="{'focus':appIndex==index}">
    <div class="img-container" draggable="false">
      <img v-bind:src="app.iconPath" alt="not found" draggable="false" v-show="viewMode=='sml'&&app.iconPath">
      <img v-bind:src="app.imagePath" alt="not found" draggable="false" v-show="viewMode!='sml'||!app.iconPath">
    </div>
    <div class="app-name" draggable="false" v-show="!isEdit||!isEditAppName||appIndex != index">
      <p v-text="app.appName" draggable="false" @click.self="isEditAppName = isEdit ? true:false">
      </p>
    </div>
    <textarea v-text="app.appName" class="app-text" rows="1" v-model="app.appName" v-add-autosize v-if="isEdit&&isEditAppName&&appIndex == index" @keydown="changeAppName" @focusout="changeAppName"></textarea>
  </div>`,
  data: function() {
    return {
      isEditAppName:false,
    }
  },
  methods: {
    setAppIndex: function(index,ev) {
      this.$emit('set-app-index',index, ev);
    },
    openApp: function(app) {
      this.$emit('open-app',app);
    },
    changeAppName: function(ev) {
      if(ev.type=="focusout") {
        this.isEditAppName = false;
      } else if(ev.keyCode==13) {
        this.isEditAppName = false;
      }
      ev.stopPropagation();
    }
  },
  created: function() {
    /*if(this.viewMode=='sml' && this.app.hasOwnProperty('iconPath')) {
      this.app.image = this.app.iconPath;
    } else {
      this.app.image = this.app.imagePath;
    }*/
  },
  watch: {
    /*viewMode: function() {
      if(this.viewMode=='sml' && this.app.hasOwnProperty('iconPath')) {
        this.app.image = this.app.iconPath;
      } else {
        this.app.image = this.app.imagePath;
      }
    }*/
  },
  computed: {
    /*isShowIcon: function() {
      if(this.viewMode=='sml' && this.app.hasOwnProperty('iconPath')) {
        return true;
      } else {
        return false;
      }
    }*/
  }
});
