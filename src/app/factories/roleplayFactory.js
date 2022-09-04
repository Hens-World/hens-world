hensApp.factory('roleplayFactory', ['$http', '$rootScope', function($http, $rootScope){
  const declareRoute = hensApp.declareFactoryRoute('roleplay', $http, $rootScope);
  return {
    getAll(opt){
      const query = hensApp.buildQuery(opt);
      return declareRoute('get', `${query}`);
    },

    get(type, id, opt){
      return declareRoute('get', `/${type}/${id}`);
    },

    getMyRoleplays(){
      return declareRoute('get', "/my-rps");
    },

    getPersonnageRps(personnage_id) {
      return declareRoute('get', "?personnage_id=" + personnage_id)
    },

    getFromLocation(slug, opt){
      let query = hensApp.buildQuery(opt);
      query += `&slug=${slug}`;
      return declareRoute('get', `/location${query}`);
    },

    create(room){
      return declareRoute('post', "/", room);
    },

    edit(room, id){
      return declareRoute('put', `/differe/${id}`, {action:'edit', room});
    },

    join(rpId){
      return declareRoute('post', `/${rpId}/members`, {action: 'join'});
    },

    acceptInvite(member){
      return declareRoute('put', `/${member.roleplay_id}/members/${member.id}`, {action: 'accept'});
    },

    // data: {type:string, message: string}
    addPost(data, rpId){
      return declareRoute('post', `/${rpId}/messages`, data);
    },

    editPost(data){
      const rpId = data.message.roleplay_id;
      const messageId = data.message.id;
      const content = data.newMessage;
      return declareRoute('put', `/${rpId}/messages/${messageId}`, {message: content});
    },

    addNote(data, rpId){
      return declareRoute('post', `/${rpId}/notes`, data);
    },

    endGame(rpId){
      return declareRoute('put', `/differe/${rpId}`, {
        action: 'end'
      });
    }
  };
}
]);