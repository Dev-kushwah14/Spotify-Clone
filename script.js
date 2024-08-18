
let playnow = document.querySelector(".PlayNow")
let previous = document.getElementById("previous")
let play = document.getElementById("Play")
let next = document.getElementById("next")
let currentSong = new Audio();
let songs;
let currentFolder;

function convertSecondsToMinuteSecond(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    // Calculate minutes and remaining seconds
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    // Format minutes and seconds to be two digits
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    // Return the formatted time
    return `${formattedMinutes}:${formattedSeconds}`;
}

// get songs function

async function getSong(folder) {
    currentFolder = folder;
    let a = await fetch(`http://127.0.0.1:3000/${folder}/`)
    let response = await a.text()

    let div = document.createElement("div")
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");

    songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.innerText.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1])
        }
    }


    // show all songs in songsList
    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0]
    songUL.innerHTML = "";
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `<li><img src="img/music.svg" alt="">
                  <div class="info">
                    <span>${song.replaceAll("%20", " ")}</span>
                    </div>
                    <span><button class="PlayNow">Play <img class="invert" src="img/play.svg" alt=""></button></span>
                </li>`
    }

    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", (elm) => {
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim())

        })
    })
return songs;

}


// music play function
const playMusic = (track, pause = false) => {

    currentSong.src = `/${currentFolder}/` + track
    if (!pause) {
        currentSong.play();
        play.src = "img/pause.svg"
    }

    document.querySelector(".songinfo").innerHTML = decodeURI(track)
    document.querySelector(".songtime").innerHTML = "00:00/00:00"
}

// disply songs in folder

async function displyAllSongs() {
    let a = await fetch(`http://127.0.0.1:3000/song/`)
    let response = await a.text()
    let div = document.createElement("div")
    div.innerHTML = response;
    let anchor = div.getElementsByTagName("a");
    let cardContainer = document.querySelector(".cardContainer")

    let array = Array.from(anchor)
    for (let index = 0; index < array.length; index++) {
        let e = array[index];
        if (e.href.includes("/song")) {
            let folder = (e.href.split("/").slice(-2)[0]);
            let a = await fetch(`http://127.0.0.1:3000/song/${folder}/info.json`)
            let response = await a.json()
            cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder="${folder}" class="card">
                        <img src="/song/${folder}/cover.jpg" alt="">
                        <h3>${response.title}</h3>
                        <p>${response.description}</p>
                        <div class="play"> <svg xmlns="http://www.w3.org/2000/svg" height="50px"
                                viewBox="0 -960 960 960" width="50px">
                                <circle cx="480" cy="-480" r="480" fill="#1ed760" />
                                <path d="M320-202v-560l440 280-420 280Z" fill="black" />
                            </svg></div>
                    </div>`

        }

    }
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            songs = await getSong(`/song/${item.currentTarget.dataset.folder}`)
            
        })
    })

}

//  main function
async function main() {
    await getSong("song/Honey")
    playMusic(songs[0], true)


    // disply all songs in albums
    await displyAllSongs();


    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "img/pause.svg"

        }
        else {
            currentSong.pause();
            play.src = "img/Play.svg"

        }
    })

    // Time update in seekbar

    currentSong.addEventListener("timeupdate", () => {
        // console.log(currentSong.currentTime, currentSong.duration)
        document.querySelector(".songtime").innerHTML = `${convertSecondsToMinuteSecond(currentSong.currentTime)}/${convertSecondsToMinuteSecond(currentSong.duration)}`

        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%"
    })

    document.querySelector(".seekbar").addEventListener("click", (e) => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100
    })



    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0"
    })

    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%"
    })


    next.addEventListener("click", () => {
        currentSong.pause();
        let index = songs.indexOf(currentSong.src.split("/").splice(-1)[0])
        console.log(index);
        if ((index + 1) > length) {
            playMusic(songs[index + 1])
        }
    })
    previous.addEventListener("click", () => {
        currentSong.pause()
        let index = songs.indexOf(currentSong.src.split("/").splice(-1)[0])
        console.log(index);
        if ((index - 1) >= 0) {
            playMusic(songs[index - 1])
        }

    })

    // add an event to change volum

    document.querySelector(".volum").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        console.log("volum rang", e.target.value, "/100");
        currentSong.volume = parseInt(e.target.value) / 100;
        if( currentSong.volume>0){
            document.querySelector(".vol").src=document.querySelector(".vol").src.replace( "img/mute.svg","img/volum.svg")
        }

    })

    document.querySelector(".vol").addEventListener("click", e => {
        if (e.target.src.includes("img/volum.svg")) {
            e.target.src = e.target.src.replace("img/volum.svg", "img/mute.svg")
            currentSong.volume = 0;
            document.querySelector(".volum").getElementsByTagName("input")[0].value = 0;

        } else {
            e.target.src = e.target.src.replace("img/mute.svg", "img/volum.svg")
            document.querySelector(".volum").getElementsByTagName("input")[0].value = 50;
            currentSong.volume = .50;
        }
    })



}
main()

