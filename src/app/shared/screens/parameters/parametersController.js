function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/')
  ;
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

angular.module('app').controller('Parameters', [
  "$scope", "accountFactory", "$rootScope", "eventsFactory", "pushFactory",
  function ($scope, accountFactory, $rootScope, eventsFactory, pushFactory) {
    $scope.$parent.info.isAppInit = false;
    $scope.selectedTheme = "nul";
    $scope.passwordChange = {};

    $scope.askPermission = () => {
      return new Promise((resolve, reject) => {
        const permissionResult = Notification.requestPermission((result) => {
          resolve(result)
        });
        if (permissionResult) {
          permissionResult.then(resolve, reject)
        }
      })
        .then((permissionResult) => {
          if (permissionResult !== 'granted') {
            throw new Error('Permission denied')
          }
        })
    };

    $scope.notificationEnabled = Notification.permission === "granted";
    console.warn('notification persmission', Notification.permission);

    $scope.waitingNotification = false;
    $scope.onNotificationEnableChange = () => {
      if (hensApp.registration) {
        $scope.waitingNotification = true;
        $scope.askPermission()
          .catch(e=>{
            $scope.waitingNotification = false;
            $scope.$apply();
            $rootScope.setAlert('error', "Vous avez refusé les notifications. Si vous voulez pouvoir les activer, vous devrez les activer dans les paramètres du navigateur, désolé :(")
          })
          .then(() => {

            const options = {
              userVisibleOnly: true,
              applicationServerKey: urlBase64ToUint8Array(hensApp.SERVER_KEY)
            };
            return hensApp.registration.pushManager.subscribe(options)
          })
          .then((pushSubscription) => {
            pushFactory.createAuthorization(pushSubscription).then(() => {
              $scope.notificationEnabled = true;
              $scope.waitingNotification = false;
              $rootScope.setAlert('success', "Les notifications Push sont désormais activées sur ce navigateur!");
            }).catch(e => {
              $scope.waitingNotification = false;
              console.error(e);
            });
            // we got the pushSubscription object
          }).catch(e=>{
            $scope.waitingNotification = false;
            $scope.$apply();
            console.error(e);
            $rootScope.setAlert('error', "Il y a eu un problème lors de la validation des notifications. Veuillez nous écrire à contact@hens-world.com")
        });
      } else {
        $rootScope.setAlert('error', "Désolé, votre navigateur ne supporte pas les notifications push :(");
      }
    };

    $scope.themes = ['sulimo', 'ulmo', 'wilwar', 'anar'];
    $scope.init = () => {
      accountFactory.getParameters().then(res => {
        $scope.isAdmin = $rootScope.currentUser.ID === 8;
        $scope.$parent.info.isAppInit = true;
        const mask = res.data.parameters;
        $scope.parameters = {};
        accountFactory.getUnlockedThemes().then(res => {
          $scope.activeThemes = {};
          res.data.forEach((theme) => {
            if (theme.village === "white") {
              $scope.themes.push("white");
            }
            $scope.activeThemes[theme.village] = true;
            $scope.initialVillage = $scope.info.user.theme;

            if (theme.selected) $scope.selectedTheme = theme.village;
          });
        }).catch($rootScope.handleError);
        Object.keys(hensApp.PARAMETERS).forEach((key) => {
          $scope.parameters[key] = (mask & hensApp.PARAMETERS[key]) === hensApp.PARAMETERS[key] ? true : false;
        });
        eventsFactory.getCurrentEvent().then((data) => {
          $scope.currentEvent = data.data;
          if (data.data && data.data.slug === 'coupe-crushrun') {
            accountFactory.getMyExternalId().then((data) => {
              if (data.data) {
                $scope.externalId = data.data.generated_id;
              }
            }).catch($rootScope.handleError);
          }
        }).catch($rootScope.handleError);
      }).catch($rootScope.handleError);
    };

    $scope.generateId = () => {
      accountFactory.generateExternalId().then((data) => {
        if (data.data) {
          $scope.externalId = data.data.generated_id;
        }
      }).catch($rootScope.handleError);
    };

    $scope.copyExternalId = () => {
      document.querySelector('#external-id-field input').select();
      document.execCommand('copy');
      $rootScope.setAlert('success', "Identifiant copié dans le presse-papier!");
    };

    $scope.changePassword = () => {
      accountFactory.updatePassword($scope.passwordChange).then(() => {
        $rootScope.setAlert('success', 'Mot de passe changé!');
      }).catch($rootScope.handleError);
    };
    if ($rootScope.currentUser) {
      $scope.init();
    } else {
      const w = $rootScope.$watch('currentUser', (n, o) => {
        if (n !== o && n) {
          $scope.init();
          w();
        }
      })
    }

    $scope.setSelectedTheme = (theme) => {
      $scope.selectedTheme = theme;
      $scope.$parent.info.user.theme = $scope.selectedTheme;
    };

    $scope.saveParameters = () => {
      let mask = 0;
      Object.keys(hensApp.PARAMETERS).forEach((key) => {
        mask = mask | ($scope.parameters[key] ? hensApp.PARAMETERS[key] : 0);
      });
      accountFactory.selectVillage($scope.selectedTheme).then(() => {
        $scope.initialVillage = $scope.selectedTheme;
        return accountFactory.saveParameters(mask);
      }).then(res => {
        $rootScope.setAlert('success', "Paramètres enregistrés");
        $scope.$parent.info.user.theme = $scope.selectedTheme;
      }).catch($rootScope.handleError);
    };
    $scope.$on('$destroy', () => {
      $scope.info.user.theme = $scope.initialVillage;
    });
  }
]);