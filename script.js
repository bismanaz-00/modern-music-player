// ========================================
// DOM Elements
// ========================================

const $ = (id) => document.getElementById(id);

const cover = $('cover');
const title = $('title');
const artist = $('artist');
const album = $('album');

const playBtn = $('play');
const playIcon = $('play-icon');
const playPath = $('play-path');

const prevBtn = $('prev');
const nextBtn = $('next');

const seek = $('seek');
const currentEl = $('current');
const durationEl = $('duration');

const vol = $('vol');
const volText = $('vol-text');
const muteBtn = $('mute');
const wave = $('wave');

const list = $('list');
const viz = $('viz');
const vinyl = $('vinyl');
const statusEl = $('status');


// ========================================
// Playlist Data
// ========================================

const songs = [

  {
    title: 'Fairytale',
    artist: 'Alexander Rybak',
    album: 'Fairytales',
    src: 'assets/audio/fairytale.mp3',
    cover: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=600&q=80'
  },

  {
    title: 'Attention',
    artist: 'Charlie Puth',
    album: 'Voicenotes',
    src: 'assets/audio/attention.mp3',
    cover: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80'
  },

  {
    title: 'Him & I',
    artist: 'G-Eazy & Halsey',
    album: 'The Beautiful & Damned',
    src: 'assets/audio/him-and-i.mp3',
    cover: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=600&q=80'
  },

  {
    title: 'Love Story',
    artist: 'Indila',
    album: 'Mini World',
    src: 'assets/audio/love-story.mp3',
    cover: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=600&q=80'
  },

  {
    title: 'Treat You Better',
    artist: 'Shawn Mendes',
    album: 'Illuminate',
    src: 'assets/audio/treat-you-better.mp3',
    cover: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=600&q=80'
  },

  {
    title: 'Cheap Thrills',
    artist: 'Sia',
    album: 'This Is Acting',
    src: 'assets/audio/cheap-thrills.mp3',
    cover: 'https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?auto=format&fit=crop&w=600&q=80'
  }

];


// ========================================
// Player State
// ========================================

const audio = new Audio();

audio.preload = 'metadata';

let index = 0;
let lastVolume = 0.7;
let isSeeking = false;

audio.volume = lastVolume;


// ========================================
// Helpers
// ========================================

const fmt = (seconds) => {

  if (!isFinite(seconds) || seconds < 0) {
    return '00:00';
  }

  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);

  return (
    String(minutes).padStart(2, '0') +
    ':' +
    String(secs).padStart(2, '0')
  );
};


const fill = (el) => {

  const min = Number(el.min) || 0;
  const max = Number(el.max) || 100;
  const value = Number(el.value) || 0;

  const percentage =
    ((value - min) / (max - min)) * 100;

  el.style.setProperty(
    '--fill',
    percentage + '%'
  );
};


const setStatus = (message = '') => {
  statusEl.textContent = message;
};


// ========================================
// Play / Pause UI
// ========================================

function updateUI() {

  const playing = !audio.paused && !audio.ended;

  if (playing) {

    // Pause icon
    playPath.setAttribute(
      'd',
      'M6 5h4v14H6zM14 5h4v14h-4z'
    );

    playBtn.setAttribute(
      'aria-label',
      'Pause'
    );

    playBtn.classList.add('is-playing');

  } else {

    // Play icon
    playPath.setAttribute(
      'd',
      'M8 5v14l11-7z'
    );

    playBtn.setAttribute(
      'aria-label',
      'Play'
    );

    playBtn.classList.remove('is-playing');

  }

  // Visualizer
  viz.classList.toggle(
    'on',
    playing
  );

  // Vinyl animation
  vinyl.classList.toggle(
    'spin',
    playing
  );
}


// ========================================
// Play
// ========================================

async function play() {

  try {

    await audio.play();

    setStatus('');

    updateUI();

  } catch (error) {

    updateUI();

    if (error.name !== 'AbortError') {

      setStatus(
        'Could not play this track. Try another song.'
      );

      console.error(
        'Playback error:',
        error
      );
    }
  }
}


// ========================================
// Pause
// ========================================

function pause() {

  audio.pause();

  updateUI();
}


// ========================================
// Toggle Play / Pause
// ========================================

function toggle() {

  if (audio.paused) {
    play();
  } else {
    pause();
  }
}


// ========================================
// Load Song
// ========================================

function loadSong(i) {

  index =
    (i + songs.length) %
    songs.length;

  const song = songs[index];

  setStatus('');

  // Artwork animation
  cover.classList.add('swap');

  setTimeout(() => {

    cover.src = song.cover;

    cover.alt =
      `Album artwork for ${song.album} by ${song.artist}`;

    cover.classList.remove('swap');

  }, 220);


  // Song information
  title.textContent = song.title;
  artist.textContent = song.artist;
  album.textContent = song.album;


  // Audio
  audio.src = song.src;
  audio.load();


  // Reset progress
  seek.value = 0;
  fill(seek);

  currentEl.textContent = '00:00';
  durationEl.textContent = '00:00';


  // Update playlist
  document
    .querySelectorAll('.track')
    .forEach((track, n) => {

      const active =
        n === index;

      track.classList.toggle(
        'active',
        active
      );

      if (active) {

        track.setAttribute(
          'aria-current',
          'true'
        );

        track.scrollIntoView({
          block: 'nearest',
          behavior: 'smooth'
        });

      } else {

        track.removeAttribute(
          'aria-current'
        );

      }

    });


  updateUI();
}


// ========================================
// Build Playlist
// ========================================

