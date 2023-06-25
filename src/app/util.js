var myLocalized = {
  medias: '/medias/',
  partials: '/version-@@currentVersion/templates/shared/',
  specPartials: window.mobilecheck() ? '/version-@@currentVersion/templates/mobile/' :
    '/version-@@currentVersion/templates/desktop/',
  json: '/version-@@currentVersion/json/'
};

// gulp variables
hensApp.version = '@@currentVersion';
hensApp.nodeUrl = '@@nodeUrl';
hensApp.SERVER_KEY = "BKJceIbPVeUTg7dt8rRMC4ZRFiSWNP4Lu7i349g_p6mdni0M-ZApr2U3yUvFm5xhFFdsJlfBIDsqPdSh2xzyCW4";
hensApp.socketUrl = hensApp.nodeUrl;
hensApp.DATE_FORMAT = 'DD/MM/YYYY';
// these formats are meant to be used in moment.format() parem
hensApp.DATE_FORMATS = {
  SHORT: 'DD/MM/YYYY',
  PRECISE: 'DD/MM/YYYY HH:mm:ss',
  MIDDLE: '[Le] DD/MM à HH:mm',
  HOUR: 'HH:mm:ss'
};
hensApp.PARAMETERS = Object.freeze({
  NOTIFY_NEWSLETTER: 1,
  NOTIFY_WHISPERS: 2,
  NOTIFY_COMMNENTS: 4,
  NOTIFY_ROLEPLAY_RESPONSE: 8,
  LIGHT_THEME: 16,
  PUSH_ANNONCE: 32,
  NOTIFY_ANNONCE: 64,
  PUSH_NEWSLETTER: 128,
  PUSH_WHISPERS: 256,
  PUSH_COMMENTS: 512,
  PUSH_ROLEPLAY_RESPONSE: 1024,
  PUSH_EVENT_START: 2048
});

hensApp.log = function (msg) {
  if (false) {
    return console.log(msg);
  }
};

hensApp.parseContent = (content) => {
  if (!content) return "";
  return content.replace(/\<br\/\>/g, '\n');
};

hensApp.formatContent = (content) => {
  return content ? content.replace(/\r\n|\n/g, '<br/>') : null;
};

hensApp.parseDate = date => {
  const split = date.split('-');
  return [parseInt(split[0]), parseInt(split[1])];
};

hensApp.isTodayBetween = (start, end) => {
  const d = new Date();
  const date = d.getDate();
  const m = d.getMonth() + 1;
  return hensApp.isDateBetween([date, m], start, end);
};

hensApp.isDateBetween = (date, start, end) => {
  const isAfterStart = ((date[0] >= start[0]) && (date[1] >= start[1])) || (date[1] > start[1]);
  const isBeforeEnd = ((date[0] <= end[0]) && (date[1] === end[1])) || (date[1] < end[1]);
  return isAfterStart && isBeforeEnd;
};

hensApp.service('authInterceptor', function ($q, $rootScope) {
  const service = this;

  service.responseError = function (response) {
    if (response.status === 401) {
      $rootScope.setAlert('error', 'login01');
    }
    return $q.reject(response);
  };

}).config([
  '$httpProvider', function ($httpProvider) {
    $httpProvider.interceptors.push('authInterceptor');
  }
]);

hensApp.color = {
  bannerDark: "#131313",
  playerDark: "#212121",
  middleDark: "#414141",
  sulimo: {
    neuter: "#e58c00",
    dark: "#5e3202",
    highDark: "#3f2202",
    shadow: "#8f4202",
    light: "#ffc12c"
  },
  wilwar: {
    neuter: "#9fb200",
    dark: "#1e2a01",
    highDark: "#1e2a01",
    shadow: "#1e2a01",
    light: "#d1f04d"
  },
  anar: {
    neuter: "#db2f00",
    dark: "#260900",
    highDark: "#260900",
    shadow: "#861900",
    light: "#fc5529"
  },
  ulmo: {
    neuter: "#01c5c3",
    dark: "#007782",
    highDark: "#004453",
    shadow: "#007782",
    light: "#10e4dd"
  },
  guest: {
    neuter: "#D9B76F",
    shadow: "#ddb560",
    dark: "#d8a944",
    highDark: "#A6802E",
    light: "#fdde9b"
  }
};

