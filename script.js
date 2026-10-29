// ===== settings (edit these) =====
const CFG = {
  // songs: mp3 and covers live in songs/, list them here
  tracks: [
    {
      file: "songs/paint.mp3",
      title: "Paint (First Day Back)",
      artist: "", // TODO: add the artist
      cover: "songs/cover1.jpg",
    },
    {
      file: "songs/deathmetal.mp3",
      title: "D>E>A>T>H>M>E>T>A>L",
      artist: "Panchiko",
      cover: "songs/cover2.jpeg",
    },
    {
      file: "songs/100days.mp3",
      title: "100 Days",
      artist: "Daniel Caverly",
      cover: "songs/cover3.jpeg",
    },
  ],
  tilt: 12, // max card tilt, in degrees
  dir: -1, // -1 = card turns away from the cursor, 1 = toward it
};

const $ = (s) => document.querySelector(s);
const $$ = (s) => document.querySelectorAll(s);

// ===== music player =====
const au = $("#au");
const pb = $("#pb");
let entered = false;
let ti = 0; // index of the current track

function sync() {
  pb.textContent = au.paused ? "▶" : "❚❚";
  document.documentElement.classList.toggle("playing", !au.paused);
}

function load(i) {
  ti = (i + CFG.tracks.length) % CFG.tracks.length;
  const t = CFG.tracks[ti];
  au.src = t.file;
  $("#title").textContent = t.title;
  $("#artist").textContent = t.artist;
  $("#cover").src = t.cover;
  $$(".trk").forEach((b, k) => b.classList.toggle("cur", k === ti));
}

function play(i) {
  load(i);
  au.play().catch(() => {});
}

// playlist tab: one button per song
CFG.tracks.forEach((t, i) => {
  const b = document.createElement("button");
  b.className = "trk rv";
  b.innerHTML = `<img src="${t.cover}" alt="" /><span><b>${t.title}</b><small>${t.artist}</small></span><i class="eq"><s></s><s></s><s></s><s></s></i>`;
  b.onclick = () => {
    if (i !== ti) play(i);
    else au.paused ? au.play() : au.pause();
  };
  $("#tracks").appendChild(b);
});

au.volume = 0.4;
load(0);

$("#next").onclick = () => play(ti + 1);
$("#prev").onclick = () => play(ti - 1);
au.onended = () => play(ti + 1);
au.onplay = au.onpause = sync;
pb.onclick = () => (au.paused ? au.play() : au.pause());
$("#vol").oninput = (e) => (au.volume = e.target.value);

// ===== "click to enter" =====
function enter() {
  if (entered) return;
  entered = true;
  $("#gate").classList.add("gone");
  $(".card").classList.add("show");
  au.play().catch(() => {});
  sync();
}

$("#gate").onclick = enter;
addEventListener("keydown", enter);

// ===== lines appear one by one, tabs =====
$$(".pane").forEach((pane) => {
  pane
    .querySelectorAll(".ln, .rv")
    .forEach((el, i) => el.style.setProperty("--i", i));
});

// ===== tabs =====
function openTab(name) {
  $$(".tab").forEach((t) => t.classList.toggle("on", t.dataset.tab === name));
  $$(".pane").forEach((p) => p.classList.toggle("on", p.id === "pane-" + name));
}
$$(".tab").forEach((t) => (t.onclick = () => openTab(t.dataset.tab)));

// ===== project screenshots: try each path from data-try until one loads =====
$$("img[data-try]").forEach((img) => {
  const list = img.dataset.try.split(" ");
  let k = 0;
  img.onerror = () => {
    if (++k < list.length) img.src = list[k];
    else img.remove(); // nothing found: the </> placeholder stays
  };
  img.onload = () => img.closest(".shot").classList.add("zoom"); // clickable
  img.src = list[0];
});

// ===== fullscreen viewer for project screenshots =====
const lb = $("#lb");
const lbImg = lb.querySelector("img");

function closeViewer() {
  lb.classList.remove("on");
  lb.setAttribute("aria-hidden", "true");
}

$$(".shot").forEach((s) =>
  s.addEventListener("click", () => {
    const im = s.querySelector("img");
    if (!im || !s.classList.contains("zoom")) return;
    lbImg.src = im.currentSrc || im.src;
    $("#lbcap").textContent =
      s.closest(".proj").querySelector("h3").textContent +
      "  ·  click or Esc to close";
    lb.classList.add("on");
    lb.setAttribute("aria-hidden", "false");
  }),
);

