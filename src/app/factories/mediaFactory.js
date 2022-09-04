hensApp.factory('mediaFactory', ['$http', '$rootScope', function ($http, $rootScope) {
  const declareRoute = hensApp.declareFactoryRoute('media', $http, $rootScope);
  return {
    getMedia() {
      return declareRoute('get', '/');
    },
    postMedia(media) {
      // let fd = new FormData();
      // fd.append(media.name, media);
      // return declareRoute('post', '/', fd);
      let p = new Promise((resolve, reject)=>{
        var xhr = new XMLHttpRequest();

        var fd = new FormData();
        fd.append("file", media);

        xhr.open("POST", hensApp.nodeUrl + "/media/",  true);
        xhr.withCredentials = true;
        xhr.upload.addEventListener('progress', function(e) {
          var percentComplete = Math.ceil((e.loaded / e.total) * 100);
          console.log('percent upload', percentComplete);
          $rootScope.$broadcast("media-upload:progress", percentComplete);
        }, false);

        xhr.onload = function() {
          if (this.status == 200) {
            resolve({data: JSON.parse(xhr.response)});
          }
          else {
            reject();
          }
        };
        xhr.send(fd);
      });

      return p;
    },
    deleteMedia(id) {
      return declareRoute('delete', `/${id}`, {});
    },
    editMedia(media) {
      return declareRoute('put', `/${media.id}`, media);
    }
  };
}]);