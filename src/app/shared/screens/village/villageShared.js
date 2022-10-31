class VillageUtils {

  constructor(scope, rootScope, localeFactory, eventsFactory, angularLocation, angularCompile) {
    this.scope = scope;
    this.rootScope = rootScope;
    this.localeFactory = localeFactory;
    this.eventsFactory = eventsFactory;
    this.location = angularLocation;
    this.compile = angularCompile;


    /**
     *  handles tile loading, putting image in place, showing prop above it.
     * @param event file Event
     */
    this.handleFileLoad = (event) => {
      const bloc = $(`.${event.item.id}`);
      $(bloc).empty();
      $(bloc).append(event.result);
      setTimeout(() => {
        $(bloc)[0].classList.add('shown');
        const rect = $(bloc)[0].getBoundingClientRect();
        $('.village__prop-unit').each((idx, prop) => {
          const propRect = prop.getBoundingClientRect();
          const left = propRect.left + (propRect.width / 2);
          const top = propRect.top + (propRect.height / 2);
          if ((left >= rect.left) && (left <= (rect.left + rect.width)) && (top >= rect.top) &&
            (top <= (rect.top + rect.height))) {
            prop.style.opacity = 1;
          }
        });
        this.scope.tileLoadEventsHandlers.forEach(handler => handler(rect));
      }, 1);
    };

    this.getVillageLayout = () => {
      return new Promise((resolve, reject) => {
        let url = `${this.scope.effectiveZone}`;
        if (this.scope.district) {
          url += `_${this.scope.district}`;
        }
        this.localeFactory.html(url).then((villageHTMLData) => {
          this.scope.mapVillageElement.innerHTML = villageHTMLData.data;

          /** scale all tiles */
          document.querySelectorAll(".tr .img").forEach((villageTile)=>{
            villageTile.setAttribute("width", (parseInt(villageTile.getAttribute("width")) * this.scope.mapScale).toString());
            villageTile.setAttribute("height", (parseInt(villageTile.getAttribute("height")) * this.scope.mapScale).toString());
          });
          resolve();
        }).catch(this.rootScope.handleError);
      });
    }


    this.displayLocationCreations = (location, preventInterior) => {
      if (location.slug === this.scope.locaSlug && this.scope.mapState.showArticles) {
        this.scope.mapState.showArticles = false;
        location.isOpen = false;
        this.scope.locaSlug = null;
        return;
      }
      let link, x, y;
      // si une map existe, link to it instead of displaying articles
      if (!preventInterior && location.interior && location.interiorDates && this.scope.dateMatches(location.interiorDates)) {
        this.location.path(`${this.location.path().replace('/int', '').replace('/' + location.slug, '')}/${location.slug}/int`);
      } else if (location.event && location.eventDates && this.scope.dateMatches(location.eventDates)) {
        switch (location.event) {
          case 'go_to_aquarium':
            this.location.path('/events/solstice-ulmo');
            break;
          case "open_crushrun":
            window.location.href = "https://crushrun.hens-world.com";
            // this.location.path('/events/coupe-crushrun');
            break;
        }
      } else {
        x = (location.pos.x + (location.width / 2));
        y = (location.pos.y);

        location.isOpen = true;
        this.scope.moveMapToAsSelected(x, y);
        let directive = "location-article-display";
        for (let uniLoca of this.scope.uniqueLocationList) {
          if (uniLoca.slug === location.slug) {
            ({directive} = uniLoca);
            ({link} = uniLoca);
          }
        }
        if ((directive !== 'domaine') && (directive !== 'link')) {
          $('.article-list').html('');
          const html = `<div ${directive} loca-slug='locaSlug' village='village'> </div>`;
          const el = $(html);
          const div = this.compile(el)(this.scope);
          $('.article-list').append(div);
          this.scope.locaSlug = location.slug;
          this.scope.mapState.showProfil = false;
          this.scope.mapState.showArticles = true;
        } else {
          if (link.indexOf('http') === 0) {
            var win = window.open(link, '_blank');
            win.focus();
          } else {
            this.location.path(link);
          }
        }
      }
    };


    /**
     *
     * @return {Promise<void>} once all necessary data is loaded and processed, map can launch all routines.
     */
    this.initVillageData = () => {
      return new Promise((resolve, reject) => {
        this.localeFactory.JSON('village/uniqueLocaList')
          .then((uniqueLocaData) => {
            this.scope.uniqueLocationList = uniqueLocaData.data;
            return null;
          })
          .then(this.getVillageLayout)
          .then(this.localeFactory.JSON.bind(this, `village/${this.scope.effectiveZone}`), false)
          .then((villageData) => {
            console.log('got village data')
            if (this.scope.district) {
              this.scope.vData = villageData.data[this.scope.district];
              this.scope.vData.locations = [];
              for (let location of Array.from(villageData.data.locations)) {
                if (this.scope.isInDistrict(location)) {
                  this.scope.vData.locations.push(location);
                }
              }
            } else {
              this.scope.vData = villageData.data;
            }
            // filter displayed locations
            this.scope.vData.locations =
              this.scope.vData.locations.filter(location => !location.mapDates ||
                this.scope.dateMatches(location.mapDates));

            //adjust to mapScale
            this.scope.vData.locations.forEach((location)=>{
              location.pos.x *= this.scope.mapScale;
              location.pos.y *= this.scope.mapScale;
              location.width *= this.scope.mapScale;
              location.height *= this.scope.mapScale;
            });
            this.scope.mapVillageElement.style.width = this.scope.vData.width * this.scope.mapScale + "px";
            this.scope.mapVillageElement.style.height = this.scope.vData.height * this.scope.mapScale + "px";
            this.scope.setMapPos(this.scope.vData.init.x * this.scope.mapScale, this.scope.vData.init.y * this.scope.mapScale);
            return true;
          })
          .then(this.eventsFactory.getCurrentEvent)
          .then((eventData) => {
            this.scope.currentEvent = eventData.data;
            return true;
          })
          .then(() => this.localeFactory.JSON(`village/props/${this.scope.effectiveZone}_props`))
          .then((villagePropsData) => {
            this.scope.villageUtils.displayProps(villagePropsData.data, () => {
              this.scope.startPropAnim();
              this.scope.villageUtils.displayContribs(villagePropsData.data, () => {
                this.scope.startPersoAnim();
                this.scope.loadCheckerInterval = setInterval(this.scope.loadingCheck, 200);

                /** Initialization pointer, going to character or location, depending URL params */
                if (this.scope.triggerGTP) {
                  this.scope.goToPerso();
                }
                if (this.scope.goTo !== undefined) {
                  if (this.scope.goTo.indexOf('perso-') === 0) {
                    this.scope.triggerGTP = true;
                  } else {
                    this.goToPointer();
                  }
                }

                resolve();
              });
            });
          })
          .catch(this.rootScope.handleError);
      });
    }


  }

  /**
   * Parses slug and find either house or animated sprite to go to, and open profile page.
   * @param slug the character name
   */
  openPerso(slug) {
    let persoInfo, x, y;
    this.scope.showProfil = true;
    for (var perso of Array.from(this.scope.contribLoadList)) {
      if (perso.slug === slug) {
        this.scope.currentProfil = {
          id: perso.id,
          char_index: perso.char_index,
          perso: slug,
          owner: perso.owner,
          img: perso.image,
          role: perso.status
        };

        persoInfo = perso.avail[perso.availIndex];

        this.scope.moveMapToAsSelected(persoInfo.x + persoInfo.width / 2, persoInfo.y);
        this.loadZone(persoInfo.x, persoInfo.y);
      }
    }
    for (perso of Array.from(this.scope.houseMainList)) {
      if (perso.slug === slug) {
        this.scope.currentProfil = {
          perso: slug,
          owner: perso.owner,
          img: perso.image,
          role: perso.status
        };
        persoInfo = perso.house;
        x = persoInfo.x + (persoInfo.width / 2);
        y = persoInfo.y;
        this.scope.moveMapToAsSelected(x, y);
        this.loadZone(x, y);
      }
    }
  }

  /**
   * Charge l'ensemble des zones d'image présente autour du point ciblé (selon la taille de l'écran.
   * @param x position en x du point de chargement
   * @param y position en y du point de chargement
   */
  loadZone(x, y) {
    const deltaX = hensApp.css('.map-village', 'margin-left') - (x ? x : this.scope.mapOffset.x);
    const deltaY = hensApp.css('.map-village', 'margin-top') - (y ? y : this.scope.mapOffset.y);
    for (let image = 1; image < this.scope.vData.sliceSize; image++) {
      var id;
      if (image < 10) {
        id = `${this.scope.effectiveZone}_0${image}`;
      } else {
        id = `${this.scope.effectiveZone}_${image}`;
      }
      const imageBlock = $(`.${id}`);

      if (!imageBlock.hasClass('loaded')) {
        if ((imageBlock.offset().top > (-imageBlock.attr('height') + deltaY)) &&
          (imageBlock.offset().top < ($(window).height() + deltaY)) &&
          (imageBlock.offset().left > (-imageBlock.attr('width') + deltaX)) &&
          (imageBlock.offset().left < ($(window).width() + deltaX))) {
          this.scope.loadImage(id);
        }
      }
    }
  };

  /**
   * parses all contribs and inits their data. handles map scaling and date checking.
   * @param res the raw data received from village_props.json
   * @param cb the callback once everything is loaded (including sprite data)
   */
  displayContribs(res, cb) {
    this.scope.contribDisplayList = res.contribs;
    for (let contrib of this.scope.contribDisplayList) {
      //adjust house to mapScale
      contrib.house.x *= this.scope.mapScale;
      contrib.house.y *= this.scope.mapScale;
      contrib.house.width *= this.scope.mapScale;
      contrib.house.height *= this.scope.mapScale;
      if (this.scope.isInDistrict(contrib)) {
        for (let index = 0; index < contrib.avail.length; index++) {

          const couple = contrib.avail[index];
          if (couple.fromT <= couple.to) {
            if ((this.scope.hour >= couple.fromT) && (this.scope.hour <= couple.to)) {
              contrib.availIndex = index;
              contrib.animIndex = Math.floor(Math.random() * 1);
              contrib.current = contrib.avail[contrib.availIndex];
              contrib.current.imgUrl =
                myLocalized.medias + `map/${this.scope.village}/${this.scope.effectiveFolder +
                (this.scope.district ? "_" + this.scope.district :
                  "")}/persos/${contrib.slug}/${contrib.current.posSlug}/${this.scope.mapTime}/${contrib.slug}_${contrib.current.posSlug}.png`;

              //adjust to map scale
              contrib.current.center.x *= this.scope.mapScale;
              contrib.current.center.y *= this.scope.mapScale;
              contrib.current.width *= this.scope.mapScale;
              contrib.current.height *= this.scope.mapScale;
              contrib.current.x *= this.scope.mapScale;
              contrib.current.y *= this.scope.mapScale;

              this.scope.contribLoadList.push(contrib);
              this.scope.houseEmptyList.push(contrib);
              break;
            }
          } else if (couple.fromT > couple.to) {
            if ((this.scope.hour >= couple.fromT) || (this.scope.hour <= couple.to)) {
              contrib.availIndex = index;
              contrib.current = contrib.avail[contrib.availIndex];
              contrib.current.imgUrl =
                myLocalized.medias + `map/${this.scope.village}/${this.scope.effectiveFolder +
                (this.scope.district ? "_" + this.scope.district :
                  "")}/persos/${contrib.slug}/${contrib.current.posSlug}/${this.scope.mapTime}/${contrib.slug}_${contrib.current.posSlug}.png`;

              //adjust to map scale
              contrib.current.center.x *= this.scope.mapScale;
              contrib.current.center.y *= this.scope.mapScale;
              contrib.current.width *= this.scope.mapScale;
              contrib.current.height *= this.scope.mapScale;
              contrib.current.x *= this.scope.mapScale;
              contrib.current.y *= this.scope.mapScale;

              contrib.animIndex = Math.floor(Math.random() * 1);

              this.scope.contribLoadList.push(contrib);
              this.scope.houseEmptyList.push(contrib);
              break;
            }
          }
          if (index === (contrib.avail.length - 1)) {
            this.scope.houseMainList.push(contrib);
          }
        }
      }
    }
    if (this.scope.contribLoadList.length === 0 && cb) {
      cb();
      return;
    }
    for (let contribLoad of this.scope.contribLoadList) {
      const {posSlug} = contribLoad.avail[contribLoad.availIndex];
      const url = `map/${this.scope.village}/${this.scope.effectiveFolder +
      (this.scope.district ? "_" + this.scope.district :
        '')}/persos/${contribLoad.slug}/${posSlug}/${this.scope.mapTime}/${contribLoad.slug}_${posSlug}_array`;
      this.localeFactory.JSON(url, true).then((res) => {
        res.data.meta.size.w *= this.scope.mapScale;
        res.data.meta.size.h *= this.scope.mapScale;
        res.data.frames.forEach((frame) => {
          frame.frame.x *= this.scope.mapScale;
          frame.frame.y *= this.scope.mapScale;
          frame.frame.w *= this.scope.mapScale;
          frame.frame.h *= this.scope.mapScale;
        });

        contribLoad.sprite = res.data;
        this.scope.persoJson.push(res.data);
        if (this.scope.persoJson.length === this.scope.contribLoadList.length) {
          cb();
        }
      });
    }
  }

  /**
   * parses all props and inits their data. handles map scaling and date checking.
   * @param res the raw json data from village_props.json
   * @param cb the optional callback once all props have been handled
   */
  displayProps(res, cb) {
    this.scope.propLoadList = [];
    this.scope.houseMainList = [];
    this.scope.houseEmptyList = [];
    this.scope.contribLoadList = [];
    this.scope.propList = res.props;
    this.scope.propListId = 0;
    for (let prop of this.scope.propList) {
      if (this.scope.isInDistrict(prop)) {
        prop.avail.some((couple, index) => {
          let match = false;
          if (couple.fromT <= couple.to) {
            if ((this.scope.hour >= couple.fromT) && (this.scope.hour <= couple.to)) {
              match = true;
            }
          } else if (couple.fromT > couple.to) {
            if ((this.scope.hour >= couple.fromT) || (this.scope.hour <= couple.to)) {
              match = true;
            }
          }
          if (match) {
            if (!couple.season || (couple.season === this.scope.season)) {
              if (!couple.event || (this.scope.currentEvent && couple.event === this.scope.currentEvent.slug)) {
                if (!couple.dates || this.scope.dateMatches(couple.dates)) {
                  prop.animIndex = Math.floor(Math.random());
                  prop.listId = this.scope.propListId++;
                  prop.availIndex = index;
                  if (!prop.list) {
                    prop.list = [
                      {
                        x: couple.x,
                        y: couple.y
                      }
                    ];
                  }
                  prop.chosenIndex = Math.floor(Math.random() * prop.list.length);// used for random pos
                  prop.imgUrl =
                    myLocalized.medias + `map/${this.scope.village}/${this.scope.effectiveFolder +
                    (this.scope.district ? "_" + this.scope.district :
                      "")}/props/${prop.label}/${this.scope.mapTime}/${prop.label}.png`;
                  //adjust to map scale
                  prop.center.x *= this.scope.mapScale;
                  prop.center.y *= this.scope.mapScale;
                  prop.width *= this.scope.mapScale;
                  prop.height *= this.scope.mapScale;
                  prop.list.forEach((instance) => {
                    instance.x *= this.scope.mapScale;
                    instance.y *= this.scope.mapScale;
                  });

                  this.scope.propLoadList.push(prop);
                  return true;
                }
              }
            }
          }
          return false;
        });
      }
    }
    let failed = 0;
    for (let propLoad of Array.from(this.scope.propLoadList)) {
      const url = `map/${this.scope.village}/${this.scope.effectiveFolder +
      (this.scope.district ? '_' + this.scope.district :
        '')}/props/${propLoad.label}/${this.scope.mapTime}/${propLoad.label}_array`;
      this.localeFactory.JSON(url, true).then((res) => {
        res.data.meta.size.w *= this.scope.mapScale;
        res.data.meta.size.h *= this.scope.mapScale;
        res.data.frames.forEach((frame) => {
          frame.frame.x *= this.scope.mapScale;
          frame.frame.y *= this.scope.mapScale;
        });
        this.scope.propJson.push(res.data);
        propLoad.sprite = res.data;
        if (this.scope.propJson.length + failed === this.scope.propLoadList.length) {
          if (cb) cb();
        }
      }).catch(err=>{
        console.warn(err, "this file failed to load", url);
        failed++;
        if (this.scope.propJson.length + failed === this.scope.propLoadList.length) {
          if (cb) cb();
        }
      });
    }
    if (this.scope.propLoadList.length === 0 && cb) {
      cb();
    }
  }

  /**
   * Valorise les différentes variable lié au temps pour le  village. (nuit/jour/saison).
   */
  setTime() {
    this.scope.d = new Date();
    this.scope.hour = this.scope.d.getHours();
    // this.scope.hour = 22;
    this.scope.day = this.scope.d.getDate();
    this.scope.month = this.scope.d.getMonth() + 1;
    const d = this.scope.day;
    const m = this.scope.month
    if (hensApp.isDateBetween([d, m], [1, 1], [20, 3]) || ((m === 12) && (d >= 21))) {
      this.scope.season = "hiver";
    } else if (hensApp.isDateBetween([d, m], [21, 3], [20, 6])) {
      this.scope.season = 'printemps';
    } else if (hensApp.isDateBetween([d, m], [21, 6], [20, 9])) {
      this.scope.season = 'ete';
    } else if (hensApp.isDateBetween([d, m], [21, 9], [20, 12])) {
      this.scope.season = 'automne';
    }

    if ((this.scope.hour >= 21) || (this.scope.hour < 7)) {
      this.scope.mapTime = "nuit";
    } else {
      this.scope.mapTime = "jour";
    }
  };

  goToPointer() {
    for (let loca of Array.from(this.scope.vData.locations)) {
      if (loca.slug === this.scope.goTo) {
        this.displayLocationCreations(loca, true);
        let x = (loca.pos.x + (loca.width / 2));
        let y = (loca.pos.y);
        this.scope.moveMapToAsSelected(x, y);
        break;
      }
    }
  };

}