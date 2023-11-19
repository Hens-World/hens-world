angular.module('app').component('equinoxeSulimo', {
  templateUrl: myLocalized.partials + 'equinoxeSulimo.html',
  controllerAs: 'museCtrl',
  bindings: {
    instrument: '<',
    hoveredInstrument: '<'
  },
  controller: [
    '$scope', '$element', '$rootScope', 'eventsFactory', function ($scope, $element, $rootScope, eventsFactory) {
      this.map = $scope.$parent;
      this.currentScreen = null;
      this.playingMusics = {};
      this.noteList = ["C", "D", "E", "F", "G", "A", "B"];
      this.noteLabels = ["Do", "Ré", "Mi", "Fa", "Sol", "La", "Si"];
      this.currentSynth = null;
      this.demoPlaying = false;
      this.currentPart = null;
      $scope.volumeSlider = 90;
      this.sliderOpt = {
        globalVolume: {
          floor: 0,
          ceil: 100
        }
      };

      $scope.$watch('volumeSlider', (n, o) => {
        if (n != o && n != null) {
          this.globalVolume.set("volume", (n / 2) - 50);
        }
      });
      this.musicSheet = {
        notes: []
      };
      //TODO STARTING OCTAVE
      this.startingOctave = {
        'violin': 2,
        'clarinet': 1,
        'guitar-acoustic': 1,
        'xylophone': 1
      };
      this.instrumentVolume = {
        'violin': -13,
        'xylophone': 0,
        'guitar-acoustic': -5,
        'clarinet': -6
      };
      this.updateInterval = null; // interval for sound volume checking

      //init music sheet
      for (let i = 13; i >= 0; i--) {
        let loop = Math.floor(i / 7);
        let keyLoop = Math.floor((i + 2) / 7);
        let note = {
          label: this.noteLabels[i - loop * this.noteLabels.length],
          note: this.noteList[i - loop * this.noteLabels.length] + (loop + 3).toString(),
          times: []
        };
        for (let j = 0; j < 4 * 6; j++) {
          note.times.push({
            pushed: false,
            continued: false,
            continuing: false,
            index: j
          });
        }
        this.musicSheet.notes.push(note);
      }

      this.eventInit = false;
      this.launchVillageMusic = () => {
        this.eventInit = true;
        if (this.musicDataList) if (!this.isMusicInit) {
          this.initMusics();
        } else {
          Tone.Transport.start();
          if (!this.updateInterval) {
            this.launchSpatialization();
          }
        }
      };

      this.closeInstrument = () => {
        this.resetSheet();
        $scope.$emit('destroyCurrentInstrument');
      };

      this.$onChanges = (changeObj) => {
        if (changeObj.instrument) {
          if (changeObj.instrument.currentValue != null) {
            Tone.Transport.stop();
            this.currentSynth = SampleLibrary.load({
              instruments: this.instrument,
              baseUrl: '/medias/events/equinoxe-automne/samples/',
            });
            if (this.musicDataList) {
              this.musicDataList.forEach(music => {
                music.currentPart.mute = true;
              });
            }
          } else {
            if (this.musicDataList) {
              this.musicDataList.forEach(music => {
                music.currentPart.mute = false;
              });
              Tone.Transport.start();
            }
          }
        }
        if (changeObj.hoveredInstrument) {
          if (changeObj.hoveredInstrument.currentValue != null) {
            this.hoveredSheet =
              this.musicDataList.find(musicData => changeObj.hoveredInstrument.currentValue.label.indexOf(musicData.instrument) >=
                0);
          } else {
          }
        }
      };

      this.$onInit = () => {
        var head = document.getElementsByTagName('head')[0];
        var imported = document.createElement('script');
        imported.type = "text/javascript";
        imported.src = '/js/externals/Tone.js';
        imported.onload = () => {
          this.currentSynth = SampleLibrary.load({
            instruments: this.instrument,
            baseUrl: '/medias/events/equinoxe-automne/samples/'
          });
          Tone.Transport.bpm.value = 140;
          this.bufferLoaded = false;
          Tone.Buffer.on('load', () => {
            this.bufferLoaded = true;
            this.currentSynth.toMaster();
            const masterCompressor = new Tone.Compressor({
              threshold: -20,
              ratio: 12,
              attack: 0,
              release: 0.3
            });
            if (!this.isMusicInit && this.musicDataList) {
              this.initMusics();
            }
          });
          let previousBar = 0;
          var loop = new Tone.Loop((time) => {
            this.musicSheet.notes.forEach((line) => {
              line.times[previousBar].highlight = false;
            });
            let [bar, beat, sixteenths] = Tone.Transport.position.split(':').map(str => parseInt(str));
            let index = (bar * 4 + beat) % 24;
            this.musicSheet.notes.forEach((line) => {
              line.times[index].highlight = true;
            });
            previousBar = index;
          }, "4n").start(0);

          //some overall compression to keep the levels in check
          const masterCompressor = new Tone.Compressor({
            threshold: -20,
            ratio: 12,
            attack: 0,
            release: 0.3
          });

          //give a little boost to the lows
          const lowBump = new Tone.Filter({
            type: 'lowshelf',
            frequency: 90,
            Q: 1,
            gain: 20
          });
          this.globalVolume = new Tone.Volume(-5);
          Tone.Master.chain(lowBump, masterCompressor, this.globalVolume);
          this.loadCurrentMusiques();
        };
        head.appendChild(imported);
        window.addEventListener('mouseup', this.releasePushNote);
      };

      this.isPushingNote = false;
      this.startPushNoteData = {
        line: null,
        note: null,
        consecutiveNotes: []
      };
      this.startPushNote = (line, note) => {
        note.pushed = !note.pushed;
        if (note.pushed) {
          this.isPushingNote = true;
          this.startPushNoteData.line = line;
          this.startPushNoteData.note = note;
        } else {
          if (note.continuing) {
            note.continuing = false;
            let forwardRemove = line.times[note.index + 1];
            while (forwardRemove) {
              forwardRemove.pushed = false;
              forwardRemove.continued = false;
              if (forwardRemove.continuing) {
                forwardRemove.continuing = false;
                forwardRemove = line.times[forwardRemove.index + 1];
              } else {
                forwardRemove = null;
              }
            }
          }
        }
        if (note.continued) {
          note.continued = false;
          let backwardRemove = line.times[note.index - 1];
          while (backwardRemove) {
            backwardRemove.pushed = false;
            backwardRemove.continuing = false;
            if (backwardRemove.continued) {
              backwardRemove.continued = false;
              backwardRemove = line.times[backwardRemove.index - 1];
            } else {
              backwardRemove = null;
            }
          }
        }
      };

      this.updatePushNote = (line, note) => {
        if (this.isPushingNote) {
          let lastNote = this.startPushNoteData.consecutiveNotes.length > 0 ?
            this.startPushNoteData.consecutiveNotes[this.startPushNoteData.consecutiveNotes.length - 1] :
            this.startPushNoteData.note;
          if (note.index === lastNote.index + 1 && line.note === this.startPushNoteData.line.note) {
            lastNote.continuing = true;
            note.pushed = true;
            note.continued = true;
            this.startPushNoteData.consecutiveNotes.push(note);
          }
        }
      };

      this.releasePushNote = () => {
        this.isPushingNote = false;
        if (this.startPushNoteData.note != null) {
          this.currentSynth.triggerAttackRelease(this.startPushNoteData.line.note, 60 / 140 *
            (1 + this.startPushNoteData.consecutiveNotes.length));
        }
        this.startPushNoteData = {
          note: null,
          line: null,
          consecutiveNotes: []
        };
        //update parition
        if (this.currentPart) {
          this.currentSynth.triggerRelease();
          this.currentPart.removeAll();
          let data = this.parseMusicSheet(this.musicSheet);
          this.currentPart = new Tone.Part((time, value) => {
            this.currentSynth.triggerAttackRelease(value.note, value.duration, time);
          }, data);
          this.currentPart.start(0);
          this.currentPart.loop = true;
          this.currentPart.loopEnd = "6m";
          Tone.Transport.start();
          this.demoPlaying = true;
        }
      };

      this.resetSheet = () => {
        this.musicSheet.notes.forEach(line => {
          line.times.forEach(note => {
            note.pushed = false;
            note.continued = false;
            note.continuing = false;
          });
        });
        this.stopEditionSheet();
      };

      this.stopEditionSheet = () => {
        this.demoPlaying = false;
        Tone.Transport.stop();
        this.currentSynth.triggerRelease();
        if (this.currentPart) {
          this.currentPart.removeAll();
          this.currentPart = null;
        }
      };

      this.playSheet = () => {
        if (Tone.Transport.state == "started") {
          this.stopEditionSheet();
        } else {
          let data = this.parseMusicSheet(this.musicSheet);
          this.currentPart = new Tone.Part((time, value) => {
            this.currentSynth.triggerAttackRelease(value.note, value.duration, time);
          }, data);
          this.currentPart.start(0);
          this.currentPart.loop = true;
          this.currentPart.loopEnd = "6m";
          Tone.Transport.start();
          this.demoPlaying = true;
        }
      };

      this.goToNextSong = (musicSheet) => {
        let nextSheet = musicSheet.upcomingSheets[0];
        nextSheet.upcomingSheets = musicSheet.upcomingSheets.filter((o, i) => i > 0);
        nextSheet.remainingPlayTime += musicSheet.remainingPlayTime;
        delete musicSheet.upcomingSheets;
        musicSheet.currentPart.removeAll();
        nextSheet.toneInstrument = musicSheet.toneInstrument;
        delete musicSheet.toneInstrument;
        nextSheet.volume = musicSheet.volume;
        delete musicSheet.volume;
        delete musicSheet.formattedMusicSheet;
        nextSheet.formattedMusicSheet = JSON.parse(nextSheet.music_sheet);
        let data = this.parseMusicSheet(nextSheet.formattedMusicSheet);
        // console.log("partition for: ", musicData.instrument, musicData.formattedMusicSheet, data);
        nextSheet.currentPart = new Tone.Part((time, value) => {
          nextSheet.toneInstrument.triggerAttackRelease(value.note, value.duration, time);
        }, data);
        nextSheet.prop = this.map.propLoadList.find(prop => prop.label.indexOf(nextSheet.instrument) >= 0);
        nextSheet.currentPart.start(0);
        nextSheet.currentPart.loop = true;
        nextSheet.currentPart.loopEnd = "6m";
        let sheetIndex = this.musicDataList.findIndex(sheet => sheet.instrument === musicSheet.instrument);
        this.musicDataList[sheetIndex] = nextSheet;
      };

      this.parseMusicSheet = (musicSheet) => {
        let data = [];
        musicSheet.notes.forEach(line => {
          line.times.forEach((note, arrIndex) => {
            if (note.pushed && !note.continued) {
              let time = 60 / 140;
              if (note.continuing) {
                let pIndex = arrIndex;
                let continuedNote = line.times[++pIndex];
                while (continuedNote) {
                  if (continuedNote.continued) {
                    time += 60 / 140;
                    continuedNote = line.times[++pIndex];
                  } else {
                    continuedNote = false;
                  }
                }
              }
              data.push({
                time: `${Math.floor(note.index / 4)}:${note.index % 4}:0`,
                note: line.note,
                duration: time,
              });
            }
          });
        });
        return data;
      };

      this.isMusicInit = false;

      this.initMusics = () => {
        if (!this.musicDataList) return;
        this.isMusicInit = true;
        this.musicDataList.forEach(musicData => {
          musicData.toneInstrument = SampleLibrary.load({
            instruments: musicData.instrument,
            baseUrl: '/medias/events/equinoxe-automne/samples/',
            onload: () => {
              if (this.eventInit) {
                Tone.Transport.start();
                this.launchSpatialization();
              }
            }
          });
          musicData.volume = new Tone.Panner3D(0, 0, 0);
          // musicData.instrument.toMaster();
          let customVolume = new Tone.Volume(this.instrumentVolume[musicData.instrument]);
          musicData.toneInstrument.chain(musicData.volume, customVolume, Tone.Master);
          musicData.formattedMusicSheet = JSON.parse(musicData.music_sheet);
          let data = this.parseMusicSheet(musicData.formattedMusicSheet);
          // console.log("partition for: ", musicData.instrument, musicData.formattedMusicSheet, data);
          musicData.currentPart = new Tone.Part((time, value) => {
            musicData.toneInstrument.triggerAttackRelease(value.note, value.duration, time);
          }, data);
          musicData.prop = this.map.propLoadList.find(prop => prop.label.indexOf(musicData.instrument) >= 0);
          musicData.currentPart.start(0);
          musicData.currentPart.loop = true;
          musicData.currentPart.loopEnd = "6m";
        });
      };

      this.updatePosition = () => {
        this.position = this.map.getRealMapPos();
      };

      this.launchSpatialization = () => {
        this.updateInterval = setInterval(() => {
          let previousDistance = 1000000;
          let closestInstrument = null;
          this.updatePosition();
          let elapsedTime = +new Date() - this.musicStartTimestamp;
          this.musicDataList.forEach(musicSheet => {
            if (musicSheet.remainingPlayTime !== -12) {
              if (musicSheet.remainingPlayTime < elapsedTime) {
                this.goToNextSong(musicSheet);
              } else {
                // console.log('remaining time for: ', musicSheet.instrument, musicSheet.remainingPlayTime - elapsedTime +
                //   'ms');
              }
            }
            var a = this.position.x + window.innerWidth / 2 - musicSheet.prop.list[0].x;
            var b = this.position.y + window.innerHeight / 2 - musicSheet.prop.list[0].y;
            let distance = Math.sqrt(a * a + b * b);
            if (distance < previousDistance) {
              previousDistance = distance;
              closestInstrument = musicSheet.instrument;
            }
            musicSheet.volume.positionX =
              (Math.abs(a) < window.innerWidth / 2.5 ? 0 : a - Math.sign(a) * window.innerWidth / 2.5) /
              ((distance < 1200) ? 26 : 5);
            musicSheet.volume.positionY =
              (Math.abs(b) < window.innerHeight / 2.5 ? 0 : b - Math.sign(b) * window.innerHeight / 2.5) /
              ((distance < 1200) ? 24 : 5);
            musicSheet.volume.positionZ = 2 + distance / 180;
          });
          if (closestInstrument != null) {
            let focusedSheet = this.musicDataList.find(musicSheet => musicSheet.instrument == closestInstrument);
            focusedSheet.volume.positionX /= 1.3;
            focusedSheet.volume.positionY /= 1.3;
            focusedSheet.volume.positionZ = 1.5;
          }
        }, 1000 / 20);
      };
      this.loadCurrentMusiques = () => {
        eventsFactory.equinoxeAutomne.getCurrentMusics().then(data => {
          this.musicStartTimestamp = +new Date();
          this.musicDataList = [];
          Object.keys(data.data).forEach(instrumentKey => {
            let sheetList = data.data[instrumentKey].reverse();
            if (sheetList.length > 0) {
              let musicSheet = sheetList[0];
              musicSheet.upcomingSheets = sheetList.filter((sheet, index) => index > 0);
              this.musicDataList.push(musicSheet);
            }
          });
          if (Tone != null) {
            this.initMusics();
          }
        }).catch($rootScope.handleError);
      };

      this.updateCurrentMusic = (instrument) => {
        eventsFactory.equinoxeAutomne.getCurrentMusic(instrument).then((music) => {
          this.playingMusics[instrument] = music;
          //TODO handle music to play;
        }).catch($rootScope.handleError);
      };

      this.postMusic = () => {
        eventsFactory.equinoxeAutomne.postMusic(this.instrument, this.musicSheet).then((data) => {
          $rootScope.setAlert('success', 'Le musicien a bien lu votre partition, et commence à la jouer !');
          this.updateCurrentMusic(this.instrument);
          setTimeout(() => {
            location.reload();
          }, 500);
        }).catch($rootScope.handleError);
      };
      this.$onDestroy = () => {
        clearInterval(this.updateInterval);
        window.removeEventListener("mouseup", this.releasePushNote);
        Tone.Transport.stop();
      };
    }
  ]
});

