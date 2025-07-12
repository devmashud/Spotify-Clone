let currentSong = new Audio();
let songs;
let currFolder;
let cardConatiner = document.querySelector(".cardContainer");

function formatSeconds(seconds) {
  if (isNaN(seconds)) return "00:00"; // handle NaN

  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);

  const formattedMins = mins.toString().padStart(2, "0");
  const formattedSecs = secs.toString().padStart(2, "0");

  return `${formattedMins}:${formattedSecs}`;
}

async function getSong(folder) {
  currFolder = folder;
  let a = await fetch(`http://127.0.0.1:3000/${folder}/`);
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
  //Show all the songs in the playlist
  let songUL = document
    .querySelector(".songlist")
    .getElementsByTagName("ul")[0];
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
          <img src="img/play.svg" width="30px" alt="" srcset="">
        </div>
      </li>`;
  }

  // NEW: Add event listeners to the dynamically created song <li> items here
  Array.from(songUL.getElementsByTagName("li")).forEach((e) => {
    e.addEventListener("click", () => {
      const songName = e.querySelector(".info").firstElementChild.textContent.trim();
      playMusic(songName);
    });
  });
  return songs;
}
async function displayAlbums() {
  let a = await fetch(`http://127.0.0.1:3000/songs/`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let anchors = div.getElementsByTagName("a");
  let array = Array.from(anchors);

  for (let index = 0; index < array.length; index++) {
    const e = array[index];
    if (e.href.includes("/songs")) {
      let folder = e.href.split("/").slice(-2)[0];
      let a = await fetch(`http://127.0.0.1:3000/songs/${folder}/info.json`);
      let response = await a.json();
      cardConatiner.innerHTML += `  
        <div data-folder="${folder}" class="card">
          <div class="play">
            <img src="img/icons8-play.png" alt="" srcset="">
          </div>
          <img src="songs/${folder}/cover.jpeg" alt="">
          <h2>${response.title}</h2>
          <p>${response.description}</p>
        </div>`;
    }
  }

  Array.from(document.getElementsByClassName("card")).forEach((e) => {
    e.addEventListener("click", async (item) => {
     songs = await getSong(`songs/${item.currentTarget.dataset.folder}`);
     playMusic(songs[0]);
    });
  });
}

const playMusic = (trac, pause = false) => {
  currentSong.src = `/${currFolder}/` + trac;
  if (!pause) {
    currentSong.play();
    play.src = "img/pause.svg";
  }

  document.querySelector(".songinfo").textContent = trac;
  document.querySelector(".songtime").textContent = "00:00/00:00";
};


async function main() {
  await getSong("songs/Atif_Aslam");
  playMusic(songs[0], true);

  await displayAlbums()
  

  // FIXED: Removed this block from here as it's handled inside getSong() now
  
  Array.from(
    document.querySelector(".songlist").getElementsByTagName("li")
  ).forEach((e) => {
    e.addEventListener("click", (e) => {
      playMusic(e.querySelector(".info").firstElementChild.textContent.trim());
    });
  });
  

  // Attach event listener to play/pause button
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
    let index = songs.indexOf(
      decodeURIComponent(currentSong.src.split("/").slice(-1)[0])
    );
    if (index > 0) {
      playMusic(songs[index - 1]);
    } else {
      playMusic(songs[songs.length - 1]);
    }
  });

  next.addEventListener("click", () => {
    let index = songs.indexOf(
      decodeURIComponent(currentSong.src.split("/").slice(-1)[0])
    );
    if (index + 1 < songs.length) {
      playMusic(songs[index + 1]);
    } else {
      playMusic(songs[0]);
    }
  });

  document
    .querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
      currentSong.volume = parseInt(e.target.value) / 100;
    });
   
  
  // add event listener to mute the track 

  document.querySelector(".volume>img").addEventListener("click", (e) => {
    if(e.target.src.includes("volume.svg")){
      e.target.src =  e.target.src.replace("img/volume.svg", "img/mute.svg")
      currentSong.volume = 0;
      document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
    }
    else{
      e.target.src = e.target.src.replace("img/mute.svg", "img/volume.svg")
      currentSong.volume = .20;
      document.querySelector(".range").getElementsByTagName("input")[0].value = 20;

    }
    
  }
  )


}




main();
