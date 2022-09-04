angular.module('app').controller('Admin', [
  '$scope', '$rootScope', 'adminFactory', function ($scope, $rootScope, adminFactory) {
    $scope.$parent.info.isAppInit = false;
    $scope.characters = {
      1: 'Ellire',
      2: 'Aulne',
      3: 'Puck',
      4: 'Anatole',
      5: 'Nawja'
    };
    $scope.newDialogueData = {};
    $scope.newReponseData = {};

    adminFactory.getAdmin().then((data) => {
      $scope.indexData = data.data;
      $scope.$parent.info.isAppInit = true;
      $scope.isAdminValid = true;
      $scope.loadDialogues();
    }).catch($rootScope.handleError);

    //dialogue
    $scope.loadDialogues = () => {
      adminFactory.getDialogues().then((data) => {
        $scope.dialogues = data.data.map((dialogue => {
          return {
            data: dialogue,
            initialData: dialogue,
            open: false,
            openReponse: false
          }
        }));
      });
    };

    $scope.openDialogue = (dialogue) => {
      dialogue.open = true;
      $scope.loadReponse(dialogue);
    };

    $scope.loadReponse = (dialogue) => {
      adminFactory.getReponses(dialogue.data.id).then((data) => {
        dialogue.reponses = data.data;
      });
    };

    $scope.closeDialogue = (dialogue) => {
      dialogue.open = false;
    };

    $scope.openNewDialogue = () => {
      $scope.dialogueCreationOpen = true;
    };

    $scope.closeNewDialogue = () => {
      $scope.dialogueCreationOpen = false;
    };

    $scope.postNewDialogue = () => {
      if (!$scope.newDialogueData.text || $scope.newDialogueData.text.length === 0) {
        return $rootScope.setAlert('error', 'Dialogue vide!');
      }
      adminFactory.postDialogue($scope.newDialogueData).then((data) => {
        let createdDialogue = data.data;
        $scope.dialogues.push({
          open: false,
          data: createdDialogue,
          initialData: createdDialogue,
          openReponse: false
        });
        $rootScope.setAlert('success', 'Dialogue créé!')
      }).catch($rootScope.handleError);
      $scope.newDialogueData = {};
    };

    $scope.putDialogue = (dialogue) => {
      adminFactory.editDialogue(dialogue.data).then((data) => {
        $rootScope.setAlert('success', 'Dialogue mis à jour!');
        dialogue.initialData = data.data;
      }).catch($rootScope.handleError);
    };

    $scope.deleteDialogue = (dialogue) => {
      adminFactory.deleteDialogue(dialogue.data).then(() => {
        $rootScope.setAlert('success', 'Dialogue supprimé!');
        $scope.loadDialogues();
      }).catch($rootScope.handleError);
    };

    //réponse
    $scope.openNewReponse = (dialogue) => {
      dialogue.openReponse = true;
      $scope.newReponseData.dialogue_id = dialogue.data.id;
    };

    $scope.closeNewReponse = (dialogue) => {
      dialogue.openReponse = false;
      $scope.newReponseData.dialogue_id = null;
    };

    $scope.postNewReponse = (dialogue) => {
      adminFactory.postReponse($scope.newReponseData).then((data) => {
        let createdReponse = data.data;
        if(!dialogue.reponses) dialogue.reponses = [];
        dialogue.reponses.push(createdReponse);
        $rootScope.setAlert('success', 'Réponse créée!');
      }).catch($rootScope.handleError);
    };

    $scope.putReponse = (dialogue, reponse) => {
      reponse.dialogue_id = dialogue.id;
      adminFactory.editReponse(reponse).then((updatedReponse) => {
        reponse.editing = false;
        $rootScope.setAlert('success', 'Réponse mise à jour !');
      });
    };

    $scope.deleteReponse = (dialogue, reponse) => {
      reponse.dialogue_id = dialogue.data.id;
      adminFactory.deleteReponse(reponse).then(() => {
        $rootScope.setAlert('success', 'Réponse supprimmée!');
        $scope.loadReponse(dialogue);
      });
    }
  }
]);