hensApp.c = {};
hensApp.zoneNames = {
  'foret_sulimo': 'Forêt de Sulimo',
  'lac_ulmo': 'Lac d\'Ulmo',
  'sulimo': 'Sulimo',
  'ulmo': 'Ulmo',
  'wilwar': 'Wilwar',
  'anar': 'Anar'
}
hensApp.host = '@@socketUrl';
hensApp.villages = ['sulimo', 'ulmo', 'wilwar', 'anar'];

hensApp.c.months = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre',
  'Décembre'
];

hensApp.getSeasonVillage = function (momentDate) {
  const seasonIndex = hensApp.getSeasonIndex(momentDate);
  const villageToSeasonMapping = [1, 2, 3, 0];
  return hensApp.villages[villageToSeasonMapping[seasonIndex]];
}

hensApp.getSeasonIndex = function (momentDate) {
  const adjustedDate = momentDate.year(2019);
  let seasonIndex = 0;
  const startOfWinter = moment("20190101");
  const startOfSpring = moment("20190321");
  const startOfSummer = moment("20190621");
  const startOfAutumn = moment("20190921");
  const startOfWinterEOY = moment("20191221");

  if (adjustedDate.isBetween(startOfWinter, startOfSpring)) {
    seasonIndex = 0;
  }
  else if (adjustedDate.isBetween(startOfSpring, startOfSummer)) {
    seasonIndex = 1;
  }
  else if (adjustedDate.isBetween(startOfSummer, startOfAutumn)) {
    seasonIndex = 2;
  }
  else if (adjustedDate.isBetween(startOfAutumn, startOfWinterEOY)) {
    seasonIndex = 3;
  }
  else {
    seasonIndex = 0;
  }
  return seasonIndex;
}

hensApp.c.seasons = ["Hiver", "Printemps", "Été", "Automne"];

hensApp.removeAllChildren = function (elt) {
  while (elt.firstChild) {
    elt.removeChild(elt.firstChild);
  }
};

hensApp.niceScrollOptions = {
  cursorcolor: "#222",
  cursoropacitymin: 0.2,
  mousescrollstep: 20,
  spacebarenabled: false,
  hidecursordelay: 800,
  cursorborder: 0,
  railpadding: {
    right: 1
  }
};

hensApp.clone = obj => { return structuredClone(obj) };

hensApp.rgba = (rgb, a) => `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${a})`;

hensApp.replaceAll = (find, replace, str) => str.replace(new RegExp(find, 'g'), replace);

hensApp.readCookie = function (name) {
  const nameEQ = `hensApp${name}=`;
  const ca = document.cookie.split(';');
  for (let index = 0; index < ca.length; index++) {
    let c = ca[index];
    while (c.charAt(0) === ' ') {
      c = c.substring(1, c.length);
    }
    if (c.indexOf(nameEQ) === 0) {
      return c.substring(nameEQ.length, c.length);
    }
  }
};

hensApp.readAbsCookie = function (nameEQ) {
  const ca = document.cookie.split(';');
  for (let index = 0; index < ca.length; index++) {
    let c = ca[index];
    console.log(c, nameEQ);
    while (c.charAt(0) === ' ') {
      c = c.substring(1, c.length);
    }
    if (c.indexOf(nameEQ) === 0) {
      return c.substring(nameEQ.length, c.length);
    }
  }
};

hensApp.declareFactoryRoute = (route, $http, $rootScope, headers) => {
  return function (type, url, data) {
    let options = {
      headers: headers ? headers : {}
    };
    options.withCredentials = true;
    $rootScope.$emit(HEADER_EVENTS.LOAD);
    if (type === 'get' || type === 'delete') {
      return $http[type](hensApp.nodeUrl + `/${route}` + url, options)
        .then(data => {
          $rootScope.$emit(HEADER_EVENTS.LOADED);
          return data;
        });
    } else {
      return $http[type](hensApp.nodeUrl + `/${route}` + url, data, options)
        .then(data => {
          $rootScope.$emit(HEADER_EVENTS.SUCCESS);

          return data;
        });
    }
  }
};

