angular.module('app').factory('dialogueFactory', [
  '$http', '$rootScope', function ($http, $rootScope) {
    const declareRoute = hensApp.declareFactoryRoute('dialogues', $http, $rootScope);
    return {
      getNextDialogue(character_id) {
        return declareRoute('get', `/character/${character_id}`);
      },
      postReponse(reponse) {
        return declareRoute('post', `/character/${reponse.character_id}/reponses`, reponse);
      }
    }
  }
]);