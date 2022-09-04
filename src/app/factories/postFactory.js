angular.module('app').factory('postFactory', ['$http', '$rootScope', function ($http, $rootScope) {
  const declareRoute = hensApp.declareFactoryRoute('posts', $http, $rootScope);
  const declareLocationRoute = hensApp.declareFactoryRoute('locations', $http, $rootScope);
  return {
    getPosts(opt) {
      opt = opt || {};
      const page = opt.page || 1;
      let query = `?page=${page}`;
      if (opt.pageSize) {
        query += `&pageSize=${opt.pageSize}`;
      }
      if (opt.type) {
        query += `&type=${opt.type}`;
      }
      if (opt.sort) {
        query += `&sort=${opt.sort}`;
      }
      if (opt.author) {
        query += `&author=${opt.author}`;
      }
      if (typeof opt.columns === 'string') {
        opt.columns = [opt.columns];
      }
      if (opt.status) {
        query += `&status=${opt.status}`;
      }
      if (opt.title && opt.title.length > 2) {
        query += `&title=${opt.title}`;
      }

      if (Array.isArray(opt.columns)) {
        query += `&columns=${opt.columns.join(',')}`;
      }
      return declareRoute('get', query);
    },

    search(searchTerm) {
      return declareRoute('get', `?title=${searchTerm}`);
    },

    getPostsAtLocation(slug, opt) {
      let query = hensApp.buildQuery(opt);
      query += `&slug=${slug}`;
      return declareRoute('get', `/location${query}`);
    },

    createComment(comment) {
      return declareRoute('post', `/${comment.post_id}/comments`, comment);
    },

    editComment(comment) {
      return declareRoute('put', `/${comment.post_id}/comments/${comment.ID}`, comment);
    },

    deleteComment(comment) {
      return declareRoute('delete', `/${comment.post_id}/comments/${comment.ID}`, {});
    },

    getLikes(post_id) {
      return declareRoute('get', `/${post_id}/likes`);
    },

    createLike(post_id) {
      return declareRoute('post', `/${post_id}/likes`, {});
    },

    deleteLike(post_id) {
      return declareRoute('put', `/${post_id}/likes/delete`, {});
    },

    getMedia() {
      const url = wpAPIData.base + "/media";
      return $http.get(url);
    },

    getShowcasedPost() {
      return declareRoute('get', '/showcased');
    },

    getPostById(id, type) {
      let query = `/${id}`;
      if (type) {
        query += `?type=${type}`;
      }
      return declareRoute('get', query);
    },

    getPostBySlug(slug, type) {
      let query = `/${slug}`;
      if (type) {
        query += `?type=${type}`;
      }
      return declareRoute('get', query);
    },

    newPost(p) {
      return declareRoute('post', '/', p);
    },

    deletePost(id) {
      return declareRoute('delete', `/${id}`);
    },

    updatePost(p) {
      return declareRoute('put', `/${p.ID}`, p);
    },

    sendMedia(media) {
      const req = {
        method: 'POST',
        url: wpAPIData.base + "/media",
        headers: {
          'Content-Type': undefined,
          'X-WP-Nonce': wpAPIData.nonce,
          enctype: 'multipart/form-data'
        },
        data: 'lol'
      };
      return $http(req);
    },

    //locations
    searchLocations(opt) {
      let query = "?searching=true";
      if (opt.village != void 0) {
        query += `&village=${opt.village}`;
      }
      if (opt.zone != void 0) {
        query += `&zone=${opt.zone}`;
      }
      if (opt.parentList != void 0 && opt.parentList.length > 0) {
        query += `&parentList=${opt.parentList.toString()}`;
      }
      return declareLocationRoute('get', '/' + query);
    }

  };
}]);
