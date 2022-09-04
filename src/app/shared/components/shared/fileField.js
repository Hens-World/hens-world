angular.module('app').component('fileField', {
  templateUrl: myLocalized.partials + 'fileField.html',
  bindings: {
    label: "@",
    placeholder: "@",
    value: "=",
    field: "@",
    required: '<'
  },
  controllerAs: 'fileCtrl',
  controller: [
    '$scope', '$element', 'formFactory', function ($scope, $element, formFactory) {

      this.onFileDrop = (event) => {
        event.preventDefault();
        if (event.dataTransfer.items) {
          if (event.dataTransfer.items[0].kind === 'file') {
            this.value = event.dataTransfer.items[0].getAsFile();
          }
        } else {
          this.value = event.dataTransfer.files[0];
        }
      };

      this.onFileChange = (e) => {
        this.value = this.inputElement.files[0];
      };

      this.$onInit = () => {
        this.dragDropZone = $element[0].querySelector('.drag-drop-zone');
        this.dragDropZone.addEventListener('drop', this.onFileDrop);
        ['drag', 'dragstart', 'dragend', 'dragover', 'dragenter', 'dragleave', 'drop'].forEach(eventName => {
          this.dragDropZone.addEventListener(eventName, (e) => {
            if (e.type == "dragenter") {
              this.dragDropZone.classList.add('dragging');
            } else if (e.type == "dragleave" || e.type === "drop") {
              this.dragDropZone.classList.remove('dragging');
            }
            e.preventDefault();
            e.stopPropagation();
          });
        });
        this.dragDropZone.addEventListener('dropover', (e) => {
          e.preventDefault();
        });

        this.inputElement = $element[0].querySelector('input[type="file"]');
        this.error = {
          type: null,
          message: null
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

        this.selectFile = () => {
          this.inputElement.click();
        };

        formFactory.addForm(this);
      };
    }
  ]
}).directive("selectNgFiles", function () {
  return {
    require: "ngModel",
    link: function postLink(scope, elem, attrs, ngModel) {
      elem.on("change", function (e) {
        var files = elem[0].files;
        ngModel.$setViewValue(files[0]);
      })
    }
  }
});