hensApp.buildQuery = function (opt) {
  let query = "?";
  opt = opt || {};
  opt.page = opt.page || 1;
  query += `page=${opt.page}`;
  if (opt.limit) {
    query += `&limit=${opt.limit}`;
  }
  if (opt.order) {
    query += `&order=${opt.order}`;
  }
  if (opt.type) {
    query += `&type=${opt.type}`;
  }
  return query;
};

hensApp.createCookie = function (name, value, days) {
  let expires;
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    expires = `; expires=${date.toGMTString()}`;
  } else {
    expires = "";
  }
  return document.cookie = `hensApp${name}=${value}${expires}; path=/`;
};

hensApp.throttle = (callback, delay) => function () {
  let timer = null;
  const now = +new Date();
  const context = this;
  const args = arguments;
  if (last && (now < (last + delay))) {
    clearTimeout(timer);
    return timer = setTimeout(function () {
      let last;
      callback.apply(context, args);
      return last = now;
    }, delay);
  } else {
    var last;
    callback.apply(context, args);
    return last = now;
  }
};

/*
container
parent
ref
ratio
*/
hensApp.parallax = function (e, t, o, n) {
  let i = (-$(e).position().top + $(window).height()) - 80;
  let r = i > 0 ? (i * n) - o : -o;
  $(e).css('background-position', `50% ${-r}px`);
  if (undefined !== $(t).data('parallax')) {
    $(t).data('parallax', $(t).data('parallax') + e + ':' + n + ':' + o + '/');
  } else {
    $(t).data('parallax', e + ':' + n + ':' + o + '/');
  }
  return $(t).on('scroll', hensApp.throttle((function (t) {
    const a = $(t.target).data('parallax').split('/');
    const p = [];
    let u = 0;
    const c = a.length;
    while (c > u) {
      var l;
      const s = a[u];
      ('' !== s) && (l = s.split(':'));
      e = l[0];
      n = l[1];
      o = parseInt(l[2]);
      i = (-$(e).position().top + $(window).height()) - 80;
      r = i > 0 ? (i * n) - o : -o;
      p.push($(e).css('background-position', `50% ${-r}px`));

      u++;
    }
    return p;
  }), 20));
};

hensApp.eraseCookie = name => hensApp.createCookie(name, "", -1);

hensApp.isHot = function (post) {
  let postId;
  const time = post.date.split("T")[1].split(':');
  const dateSplit = post.date.split("T")[0].split('-');
  const year = parseInt(dateSplit[0]);
  const month = parseInt(dateSplit[1]) - 1;
  const day = parseInt(dateSplit[2]);
  const hour = parseInt(time[0]);
  const minute = parseInt(time[1]);
  const date = new Date(year, month, day, hour, minute);
  const now = new Date();
  const nowTime = now.getTime();
  const seenList = hensApp.readCookie('Seen');
  if (seenList !== undefined) {
    const seenSplit = seenList.split(':');
    for (postId of seenSplit) {
      if (parseInt(postId) === post.ID) {
        return false;
      }
    }
  }
  if (nowTime < (date.getTime() + (30 * 24 * 3600 * 1000))) {
    let cantHotList, cantHotListParsed;
    let isHotList = hensApp.readCookie("HotPosts");
    if (isHotList === undefined) {
      cantHotList = hensApp.readCookie("CantHot");
      if (cantHotList === undefined) {
        hensApp.createCookie("HotPosts", `${post.ID}:`);
        hensApp.createCookie("CantHot", `${post.ID}:`, 30);
        return true;
      } else {
        cantHotListParsed = cantHotList.split(':');
        for (postId of cantHotListParsed) {
          if (parseInt(postId) === post.ID) {
            return false;
          }
        }
        cantHotList += `${post.ID}:`;
        hensApp.createCookie("CantHot", cantHotList, 30);
        return hensApp.createCookie("HotPosts", `${post.ID}:`);
      }
    } else {
      let isHotString = isHotList;
      isHotList = isHotList.split(':');
      for (let hotPost of isHotList) {
        if (post.ID === parseInt(hotPost)) {
          return true;
        }
      }
      cantHotList = hensApp.readCookie("CantHot");
      if (cantHotList === undefined) {
        isHotString += `${post.ID}:`;
        hensApp.createCookie("HotPosts", isHotString);
        hensApp.createCookie("CantHot", `${post.ID}:`, 30);
        return true;
      } else {
        cantHotListParsed = cantHotList.split(':');
        for (postId of cantHotListParsed) {
          if (parseInt(postId) === post.ID) {
            return false;
          }
        }
        cantHotList += `${post.ID}:`;
        hensApp.createCookie("CantHot", cantHotList, 30);
        isHotString += `${post.ID}:`;
        return hensApp.createCookie("HotPosts", isHotString);
      }
    }
  } else {
    return false;
  }
};

