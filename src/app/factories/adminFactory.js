angular.module('app').factory('adminFactory', ['$rootScope', '$http', function($rootScope, $http){
  const declareRoute = hensApp.declareFactoryRoute('admin', $http, $rootScope);
  return {
    getAdmin(){
      return declareRoute('get', '/');
    },

    getDialogues(){
      return declareRoute('get', '/dialogues');
    },

    postDialogue(dialogue){
      return declareRoute('post', '/dialogues', dialogue);
    },

    editDialogue(dialogue) {
      return declareRoute('put', `/dialogues/${dialogue.id}`, dialogue);
    },

    deleteDialogue(dialogue) {
      return declareRoute('delete', `/dialogues/${dialogue.id}`);
    },


    getReponses(dialogue_id){
      return declareRoute('get', `/dialogues/${dialogue_id}/reponses`);
    },

    postReponse(reponse){
      return declareRoute('post', `/dialogues/${reponse.dialogue_id}/reponses`, reponse);
    },

    editReponse(reponse) {
      return declareRoute('put', `/dialogues/${reponse.dialogue_id}/reponses/${reponse.id}`, reponse);
    },

    deleteReponse(reponse) {
      return declareRoute('delete', `/dialogues/${reponse.dialogue_id}/reponses/${reponse.id}`);
    }
  }
}]);