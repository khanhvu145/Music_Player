const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const PLAYER_STORAGE_KEY = 'MUSIC_PLAYER';

const main = $('.main');
const cd = $('.cd');
const heading = $('.header__title h2');
const cdThumb = $('.cd__img');
const audio = $('#audio');
const playBtn = $('.btn-toggle-play');
const progress = $('#progress');
const nextBtn = $('.btn-next');
const prevBtn = $('.btn-prev');
const randomBtn = $('.btn-random');
const repeatBtn = $('.btn-repeat');
const playList = $('.playlist');
var songPlayed = [];
const setVolume = $('#volume');
const volumeOn = $('.btn-volume-on');
const volumeOff = $('.btn-volume-off');
const volumeValue = $('.volume-value');

const app = {
    currentIndex: 0,
    currentVolumeValue: 1,
    valueVolumeOld: 0,
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
    songs: [
        {
            name: 'Bông hoa đẹp nhất',
            singer: 'Quân A.P',
            path: './assets/music/song1.mp3',
            image: './assets/img/song1.png'
        },
        {
            name: 'Lời xin lỗi vụng về',
            singer: 'Quân A.P',
            path: './assets/music/song2.mp3',
            image: './assets/img/song2.png'
        },
        {
            name: 'Suýt nữa thì',
            singer: 'Andiez',
            path: './assets/music/song3.mp3',
            image: './assets/img/song3.png'
        },
        {
            name: '1 phút',
            singer: 'Andiez',
            path: './assets/music/song4.mp3',
            image: './assets/img/song4.png'
        },
        {
            name: 'Lạ lùng',
            singer: 'Vũ',
            path: './assets/music/song5.mp3',
            image: './assets/img/song5.png'
        },
        {
            name: 'Nàng thơ',
            singer: 'Hoàng Dũng',
            path: './assets/music/song6.mp3',
            image: './assets/img/song6.png'
        },
        {
            name: 'Ai là người thương em',
            singer: 'Quân A.P',
            path: './assets/music/song7.mp3',
            image: './assets/img/song7.png'
        },
        {
            name: 'Chiều hôm ấy',
            singer: 'Jaykii',
            path: './assets/music/song8.mp3',
            image: './assets/img/song8.png'
        },
        {
            name: 'Nơi tình yêu kết thúc',
            singer: 'Bùi Anh Tuấn',
            path: './assets/music/song9.mp3',
            image: './assets/img/song9.png'
        },
        {
            name: 'Tháng năm',
            singer: 'Soobin Hoàng Sơn',
            path: './assets/music/song10.mp3',
            image: './assets/img/song10.png'
        }
    ],
    setConfig: function(key, value) {
        this.config[key] = value;
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config));
    },
    render: function(){
        const htmls = this.songs.map((song, index) => {
            return `
                <div class="song" data-index="${index}">
                    <div class="song-img">
                        <img src="${song.image}" alt="" class="song-img__item">
                        <i class="fas fa-play song-icon-pause"></i>
                        <i class="fas fa-headphones-alt song-icon-play"></i>
                    </div>
                    <div class="body">
                        <h2 class="body__song-name">
                            ${song.name}
                        </h2>
                        <p class="body__song-singer">
                            ${song.singer}
                        </p>
                    </div>
                    <div class="btn btn__option">
                        <i class="fas fa-ellipsis-h"></i>
                    </div>
                </div>
            `
        })
        playList.innerHTML = htmls.join('');
    },

    defineProperties: function(){
        Object.defineProperty(this, 'currentSong', {
            get: function(){
                return this.songs[this.currentIndex];
            }
        })
    },

    handleEvents: function(){
        //Xử lý CD quay / dừng
        const cdAnimate = cd.animate([
            {
                transform: 'rotate(360deg)'
            }
        ], {
            duration: 30000,
            iterations: Infinity
        })
        cdAnimate.pause();

        //Xử lý scroll danh sách bài hát
        const cdWidth = cd.offsetWidth;
        const cdHeight = cd.offsetHeight;
        document.onscroll = function(){
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            const newWidth = cdWidth - scrollTop;
            const newHeight = cdHeight - scrollTop;

            // cd.style.width = newWidth > 0 ? newWidth + 'px' : 0;
            // cd.style.height = newHeight > 0 ? newHeight + 'px' : 0;
            if(newWidth > 0 && newHeight > 0){
                cd.style.width = newWidth + 'px';
                cd.style.height = newHeight + 'px';
                cd.style.opacity = newHeight/cdHeight;
            }
            else{
                cd.style.width = 0;
                cd.style.height = 0;
            }
        }

        
        //Xử lý click play button
        playBtn.onclick = function(){
            if(!app.isPlaying)
            {
                audio.play();
            }
            else
                audio.pause();
        }

        //Khi bài hát được play
        audio.onplay = function(){
            main.classList.add('playing');
            app.isPlaying = true;
            cdAnimate.play();
            cd.classList.add('cd-animation');
            app.songActive();
        }
        //Khi bài hát được pause
        audio.onpause = function(){
            main.classList.remove('playing');
            app.isPlaying = false;
            cdAnimate.pause();
            cd.classList.remove('cd-animation');
            app.songActive();
        }

        //Xử lý chạy thanh progress
        audio.ontimeupdate = function(){
            if(audio.duration){
                const progressPercent = Math.floor(audio.currentTime / audio.duration*100);
                progress.value = progressPercent;
            }
        }

        //Xử lý qua bài mới khi hết nhạc
        audio.onended = function(){
            if(app.isRepeat){
                app.currentIndex--;
            }
            nextBtn.click();
        }

        //Xử lý tua bài hát 
        progress.oninput = function(e){
            const seekTime = (e.target.value*audio.duration)/100;
            audio.currentTime = seekTime;
        }

        //Xử lý next bài hát 
        nextBtn.onclick = function(){
            if(app.isRandom){
                app.randomSong();
            }
            else{
                app.nextSong();
            }
            cdAnimate.cancel();
            audio.onpause();
            progress.value = 0;
            setTimeout(function(){
                audio.play();
            }, 800)
            app.scrollToActiveSong();
        }

        //Xử lý prev bài hát 
        prevBtn.onclick = function(){
            app.prevSong();
            cdAnimate.cancel();
            audio.onpause();
            progress.value = 0;
            setTimeout(function(){
                audio.play();
            }, 800)
            app.scrollToActiveSong();
        }

        //Xử lý random bài hát 
        randomBtn.onclick = function(){
            app.isRandom = !app.isRandom;
            app.setConfig('isRandom', app.isRandom)
            randomBtn.classList.toggle('active', app.isRandom);
        }

        //Xử lý lặp bài hát 
        repeatBtn.onclick = function(){
            app.isRepeat = !app.isRepeat;
            app.setConfig('isRepeat', app.isRepeat)
            repeatBtn.classList.toggle('active', app.isRepeat);
        }

        //Xử lý click vào playlist
        playList.onclick = function(e){
            const songNode = e.target.closest('.song:not(.active)');
            if(songNode || e.target.closest('.btn__option')){
                //Xử lý khi click vào song
                if(songNode){
                    app.currentIndex = Number(songNode.dataset.index);
                    app.loadCurrentSong();
                    audio.play();
                }
                //Xử lý khi click vào option
                if(e.target.closest('.btn__option')){

                }
            }
        }

        //Xử lý tăng giảm âm lượng
        setVolume.oninput = function(e){
            app.currentVolumeValue = (e.target.value)/100;
            audio.volume = app.currentVolumeValue;
            app.setVolumeActive(app.currentVolumeValue);  
            app.setConfig('currentVolumeValue', app.currentVolumeValue);
            volumeValue.innerText = `${ Math.floor(app.currentVolumeValue*100)}%`;
        }

        //Xử lý nhấp vào nút volume on
        volumeOn.onclick = function(){
            app.valueVolumeOld = app.currentVolumeValue;
            app.currentVolumeValue = 0;
            app.setVolumeActive(app.currentVolumeValue);
            setVolume.value = app.currentVolumeValue;
            audio.volume = app.currentVolumeValue;
            volumeValue.innerText = `${ Math.floor(app.currentVolumeValue*100)}%`;
            app.setConfig('currentVolumeValue', app.currentVolumeValue);
            app.setConfig('valueVolumeOld', app.valueVolumeOld);
        }

        //Xử lý nhấp vào nút volume off
        volumeOff.onclick = function(){
            app.setVolumeActive(app.valueVolumeOld);
            app.currentVolumeValue = app.valueVolumeOld;
            setVolume.value = app.valueVolumeOld*100;
            audio.volume = app.valueVolumeOld;
            volumeValue.innerText = `${ Math.floor(app.valueVolumeOld*100)}%`;
            app.setConfig('currentVolumeValue', app.valueVolumeOld);
            app.setConfig('valueVolumeOld', app.currentVolumeValue);
        }
    },

    loadDefaultValue: function(){
        if(JSON.stringify(app.config) === '{}'){
            app.setConfig('currentVolumeValue', 1);
            app.setConfig('valueVolumeOld', 1);
            app.setConfig('isRepeat', false);
            app.setConfig('isRandom', false);
            app.setConfig('currentIndex', 0)
        }
    },

    loadCurrentSong: function(){
        heading.innerText = this.currentSong.name;
        cdThumb.src = this.currentSong.image;
        audio.src = this.currentSong.path;
        this.songActive();
    },

    loadConfig: function(){
        this.isRandom = this.config.isRandom;
        this.isRepeat = this.config.isRepeat;
        this.currentIndex = this.config.currentIndex;
        this.currentVolumeValue = this.config.currentVolumeValue;
        this.valueVolumeOld = this.config.valueVolumeOld;
    },

    loadInitialState: function(){
        //Hiện thị trạng thái ban đầu của nút random và repeat
        randomBtn.classList.toggle('active', this.isRandom);
        repeatBtn.classList.toggle('active', this.isRepeat);

        //Hiện thị trạng thái ban đầu của thanh âm lượng và gán giá trị âm lượng ban đầu cho audio
        setVolume.value = this.currentVolumeValue*100;
        audio.volume = this.currentVolumeValue;
        volumeValue.innerText = `${ Math.floor(this.currentVolumeValue*100)}%`;
        this.setVolumeActive(this.currentVolumeValue);
   },

    setVolumeActive: function(value){
        if(value > 0){
            volumeOn.classList.add('active');
            volumeOff.classList.remove('active');
        }
        if(value <= 0){
            volumeOff.classList.add('active');
            volumeOn.classList.remove('active');
        }  
    },

    scrollToActiveSong: function(){
        setTimeout(function(){
            if(app.currentIndex <= 2){
                $('.song.active').scrollIntoView({
                    behavior: 'smooth',
                    block: 'end'
                })
            }
            else{
                $('.song.active').scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                })
            }
        }, 300)
    },

    nextSong: function(){
        this.currentIndex++;
        if(this.currentIndex >= this.songs.length){
            this.currentIndex = 0;
        }
        this.loadCurrentSong();
    },

    prevSong: function(){
        this.currentIndex--;
        if(this.currentIndex < 0){
            this.currentIndex = this.songs.length - 1;
        }
        this.loadCurrentSong();
    },

    randomSong: function(){
        let newIndex;
        let songRandom;
        do{
            //Khi phát hết playlist thì xóa mảng
            if(songPlayed.length === this.songs.length){
                songPlayed.splice(0, this.songs.length);
            }
            //Random song
            newIndex = Math.floor(Math.random() * this.songs.length)
            //Kiểm tra xem đã phát bài này chưa
            songRandom = songPlayed.includes(newIndex);
            //Nếu chưa phát thì lưu vào mảng rồi phát
            if(songRandom === false){
                songPlayed.push(newIndex);
            }
        }while(songRandom === true)//Nếu phát rồi thì random lại
        this.currentIndex = newIndex;
        this.loadCurrentSong();
    },

    songActive: function(){
        const songsActive = $$('.song');
        const songIconPlay = $$('.song-icon-play');
        const songIconPause = $$('.song-icon-pause');
        songsActive.forEach(function(song, index){
            if(!song.classList.contains('active') && index === app.currentIndex){
                song.classList.add('active');
                app.setConfig('currentIndex', app.currentIndex)
            }
            if(song.classList.contains('active') && index !== app.currentIndex){
                song.classList.remove('active');
                songIconPlay[index].classList.remove('active');
                songIconPause[index].classList.remove('active');
            }
            if(song.classList.contains('active') && index === app.currentIndex){
                if(app.isPlaying){
                    songIconPlay[index].classList.add('active');
                    songIconPause[index].classList.remove('active');
                } 
                else{
                    songIconPause[index].classList.add('active');
                    songIconPlay[index].classList.remove('active');
                }
            }
        })
    },

    start: function(){
        //Gán cấu hình mặc định ban đầu
        this.loadDefaultValue();

        //Gán cấu hình từ config vào ứng dụng
        this.loadConfig();

        //Định nghĩa các thuộc tính cho object
        this.defineProperties();

        //Render danh sách bài hát
        this.render();

        //Lắng nghe / xử lý sự kiện (DOM events)
        this.handleEvents();

        //Load thông tin bài hát đầu tiên khi chạy ứng dụng
        this.loadCurrentSong();

        //Load các trạng thái ban đầu của ứng dụng
        this.loadInitialState();
    }
};

app.start();

