Vue.directive('add-autosize', {
  bind : function(el) {
    autosize(el);
  },
  inserted : function(el) {
    el.focus();
    autosize.update(el);
  }
});
