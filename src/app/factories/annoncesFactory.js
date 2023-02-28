hensApp.factory('annoncesFactory', [
  '$http', '$rootScope', function ($http, $rootScope) {
    const declareRoute = hensApp.declareFactoryRoute('annonces', $http, $rootScope);
    return {
      // type: instant/async
      get(opt) {
        const query = hensApp.buildQuery(opt);

        return declareRoute('get', `${query}`);
      },
      getById(id) {
        return declareRoute('get', `/${id}`);
      },
      create(data) {
        return declareRoute('post', '', data);
      },
      edit(id, data) {
        return declareRoute('put', `/${id}`, data);
      },
      close(id) {
        return declareRoute('put', `/${id}/close`, {});
      },
      join(id, data) {
        return declareRoute('post', `/${id}/join`, {});
      },
      kick(id, data) {
        return declareRoute('put', `/${id}/kick`, data);
      },
      acceptInvite(id, data) {
        return declareRoute('put', `/${id}/invitation`, {});
      },

      leave(id, data) {
        return declareRoute('put', `/${id}/leave`, {});
      },

      comment(id, data) {
        return declareRoute('post', `/${id}/comment`, data);
      },
      editComment(id, commentId, data) {
        return declareRoute('put', `/${id}/comment/${commentId}`, data);
      }

    };
  }
]);