hensApp.createCookie('HotPosts', '');

const TYPES = {
  "videos": "Vidéo",
  "musiques": "Musique",
  "images": "Image",
  "photos": "Photo",
  "recit": "Récit",
  "legende": "Légende",
  "article": "Article",
  "jeux_videos": "Jeu vidéo"
};

hensApp.getFormatType = function (post) {
  return TYPES[post.type];
};

hensApp.setMiniature = function (post) {
  if (!post.meta || (post.meta.miniature === undefined) || (post.meta.miniature === "")) {
    if (post.type === "videos") {
      post.formatType = "Vidéo";
      post.miniature = myLocalized.medias + 'common/camera.png';
    }
    if (post.type === "musiques") {
      post.formatType = "Musique";
      post.miniature = myLocalized.medias + 'common/musique.png';
    }
    if (post.type === "images") {
      post.formatType = "Image";
      post.miniature = myLocalized.medias + 'common/image.png';
    }
    if (post.type === "photos") {
      post.formatType = "Photo";
      post.miniature = myLocalized.medias + 'common/photo.png';
    }
    if (post.type === "recit") {
      post.formatType = "Récit";
      post.miniature = myLocalized.medias + 'common/ecrit.png';
    }
    if (post.type === "legende") {
      post.formatType = "Légende";
      post.miniature = myLocalized.medias + 'common/ecrit.png';
    }
    if (post.type === "article") {
      post.formatType = "Article";
      post.miniature = myLocalized.medias + 'common/ecrit.png';
    }
    if (post.type === "jeux_videos") {
      post.formatType = "Jeu vidéo";
      post.miniature = myLocalized.medias + 'common/game.png';
    }
  } else {
    post.miniature = post.meta.miniature;
  }
  return post.miniature;
};

hensApp.filter('filterPopulation', [
  '$filter', $filter => function (tab, filter) {
    if (tab !== undefined) {
      const res = [];
      for (let user of tab) {
        if (user.display_name.toLowerCase().indexOf(filter.display_name.toLowerCase()) > -1) {
          if ((filter.role === "") || (filter.role === user.role)) {
            if ((filter.village === "") || (filter.village === user.village)) {
              if (filter.ID.length > 0) {
                for (let id of filter.ID) {
                  if (id === user.ID) {
                    res.push(user);
                  }
                }
              } else {
                res.push(user);
              }
            }
          }
        }
      }
      return res;
    }
  }

]);

hensApp.filter('filterGuideTour', [
  '$filter', $filter => function (tab, filter) {
    if (tab !== undefined) {
      const res = [];
      for (let lieu of tab) {
        if (lieu.nom.toLowerCase().indexOf(filter.nom.toLowerCase().trim()) > -1) {
          if ((filter.village === "") || (filter.village === lieu.village)) {
            if (!filter.hasArt || (filter.hasArt && lieu.hasArt)) {
              if (!filter.unique || (filter.unique && lieu.unique)) {
                if (filter.type !== "") {
                  if (lieu.categories.indexOf(filter.type) > -1) {
                    res.push(lieu);
                  }
                } else {
                  res.push(lieu);
                }
              }
            }
          }
        }
      }
      return res;
    }
  }

]);

hensApp.villageToTag = {
  sulimo: 5,
  anar: 3,
  wilwar: 4,
  ulmo: 2
};

