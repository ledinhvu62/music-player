const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const PLAYER_STORAGE_KEY = "MUSIC_PLAYER";

const player = $(".player");
const heading = $("header h2");
const cd = $(".cd");
const cdThumb = $(".cd-thumb");
const progress = $("#progress");
const currentTime = $(".current-time"); // mới
const duration = $(".duration"); // mới
const repeatBtn = $(".btn-repeat");
const prevBtn = $(".btn-prev");
const playBtn = $(".btn-toggle-play");
const nextBtn = $(".btn-next");
const randomBtn = $(".btn-random");
const audio = $("#audio");
const playlist = $(".playlist");

const app = {
    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
    songs: [
        {
            name: "Hai Muoi Hai",
            singer: "AMEE",
            path: "./assets/song/hai_muoi_hai.mp3",
            image: "./assets/img/hai_muoi_hai.jpg"
        },
        {
            name: "ThichThich",
            singer: "Phuong Ly",
            path: "./assets/song/thichthich.mp3",
            image: "./assets/img/thichthich.jpg"
        },
        {
            name: "The Gioi Trong Em",
            singer: "Huong Ly",
            path: "./assets/song/the_gioi_trong_em.mp3",
            image: "./assets/img/the_gioi_trong_em.jpg"
        },
        {
            name: "Mai Mai Ben Nhau",
            singer: "Noo Phuoc Thinh",
            path: "./assets/song/mai_mai_ben_nhau.mp3",
            image: "./assets/img/mai_mai_ben_nhau.png"
        },
        {
            name: "Loi Anh Chua The Noi",
            singer: "Chuppy",
            path: "./assets/song/loi_anh_chua_the_noi.mp3",
            image: "./assets/img/loi_anh_chua_the_noi.jpg"
        },
        {
            name: "Huong Dem Bay Xa",
            singer: "Hari Won",
            path: "./assets/song/huong_dem_bay_xa.mp3",
            image: "./assets/img/huong_dem_bay_xa.png"
        },
        {
            name: "Ghe Qua",
            singer: "Dick x Tofu x PC",
            path: "./assets/song/ghe_qua.mp3",
            image: "./assets/img/ghe_qua.jpg"
        }
    ],
    setConfig: function (key, value) {
        this.config[key] = value;
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config));
    },
    render: function () {
        const htmls = this.songs.map((song, index) => {
            return `
                <div class="song ${index === this.currentIndex ? "active" : ""}" data-index="${index}">
                    <div class="thumb" style="background-image: url('${song.image}')">
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
        playlist.innerHTML = htmls.join("");
    },
    defineProperties: function () {
        Object.defineProperty(this, "currentSong", { // định nghĩa thuộc tính currentSong cho obj app
            get: function () { // xác định giá trị trả về khi get thuộc tính currentSong -------> app.currentSong = this.songs[this.currentIndex]
                return this.songs[this.currentIndex]; // trả về bài hát hiện tại
            }
        });
    },
    handleEvents: function () {
        const _this = this; // this ở đây là obj app
        const cdWidth = cd.offsetWidth;

        // Xử lý CD quay / dừng
        // Handle CD spins / stops
        const cdThumbAnimate = cdThumb.animate([{ transform: "rotate(360deg)" }], { // animate quay 360 độ
            duration: 10000, // trong 10 giây
            iterations: Infinity // lặp vô hạn
        });
        cdThumbAnimate.pause(); // cdThumbAnimate là 1 obj Animate nên có thể play() / pause()

        // Xử lý phóng to / thu nhỏ CD
        // Handles CD enlargement / reduction
        document.onscroll = function () {
            const scrollTop = window.scrollY || document.documentElement.scrollTop; // kích thước khi scroll (window là cửa sổ trình duyệt, document.Element là thẻ html)
            const newCdWidth = cdWidth - scrollTop; // width của cd sau khi scroll

            cd.style.width = newCdWidth > 0 ? newCdWidth + "px" : 0;
            cd.style.opacity = newCdWidth / cdWidth;
        };

        // Xử lý khi click play
        // Handle when click play
        playBtn.onclick = function () {
            if (_this.isPlaying) { // ở đây ta muốn gọi đến obj app, ta k dùng this đc vì lúc này this = playBtn, để xử lý case này ta tạo const _this = this ở đầu method handleEvents (cũng có thể gọi thẳng app.isPlaying)
                audio.pause();
            } else {
                audio.play();
            }
        };

        audio.onloadeddata = function() { // ------------ mới thêm ------------
            var minutes = Math.floor(audio.duration / 60);
            var seconds = Math.floor(audio.duration % 60);
            duration.innerText =`${minutes > 9 ? minutes : '0' + minutes}:${seconds > 9 ? seconds : '0' + seconds}`;
        };

        // Khi song được play
        // When the song is played
        audio.onplay = function () {
            _this.isPlaying = true;
            player.classList.add("playing");
            cdThumbAnimate.play();
        };

        // Khi song bị pause
        // When the song is pause
        audio.onpause = function () {
            _this.isPlaying = false;
            player.classList.remove("playing");
            cdThumbAnimate.pause();
        };

        // Khi tiến độ bài hát thay đổi
        // When the song progress changes
        audio.ontimeupdate = function () {
            if (audio.duration) {
                const progressPercent = Math.floor((audio.currentTime / audio.duration) * 100); // duration là tổng thời gian của song, currentTime là thời gian hiện tại
                progress.value = progressPercent; // sửa value của time range
                progress.style.background = `linear-gradient(90deg, var(--primary-color) ${progressPercent}%, #d3d3d3 ${progressPercent}%)`; // đổi màu time range cho phần song đã nghe =======> tự code
                
                var currentMinutes = Math.floor(audio.currentTime / 60); // ------------ mới thêm ------------
                var currentSeconds = Math.floor(audio.currentTime % 60);
                currentTime.innerText =`${currentMinutes > 9 ? currentMinutes : '0' + currentMinutes}:${currentSeconds > 9 ? currentSeconds : '0' + currentSeconds}`;
            }
        };

        // Xử lý khi tua song
        // Handling when seek
        progress.oninput = function (e) { // ------------ có sửa ------------
            const seekTime = (audio.duration / 100) * e.target.value; // e.target chính là progress
            audio.currentTime = seekTime;
        };

        // Khi next song
        // When next song
        nextBtn.onclick = function () {
            if (_this.isRandom) {
                _this.playRandomSong();
            } else {
                _this.nextSong();
            }
            audio.play();
            _this.setConfig("currentIndex", _this.currentIndex); // ------------ mới thêm ------------
            _this.render(); // render để hiển thị active bài hát trong playlist
            _this.scrollToActiveSong();
        };

        // Khi prev song
        // When prev song
        prevBtn.onclick = function () {
            if (_this.isRandom) {
                _this.playRandomSong();
            } else {
                _this.prevSong();
            }
            audio.play();
            _this.setConfig("currentIndex", _this.currentIndex); // ------------ mới thêm ------------
            _this.render(); // render để hiển thị active bài hát trong playlist
            _this.scrollToActiveSong();
        };

        // Xử lý bật / tắt random song
        // Handling on / off random song
        randomBtn.onclick = function (e) {
            _this.isRandom = !_this.isRandom;
            _this.setConfig("isRandom", _this.isRandom);
            randomBtn.classList.toggle("active", _this.isRandom); // _this.isRandom true thì add class, false thì remove class
        };

        // Xử lý lặp lại một song
        // Single-parallel repeat processing
        repeatBtn.onclick = function (e) {
            _this.isRepeat = !_this.isRepeat;
            _this.setConfig("isRepeat", _this.isRepeat);
            repeatBtn.classList.toggle("active", _this.isRepeat);
        };

        // Xử lý next song khi audio ended
        // Handle next song when audio ended
        audio.onended = function () {
            if (_this.isRepeat) {
                audio.play();
            } else {
                nextBtn.click();
            }
        };

        // Lắng nghe hành vi click vào playlist
        // Listen to playlist clicks
        playlist.onclick = function (e) {
            const songNode = e.target.closest(".song:not(.active)"); // closest tìm phần tử phù hợp với CSS Selector truyền vào, nó sẽ tìm từ chính nó ngược lên cha, ông, cụ,.., và trả về đối tượng gần nhất thỏa mãn đk
                                                                    // khi click bất kỳ chỗ nào trên playlist, nếu song k active thì đều trả về 1 element gán cho biến songNode
            if (e.target.closest(".option")) { // Xử lý khi click vào song option // tự sửa code
            } else if (songNode) { // Xử lý khi click vào song
                _this.currentIndex = Number(songNode.dataset.index); // Cách 1: songNode.getAttribute('data-index'), Cách 2: songNode.dataset.index (vì có attr tự tạo là data-index nên dùng dataset, vd data-parent thì dataset.parent, data-index-number thì dataset.indexNumber)
                _this.loadCurrentSong();
                _this.render();
                _this.setConfig("currentIndex", _this.currentIndex); // ------------ mới thêm ------------
                audio.play();
            }
        };
    },
    scrollToActiveSong: function () {
        setTimeout(() => {
            $(".song.active").scrollIntoView({ // đây là phương thức của Web API, kéo đối tượng tới vùng có thể nhìn thấy
                behavior: "smooth", // hành vi mềm mại
                block: "end" // ------------ có sửa ------------
            });
        }, 300); // delay 300ms để trải nghiệm khi chuyển bài tốt hơn
    },
    loadCurrentSong: function () {
        heading.textContent = this.currentSong.name;
        cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`;
        audio.src = this.currentSong.path;
    },
    loadConfig() {
        this.isRandom = this.config.isRandom || false; // ------------ có sửa ------------
        this.isRepeat = this.config.isRepeat || false; // ------------ có sửa ------------
        this.currentIndex = this.config.currentIndex || 0; // ------------ mới thêm ------------
    },
    nextSong() {
        this.currentIndex++;
        if (this.currentIndex >= this.songs.length) {
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
    playRandomSong() {
        let newIndex;
        do {
            newIndex = Math.floor(Math.random() * this.songs.length);
        } while (newIndex === this.currentIndex);

        this.currentIndex = newIndex;
        this.loadCurrentSong();
    },
    start: function () {
        // Gán cấu hình từ config vào ứng dụng
        // Assign configuration from config to application
        this.loadConfig();

        // Định nghĩa các thuộc tính cho object
        // Defines properties for the object
        this.defineProperties();

        // Lắng nghe / xử lý các sự kiện (DOM events)
        // Listening / handling events (DOM events)
        this.handleEvents();

        // Tải thông tin bài hát đầu tiên vào UI khi chạy ứng dụng
        // Load the first song information into the UI when running the app
        this.loadCurrentSong();

        // Render playlist
        this.render();

        // Hiển thị trạng thái ban đầu của button repeat & random
        // Display the initial state of the repeat & random button
        randomBtn.classList.toggle("active", this.isRandom);
        repeatBtn.classList.toggle("active", this.isRepeat);
    }
};

app.start();