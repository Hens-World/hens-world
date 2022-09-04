angular.module('app').factory('userFactory', ['$http', '$rootScope', function ($http, $rootScope) {
  const declareRoute = hensApp.declareFactoryRoute('profile', $http, $rootScope);
  const declareRankRoute = hensApp.declareFactoryRoute('ranks', $http, $rootScope);
  return {
    displayUser(res) {
      let obj;
      const user = res.data;
      if (user.roles[0] === "subscriber") {
        user.role = "membre";
      }
      if ((user.roles[0] === "author") || (user.roles[0] === "contributor") || (user.roles[0] === "administrator")) {
        user.role = "contributeur";
      }
      hensApp.u = user;
      return obj = {
        then(callback) {
          return callback(user);
        }
      };
    },

    displayUsers(res) {
      let obj;
      for (let user of Array.from(res)) {
        if (user.roles[0] === "subscriber") {
          user.role = "membre";
        }
        if ((user.roles[0] === "author") || (user.roles[0] === "contributor") || (user.roles[0] === "administrator")) {
          user.role = "contributeur";
        }
        hensApp.u = user;
      }
      return obj = {
        success(callback) {
          return callback(res);
        }
      };
    },

    getUserList(params) {
      let query = "/list?list=true";
      query += `&page=${params.page ? params.page : 1}`;
      if (params.role) {
        query += `&role=${params.role}`;
      }
      if (params.village) {
        query += `&village=${params.village}`;
      }
      if (params.search) {
        query += `&search=${params.search}`;
      }
      if (params.team) {
        query += "&team=true";
      }
      return declareRoute('get', query);
    },

    getMe() {
      return declareRoute('get', '/');
    },

    updateMyMeta(meta_key, meta_value) {
      return declareRoute('put', `/meta`, {
        meta_key: meta_key,
        meta_value: meta_value
      });
    },

    getUserBySlug(slug) {
      return declareRoute('get', `/${slug}`);
    },

    getProfileFiche(id) {
      return declareRoute('get', `/${id}/fiche`);
    },

    createOrUpdateProfileFiche(id, fiche) {
      return declareRoute('post', `/${id}/fiche`, fiche);
    },

    /**
     * Set village for either user, if this is the first character selected. Otherwise, create a new character sheet with a village on it.
     * If village is already set, this will fail.
     * @param user_id
     * @param character_index
     * @param village village index (number)
     * @returns Promise of village set
     */
    setVillage(user_id, character_index, village) {
      return declareRoute('post', `/${user_id}/characters/${character_index}/village`, {village});
    },

    setPower(user_id, character_index, power) {
      return declareRoute('post', `/${user_id}/characters/${character_index}/pouvoir`, {power});
    },

    saveFavorites(favorites) {
      return declareRoute('put', `/favorites`, favorites);
    },

    getUserById(id) {
      return declareRoute('get', `/${id}`);
    },

    getRelations(id, cid) {
      return declareRoute('get', `/${id}/relations/${cid}`);
    },

    createRelation(id, cid, data) {
      return declareRoute('post', `/${id}/relations/${cid}`, data);
    },

    editRelation(id, cid, rid, data) {
      return declareRoute('put', `/${id}/relations/${cid}/${rid}`, data);
    },

    deleteRelation(id, cid, rid) {
      return declareRoute('delete', `/${id}/relations/${cid}/${rid}`);
    },

    getCharacters(id) {
      return declareRoute('get', `/${id}/characters`);
    },

    getCharacter(id, cid) {
      return declareRoute('get', `/${id}/characters/${cid})`);
    },

    //TODO: put a character only route somewhere
    searchCharacters(name) {
      return declareRoute('get', `/0/characters/?search=true&name=${name}`);
    },

    getCharacterCreations(user_id, fid) {
      return declareRoute('get', `/${user_id}/characters/${fid}/creations`);
    },

    createCharacter(id, cid, data) {
      return declareRoute('post', `/${id}/characters/${cid}`, data);
    },

    getUserseries(user_id) {
      return declareRoute('get', `/${user_id}/series`);
    },

    editCharacter(id, data) {
      return declareRoute('put', `/${id}/characters/${data.char_index}`, data);
    },

    getLikes(id, opt) {
      opt = opt || {};
      const page = opt.page || 1;
      let query = `?page=${page}`;
      if (opt.pageSize) {
        query += `&pageSize=${opt.pageSize}`;
      }
      return declareRoute('get', `/${id}/likes${query}`);
    },

    search(opt) {
      let query = `/?search=${opt.str}`;
      if (opt.count_village) {
        query += "&count_village=true";
      }
      return declareRoute('get', query);
    },

    getComments() {
      return declareRoute('get', '/comments');
    },

    getNotifications() {
      return $http.get(hensApp.nodeUrl + "/notifications", {
        withCredentials: true
      });
    },

    // rank based routes
    getMyRankList() {
      return declareRankRoute('get', '/list');
    },

    getUserRankList(id) {
      return declareRankRoute('get', `/list/${id}`);
    },

    getMyRank() {
      return declareRankRoute('get', '/');
    },

    getUserRank(id) {
      return declareRankRoute('get', `/${id}`);
    },

    selectRank(rank_id) {
      return declareRankRoute('put', "/", {rank_id});
    },

    createBaseRanking() {
      return declareRankRoute('post', "/", {});
    }
  };
}]);
