angular.module('app').factory('musicPlayerFactory', ['$rootScope', 'postFactory', function ($rootScope, postFactory) {
  let factory;
  this.currentSong = null;
  this.currentSongIndex = 0;
  this.playlist = [];
  this.order = [];
  this.player = document.createElement('audio');
  this.player.setAttribute('id', 'audioPlayer');
  this.playerControls = {
    volume: 1,
    shuffle: true,
    repeat: true,
    isNextOk: true,
    isLoopOk: false
  };
  this.songInfo = {};
  this.playing = false;
  const track = 0;
  const audioType = '.mp3';

  //listeners
  $rootScope.$on('previousSong', () => factory.previousSong());

  $rootScope.$on('nextSong', () => factory.nextSong());

  $rootScope.$on('volume-update', (e, data) => factory.setVolume(data));

  $rootScope.$on('toggleShuffleDisplay', () => factory.toggleShuffle());

  $rootScope.$on('togglePlay', (event, musicBound) => {
    if (!musicBound) {
      factory.togglePlay()
    }
    else {
      if (this.getCurrentSong().slug === musicBound) {
        factory.togglePlay();
      }
      else {
        factory.setSong(musicBound);
        if (!this.playing) {
          factory.togglePlay();
        }
      }
    }
  });

  $rootScope.$on('changeSong', (event, music) => {
    factory.setSong(music.slug);
    if (!this.playing) {
      factory.togglePlay();
    }
  });

  //JQUERY RAW HANDLING
  $('body').keydown((e)=> {
    if ((e.keyCode === 32) && (e.target.type !== "textarea") && (e.target.type !== "input") && (e.target.type !== "text") && !e.target.parentElement.classList.contains('ta-text')) {
      factory.togglePlay();
    }
  });

  //private functions
  this.getCurrentSong = () => {
    if (this.currentSongIndex === -1) {
      return null;
    }
    return this.playlist[this.order[this.currentSongIndex]];
  };

  this.shuffle = (a) => {
    let j, x, i;
    for (i = a.length - 1; i > 0; i--) {
      j = Math.floor(Math.random() * (i + 1));
      x = a[i];
      a[i] = a[j];
      a[j] = x;
    }
    return a;
  };

  this.rearrange = array => {
    array.sort(function (a, b) {
      if (a < b) {
        return -1;
      } else if (a > b) {
        return 1;
      }
      return 0;
    });
    return array;
  };

  this.currentSongAttr = () => {
    const song = this.getCurrentSong();
    this.songInfo = {
      title: song.title,
      formatTitle: song.formatTitle,
      artist: song.author.display_name,
      label: '',
      village: song.village.slug,
      lieu: song.location.slug,
      miniature: song.miniature
    };
    $rootScope.$broadcast('song-info-updated', this.songInfo);
    $rootScope.$broadcast('song-changed', {
      slug: this.getCurrentSong().slug,
      isPlaying: this.isPlaying
    });
    this.checkNext();
  };

  this.checkNext = () => {
    this.playerControls.isNextOk = this.playerControls.repeat || this.currentSongIndex !== this.playlist.length - 1;
    this.playerControls.isLoopOk = this.playerControls.repeat || this.currentSongIndex !== 0;
    $rootScope.$broadcast('player-controls-updated', this.playerControls);
  };

  this.updateTimer = () => {
    const time = factory.getCurrentTime();
    const duration = factory.getDuration();
    const per = time / duration;
    $rootScope.$broadcast('timer-updated', {
      percent: per,
      slug: this.getCurrentSong().slug
    });
    const minutes = Math.floor(time / 60);
    let seconds =  Math.floor(time % 60);
    if (seconds < 10) {
      seconds = `0${seconds}`;
    }
    if(minutes !== this.songInfo.minutes || seconds !== this.songInfo.seconds) {
      this.songInfo.minutes = minutes;
      this.songInfo.seconds = seconds;
    }
    if ((time >= duration) && (this.playing === true)) {
      if ((this.currentSongIndex < (this.playlist.length - 1)) || this.playerControls.repeat) {
        factory.nextSong();
      }
    }
  };

  //public functions
  return factory = {
    getPlayerControls: () => {
      return this.playerControls;
    },
    loadPlaylist: () => {
      return postFactory.getPosts({
        page: 1,
        pageSize: 1000,
        type: 'musiques',
        columns: 'musique'
      }).then((res) => {
        this.playlist = res.data;
        this.playlist.forEach((song) => {
          if (!song.miniature) {
            song.miniature = myLocalized.medias + "article/no-mini-music.png";
          }
          song.source = song.musique;
          song.formatTitle = song.title;
        });
        for (let i = 0; i < this.playlist.length; i++) {
          this.order.push(i);
        }
        this.order = this.shuffle(this.order);
        this.timerInterval = setInterval(()=> this.updateTimer(), 100);
        $rootScope.$broadcast('playlist-updated', {
          playlist: this.playlist
        });
        //start a loading loop to get every info initialized
        this.currentSongIndex = -1;
        factory.nextSong();
      });
    },
    getPlaylist: () => {
      return this.playlist;
    },
    setSong: (slug) => {
      this.getCurrentSong().isSelected = false;
      this.player.pause();
      const playlistIndex = this.playlist.findIndex((music) => music.slug === slug);
      this.currentSongIndex = this.order.indexOf(playlistIndex);
      this.player.setAttribute("src", this.getCurrentSong().source);
      this.getCurrentSong().isSelected = true;
      setTimeout(() => {
        if (this.playing === true) {
          this.player.play();
        }
      }, 1);
      this.currentSongAttr();
    },
    play: () => {
      this.player.play();
    },
    pause: () => {
      this.player.pause();
    },
    nextSong: () => {
      if (this.currentSongIndex !== -1) {
        for (let song of this.playlist) {
          song.isSelected = false;
        }
      }
      if (this.currentSongIndex < (this.playlist.length - 1)) {
        this.player.pause();
        this.currentSongIndex++;
        this.player.setAttribute("src", this.getCurrentSong().source);
        if (this.playing === true) {
          this.player.play();
        }
      } else if (this.playerControls.repeat) {
        this.player.pause();
        this.currentSongIndex = 0;
        this.player.setAttribute("src", this.getCurrentSong().source);
        if (this.playing === true) {
          this.player.play();
        }
      }
      this.getCurrentSong().isSelected = true;
      this.currentSongAttr();

    },
    currentSongAttr: ()=>{
      this.currentSongAttr();
    },
    previousSong: () => {
      this.getCurrentSong().isSelected = false;
      this.player.pause();
      if (this.currentSongIndex > 0) {
        this.currentSongIndex--;
      } else if (this.playerControls.repeat) {
        this.currentSongIndex = playlist.length - 1;
      }
      this.player.setAttribute("src", this.getCurrentSong().source);
      if (this.playing === true) {
        this.player.play();
      }
      this.getCurrentSong().isSelected = true;
      this.currentSongAttr();
    },
    getCurrentSong: () => {
      return this.getCurrentSong();
    },
    getCurrentTime: () => {
      return this.player.currentTime;
    },
    setCurrentTime: (time) => {
      this.player.currentTime = time;
    },
    getDuration: () => {
      return this.player.duration;
    },
    setVolume: (value) => {
      if(typeof value === 'number') {
        this.player.volume = value;
      }
      $rootScope.$broadcast('volume-updated', factory.getVolume());
    },
    getVolume: () => {
      return this.player.volume;
    },
    isPlaying: () => {
      return this.playing;
    },
    togglePlay: () => {
      this.playing = !this.playing;
      this.playing ? this.player.play() : this.player.pause();
      $rootScope.$broadcast('play-state-updated', {
        slug: this.getCurrentSong().slug,
        state: this.playing
      });
    },
    toggleShuffle: () => {
      this.playerControls.shuffle = !this.playerControls.shuffle;
      this.order = this.playerControls.shuffle ? this.shuffle(this.order) : this.rearrange(this.order);
      $rootScope.$broadcast("player-control-updated", this.playerControls);
    },
    toggleRepeat: () => {
      this.playerControls.repeat = !this.playerControls.repeat;
      $rootScope.$broadcast("player-controls-updated", this.playerControls);
      this.checkNext();
    },
  };
}]);