/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
hensApp.controller('WhisperList', ['$scope', 'whisperFactory', '$rootScope', function($scope, whisperFactory, $rootScope){
  $scope.$parent.info.isAppInit = false;

  $scope.newSubjects = 0;
  return whisperFactory.get().then(function(res){
    res = res.data;
    if (!res.error) {
      $scope.subjects = res;
      $scope.subjects.forEach(function(subject){
        subject.formatLastMessage = moment(subject.messages[0].creationtime).format(hensApp.DATE_FORMATS.SHORT);
        subject.me =  subject.members.find(member=> member.user_id === $rootScope.currentUser.ID);
        subject.new = moment(subject.messages[0].creationtime).isAfter(subject.me.lastseentime);
        subject.messages.forEach(message=> message.author = subject.userList.find(user => user && user.ID === message.user_id));
      });
      $scope.$parent.info.isAppInit = true;
    }
  });
}
]);