hensApp.customTimeFormats = {
  MINUTE_SECOND_TEXT: "mm unit ss unit"
};

hensApp.formatTime = function (ms, formatter) {
  ms /= 1000;
  let m = Math.floor(ms / 60);
  let minutes = m < 10 ? "0" + m : m;
  let s = Math.floor(ms % 60);
  let seconds = s < 10 ? "0" + s : s;
  if (formatter === "mm:ss") {
    return minutes + " : " + seconds;
  } else if (formatter === "mm unit ss unit") {
    let mUnit = "minute" + (m > 1 ? "s" : "");
    let sUnit = "seconde" + (s > 1 ? "s" : "");
    return `${minutes} ${mUnit} ${seconds} ${sUnit}`;
  } else {
    return number;
  }
};

hensApp.formatPhraseDate = function (date) {
  let d = moment(date);
  return `Le ${d.date()} ${hensApp.c.months[d.month()]} ${d.year()}`;
}

hensApp.defineMiniature = function (post) {
  if ((post.miniature === undefined) || (post.miniature === "")) {
    if (post.type === "videos") {
      post.formatType = "Vidéo";
      post.miniature = myLocalized.medias + 'common/camera.png';
    }
    if (post.type === "musiques") {
      post.formatType = "Musique";
      post.miniature = myLocalized.medias + 'common/musique.png';
    }
    if (post.type === "images") {
      post.formatType = "Image";
      post.miniature = myLocalized.medias + 'common/image.png';
    }
    if (post.type === "photos") {
      post.formatType = "Photo";
      post.miniature = myLocalized.medias + 'common/photo.png';
    }
    if (post.type === "recit") {
      post.formatType = "Récit";
      post.miniature = myLocalized.medias + 'common/ecrit.png';
    }
    if (post.type === "legende") {
      post.formatType = "Légende";
      post.miniature = myLocalized.medias + 'common/ecrit.png';
    }
    if (post.type === "article") {
      post.formatType = "Article";
      post.miniature = myLocalized.medias + 'common/ecrit.png';
    }
    if (post.type === "jeux_videos") {
      post.formatType = "Jeu vidéo";
      post.miniature = myLocalized.medias + 'common/game.png';
    }
  }
  return post;
};

hensApp.debounce = function (func, wait, immediate) {
  var timeout;
  return function () {
    var context = this, args = arguments;
    var later = function () {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    var callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
};

hensApp.css = (id, value) => parseInt($(id).css(value).replace('px', ''));

/**
 * Shuffle array. (unpure function)
 * @returns the randomized array
 */
hensApp.shuffleArray = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

hensApp.lerp = function lerp(v0, v1, t) {
  return v0 * (1 - t) + v1 * t
};

//
//
//  `7MM"""Mq.                   mm            mm
//    MM   `MM.                  MM            MM
//    MM   ,M9 `7Mb,od8 ,pW"Wq.mmMMmm ,pW"Wq.mmMMmm `7M'   `MF'`7MMpdMAo.  .gP"Ya
//    MMmmdM9    MM' "'6W'   `Wb MM  6W'   `Wb MM     VA   ,V    MM   `Wb ,M'   Yb
//    MM         MM    8M     M8 MM  8M     M8 MM      VA ,V     MM    M8 8M""""""
//    MM         MM    YA.   ,A9 MM  YA.   ,A9 MM       VVV      MM   ,AP YM.    ,
//  .JMML.     .JMML.   `Ybmd9'  `Mbmo`Ybmd9'  `Mbmo    ,V       MMbmmd'   `Mbmmd'
//                                                     ,V        MM
//                                                  OOb"       .JMML.

String.prototype.capitalizeFirstLetter = function () {
  return this.charAt(0).toUpperCase() + this.slice(1).replace("_", " ");
};

Number.prototype.mod = function (n) {
  return ((this % n) + n) % n;
};

Number.prototype.clamp = function (min, max) {
  return Math.min(Math.max(this, min), max);
}

var HEADER_EVENTS = {
  LOAD: 'header:loading',
  LOADED: 'header:load_end',
  SUCCESS: 'header:load_success',
  ERROR: 'header:error',
  CURRENT_PAGE: 'header:current_page'
};
