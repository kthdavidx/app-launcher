Vue.component("search-apps", {
  props:['app','appCategories','appIndex','index','viewMode','isEdit'],
  template:
    `<div class="app-container" tabindex="-1" v-bind:class="{'focus':appIndex==index}" @click="setAppIndex(index,$event)" @dblclick="openApp(app)" draggable="false">
      <div class="img-container" v-bind:title="appCategories[app.catIndex].categoryName+'-'+appCategories[app.catIndex].apps[app.appIndex].appName" draggable="false">
        <img v-bind:src="app.iconPath" alt="not found" draggable="false" v-if="viewMode=='sml'&&app.iconPath">
        <img v-bind:src="app.imagePath" alt="not found" draggable="false" v-else>
      </div>
      <div class="app-name" draggable="false" v-show="!isEdit||!isEditAppName||appIndex != index" draggable="false">
        <p v-text="app.appName" @click.self="isEditAppName = isEdit ? true:false" draggable="false">
        </p>
      </div>
      <textarea v-text="app.appName" class="app-text" rows="1" v-add-autosize v-if="isEdit&&isEditAppName&&appIndex == index" @keydown="changeAppName(app,$event)" @focusout="changeAppName(app,$event)" draggable="false">
      </textarea>
    </div>`,
  data: function() {
    return {
      isEditAppName:false
    }
  },
  methods: {
    setAppIndex: function(index,ev) {
      this.$emit('set-app-index',index, ev);
    },
    openApp: function(app) {
      this.$emit('open-app',app);
    },
    changeAppName: function(app,ev) {
      if(ev.type=="focusout") {
        //app.appName = ev.target.value;
        this.isEditAppName = false;
        this.$emit('change-app-name',ev.target.value, app.catIndex, app.appIndex);
      } else if(ev.keyCode==13) {
        //app.appName = ev.target.value;
        this.isEditAppName = false;
        this.$emit('change-app-name',ev.target.value, app.catIndex, app.appIndex);
      }
      ev.stopPropagation();
    }
  }
});
