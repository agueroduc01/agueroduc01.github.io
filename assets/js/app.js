const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const PLAYER_STORAGE_KEY = "DUKE_PLAYER";

const playList = $(".playlist");
const cd = $(".cd");
const heading = $("header h2");
const cdThumb = $(".cd-thumb");
const audio = $("#audio");
const playBtn = $(".btn-toggle-play");
const player = $(".player");
const progress = $("#progress");
const nextBtn = $(".btn-next");
const prevBtn = $(".btn-prev");
const randomBtn = $(".btn-random");
const repeatBtn = $(".btn-repeat");

const trackTimeMin = $(".tracktime .minute");
const trackTimeSec = $(".tracktime .second");
const durationTimeMin = $(".durationtime .minute");
const durationTimeSec = $(".durationtime .second");
const volumes = $$(".volume__range");
const volumeProgress = $$(".player__volume-progress");
const volumeBtns = $$(".control .btn.btn-volume");
const volumeTracks = $$(
  ".progress__track.volume--track .progress__track-update"
);
const volumeIcons = $$(".btn-volume .fa.fa-volume-up");
const heartBtn = $(".btn-heart");

var listSong;

const app = {
  currentIndex: 0,
  // currentVolume: 0,
  isPlaying: false,
  isRandom: false,
  isRepeat: false,
  isChangeVolume: false,
  avoidRepeatSongs: [],
  config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
  songs: [
    {
      name: "It's you",
      singer: "Ali Gatie",
      path: "./assets/music/Ali Gatie - Its You.mp3",
      image: "./assets/img/Its You.jpg",
    },
    {
      name: "Roses",
      singer: "Finn Askew",
      path: "./assets/music/Finn Askew - Roses.mp3",
      image: "./assets/img/Finn Askew - Roses.jpg",
    },
    {
      name: "Comethru",
      singer: "Jeremy Zucker",
      path: "./assets/music/Jeremy Zucker - comethru.mp3",
      image: "./assets/img/Comethru.jpg",
    },
    {
      name: "Counting Stars",
      singer: "Be'O (비오)",
      path: "./assets/music/BEO(비오) - Counting Stars.mp3",
      image: "./assets/img/CountingStars.jpg",
    },
    {
      name: "double take",
      singer: "dhruv",
      path: "./assets/music/dhruv - double take.mp3",
      image: "./assets/img/DoubleTake.jpg",
    },
    {
      name: "Happy For You",
      singer: "Lukas Graham ft Vũ",
      path: "./assets/music/Happy For You feat Vũ.mp3",
      image: "./assets/img/HappyForYou.jpg",
    },
    {
      name: "Loverboy",
      singer: "A-Wall",
      path: "./assets/music/A-Wall - Loverboy.mp3",
      image: "./assets/img/Loverboy.jpg",
    },
    {
      name: "Paris in the rain",
      singer: "Lauv",
      path: "./assets/music/Lauv - Paris in the Rain.mp3",
      image: "./assets/img/ParisInTheRain.jpg",
    },
    {
      name: "Precious",
      singer: "DADUC x KIPER T",
      path: "./assets/music/PRECIOUS - DADUC x KIPER T.mp3",
      image: "./assets/img/Precious.jpg",
    },
    {
      name: "The Other Side Of Paradise",
      singer: "Glass Animals",
      path: "./assets/music/The Other Side Of Paradise - Glass Animals.mp3",
      image: "./assets/img/TheOtherSideOfParadise.jpg",
    },
    {
      name: "Your smile",
      singer: "Obito ft. hnhngan",
      path: "./assets/music/Obito ft. hnhngan -YOUR SMILE.mp3",
      image: "./assets/img/YourSmile.jpg",
    },
    {
      name: "Keep Your Head Up Princess",
      singer: "Anson Seabra",
      path: "./assets/music/Anson Seabra - Keep Your Head Up Princess.mp3",
      image: "./assets/img/KeepYourHeadUpPrincess.jpg",
    },
    {
      name: "Qua Khung Cửa Sổ",
      singer: "Chillies",
      path: "./assets/music/Qua Khung Cửa Sổ - Chillies.mp3",
      image: "./assets/img/QuaKhungCuaSo.jpg",
    },
    {
      name: "Em Đừng Khóc",
      singer: "Chillies",
      path: "./assets/music/Em Đừng Khóc - Chillies.mp3",
      image: "./assets/img/EmDungKhoc.jpg",
    },
    {
      name: "Caroline",
      singer: "Crash Adams",
      path: "./assets/music/Crash Adams - Caroline.mp3",
      image: "./assets/img/Caroline.jpg",
    },
    {
      name: "Give Me A Kiss",
      singer: "Crash Adams",
      path: "./assets/music/Crash Adams - Give Me A Kiss.mp3",
      image: "./assets/img/GiveMeAKiss.jpg",
    },
  ],
  setConfig: function (key, value) {
    this.config[key] = value;
    localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config));
  },
  render: function () {
    const htmls = this.songs.map((song, index) => {
      return `
                <div class="song ${
                  index === this.currentIndex ? "active" : ""
                }" data-index="${index}">
                    <div class="thumb" style="background-image: url('${
                      song.image
                    }')">
                    </div>
                    <div class="body">
                        <h3 class="title">${song.name}</h3>
                        <p class="author">${song.singer}</p>
                    </div>
                    <div class="option">
                        <i class="fas fa-ellipsis-h"></i>
                    </div>
                </div>
            `;
    });
    playList.innerHTML = htmls.join("");
    listSong = $$(".song"); // để xử lí active song tránh render lại list nhạc
  },
  defineProperties: function () {
    Object.defineProperty(this, "currentSong", {
      get: function () {
        return this.songs[this.currentIndex];
      },
    });
  },
  handleEvents: function () {
    const cdWidth = cd.offsetWidth;
    const _this = this;
    let tempIndex;

    //Xử lí CD quay / dừng
    const cdThumbAnimate = cdThumb.animate(
      [
        {
          transform: "rotate(360deg)",
        },
      ],
      {
        duration: 10000, //10s
        iterations: Infinity, // vô hạn
      }
    );
    cdThumbAnimate.pause();

    //Xử lí phóng to hoặc thu nhỏ đĩa CD
    document.onscroll = function () {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const newCdWidth = cdWidth - scrollTop;

      cd.style.width = newCdWidth > 0 ? newCdWidth + "px" : 0;
      cd.style.opacity = newCdWidth / cdWidth;
    };

    //Xử lí khi click Play
    playBtn.onclick = function () {
      if (_this.isPlaying) {
        audio.pause();
      } else {
        audio.play();
      }
    };

    //Khi bài hát được play
    audio.onplay = function () {
      _this.isPlaying = true;
      player.classList.add("playing");
      cdThumbAnimate.play();
    };

    //Khi bài hát bị pause
    audio.onpause = function () {
      _this.isPlaying = false;
      player.classList.remove("playing");
      cdThumbAnimate.pause();
    };

    //Khi tiến độ bài hát thay đổi
    audio.ontimeupdate = function () {
      if (audio.duration) {
        const progressPercentage = Math.floor(
          (audio.currentTime / audio.duration) * 100
        );
        let secs = Math.floor(audio.currentTime % 60);
        let durationSecs = Math.floor(audio.duration % 60);

        progress.value = progressPercentage;
        trackTimeMin.innerHTML = "0" + Math.floor(audio.currentTime / 60);
        if (secs < 10) {
          secs = "0" + String(secs);
        }
        trackTimeSec.innerHTML = secs;

        durationTimeMin.innerHTML = "0" + Math.floor(audio.duration / 60);
        if (durationSecs < 10) {
          durationSecs = "0" + String(durationSecs);
        }
        durationTimeSec.innerHTML = durationSecs;
      }
    };

    //Xử lí khi tua bài hát
    progress.oninput = function (e) {
      audio.pause();
      const seekTime = (e.target.value / 100) * audio.duration;
      audio.currentTime = seekTime;
      // trackTimeMin.innerHTML = '0' + Math.floor(seekTime / 60)
      // trackTimeSec.innerHTML = Math.floor(seekTime % 60)
      progress.onchange = function () {
        audio.play();
      };
    };

    //Khi next bài hát
    nextBtn.onclick = function () {
      if (_this.isRandom) {
        _this.playRandomSong();
      } else {
        _this.nextSong();
      }
      audio.play();
      $(".song.active").classList.remove("active");
      listSong[_this.currentIndex].classList.add("active");
      tempIndex =
        _this.currentIndex !== 0
          ? _this.currentIndex - 1
          : _this.songs.length - 1;
      _this.scrollToActiveSong(_this.currentIndex, tempIndex);
    };

    //Khi previous bài hát
    prevBtn.onclick = function () {
      if (_this.isRandom) {
        _this.playRandomSong();
      } else {
        _this.prevSong();
      }
      audio.play();
      $(".song.active").classList.remove("active");
      listSong[_this.currentIndex].classList.add("active");
      tempIndex = _this.currentIndex !== 10 ? _this.currentIndex + 1 : 0;
      _this.scrollToActiveSong(_this.currentIndex, tempIndex);
    };

    //Xử lí bật/ tắt random bài hát
    randomBtn.onclick = function () {
      _this.isRandom = !_this.isRandom;
      _this.setConfig("isRandom", _this.isRandom);
      this.classList.toggle("active", _this.isRandom);
    };

    // Xử lí bật / tắt repeat 1 bài hát
    repeatBtn.onclick = function () {
      _this.isRepeat = !_this.isRepeat;
      _this.setConfig("isRepeat", _this.isRepeat);
      this.classList.toggle("active", _this.isRepeat);
    };

    // Xử lí next bài hát khi audio ended
    audio.onended = function () {
      if (_this.isRepeat) {
        audio.play();
      } else {
        nextBtn.click();
      }
    };

    // Lắng nghe hành vi click vào playlist
    playList.onclick = function (e) {
      const songNode = e.target.closest(".song:not(.active)");
      if (songNode) {
        _this.currentIndex = Number(songNode.dataset.index);
        _this.loadCurrentSong();
        $(".song.active").classList.remove("active");
        listSong[_this.currentIndex].classList.add("active");
        audio.play();
      } else if (e.target.closest(".option")) {
        console.log(123);
      }
    };

    volumeBtns.forEach(function (volume) {
      volume.addEventListener("mouseover", function handleMouseOver() {
        volumeProgress[0].style.display = "flex";
      });
      volume.addEventListener("mouseout", function handleMouseOut() {
        volumeProgress[0].style.display = "none";
      });
    });

    volumeProgress.forEach(function (volume) {
      volume.addEventListener("mouseover", function handleMouseOver() {
        volume.style.display = "flex";
      });
      volume.addEventListener("mouseout", function handleMouseOut() {
        volume.style.display = "none";
      });
    });

    //Handle adjust volume change
    function changeVolume(index) {
      if (audio.volume * 100 != volumes[index].value) {
        audio.volume = volumes[index].value / 100;
        volumeTracks.forEach((volumeTrack) => {
          volumeTrack.style.width = volumes[index].value + "%";
        });
        // _this.setConfig('currentVolume', volumes[index].value)
        if (!audio.volume) {
          volumeIcons.forEach((volumeIcon) => {
            volumeIcon.classList.remove("fa", "fa-volume-up");
            volumeIcon.classList.add("fa", "fa-volume-mute");
          });
        } else {
          volumeIcons.forEach((volumeIcon) => {
            volumeIcon.classList.remove("fa", "fa-volume-mute");
            volumeIcon.classList.add("fa", "fa-volume-up");
          });
        }
      }
    }

    volumes.forEach((volume, index) => {
      volume.onchange = function (e) {
        changeVolume(index);
      };
      volume.onmousedown = (e) => {
        _this.isChangeVolume = true;
      };
      volume.onmouseup = () => {
        _this.isChangeVolume = false;
      };
      volume.onmousemove = function (e) {
        if (_this.isChangeVolume === true) {
          changeVolume(index);
          e.stopPropagation();
        }
      };
      // Use addEventListener to fix the bug when the first loading
      volume.addEventListener("touchstart", function (e) {
        _this.isChangeVolume = true;
      });
      volume.addEventListener("touchend", function (e) {
        _this.isChangeVolume = false;
      });
      volume.addEventListener("touchmove", function (e) {
        if (_this.isChangeVolume === true) {
          changeVolume(index);
          e.stopPropagation();
        }
      });
    });

    volumeBtns.forEach((volumeBtn, index) => {
      volumeBtn.onclick = (e) => {
        let currentVolume = volumes[index].value;
        if (audio.volume > 0) {
          currentVolume = 0;
        } else {
          if (volumes[index].value > 0) {
            currentVolume = volumes[index].value / 100;
          } else {
            currentVolume = 100;
            volumes.forEach((volume) => {
              volume.value = 100;
            });
          }
        }
        audio.volume = currentVolume / 100;
        volumeTracks.forEach((volumeTrack) => {
          volumeTrack.style.width = currentVolume + "%";
        });
        volumes.forEach((volume) => {
          volume.value = currentVolume;
        });
        // _this.setConfig('currentVolume', currentVolume)
        if (!audio.volume) {
          volumeIcons.forEach((volumeIcon) => {
            volumeIcon.classList.remove("fa", "fa-volume-up");
            volumeIcon.classList.add("fa", "fa-volume-mute");
          });
        } else {
          volumeIcons.forEach((volumeIcon) => {
            volumeIcon.classList.remove("fa", "fa-volume-mute");
            volumeIcon.classList.add("fa", "fa-volume-up");
          });
        }
      };
    });

    // Handle click the heart icon
    heartBtn.onclick = function () {
      this.classList.toggle("active");
      if (this.classList.contains("active")) {
        alert("Đã thêm vào bài hát yêu thích");
      } else {
        alert("Xóa bỏ khỏi bài hát yêu thích");
      }
    };
  },
  loadConfig: function () {
    this.isRandom = this.config.isRandom;
    this.isRepeat = this.config.isRepeat;
    this.currentVolume = this.config.currentVolume;

    // Load, hiển thị trạng thái ban đầu của button repeat & random
    randomBtn.classList.toggle("active", this.isRandom);
    repeatBtn.classList.toggle("active", this.isRepeat);
  },
  scrollToActiveSong: function (currentIndex, oldIndex) {
    let songArrayLength = this.songs.length;
    setTimeout(function () {
      if (
        (currentIndex === 0 && oldIndex === songArrayLength - 1) ||
        (currentIndex === songArrayLength - 1 && oldIndex === 0)
      ) {
        $(".song.active").scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      } else {
        $(".song.active").scrollIntoView({
          behavior: "smooth",
          block: "nearest",
        });
      }
      console.log(currentIndex, songArrayLength, oldIndex);
    }, 300);
  },
  loadCurrentSong: function () {
    heading.textContent = this.currentSong.name;
    cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`;
    audio.src = this.currentSong.path;
  },
  nextSong: function () {
    this.currentIndex++;
    if (this.currentIndex >= this.songs.length) {
      this.currentIndex = 0;
    }
    this.loadCurrentSong();
  },
  prevSong: function () {
    this.currentIndex--;
    if (this.currentIndex < 0) {
      this.currentIndex = this.songs.length - 1;
    }
    this.loadCurrentSong();
  },
  playRandomSong: function () {
    let newIndex;
    console.log(this.avoidRepeatSongs);
    let avoidRepeatSongsLength =
      this.avoidRepeatSongs.length > 0 ? this.avoidRepeatSongs.length : 0;
    do {
      newIndex = Math.floor(Math.random() * this.songs.length);
      for (let i = 0; i < avoidRepeatSongsLength; i++) {
        if (newIndex === this.avoidRepeatSongs[i]) {
          newIndex = Math.floor(Math.random() * this.songs.length);
          // console.log("AvoidRepeatArray: " + this.avoidRepeatSongs[i])
          // console.log("newIndexInFor: " + newIndex)
          i = -1;
        }
      }
    } while (newIndex === this.currentIndex);
    // console.log(newIndex)
    if (avoidRepeatSongsLength < this.songs.length - 1) {
      this.avoidRepeatSongs.push(newIndex);
    } else {
      this.avoidRepeatSongs = [];
    }
    this.currentIndex = newIndex;
    this.loadCurrentSong();
  },
  start: function () {
    // Gán cấu hình từ config vào ứng dụng
    this.loadConfig();

    //Định nghĩa các thuộc tính cho Object
    this.defineProperties();

    //Lắng nghe / xử lí các sự kiện (DOM Events)
    this.handleEvents();

    //Tải thông tin bài hát đầu tiên vào UI khi chạy ứng dụng
    this.loadCurrentSong();

    //Render playlist
    this.render();
  },
};

app.start();
