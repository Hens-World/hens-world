angular.module('app').component('switch', {
  templateUrl: myLocalized.partials + 'switch.html',
  bindings: {
    label: "@",
    value: '=',
    field: "@",
    required: '<',
    disabled: '<'
  },
  controllerAs: 'switchCtrl',
  controller: ['$scope', '$element', 'formFactory', function ($scope, $element, formFactory) {
    this.$onInit = () => {
      this.error = {
        type: null,
        message: null
      };
      //TODO switch logic

      this.clearError = () => {
        $element.removeClass('field--error');
        this.error = null;
      };
      this.setError = (error) => {
        $element.addClass('field--error');
        this.error = {
          message: error.message,
          type: 'error'
        }
      };
      formFactory.addForm(this);
    };

    this.toggleValue = () => {
      this.value = !this.value;
    };
  }]
});