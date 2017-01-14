Vue.component("my-category", {
  props:['category','catIndex','index','isEdit'],
  template:
  `<li @click="setCatIndex(index)" @dblclick="isEditCatName = isEdit ? true:false" 
    v-bind:draggable="isEdit" v-bind:class="{'active': catIndex == index}" tabindex="-1">
    <span v-text="category.categoryName" draggable="false"></span>
    <input class="cat-name-input" v-model="category.categoryName" v-if="isEdit&&isEditCatName&&catIndex==index"
    @keydown="updateCatName" @focusout="updateCatName" v-focus-on-display draggable="false" ondragstart="return false;">
  </li>`,
  data: function() {
    return {
      isEditCatName:false,
      keys:[]
    }
  },
  methods: {
    setCatIndex : function(index) {
      this.$emit('cat-index-selected',index);
    },
    /*handleKeyEvent: function(ev) {
      this.keys[ev.keyCode] = true;
      if(this.isEdit) {
        if(this.keys[17]&&this.keys[46]) { //ctr+del - delete category
          this.$emit('cat-delete');
          this.keys=[];
        }
      }
      setTimeout(function() {
        this.keys=[];
      },500);
    },
    resetKeys: function() {
      this.keys = [];
    },*/
    updateCatName: function(ev) {
      ev.stopPropagation();
      if(ev.type == "focusout") {
        this.isEditCatName = false;
        //this.$emit('update-cat-name',this.categoryName);
      } else if(ev.keyCode==13) {
        this.isEditCatName = false;
        //this.$emit('update-cat-name',this.categoryName);
      }
    }
  }
});