songs.forEach((song, i) => {

  const li =
    document.createElement('li');

  li.className = 'track';

  li.tabIndex = 0;

  li.setAttribute(
    'role',
    'button'
  );

  li.setAttribute(
    'aria-label',
    `Play ${song.title} by ${song.artist}`
  );


  li.innerHTML = `

    <span class="num">
      ${String(i + 1).padStart(2, '0')}
    </span>

    <img
      class="thumb"
      src="${song.cover}"
      alt=""
      loading="lazy"
    >

    <div class="meta">
      <b>${song.title}</b>
      <small>${song.artist}</small>
    </div>

    <span
      class="dur"
      data-dur="${i}"
    >
      --:--
    </span>

  `;


  // Click
  li.addEventListener(
    'click',
    () => {

      loadSong(i);
      play();

    }
  );


  // Keyboard
  li.addEventListener(
    'keydown',
    (event) => {

      if (
        event.key === 'Enter' ||
        event.key === ' '
      ) {

        event.preventDefault();

        loadSong(i);
        play();

      }

    }
  );


  list.appendChild(li);

});


$('count').textContent =
  `${songs.length} Songs`;


// ========================================
// Next Song
// ========================================

function next() {

  const wasPlaying =
    !audio.paused;

  loadSong(index + 1);

  if (wasPlaying) {
    play();
  }
}


// ========================================
// Previous Song
// ========================================

function prev() {

  // If song has played more than 3 seconds,
  // restart current song
  if (audio.currentTime > 3) {

    audio.currentTime = 0;

    return;
  }


  const wasPlaying =
    !audio.paused;

  loadSong(index - 1);

  if (wasPlaying) {
    play();
  }
}


// ========================================
// Audio Events
// ========================================

// Actual audio play event
audio.addEventListener(
  'play',
  () => {

    updateUI();

  }
);


// Actual audio pause event
audio.addEventListener(
  'pause',
  () => {

    updateUI();

  }
);


// Song finished
audio.addEventListener(
  'ended',
  () => {

    loadSong(index + 1);

    play();

  }
);


// ========================================
// Metadata / Duration
// ========================================

audio.addEventListener(
  'loadedmetadata',
  () => {

    durationEl.textContent =
      fmt(audio.duration);

    const durationElement =
      document.querySelector(
        `[data-dur="${index}"]`
      );

    if (durationElement) {

      durationElement.textContent =
        fmt(audio.duration);

    }

  }
);


// ========================================
// Progress / Seek
// ========================================

audio.addEventListener(
  'timeupdate',
  () => {

    if (
      isSeeking ||
      !audio.duration
    ) {
      return;
    }


    seek.value =
      (audio.currentTime /
        audio.duration) * 100;

    fill(seek);


    currentEl.textContent =
      fmt(audio.currentTime);

  }
);


// While dragging
seek.addEventListener(
  'input',
  () => {

    isSeeking = true;

    fill(seek);


    if (audio.duration) {

      currentEl.textContent =
        fmt(
          (seek.value / 100) *
          audio.duration
        );

    }

  }
);


// After releasing
seek.addEventListener(
  'change',
  () => {

    if (audio.duration) {

      audio.currentTime =
        (seek.value / 100) *
        audio.duration;

    }

    isSeeking = false;

  }
);


// ========================================
// Audio Error
// ========================================

audio.addEventListener(
  'error',
  () => {

    updateUI();

    setStatus(
      'This audio file failed to load. Check your file path.'
    );

    console.error(
      'Audio failed:',
      audio.error
    );

  }
);


// ========================================
// Volume
// ========================================

function setVolume(value) {

  audio.volume = value;

  vol.value =
    Math.round(value * 100);

  fill(vol);

  volText.textContent =
    vol.value + '%';


  // Hide sound waves when muted
  wave.style.display =
    value === 0 ? 'none' : '';


  muteBtn.setAttribute(
    'aria-label',
    value === 0
      ? 'Unmute'
      : 'Mute'
  );
}


// Volume slider
vol.addEventListener(
  'input',
  () => {

    const value =
      Number(vol.value) / 100;


    if (value > 0) {
      lastVolume = value;
    }


    setVolume(value);

  }
);


// Mute / Unmute
function toggleMute() {

  if (audio.volume === 0) {

    setVolume(lastVolume);

  } else {

    lastVolume =
      audio.volume;

    setVolume(0);

  }

}


muteBtn.addEventListener(
  'click',
  toggleMute
);


// ========================================
// Player Buttons
// ========================================

playBtn.addEventListener(
  'click',
  toggle
);

nextBtn.addEventListener(
  'click',
  next
);

prevBtn.addEventListener(
  'click',
  prev
);


// ========================================
// Cover Image Error
// ========================================

cover.addEventListener(
  'error',
  () => {

    cover.removeAttribute(
      'src'
    );

  }
);


// ========================================
// Keyboard Controls
// ========================================

document.addEventListener(
  'keydown',
  (event) => {

    const target =
      event.target;


    // Don't interfere with inputs
    if (
      target.matches(
        'input[type=text], input[type=search], textarea, select, [contenteditable]'
      )
    ) {
      return;
    }


    // Space = Play / Pause
    if (event.code === 'Space') {

      if (
        target.closest('button') ||
        target.closest('.track')
      ) {
        return;
      }

      event.preventDefault();

      toggle();

    }


    // Right arrow = Next
    else if (
      event.key === 'ArrowRight' &&
      !target.matches(
        'input[type=range]'
      )
    ) {

      next();

    }


    // Left arrow = Previous
    else if (
      event.key === 'ArrowLeft' &&
      !target.matches(
        'input[type=range]'
      )
    ) {

      prev();

    }


    // M = Mute
    else if (
      event.key.toLowerCase() === 'm'
    ) {

      toggleMute();

    }

  }
);


// ========================================
// Initialize Player
// ========================================

setVolume(0.7);

loadSong(0);

updateUI();