const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const PLAYER_STORAGE_KEY = "Kha_player";

const titleSong = $("header h2");
const cdThumb = $(".cd .cd-thumb");
const audio = $("#audio");
const cd = $(".cd");
const playMusic = $(".btn-play");
const player = $(".player");
const inputPlay = $("#progress");
const nextSong = $(".btn-next");
const prevSong = $(".btn-prev");
const randSong = $(".btn-rand");
const repeatSong = $(".btn-repeat");
const playList = $(".playlist");
const app = {
  currentIndex: 0,
  isPlay: false,
  isRand: false,
  isRepeat: false,
  config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
  songs: [
    {
      name: "Cơn Mơ Băng Giá",
      singer: "Bằng Kiều",
      path: "./music/ConMoBangGia-BangKieu-4677122.mp3",
      image: "./img/conmobanggia.jpg",
    },
    {
      name: "Để Nhớ Một Thời Ta Đã Yêu",
      singer: "Bằng Kiều",
      path: "./music/DeNhoMotThoiTaDaYeu-BangKieu_3x2je.mp3",
      image: "./img/denhomotthoitadayeu.jpg",
    },
    {
      name: "Định Mệnh",
      singer: "Bằng Kiều",
      path: "./music/DinhMenh-BangKieuLamAnh-4772905.mp3",
      image: "./img/bangkieu.jpg",
    },
    {
      name: "Em Ơi Hà Nội Phố",
      singer: "Bằng Kiều",
      path: "./music/EmOiHaNoiPho-BangKieu-3145883.mp3",
      image: "./img/bangkieu.jpg",
    },
    {
      name: "Linh Hồn Đã Mất",
      singer: "Bằng Kiều",
      path: "./music/LinhHonDaMat-BangKieu_3tu9k.mp3",
      image: "./img/bangkieu.jpg",
    },
    {
      name: "Nơi Tình Yêu Bắt Đầu",
      singer: "Bằng Kiều",
      path: "./music/NoiTinhYeuBatDau-LamAnhBangKieu-3283028.mp3",
      image: "./img/noitinhyeubatdau.png",
    },
    {
      name: "Xin Lỗi Anh",
      singer: "Bằng Kiều",
      path: "./music/XinLoiAnh-BangKieu-MinhTuyet_3vg8t.mp3",
      image: "./img/bangkieu.jpg",
    },
  ],
  setConfig(key, value) {
    this.config[key] = value;
    localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config));
  },
  defineProperties() {
    Object.defineProperty(this, "currentSong", {
      get() {
        return this.songs[this.currentIndex];
      },
    });
  },
  render() {
    const html = this.songs.map((song, index) => {
      return `<div class="song ${
        index === this.currentIndex ? "active" : " "
      } " data-index="${index}">
        <div
          class="thumb"
          style="
            background-image: url('${song.image}');
          "
        ></div>
        <div class="body">
          <h3 class="title">${song.name}</h3>
          <p class="author">${song.singer}</p>
        </div>
        <div class="option">
          <i class="fas fa-ellipsis-h"></i>
        </div>
      </div>`;
    });
    playList.innerHTML = html.join("");
  },
  handleEvent() {
    const _this = this;
    const cdWidth = cd.offsetWidth;
    //phóng to thu nhỏ
    document.onscroll = function () {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const newWidth = cdWidth - scrollTop;
      cd.style.width = newWidth > 0 ? newWidth + "px" : 0;
      cd.style.opacity = newWidth / cdWidth;
    };
    //quay đĩa
    const cdPlay = cdThumb.animate(
      [
        {
          transform: "rotate(360deg)",
        },
      ],
      {
        duration: 10000, //second
        iterations: Infinity,
      }
    );
    cdPlay.pause();
    //random bài hát
    randSong.onclick = function () {
      _this.isRand = !_this.isRand;
      _this.setConfig("isRand", _this.isRand);
      randSong.classList.toggle("active", _this.isRand);
    };
    playList.onclick = function (e) {
      const currentPlay = e.target.closest(".song:not(.active)");
      if (currentPlay || e.target.closest(".option")) {
        if (currentPlay) {
          _this.currentIndex = parseInt(currentPlay.dataset.index);
          _this.loadCurrentSong();
          _this.render();
          audio.play();
        }
      }
    };
    playMusic.onclick = function () {
      if (!_this.isPlay) {
        audio.play();
      } else {
        audio.pause();
      }
    };
    //xử lí khi chạy nhạc
    audio.onplay = function () {
      cdPlay.play();
      _this.isPlay = true;
      player.classList.add("playing");
    };
    //xử lí khi dừng nhạc
    audio.onpause = function () {
      cdPlay.pause();
      _this.isPlay = false;
      player.classList.remove("playing");
    };
    //tiến độ bài hát thay đổi
    // inputPlay.onchange = function (e) {
    //   const seekTime = Math.floor((e.target.value / 100) * audio.duration);
    //   audio.currentTime = seekTime;
    // };
    inputPlay.addEventListener("input", (e) => {
      const seekTime = Math.floor((e.target.value / 100) * audio.duration);
      audio.currentTime = seekTime;
    });
    audio.ontimeupdate = function () {
      const currentTime = audio.currentTime;
      const duration = audio.duration;
      inputPlay.value = Math.floor((currentTime / duration) * 100);
    };
    //lặp lại bài hát
    repeatSong.onclick = function () {
      _this.isRepeat = !_this.isRepeat;
      _this.setConfig("isRepeat", _this.isRepeat);
      repeatSong.classList.toggle("active", _this.isRepeat);
    };
    audio.onended = function () {
      if (_this.isRepeat) {
        audio.play();
      } else nextSong.click();
    };
    //tiến tới
    nextSong.onclick = function () {
      if (_this.isRand) {
        _this.randSong();
      } else {
        _this.nextSong();
      }
      audio.play();
      _this.render();
      _this.scrollActiveSong();
    };
    //lùi lại
    prevSong.onclick = function () {
      if (_this.isRand) {
        _this.randSong();
      } else {
        _this.prevSong();
      }
      audio.play();
      _this.render();
    };
  },
  scrollActiveSong() {
    setTimeout(function () {
      $(".song.active").scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }, 300);
  },
  randSong() {
    const max = this.songs.length;
    let newIndex;
    do {
      newIndex = Math.floor(Math.random() * max);
    } while (newIndex == this.currentIndex);
    this.currentIndex = newIndex;
    this.loadCurrentSong();
  },
  loadCurrentSong() {
    const currentSong = this.currentSong;
    titleSong.innerText = currentSong.name;
    cdThumb.style.backgroundImage = `url(${currentSong.image})`;
    audio.src = currentSong.path;
  },
  nextSong() {
    this.currentIndex++;
    if (this.currentIndex > this.songs.length - 1) {
      this.currentIndex = 0;
    }
    this.loadCurrentSong();
  },
  prevSong() {
    this.currentIndex--;
    if (this.currentIndex < 0) {
      this.currentIndex = this.songs.length - 1;
    }
    this.loadCurrentSong();
  },
  //load cofig
  loadConfig() {
    this.isRand = this.config.isRand;
    this.isRepeat = this.config.isRepeat;
  },
  Start() {
    this.loadConfig();
    //định nghĩa các thuộc tính cho object
    this.defineProperties();
    //lắng nghe xử lí sự kiện dom
    this.handleEvent();
    //tải thông tin bài hát vào ui
    this.loadCurrentSong();
    this.render();

    randSong.classList.toggle("active", this.isRand);
    repeatSong.classList.toggle("active", this.isRepeat);
  },
};
app.Start();