lb.addEventListener("click", closeViewer);
addEventListener("keydown", (e) => e.key === "Escape" && closeViewer());

// ===== falling code (decoration at the bottom of the card) =====
const cf = $("#codefall");
const cx = cf.getContext("2d");
const CODE_CHARS = "{}[]()<>/\\=;:+-*&|!?#$01abcdefxyz".split("");
const CF_SIZE = 12; // font size and row height, px
const CF_TRAIL = 7; // how many characters follow the head
let cols = [];
let cfW = 0;
let cfH = 0;

const rndChar = () => CODE_CHARS[(Math.random() * CODE_CHARS.length) | 0];

function cfResize() {
  const dpr = window.devicePixelRatio || 1;
  cfW = cf.clientWidth;
  cfH = cf.clientHeight;
  cf.width = cfW * dpr;
  cf.height = cfH * dpr;
  cx.setTransform(dpr, 0, 0, dpr, 0, 0);
  cols = Array.from({ length: Math.floor(cfW / CF_SIZE) }, () => ({
    head: -Math.random() * 20,
    speed: 0.12 + Math.random() * 0.22, // rows per frame
    chars: Array.from({ length: CF_TRAIL }, rndChar),
  }));
}

function cfFrame() {
  cx.clearRect(0, 0, cfW, cfH);
  cx.font = `${CF_SIZE}px "JetBrains Mono", monospace`;
  cx.textBaseline = "top";
  const rows = cfH / CF_SIZE;
  cols.forEach((c, i) => {
    for (let k = 0; k < CF_TRAIL; k++) {
      const row = Math.floor(c.head) - k;
      if (row < 0 || row > rows) continue;
      const a = k === 0 ? 0.95 : (1 - k / CF_TRAIL) * 0.45;
      cx.fillStyle = `rgba(255, 255, 255, ${a})`;
      cx.fillText(c.chars[k], i * CF_SIZE + 1, row * CF_SIZE);
    }
    c.head += c.speed;
    if (Math.random() < 0.06)
      c.chars[(Math.random() * CF_TRAIL) | 0] = rndChar();
    if (c.head - CF_TRAIL > rows) {
      c.head = -Math.random() * 12;
      c.speed = 0.12 + Math.random() * 0.22;
    }
  });
}

function cfLoop() {
  cfFrame();
  requestAnimationFrame(cfLoop);
}

addEventListener("resize", cfResize);
cfResize();
if (matchMedia("(prefers-reduced-motion: reduce)").matches) cfFrame();
else cfLoop();

// ===== card tilt =====
const card = $(".card");
let tiltX = 0;
let tiltY = 0;
let targetX = 0;
let targetY = 0;

addEventListener("pointermove", (e) => {
  const nx = (e.clientX / innerWidth) * 2 - 1;
  const ny = (e.clientY / innerHeight) * 2 - 1;
  targetY = nx * CFG.tilt * CFG.dir;
  targetX = -ny * CFG.tilt * CFG.dir;
});

document.addEventListener("pointerleave", () => {
  targetX = targetY = 0;
});

