angular.module('app').component('field', {
    templateUrl: myLocalized.partials + 'field.html',
    bindings: {
        label: "@",
        placeholder: "@",
        value: "=",
        type: "@",
        field: "@",
        required: '<',
        readonly: '<'
    },
    controllerAs: 'fieldCtrl',
    controller: ['$scope', '$element', 'formFactory', function ($scope, $element, formFactory) {
        this.$onInit = () => {
            this.error = {
                type: null,
                message: null
            };
            $element.addClass('field');
            this.typeToClass = {
                text: 'form',
                password: 'form',
                email: 'form'
            };
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
            setTimeout(() => {
                if (this.readonly) {
                    $element.get()[0].querySelector('input').setAttribute('readonly', 'true');
                }
            });
        };

        this.$onDestroy = () => {
            formFactory.removeForm(this);
        }
    }]
});