/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
hensApp.controller('WhisperElement', ['$scope', 'whisperFactory', '$rootScope', '$routeParams', 'socket', function($scope, whisperFactory, $rootScope, $routeParams, socket){
  $scope.$parent.info.isAppInit = false;
  $scope.newMessage = "";
  $scope.formatSubject = function(subject){
    $rootScope.setSubjectSeen(subject);
    if ($rootScope.socketConnected) {
      socket.emit('whisper:join', parseInt($routeParams.id));
    }

    subject.messages.forEach(function(message){
      message.author = subject.userList.find(user=> user.ID === message.user_id);
      return message.formatDate = moment(message.creationtime).format(hensApp.DATE_FORMATS.PRECISE);
    });
    return $scope.subject = subject;
  };

  $scope.sendMessage = function(){
    if ($scope.newMessage.length === 0) {
      return $rootScope.setAlert('error', 'message_short');
    } else {
      return whisperFactory.sendMessage($scope.newMessage, $routeParams.id).then(function(res){
        if (res.data.error) {
          return $rootScope.setAlert('error', res.data.msg);
        } else {
          $scope.newMessage = "";
          return $rootScope.setAlert('success', res.data.msg);
        }
      });
    }
  };

  if ($rootScope.socketConnected) {
    socket.emit('whisper:join', parseInt($routeParams.id));
    socket.on('whisper:update', $scope.formatSubject);
  } else {
    $rootScope.$watch('socketConnected', function(n, o){
      if (n && (n !== o)) {
        socket.emit('whisper:join', parseInt($routeParams.id));
        return socket.on('whisper:update', $scope.formatSubject);
      }
    });
  }



  whisperFactory.getSubject($routeParams.id).then(function(res){
    if (!res.data.error) {
      $scope.formatSubject(res.data);
      return $scope.$parent.info.isAppInit = true;
    } else {
      return $rootScope.setAlert('error', res.data.msg);
    }
  });


  return $scope.$on('destroy', ()=> socket.removeEventListener('whisper:update', $scope.formatSubject));
}
]);