function tiltLoop() {
  tiltX += (targetX - tiltX) * 0.08;
  tiltY += (targetY - tiltY) * 0.08;
  card.style.transform = `rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
  requestAnimationFrame(tiltLoop);
}
tiltLoop();

// ===== custom cursor =====
const root = document.documentElement;
const cursor = $("#cur");

if (matchMedia("(pointer:fine)").matches) root.classList.add("cc");

addEventListener("pointermove", (e) => {
  cursor.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
  root.classList.toggle(
    "hov",
    !!e.target.closest("a, button, input, .zoom, #lb"),
  );
});
addEventListener("pointerdown", () => root.classList.add("down"));
addEventListener("pointerup", () => root.classList.remove("down"));

// ===== stack.sh: interactive terminal =====
const tin = $("#tin");
const tout = $("#tout");
const termPane = $("#pane-stack");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let cmdHistory = [];
let hi = 0;
let busy = false;

// each command returns rows: a string, or [key, value]
// (return null = clear the screen)
const CMDS = {
  help: {
    d: "list of commands",
    run: () => Object.entries(CMDS).map(([n, c]) => [n, c.d]),
  },
  about: {
    d: "a few words about me",
    run: () => [
      "mayee. i like customizing everything and digging in the terminal.",
      "i write for the web: html, css, js and python.",
    ],
  },
  os: {
    d: "what i run",
    run: () => [
      ["linux", "ubuntu"],
      ["windows", "windows 10"],
      ["editor", "vs code"],
    ],
  },
  loves: {
    d: "what i like",
    run: () => [
      ["love", "customization"],
      ["love", "the terminal"],
      ["listen", "classical and hard rock (try: music)"],
    ],
  },
  plays: {
    d: "what i play",
    run: () => [
      ["steam", "Dead by Daylight"],
      ["roblox", "Michael's Zombies"],
      ["roblox", "Violence District"],
      ["rhythm", "osu!"],
    ],
  },
  stack: {
    d: "technologies",
    run: () => [
      ["web", "html, css, js"],
      ["apps", "python, batch (piano autoplayer)"],
      ["tools", "vs code, git"],
    ],
  },
  projects: {
    d: "things i made",
    run: () => [
      ["velum", "new tab extension: widgets, glass, resize"],
      ["piano", "autoplayer app: song library, note editor, player"],
    ],
  },
  links: {
    d: "where to find me",
    run: () => [
      ["telegram", "t.me/labosax"],
      ["github", "github.com/m4yeed"],
      ["tiktok", "@m4yeedy"],
      ["soundcloud", "soundcloud.com/m4yee"],
    ],
  },
  music: {
    d: "what is playing now",
    run: () => {
      const t = CFG.tracks[ti];
      return [[au.paused ? "paused" : "playing", `${t.title} - ${t.artist}`]];
    },
  },
  neofetch: {
    d: "short summary",
    run: () => [
      ["os", "ubuntu, windows 10"],
      ["web", "html, css, js"],
      ["editor", "vs code"],
      ["loves", "customization, terminal"],
      ["plays", "dead by daylight, roblox, osu!"],
    ],
  },
  whoami: { d: "who am i", run: () => ["mayee"] },
  clear: { d: "clear the screen", run: () => null },
};

function addLine(row, cls = "") {
  const d = document.createElement("div");
  d.className = "tl " + cls;
  if (Array.isArray(row)) {
    const b = document.createElement("b");
    b.textContent = row[0];
    d.append(b, row[1]);
    d.classList.add("out");
  } else {
    d.textContent = row;
    if (!cls) d.classList.add("out");
  }
  tout.appendChild(d);
  termPane.scrollTop = termPane.scrollHeight;
}

async function runCommand(raw) {
  const line = raw.trim();
  addLine("$ " + raw, "cmd pr");
  if (!line) return;
  cmdHistory.push(line);
  hi = cmdHistory.length;

  const name = line.split(/\s+/)[0].toLowerCase();

  let rows;
  // easter eggs
  if (name === "sudo")
    rows = [
      "mayee is not in the sudoers file. this incident will be reported.",
    ];
  else if (line.startsWith("rm -rf")) rows = ["nice try."];
  else if (name === "ls")
    rows = ["about.md  projects.js  stack.sh  playlist.m3u  links.txt"];
  else if (name === "echo") rows = [line.slice(5)];
  else if (CMDS[name]) rows = CMDS[name].run();
  else {
    addLine(`command not found: ${name}. try help`, "err");
    return;
  }

  if (rows === null) {
    tout.innerHTML = ""; // clear
    return;
  }

  busy = true;
  for (const r of rows) {
    addLine(r);
    await sleep(70); // small "typing" delay between lines
  }
  busy = false;
}

tin.addEventListener("keydown", (e) => {
  e.stopPropagation();
  if (e.key === "Enter") {
    if (busy) return;
    const v = tin.value;
    tin.value = "";
    runCommand(v);
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    if (hi > 0) tin.value = cmdHistory[--hi];
  } else if (e.key === "ArrowDown") {
    e.preventDefault();
    hi = Math.min(hi + 1, cmdHistory.length);
    tin.value = cmdHistory[hi] || "";
  } else if (e.key === "Tab") {
    e.preventDefault();
    const v = tin.value.toLowerCase();
    const m = Object.keys(CMDS).filter((n) => v && n.startsWith(v));
    if (m.length === 1) tin.value = m[0];
  } else if (e.key === "l" && e.ctrlKey) {
    e.preventDefault();
    tout.innerHTML = "";
  }
});

// focus the input when the tab opens or when you click the terminal
$$(".tab").forEach((t) =>
  t.addEventListener("click", () => {
    if (t.dataset.tab === "stack") setTimeout(() => tin.focus(), 50);
  }),
);
termPane.addEventListener("click", () => {
  if (!getSelection().toString()) tin.focus();
});
