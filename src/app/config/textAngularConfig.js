/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
hensApp.config(function($provide) {
  $provide.decorator('taOptions', [
    'taRegisterTool',
    '$delegate',
    'taSelection',
    function(taRegisterTool, taOptions,taSelection) {
      // $delegate is the taOptions we are decorating
      // register the tool with textAngular
      // at least one true
      const isWrappedIn = function(selection, list){
        for (let css of Array.from(list)) {
          if (angular.element(selection).hasClass(css)) {
            return true;
          }
          if (angular.element(selection).parent().hasClass(css)) {
            return true;
          }
        }
        return false;
      };
      taRegisterTool('nextPage', {
        iconclass: 'next-page-bt',
        action() {
          this.$editor().wrapSelection('insertparagraph', '');
          this.$editor().wrapSelection('inserthtml', '$nextpage$');
          this.$editor().wrapSelection('insertparagraph', '');
        }
      }
      );


      //action bouton, essentially a <p> block
      taRegisterTool('action', {
        iconclass: 'fa-action',
        action() {
          return this.$editor().wrapSelection("formatBlock", "<p>");
        },
        activeState(commonElement){
          return !isWrappedIn(taSelection.getSelectionElement(),['speech-wrapper']) && !isWrappedIn(taSelection.getSelectionElement(),['think-wrapper']);
        }
      }
      );
      //pensee bouton
      taRegisterTool('think', {
        iconclass: 'fa-think',
        action() {
          if (angular.element(taSelection.getSelectionElement()).hasClass('think-wrapper')) {
            return this.$editor().wrapSelection('formatblock', '<p>');
          } else {
            return this.$editor().wrapSelection('formatblock', '<p class="think-wrapper">');
          }
        },

        activeState(commonElement){
          return isWrappedIn(taSelection.getSelectionElement(),['think-wrapper']);
        }
      }
      );
      //parole bouton
      taRegisterTool('speech', {
        iconclass: 'fa-speech',
        action() {

          if (angular.element(taSelection.getSelectionElement()).hasClass('speech-wrapper')) {
            this.$editor().wrapSelection('formatblock', '<p>');
          } else {
            this.$editor().wrapSelection('formatblock', '<p class="speech-wrapper font-village">');
          }

        },
        activeState(commonElement){
          return isWrappedIn(taSelection.getSelectionElement(),['speech-wrapper']);
        }
      }
      );

      //crier bouton
      taRegisterTool('shout', {
        iconclass: 'fa-shout',
        action() {
          return this.$editor().wrapSelection("bold", null);
        },
        activeState() {
          return this.$editor().queryCommandState('bold');
        }
      }
      );


      //murmurer bouton
      taRegisterTool('whisper', {
        iconclass: 'fa-whisper',
        action() {
          return this.$editor().wrapSelection("italic", null);
        },

        activeState() {
          return this.$editor().queryCommandState('italic');
        }
      }
      );
      return taOptions;
    }
  ]);
});
