Vue.component("my-category", {
  props:['category','index'],
  template: `<li @click="setSelectedCat(category, $event)" tabindex="1" @keydown="catHandleKeyEvent(appCategories,index,$event)" @keyUp="resetKeys" @focusout="updateCatName(category,$event)">
    {{category.categoryName}}
  </li>`,
  data: function() {

  },
  methods: {
    handleKeyEvent : function(category) {
      this,$emit('catSelected',category);
    }
  }
});
