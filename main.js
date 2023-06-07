const $ = document.querySelector.bind(document)
const $$ = document.querySelectorAll.bind(document)

const PLAYER_STORAGE_KEY = "MUSIC_PLAYER"

const player = $(".player")
const heading = $("header h2")
const cd = $(".cd")
const cdThumb = $(".cd-thumb")
const progress = $("#progress")
const currentTime = $(".current-time") // thêm
const duration = $(".duration") // thêm
const repeatBtn = $(".btn-repeat")
const prevBtn = $(".btn-prev")
const playBtn = $(".btn-toggle-play")
const nextBtn = $(".btn-next")
const randomBtn = $(".btn-random")
const audio = $("#audio")
const playlist = $(".playlist")

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
            image: "./assets/img/hai_muoi_hai.jpg",
        },
        {
            name: "Lan Man",
            singer: "Ronboogz",
            path: "./assets/song/lan_man.mp3",
            image: "./assets/img/lan_man.jpg",
        },
        {
            name: "Hay De Toi Om Lay",
            singer: "Kai Dinh x MIN x Grey D",
            path: "./assets/song/de_toi_om_em_bang_giai_dieu_nay.mp3",
            image: "./assets/img/de_toi_om_em_bang_giai_dieu_nay.jpg",
        },
        {
            name: "Anh Se Cho Minh",
            singer: "Khai Nguyen",
            path: "./assets/song/anh_se_cho_minh.mp3",
            image: "./assets/img/anh_se_cho_minh.jpg",
        },
        {
            name: "Khi Ma",
            singer: "Ronboogz",
            path: "./assets/song/khi_ma.mp3",
            image: "./assets/img/khi_ma.jpg",
        },
        {
            name: "ThichThich",
            singer: "Phuong Ly",
            path: "./assets/song/thichthich.mp3",
            image: "./assets/img/thichthich.jpg",
        },
        {
            name: "Ghe Qua",
            singer: "Dick x Tofu x PC",
            path: "./assets/song/ghe_qua.mp3",
            image: "./assets/img/ghe_qua.jpg",
        },
        {
            name: "Loi Anh Chua The Noi",
            singer: "Chuppy",
            path: "./assets/song/loi_anh_chua_the_noi.mp3",
            image: "./assets/img/loi_anh_chua_the_noi.jpg",
        },
        {
            name: "Huong Dem Bay Xa",
            singer: "Hari Won",
            path: "./assets/song/huong_dem_bay_xa.mp3",
            image: "./assets/img/huong_dem_bay_xa.png",
        },
    ],
    setConfig(key, value) {
        this.config[key] = value
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config))
    },
    render() {
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
            `
        })
        playlist.innerHTML = htmls.join("")
    },
    defineProperties() {
        Object.defineProperty(this, "currentSong", { // định nghĩa thuộc tính currentSong cho obj app
            get: () => { // xác định giá trị trả về khi get thuộc tính currentSong -------> app.currentSong = this.songs[this.currentIndex]
                return this.songs[this.currentIndex] // trả về bài hát hiện tại
            }
        })
    },
    handleEvents() {
        const _this = this // this ở đây là obj app
        const cdWidth = cd.offsetWidth

        // Xử lý CD quay / dừng
        const cdThumbAnimate = cdThumb.animate([{ transform: "rotate(360deg)" }], {
            duration: 10000,
            iterations: Infinity,
        })
        cdThumbAnimate.pause() // cdThumbAnimate là 1 obj Animate nên có thể play() / pause()

        // Xử lý phóng to / thu nhỏ CD
        document.onscroll = () => {
            const scrollTop = window.scrollY || document.documentElement.scrollTop // kích thước khi scroll (window là cửa sổ trình duyệt, document.Element là thẻ html)
            const newCdWidth = cdWidth - scrollTop // width của cd sau khi scroll

            cd.style.width = newCdWidth > 0 ? newCdWidth + "px" : 0
            cd.style.opacity = newCdWidth / cdWidth
        }

        // Xử lý khi click play
        playBtn.onclick = () => {
            if (_this.isPlaying) { // k dùng this để gọi obj app vì this = playBtn, phải tạo const _this = this ở đầu method handleEvents (cũng có thể gọi thẳng app.isPlaying)
                audio.pause()
            }
            else {
                audio.play()
            }
        }

        audio.onloadeddata = () => { // ------------ thêm ------------
            var minutes = Math.floor(audio.duration / 60)
            var seconds = Math.floor(audio.duration % 60)
            duration.innerText =`${minutes > 9 ? minutes : '0' + minutes}:${seconds > 9 ? seconds : '0' + seconds}`
        }

        // Khi song được play
        audio.onplay = () => {
            _this.isPlaying = true
            player.classList.add("playing")
            cdThumbAnimate.play()
        }

        // Khi song bị pause
        audio.onpause = () => {
            _this.isPlaying = false
            player.classList.remove("playing")
            cdThumbAnimate.pause()
        }

        // Khi tiến độ bài hát thay đổi
        audio.ontimeupdate = () => {
            if (audio.duration) {
                const progressPercent = Math.floor((audio.currentTime / audio.duration) * 100) // duration là tổng thời gian của song, currentTime là thời gian hiện tại
                progress.value = progressPercent // sửa value của time range
                progress.style.background = `linear-gradient(90deg, var(--primary-color) ${progressPercent}%, #d3d3d3 ${progressPercent}%)` // đổi màu time range cho phần song đã nghe // thêm
                
                var currentMinutes = Math.floor(audio.currentTime / 60) // ------------ thêm ------------
                var currentSeconds = Math.floor(audio.currentTime % 60)
                currentTime.innerText =`${currentMinutes > 9 ? currentMinutes : '0' + currentMinutes}:${currentSeconds > 9 ? currentSeconds : '0' + currentSeconds}`
            }
        }

        // Xử lý khi tua song
        progress.oninput = (e) => { // ------------ sửa ------------
            const seekTime = (audio.duration / 100) * e.target.value // e.target chính là progress
            audio.currentTime = seekTime
        }

        // Khi next song
        nextBtn.onclick = () => {
            if (_this.isRandom) {
                _this.playRandomSong()
            }
            else {
                _this.nextSong()
            }
            audio.play()
            _this.setConfig("currentIndex", _this.currentIndex) // ------------ thêm ------------
            _this.render() // render để hiển thị active bài hát trong playlist
            _this.scrollToActiveSong()
        }

        // Khi prev song
        prevBtn.onclick = () => {
            if (_this.isRandom) {
                _this.playRandomSong()
            }
            else {
                _this.prevSong()
            }
            audio.play()
            _this.setConfig("currentIndex", _this.currentIndex) // ------------ thêm ------------
            _this.render()
            _this.scrollToActiveSong()
        }

        // Xử lý bật / tắt random song
        randomBtn.onclick = () => {
            _this.isRandom = !_this.isRandom
            _this.setConfig("isRandom", _this.isRandom)
            randomBtn.classList.toggle("active", _this.isRandom) // _this.isRandom true thì add class, false thì remove class
        }

        // Xử lý lặp lại một song
        repeatBtn.onclick = () => {
            _this.isRepeat = !_this.isRepeat
            _this.setConfig("isRepeat", _this.isRepeat)
            repeatBtn.classList.toggle("active", _this.isRepeat)
        }

        // Xử lý next song khi song kết thúc
        audio.onended = () => {
            if (_this.isRepeat) {
                audio.play()
            }
            else {
                nextBtn.click()
            }
        }

        // Lắng nghe hành vi click vào playlist
        playlist.onclick = (e) => {
            const songNode = e.target.closest(".song:not(.active)") // closest tìm phần tử phù hợp với CSS Selector truyền vào, nó sẽ tìm từ chính nó ngược lên cha, ông, cụ,.., và trả về đối tượng gần nhất thỏa mãn đk
                                                                    // khi click bất kỳ chỗ nào trên playlist, nếu song k active thì đều trả về 1 element gán cho biến songNode
            if (e.target.closest(".option")) { // Xử lý khi click vào song option // sửa
            }
            else if (songNode) { // Xử lý khi click vào song
                _this.currentIndex = Number(songNode.dataset.index) // Cách 1: songNode.getAttribute('data-index'), Cách 2: songNode.dataset.index (vì có attr tự tạo là data-index nên dùng dataset, vd data-parent thì dataset.parent, data-index-number thì dataset.indexNumber)
                _this.loadCurrentSong()
                _this.render()
                _this.setConfig("currentIndex", _this.currentIndex) // ------------ thêm ------------
                audio.play()
            }
        }
    },
    scrollToActiveSong() {
        setTimeout(() => {
            $(".song.active").scrollIntoView({ // đây là phương thức của Web API, kéo đối tượng tới vùng có thể nhìn thấy
                behavior: "smooth",
                block: "end",
            });
        }, 300)
    },
    loadCurrentSong() {
        heading.textContent = this.currentSong.name
        cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`
        audio.src = this.currentSong.path
    },
    loadConfig() {
        this.isRandom = this.config.isRandom || false // ------------ sửa ------------
        this.isRepeat = this.config.isRepeat || false // ------------ sửa ------------
        this.currentIndex = this.config.currentIndex || 0 // ------------ thêm ------------
    },
    nextSong() {
        this.currentIndex++
        if (this.currentIndex >= this.songs.length) {
            this.currentIndex = 0
        }
        this.loadCurrentSong()
    },
    prevSong() {
        this.currentIndex--
        if (this.currentIndex < 0) {
            this.currentIndex = this.songs.length - 1
        }
        this.loadCurrentSong()
    },
    playRandomSong() {
        let newIndex
        do {
            newIndex = Math.floor(Math.random() * this.songs.length)
        } while (newIndex === this.currentIndex)

        this.currentIndex = newIndex
        this.loadCurrentSong()
    },
    start() {
        // Gán cấu hình từ config vào ứng dụng
        this.loadConfig()

        // Định nghĩa các thuộc tính cho object
        this.defineProperties()

        // Lắng nghe / xử lý các sự kiện (DOM events)
        this.handleEvents()

        // Tải thông tin bài hát đầu tiên vào UI khi chạy ứng dụng
        this.loadCurrentSong()

        // Render playlist
        this.render()

        // Hiển thị trạng thái ban đầu của button repeat & random
        randomBtn.classList.toggle("active", this.isRandom)
        repeatBtn.classList.toggle("active", this.isRepeat)
    },
}

app.start()