/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
hensApp.controller('AsyncDetail', [
  '$scope', '$rootScope', 'roleplayFactory', 'socket', '$routeParams', 'localeFactory', 'storageFactory', 'userFactory',
  function ($scope, $rootScope, roleplayFactory, socket, $routeParams, localeFactory, storageFactory, userFactory) {
    $scope.$parent.info.isAppInit = false;
    $scope.villages = ['sulimo', 'ulmo', 'wilwar', 'anar'];
    $scope.base = myLocalized.medias;
    $scope.rpNote = "";
    $scope.notmob = "";
    $scope.rpMessage = "";
    $scope.rpCharacterIndex = 1;
    $scope.myCharacters = [];

    $scope.noteListDucked = true;

    $scope.toggleNoteListDuck = () => {
      $scope.noteListDucked = !$scope.noteListDucked;
    };

    $scope.populateMessages = () => {
      $scope.roleplay.messages.forEach(function (msg) {
        msg.author = structuredClone($scope.roleplay.userList[msg.user_id]);
        if (!msg.author) {
          msg.author = {
            characters: [],
            ID: -1,
            display_name: "Profil supprimé",
            chara: {
              id: -1,
              prenom: "Personnage supprimé",
            }
          }
        }
        msg.author.chara = msg.author.characters.find(c => c.char_index === msg.char_index);
        msg.edited = moment(msg.lastchangetime).isAfter(msg.creationtime);
        msg.formatOriginalDate = moment(msg.creationtime).format(hensApp.DATE_FORMATS.PRECISE);
        msg.formatDate = moment(msg.lastchangetime).format(hensApp.DATE_FORMATS.PRECISE);
        return msg.isMe = msg.user_id === $rootScope.currentUser.ID;
      });
    };

    $scope.updateRoleplay = function (roleplay) {
      localeFactory.JSON("guideInfo").then((locations) => {
        $scope.location = locations.data.list.find(location => location.id === roleplay.location);
      });
      roleplay.formatDate = moment(roleplay.starttime).format(hensApp.DATE_FORMATS.SHORT);
      $scope.roleplay = roleplay;
      let charactersQueried = 0;
      for (let id in $scope.roleplay.userList) {
        userFactory.getCharacters(id).then(res => {
          $scope.roleplay.userList[id].characters = res.data;
          console.log(id, $rootScope.currentUser.ID);
          if (parseInt(id) === $rootScope.currentUser.ID) {
            $scope.myCharacters = res.data;
          }
          charactersQueried++;
          if (charactersQueried === Object.keys($scope.roleplay.userList).length) {
            $scope.populateMessages();
          }
        }).catch($rootScope.handleError);
      }
      $scope.roleplay.notes.forEach(function (msg) {
        msg.author = $scope.roleplay.userList[msg.user_id];
        if (!msg.author) {
          msg.author = {
            ID: -1,
            display_name: "Profil supprimé"
          }
        }
        msg.formatDate = moment(msg.created_at).format('DD/MM/YY HH:mm:ss');
      });
      $scope.participation = $scope.roleplay.members.find(member => member.user_id === $rootScope.currentUser.ID);
      $scope.isInRoleplay = $scope.participation && ($scope.participation.status === 1);
      $scope.hasPlace = ((roleplay.size === -1) || (roleplay.members.length < roleplay.size));
      $scope.canParticipate =
        (!roleplay.is_finished && (!roleplay.is_private && !$scope.participation)) ||
        ((!!$scope.participation && ($scope.participation.status === 0)) && $scope.hasPlace);
      $scope.isOwner = roleplay.owner.ID === $rootScope.currentUser.ID;
      return $scope.isMyTurn =
        (roleplay.messages.length === 0) ||
        (roleplay.messages[roleplay.messages.length - 1].user_id !== $rootScope.currentUser.ID);
    };

    $scope.joinRP = () => roleplayFactory.join($scope.roleplay.id).then(function (result) {
      if (result.data.error) {
        $rootScope.setAlert('error', result.data.msg);
      } else {
        location.reload();
      }
    });

    $scope.acceptInvite = () => {
      roleplayFactory.acceptInvite($scope.participation).then(function (result) {
        if (result.data.error) {
          $rootScope.setAlert('error', result.data.msg);
        } else {
          location.reload();
          if (result.data.msg) {
            $rootScope.setAlert('success', result.msg);
          }
        }
      });
    };

    $scope.selectCharacterForMessage = (char_index) => {
      $scope.rpCharacterIndex = char_index;
    }

    $scope.postMessage = function () {
      if ($scope.isMyTurn || $scope.editedMsg) {
        $scope.isMyTurn = false;
        if ($scope.editedMsg) {
          return roleplayFactory.editPost({
            message: $scope.editedMsg,
            newMessage: $scope.rpMessage
          }).then(function (result) {
            if (!result.data.error) {
              $scope.editedMsg = null;
              $scope.rpMessage = null;
              return $rootScope.setAlert('success', result.data.msg);
            } else {
              return $rootScope.setAlert('error', result.data.msg);
            }
          });
        } else {
          return roleplayFactory.addPost({
            message: $scope.rpMessage,
            char_index: $scope.rpCharacterIndex,
            type: 'differe'
          }, $scope.roleplay.id).then(function (result) {
            if (!result.data.error) {
              storageFactory.del(hensApp.LS.ROLEPLAY_DRAFT, {
                roleplay_type: 'differe',
                roleplay_id: $scope.roleplay.id
              });
              return $scope.rpMessage = "";
            } else {
              return $rootScope.setAlert('error', result.data.msg);
            }
          });
        }
      }
    };

    $scope.postNote = function () {
      let note = $rootScope.mobileCheck() ? $scope.notmob : $scope.rpNote;
      if (note.trim().length === 0) {
        $rootScope.setAlert('error', 'message_short');
      } else {
        roleplayFactory.addNote({
          message: note,
          type: 'differe'
        }, $scope.roleplay.id).then(function (result) {
          if (result.data.error) {
            $rootScope.setAlert('error', result.data.msg);
          }
        });
        $scope.rpNote = "";
        $scope.notmob = "";
      }
    };

    $scope.init = () => {
      roleplayFactory.get('differe', $routeParams.id).then(function (res) {
        if ($rootScope.socketConnected) {
          socket.emit('rp-diff:join', res.data.id);
        } else {
          $rootScope.$watch('socketConnected', (n, o) => {
            if (n && n !== o) {
              socket.emit('rp-diff:join', res.data.id);
            }
          });
        }
        $scope.updateRoleplay(res.data);

        //init local storage rp
        let savedDraft = storageFactory.get(hensApp.LS.ROLEPLAY_DRAFT, {
          roleplay_type: 'differe',
          roleplay_id: $routeParams.id
        });
        if (savedDraft) {
          $scope.rpMessage = savedDraft;
        }
        return $scope.$parent.info.isAppInit = true;
      })
    };

    $scope.socketInit = function () {
      socket.on('rp-diff:update', data => $scope.updateRoleplay(data));
    };

    $scope.endGame = () => $rootScope.$emit('modal:set', {
      title: "Terminer une partie:",
      text: `Voulez vous vraiment terminer la partie '${$scope.roleplay.title}'? Une fois terminée, plus personne ne pourra écrire ni éditer leurs posts.`,
      validation: () => {
        return roleplayFactory.endGame($scope.roleplay.id).then(function (result) {
          if (result.data.error) {
            return $rootScope.setAlert('error', result.data.msg);
          } else {
            return console.log('end success!');
          }
        });
      }
    });

    $scope.onRpMessageChange = hensApp.debounce((message) => {
      if (!$scope.editedMsg) {
        storageFactory.set(hensApp.LS.ROLEPLAY_DRAFT, message, {
          roleplay_type: 'differe',
          roleplay_id: $scope.roleplay.id
        });
      }
    }, 700);

    $scope.startEdition = function (msg) {
      if ($scope.rpMessage.length > 0) {
        return $rootScope.setAlert('error', "Du texte est présent dans la zone de réponse, vous ne pouvez pas éditer!");
      } else {
        $scope.editedMsg = msg;
        $scope.rpMessage = $scope.editedMsg.message;
        $('.page-container').scrollTop($('.page-container')[0].scrollHeight);
        return;
      }
    };
    $scope.stopEdition = function () {
      $scope.rpMessage = "";
      return $scope.editedMsg = null;
    };

    $scope.$on('onRepeatLast', function (scope, element, attrs) {
      if (element[0].classList.contains("rp-note__unit")) {
        let scroll = document.querySelector('.rp-note__scroll');
        scroll.scrollTo({ top: scroll.scrollHeight });
      } else {
        return $('.page-container').scrollTop($('.page-container')[0].scrollHeight);
      }
    });

    if ($rootScope.socketConnected) {
      $scope.socketInit();
    } else {
      $rootScope.$watch('socketConnected', function (n, o) {
        if (n) {
          return $scope.socketInit();
        }
      });
    }
    $scope.init();
  }
]);

