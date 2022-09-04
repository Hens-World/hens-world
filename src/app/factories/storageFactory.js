hensApp.LS = {};
let ls = hensApp.LS;
ls.ROLEPLAY = "roleplay.#{roleplay_type}.#{roleplay_id}";
ls.ROLEPLAY_DRAFT = ls.ROLEPLAY + ".draft";

hensApp.factory('storageFactory', ['$rootScope', function ($rootScope) {
  let storage;
  let currentValue;

  return storage = {
    initStorage() {
      currentValue = JSON.parse(localStorage.getItem('hw-storage-' + $rootScope.currentUser.ID));
      currentValue = currentValue || {};
      currentValue.seen = currentValue.seen || {
        posts: [],
        rps: []
      };
    },
    parseKey(key, values) {
      let parsedKey = key + "";
      let data = key.match(/\#\{(.*?)\}/g);
      if (data) {
        data.forEach(tag => {
          let cleanTag = tag.replace('#{', '').replace('}', '');
          if (values[cleanTag]) {
            parsedKey = parsedKey.replace(tag, values[cleanTag]);
          }
        });
      }
      return parsedKey;
    },
    set(key, value, params) {
      params = params || {};
      // let function set nested values in object
      const chain = this.parseKey(key, params).split('.');
      if (chain.length > 1) {
        let arbo = currentValue;
        chain.forEach((key, index) => {
          if (index < chain.length - 1) {
            if (!arbo[key]) arbo[key] = {};
            arbo = arbo[key];
          } else {
            arbo[key] = value;
          }
        });
      } else {
        currentValue[key] = value;
      }
      localStorage.setItem('hw-storage-' + $rootScope.currentUser.ID, JSON.stringify(currentValue));
    },
    get(key, params) {
      params = params || {};
      const chain = this.parseKey(key, params).split('.');
      if (chain.length > 1) {
        let arbo = currentValue;
        chain.forEach(key => {
          if (arbo) {
            return arbo = arbo[key];
          }
        });
        return arbo;
      } else {
        return currentValue[key];
      }
    },
    del(key, params) {
      params = params || {};
      const chain = this.parseKey(key, params).split('.');
      if (chain.length > 1) {
        let arbo = currentValue;
        chain.forEach((key, index) => {
          if (index < chain.length - 1) {
            if (!arbo[key]) arbo[key] = {};
            arbo = arbo[key];
          } else {
            arbo[key] = null;
          }
        });
      } else {
        currentValue[key] = null;
      }
      localStorage.setItem('hw-storage-' + $rootScope.currentUser.ID, JSON.stringify(currentValue));
    }
  };
}]);