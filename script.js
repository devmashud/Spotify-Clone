let currentSong = new Audio();
let songs;
let currFolder;
let cardContainer = document.querySelector(".cardContainer");
const play = document.getElementById("play");
const previous = document.getElementById("previous");
const next = document.getElementById("next");

function formatSeconds(seconds) {
  if (isNaN(seconds)) return "00:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

async function getSong(folder) {
  currFolder = folder;
  let a = await fetch(`/${folder}/`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let as = div.getElementsByTagName("a");
  songs = [];

  for (let index = 0; index < as.length; index++) {
    const element = as[index];
    if (element.href.endsWith(".mp3")) {
      songs.push(element.href.split(`/${folder}/`)[1].replaceAll("%20", " "));
    }
  }

  let songUL = document.querySelector(".songlist ul");
  songUL.innerHTML = "";

  for (const song of songs) {
    songUL.innerHTML += ` 
      <li>
        <img src="img/music.svg" width="20px" alt="music">
        <div class="info">
          <div>${song}</div>
          <div>Opi</div>
        </div>
        <div class="playnow">
          <span>Play now</span>
          <img src="img/play.svg" width="30px" alt="">
        </div>
      </li>`;
  }

  Array.from(songUL.getElementsByTagName("li")).forEach((e) => {
    e.addEventListener("click", () => {
      const songName = e.querySelector(".info").firstElementChild.textContent.trim();
      playMusic(songName);
    });
  });

  return songs;
}

async function displayAlbums() {
  let a = await fetch(`/songs/`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let anchors = div.getElementsByTagName("a");
  let array = Array.from(anchors);

  for (let index = 0; index < array.length; index++) {
    const e = array[index];
    if (e.href.includes("/songs")) {
      let folder = e.href.split("/").slice(-2)[0];
      let res = await fetch(`/songs/${folder}/info.json`);
      let album = await res.json();
      cardContainer.innerHTML += `  
        <div data-folder="${folder}" class="card">
          <div class="play">
            <img src="img/icons8-play.png" alt="">
          </div>
          <img src="/songs/${folder}/cover.jpeg" alt="">
          <h2>${album.title}</h2>
          <p>${album.description}</p>
        </div>`;
    }
  }

  document.querySelectorAll(".card").forEach((e) => {
    e.addEventListener("click", async () => {
      songs = await getSong(`songs/${e.dataset.folder}`);
      playMusic(songs[0]);
    });
  });
}

function playMusic(track, pause = false) {
  currentSong.src = `/${currFolder}/` + track;
  if (!pause) {
    currentSong.play();
    play.src = "img/pause.svg";
  }
  document.querySelector(".songinfo").textContent = track;
  document.querySelector(".songtime").textContent = "00:00/00:00";
}

async function main() {
  await getSong("songs/Atif_Aslam");
  playMusic(songs[0], true);
  await displayAlbums();

  play.addEventListener("click", () => {
    if (currentSong.paused) {
      currentSong.play();
      play.src = "img/pause.svg";
    } else {
      currentSong.pause();
      play.src = "img/play.svg";
    }
  });

  currentSong.addEventListener("timeupdate", () => {
    document.querySelector(".songtime").innerHTML = `${formatSeconds(
      currentSong.currentTime
    )} / ${formatSeconds(currentSong.duration)}`;
    document.querySelector(".circle").style.left =
      (currentSong.currentTime / currentSong.duration) * 100 + "%";
  });

  document.querySelector(".seekbar").addEventListener("click", (e) => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = percent + "%";
    currentSong.currentTime = (currentSong.duration * percent) / 100;
  });

  document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0";
  });

  document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-100%";
  });

  previous.addEventListener("click", () => {
    let index = songs.indexOf(decodeURIComponent(currentSong.src.split("/").slice(-1)[0]));
    playMusic(index > 0 ? songs[index - 1] : songs[songs.length - 1]);
  });

  next.addEventListener("click", () => {
    let index = songs.indexOf(decodeURIComponent(currentSong.src.split("/").slice(-1)[0]));
    playMusic(index + 1 < songs.length ? songs[index + 1] : songs[0]);
  });

  document.querySelector(".range input").addEventListener("input", (e) => {
    currentSong.volume = parseInt(e.target.value) / 100;
  });

  document.querySelector(".volume>img").addEventListener("click", (e) => {
    const rangeInput = document.querySelector(".range input");
    if (e.target.src.includes("volume.svg")) {
      e.target.src = "img/mute.svg";
      currentSong.volume = 0;
      rangeInput.value = 0;
    } else {
      e.target.src = "img/volume.svg";
      currentSong.volume = 0.2;
      rangeInput.value = 20;
    }
  });
}

main();
