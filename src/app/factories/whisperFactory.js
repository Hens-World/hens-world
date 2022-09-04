hensApp.factory('whisperFactory', ['$http', '$rootScope', function($http, $rootScope){
  const declareRoute = hensApp.declareFactoryRoute('whisper', $http, $rootScope);
  return {
    get(){
      return declareRoute('get', '/');
    },

    getSubject(id){
      return declareRoute('get', `/${parseInt(id)}`);
    },

    create(subject){
      return declareRoute('post', '/', subject);
    },
    sendMessage(message, id){
      return declareRoute('post', `/${id}/messages`, {message});
    },

    getNewCount(){
      return declareRoute('get', "/new-count");
    }
  };
}
]);