var SampleLibrary = {
  minify: false,
  ext: '.[mp3|ogg]', // use setExt to change the extensions on all files // do not change this variable //
  baseUrl: '/samples/',
  list: ['clarinet', 'guitar-acoustic', 'violin', 'xylophone'],
  onload: null,

  setExt: function (newExt) {
    var i
    for (i = 0; i <= this.list.length - 1; i++) {
      for (var property in this[this.list[i]]) {

        this[this.list[i]][property] = this[this.list[i]][property].replace(this.ext, newExt)
      }

    }
    this.ext = newExt;
  },

  load: function (arg) {
    var t, rt, i;
    (arg) ? t = arg : t = {};
    t.instruments = t.instruments || this.list;
    t.baseUrl = t.baseUrl || this.baseUrl;
    t.onload = t.onload || this.onload;

    // update extensions if arg given
    if (t.ext) {
      if (t.ext != this.ext) {
        this.setExt(t.ext)
      }
      t.ext = this.ext
    }

    rt = {};

    // if an array of instruments is passed...
    if (Array.isArray(t.instruments)) {
      for (i = 0; i <= t.instruments.length - 1; i++) {
        var newT = this[t.instruments[i]];
        //Minimize the number of samples to load
        if (this.minify === true || t.minify === true) {
          var minBy = 1;
          if (Object.keys(newT).length >= 17) {
            minBy = 2
          }
          if (Object.keys(newT).length >= 33) {
            minBy = 4
          }
          if (Object.keys(newT).length >= 49) {
            minBy = 6
          }

          var filtered = Object.keys(newT).filter(function (_, i) {
            return i % minBy != 0;
          })
          filtered.forEach(function (f) {
            delete newT[f]
          })

        }

        rt[t.instruments[i]] = new Tone.Sampler(newT, {
          baseUrl: t.baseUrl + t.instruments[i] + "/",
          onload: t.onload
        })
      }

      return rt

      // if a single instrument name is passed...
    } else {
      newT = this[t.instruments];

      //Minimize the number of samples to load
      if (this.minify === true || t.minify === true) {
        minBy = 1;
        if (Object.keys(newT).length >= 17) {
          minBy = 2
        }
        if (Object.keys(newT).length >= 33) {
          minBy = 4
        }
        if (Object.keys(newT).length >= 49) {
          minBy = 6
        }

        filtered = Object.keys(newT).filter(function (_, i) {
          return i % minBy != 0;
        });
        filtered.forEach(function (f) {
          delete newT[f]
        })
      }

      var s = new Tone.Sampler(newT, {
        baseUrl: t.baseUrl + t.instruments + "/",
        onload: t.onload
      });

      return s;
    }
  },

  'clarinet': {
    'D3': 'D3.[mp3|ogg]',
    'D4': 'D4.[mp3|ogg]',
    'D5': 'D5.[mp3|ogg]',
    'F2': 'F2.[mp3|ogg]',
    'F3': 'F3.[mp3|ogg]',
    'F4': 'F4.[mp3|ogg]',
    'F#5': 'Fs5.[mp3|ogg]',
    'A#2': 'As2.[mp3|ogg]',
    'A#3': 'As3.[mp3|ogg]',
    'A#4': 'As4.[mp3|ogg]',
    'D2': 'D2.[mp3|ogg]'
  },
  'guitar-acoustic': {
    'F3': 'F3.[mp3|ogg]',
    'F#1': 'Fs1.[mp3|ogg]',
    'F#2': 'Fs2.[mp3|ogg]',
    'F#3': 'Fs3.[mp3|ogg]',
    'G1': 'G1.[mp3|ogg]',
    'G2': 'G2.[mp3|ogg]',
    'G3': 'G3.[mp3|ogg]',
    'G#1': 'Gs1.[mp3|ogg]',
    'G#2': 'Gs2.[mp3|ogg]',
    'G#3': 'Gs3.[mp3|ogg]',
    'A1': 'A1.[mp3|ogg]',
    'A2': 'A2.[mp3|ogg]',
    'A3': 'A3.[mp3|ogg]',
    'A#1': 'As1.[mp3|ogg]',
    'A#2': 'As2.[mp3|ogg]',
    'A#3': 'As3.[mp3|ogg]',
    'B1': 'B1.[mp3|ogg]',
    'B2': 'B2.[mp3|ogg]',
    'B3': 'B3.[mp3|ogg]',
    'C2': 'C2.[mp3|ogg]',
    'C3': 'C3.[mp3|ogg]',
    'C4': 'C4.[mp3|ogg]',
    'C#2': 'Cs2.[mp3|ogg]',
    'C#3': 'Cs3.[mp3|ogg]',
    'C#4': 'Cs4.[mp3|ogg]',
    'D1': 'D1.[mp3|ogg]',
    'D2': 'D2.[mp3|ogg]',
    'D3': 'D3.[mp3|ogg]',
    'D4': 'D4.[mp3|ogg]',
    'D#1': 'Ds1.[mp3|ogg]',
    'D#2': 'Ds2.[mp3|ogg]',
    'D#3': 'Ds3.[mp3|ogg]',
    'E1': 'E1.[mp3|ogg]',
    'E2': 'E2.[mp3|ogg]',
    'E3': 'E3.[mp3|ogg]',
    'F1': 'F1.[mp3|ogg]',
    'F2': 'F2.[mp3|ogg]'
  },

  'violin': {
    'A3': 'A3.[mp3|ogg]',
    'A4': 'A4.[mp3|ogg]',
    'A5': 'A5.[mp3|ogg]',
    'A6': 'A6.[mp3|ogg]',
    'C4': 'C4.[mp3|ogg]',
    'C5': 'C5.[mp3|ogg]',
    'C6': 'C6.[mp3|ogg]',
    'C7': 'C7.[mp3|ogg]',
    'E4': 'E4.[mp3|ogg]',
    'E5': 'E5.[mp3|ogg]',
    'E6': 'E6.[mp3|ogg]',
    'G4': 'G4.[mp3|ogg]',
    'G5': 'G5.[mp3|ogg]',
    'G6': 'G6.[mp3|ogg]'
  },

  'xylophone': {
    'C7': 'C7.[mp3|ogg]',
    'G3': 'G3.[mp3|ogg]',
    'G4': 'G4.[mp3|ogg]',
    'G5': 'G5.[mp3|ogg]',
    'G6': 'G6.[mp3|ogg]',
    'C4': 'C4.[mp3|ogg]',
    'C5': 'C5.[mp3|ogg]',
    'C6': 'C6.[mp3|ogg]'
  }
};
