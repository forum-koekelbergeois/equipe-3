const canvas = document.getElementById("jeu");
const ctx = canvas.getContext("2d");
const scoreEl = document.getElementById("score");
const recordEl = document.getElementById("record");

const SOL = 330;
const POLICE = "Permanent Marker, Marker Felt, Segoe Print, Impact, cursive";

let joueur, obstacles, vitesse, score, record = 0, etat = "attente", compteur;
let objets = [];     // objets spéciaux (jetpack)
let vol = 0;         // temps de vol qui reste (en images)
let protection = 0;  // petit temps sans danger après l'atterrissage
let bottes = 0;      // temps qui reste avec les bottes (grands sauts)
let bouclier = 0;    // temps qui reste avec le bouclier (protection)
const DEBUT_TRAJET = 500;     // à 500 mètres, la voiture vient chercher le garçon
const FIN_TRAJET = 800;       // à 800 mètres, elle le dépose
const DISTANCE_FIN = 1000;    // à 1000 mètres, la voiture l'emmène pour de bon : c'est la fin
let voiture = null;           // la voiture de fuite
let typeFinale = "fin";       // "trajet" (500 à 800 m) ou "fin" (1000 m)
let trajetFait = false;       // le trajet de 500 à 800 m a déjà eu lieu
let phaseFinale = "";         // "arrivee", "montee", "trajet", "descente", "sortie" ou "depart"
let minuteurFinale = 0;
let joueurCache = false;      // le garçon est monté dans la voiture
let debutGagne = 0;
const DUREE_BOTTES = 300;     // 5 secondes
const DUREE_BOUCLIER = 360;  // 6 secondes
const DUREE_VOL = 300;  // 5 secondes à 60 images par seconde
const HAUTEUR_VOL = SOL - 180;

function metres() {
  return Math.floor(score / 6);  // 10 mètres par seconde
}

// Musique qui se répète pendant toute la partie.
// Le navigateur fabrique les sons lui-même.
let audio = null;
let minuterieMusique = null;
let prochainTemps = 0;
let musiquePaysage = 0;  // paysage dont on joue la musique
const LONGUEUR_MUSIQUE = 4;  // secondes

function jouerNote(freq, debut, duree, forme, force) {
  const osc = audio.createOscillator();
  const volume = audio.createGain();
  osc.type = forme;
  osc.frequency.value = freq;
  volume.gain.setValueAtTime(force, debut);
  volume.gain.exponentialRampToValueAtTime(0.001, debut + duree);
  osc.connect(volume);
  volume.connect(audio.destination);
  osc.start(debut);
  osc.stop(debut + duree);
}

// bruit court (pour la caisse claire et les charleston)
function jouerBruit(debut, duree, force, aigu) {
  const taille = Math.floor(audio.sampleRate * duree);
  const tampon = audio.createBuffer(1, taille, audio.sampleRate);
  const donnees = tampon.getChannelData(0);
  for (let i = 0; i < taille; i++) donnees[i] = Math.random() * 2 - 1;
  const source = audio.createBufferSource();
  source.buffer = tampon;
  const filtre = audio.createBiquadFilter();
  filtre.type = "highpass";
  filtre.frequency.value = aigu;
  const volume = audio.createGain();
  volume.gain.setValueAtTime(force, debut);
  volume.gain.exponentialRampToValueAtTime(0.001, debut + duree);
  source.connect(filtre);
  filtre.connect(volume);
  volume.connect(audio.destination);
  source.start(debut);
}

// grosse caisse : un son grave qui descend
function jouerGrosseCaisse(debut) {
  const osc = audio.createOscillator();
  const volume = audio.createGain();
  osc.frequency.setValueAtTime(150, debut);
  osc.frequency.exponentialRampToValueAtTime(40, debut + 0.15);
  volume.gain.setValueAtTime(0.5, debut);
  volume.gain.exponentialRampToValueAtTime(0.001, debut + 0.25);
  osc.connect(volume);
  volume.connect(audio.destination);
  osc.start(debut);
  osc.stop(debut + 0.25);
}

// Une musique par paysage (dans le même ordre que les paysages), de 4 secondes qui se répètent.
// Les 32 "pas" de la batterie font chacun un huitième de temps. Une mélodie à 0 est un silence.
const musiques = [
  { // Los Angeles : musique urbaine
    kicks: [0, 6, 8, 16, 22, 24], snares: [4, 12, 20, 28], pasHats: 2, forceHats: 0.08,
    basse: [110, 110, 131, 110, 147, 147, 131, 98], formeBasse: "triangle",
    melodie: [440, 523, 659, 523, 440, 523, 784, 659, 587, 698, 880, 698, 523, 659, 784, 659],
    formeMelodie: "square", forceMelodie: 0.05, duree: 0.2 },
  { // Désert : lent et mystérieux
    kicks: [0, 8, 16, 24], snares: [12, 28], pasHats: 4, forceHats: 0.05,
    basse: [110, 110, 117, 110, 147, 147, 117, 110], formeBasse: "triangle",
    melodie: [440, 466, 587, 466, 440, 392, 440, 466, 587, 622, 587, 466, 440, 466, 392, 440],
    formeMelodie: "sawtooth", forceMelodie: 0.03, duree: 0.22 },
  { // Forêt : doux et joyeux
    kicks: [0, 16], snares: [], pasHats: 4, forceHats: 0.03,
    basse: [131, 131, 196, 196, 175, 175, 196, 196], formeBasse: "sine",
    melodie: [523, 659, 784, 659, 523, 659, 880, 784, 698, 880, 1047, 880, 784, 659, 587, 659],
    formeMelodie: "sine", forceMelodie: 0.1, duree: 0.25 },
  { // Montagne enneigée : calme, avec des petites notes qui brillent
    kicks: [0, 16], snares: [], pasHats: 0, forceHats: 0,
    basse: [98, 98, 98, 98, 87, 87, 98, 98], formeBasse: "sine",
    melodie: [784, 0, 988, 0, 1175, 0, 988, 0, 880, 0, 1047, 0, 1319, 0, 1047, 0],
    formeMelodie: "sine", forceMelodie: 0.12, duree: 0.45 },
  { // Ville de nuit : rapide et électro
    kicks: [0, 4, 8, 12, 16, 20, 24, 28], snares: [8, 24], pasHats: 1, forceHats: 0.05,
    basse: [110, 110, 110, 147, 98, 98, 131, 131], formeBasse: "sawtooth",
    melodie: [659, 784, 988, 784, 659, 784, 1175, 988, 880, 1047, 1319, 1047, 784, 988, 1175, 988],
    formeMelodie: "square", forceMelodie: 0.04, duree: 0.15 },
];

function planifierMusique() {
  const m = musiques[indicePaysage()];
  const pas = 0.125;
  for (const p of m.kicks) jouerGrosseCaisse(prochainTemps + p * pas);
  for (const p of m.snares) jouerBruit(prochainTemps + p * pas, 0.15, 0.25, 1500);
  if (m.pasHats > 0) {
    for (let p = 0; p < 32; p += m.pasHats) jouerBruit(prochainTemps + p * pas, 0.04, m.forceHats, 7000);
  }
  // un coup de grosse caisse en plus, de temps en temps, au hasard
  if (Math.random() < 0.5) jouerGrosseCaisse(prochainTemps + [10, 14, 26, 30][Math.floor(Math.random() * 4)] * pas);
  // basse : une note toutes les demi-secondes (parfois remplacée par une autre note de la basse)
  m.basse.forEach((freq, i) => {
    if (Math.random() < 0.2) freq = m.basse[Math.floor(Math.random() * m.basse.length)];
    jouerNote(freq, prochainTemps + i * 0.5, 0.45, m.formeBasse, 0.3);
  });
  // mélodie : une note tous les quarts de seconde.
  // Elle change un peu à chaque tour, donc la musique ne se répète jamais pareil.
  const gamme = m.melodie.filter((f) => f > 0);
  m.melodie.forEach((freq, i) => {
    if (freq === 0) return;
    if (Math.random() < 0.3) freq = gamme[Math.floor(Math.random() * gamme.length)];
    if (Math.random() < 0.1) return;  // petit silence
    jouerNote(freq, prochainTemps + i * 0.25, m.duree, m.formeMelodie, m.forceMelodie);
  });
  prochainTemps += LONGUEUR_MUSIQUE;
}

function demarrerMusique() {
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return;
  arreterMusique();
  if (!audio) audio = new AudioCtx();
  audio.resume();
  prochainTemps = audio.currentTime + 0.1;
  musiquePaysage = indicePaysage();
  planifierMusique();
  minuterieMusique = setInterval(() => {
    if (prochainTemps - audio.currentTime < 1.5) planifierMusique();
  }, 300);
}

function arreterMusique() {
  clearInterval(minuterieMusique);
  minuterieMusique = null;
  if (audio) {
    // ferme le son : les notes déjà prévues s'arrêtent
    audio.close();
    audio = null;
  }
}

// La grosse tête crie « six seven » avec la voix du navigateur
let debutPerdu = 0;  // moment où la partie est perdue (pour animer la grosse tête)

function crierSixSeven() {
  debutPerdu = Date.now();
  if (!window.speechSynthesis) return;
  speechSynthesis.cancel();
  // il crie deux fois, fort et aigu
  for (let i = 0; i < 2; i++) {
    const voix = new SpeechSynthesisUtterance("six seven!");
    voix.lang = "en-US";
    voix.volume = 1;
    voix.rate = 1.15;
    voix.pitch = 1.8;
    speechSynthesis.speak(voix);
  }
}

function recommencer() {
  if (window.speechSynthesis) speechSynthesis.cancel();
  objets = [];
  vol = 0;
  protection = 0;
  bottes = 0;
  bouclier = 0;
  voiture = null;
  joueurCache = false;
  trajetFait = false;
  joueur = { x: 200, y: SOL, vy: 0, glisse: false, tempsGlisse: 0 };
  obstacles = [];
  vitesse = 6;
  score = 0;
  compteur = 0;
  etat = "jeu";
  demarrerMusique();  // après la remise à zéro, pour commencer avec la musique du premier paysage
}

function sauter() {
  if (etat === "finale") return;  // pendant la fin, les touches ne font rien
  if (etat !== "jeu") { recommencer(); return; }
  if (vol > 0) return;
  if (joueur.y >= SOL && !joueur.glisse) joueur.vy = bottes > 0 ? -17 : -13;
}

function glisser() {
  if (etat !== "jeu" || vol > 0) return;
  if (joueur.y >= SOL) { joueur.glisse = true; joueur.tempsGlisse = 40; }
}

document.addEventListener("keydown", (e) => {
  if (e.code === "Space") { e.preventDefault(); sauter(); }
  if (e.code === "ArrowDown") { e.preventDefault(); glisser(); }
});
document.getElementById("btnSaut").addEventListener("click", sauter);
document.getElementById("btnGlisse").addEventListener("click", glisser);

function creerObstacle(x) {
  // "bas" : on saute par-dessus. "haut" : on glisse en dessous.
  // "pique" : des piques au sol, on saute par-dessus.
  // Tous les 500 mètres, de nouveaux obstacles arrivent :
  // "pile" (caisses empilées, dès 500 m) et "barriere" (dès 1000 m).
  const niveau = Math.floor(metres() / 500);
  const types = ["bas", "haut", "pique"];
  if (niveau >= 1) types.push("pile");
  if (niveau >= 2) types.push("barriere");
  const type = types[Math.floor(Math.random() * types.length)];
  const largeurs = { pique: 60, barriere: 70 };
  obstacles.push({ x: x === undefined ? canvas.width + 20 : x, type: type, w: largeurs[type] || 40 });
}

function boiteJoueur() {
  const h = joueur.glisse ? 25 : 60;
  return { x: joueur.x - 15, y: joueur.y - h, w: 30, h: h };
}

function boiteObstacle(o) {
  if (o.type === "bas") return { x: o.x, y: SOL - 40, w: o.w, h: 40 };
  if (o.type === "pique") return { x: o.x + 5, y: SOL - 30, w: o.w - 10, h: 30 };
  if (o.type === "pile") return { x: o.x, y: SOL - 70, w: o.w, h: 70 };
  if (o.type === "barriere") return { x: o.x, y: SOL - 60, w: o.w, h: 25 };  // on saute dessus ou on glisse dessous
  return { x: o.x, y: SOL - 95, w: o.w, h: 50 }; // flotte : laisse le passage en bas
}

function touche(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function mettreAJour() {
  if (etat === "finale") { mettreAJourFinale(); return; }
  if (etat !== "jeu") return;
  if (voiture) mettreAJourVoitureQuiPart();

  if (vol > 0) {
    // vol : on monte doucement et on reste en l'air
    vol--;
    joueur.glisse = false;
    joueur.vy = 0;
    joueur.y += (HAUTEUR_VOL - joueur.y) * 0.1;
    if (vol === 0) {
      // fin du vol : on retombe sur un sol sans obstacle, puis un premier obstacle
      // arrive en moins d'une seconde (il touche le personnage après environ 50 images)
      obstacles = [];
      creerObstacle(joueur.x + vitesse * 50);
      compteur = 0;
      protection = 25;  // le temps de retomber
    }
  } else {
    joueur.vy += 0.8;
    joueur.y += joueur.vy;
    if (joueur.y > SOL) { joueur.y = SOL; joueur.vy = 0; }
  }
  if (protection > 0) protection--;
  if (bottes > 0) bottes--;
  if (bouclier > 0) bouclier--;

  // un objet spécial apparaît parfois, au hasard, quand il n'y a pas d'obstacle à côté :
  // jetpack (voler), bottes (grands sauts) ou bouclier (protection)
  const placeLibre = obstacles.every((o) => o.x < canvas.width - 150);
  if (vol === 0 && protection === 0 && objets.length === 0 && placeLibre && Math.random() < 0.004) {
    const genres = ["jetpack", "bottes", "bouclier"];
    const genre = genres[Math.floor(Math.random() * genres.length)];
    objets.push({ genre: genre, x: canvas.width + 20, y: SOL - 110, w: 30, h: 40 });
  }
  for (const obj of objets) obj.x -= vitesse;
  objets = objets.filter((obj) => obj.x > -60);
  for (const obj of objets) {
    if (touche(boiteJoueur(), obj)) {
      if (obj.genre === "jetpack") vol = DUREE_VOL;
      if (obj.genre === "bottes") bottes = DUREE_BOTTES;
      if (obj.genre === "bouclier") bouclier = DUREE_BOUCLIER;
      objets = [];
      break;
    }
  }

  if (joueur.glisse) {
    joueur.tempsGlisse--;
    if (joueur.tempsGlisse <= 0) joueur.glisse = false;
  }

  if (vol === 0) compteur++;  // pas de nouvel obstacle pendant le vol
  if (compteur > 70 - Math.min(vitesse * 3, 35) + Math.random() * 40) {
    creerObstacle();
    compteur = 0;
  }

  for (const o of obstacles) o.x -= vitesse;
  obstacles = obstacles.filter((o) => o.x > -100);

  score += 1;
  // vitesse normale au début, puis +1,5 tous les 500 mètres
  vitesse = 6 + 1.5 * Math.floor(metres() / 500);
  scoreEl.textContent = metres();

  const moi = boiteJoueur();
  for (const o of obstacles) {
    if (vol === 0 && protection === 0 && bouclier === 0 && touche(moi, boiteObstacle(o))) {
      etat = "perdu";
      arreterMusique();
      crierSixSeven();
      record = Math.max(record, metres());
      recordEl.textContent = record;
    }
  }

  if (etat === "jeu" && metres() >= DISTANCE_FIN) demarrerFinale("fin");
  else if (etat === "jeu" && !trajetFait && metres() >= DEBUT_TRAJET) demarrerFinale("trajet");
}

// Après le trajet, la voiture continue sa route et sort de l'écran pendant que la course reprend
function mettreAJourVoitureQuiPart() {
  voiture.vitesse = Math.min(16, voiture.vitesse + 0.4);
  voiture.x += voiture.vitesse;
  voiture.roue += voiture.vitesse / 11;
  if (voiture.x > canvas.width + 20) voiture = null;
}

// ---------- La fin : la voiture arrive, le garçon monte dedans et ils s'enfuient ----------

// type "trajet" : à 500 m la voiture emmène le garçon jusqu'à 800 m, puis le dépose.
// type "fin" : à 1000 m la voiture l'emmène pour de bon, c'est la victoire.
function demarrerFinale(type) {
  etat = "finale";
  typeFinale = type;
  if (type === "trajet") trajetFait = true;
  phaseFinale = "arrivee";
  minuteurFinale = 0;
  obstacles = [];
  objets = [];
  vol = 0;
  joueur.glisse = false;
  voiture = { x: canvas.width + 60, vers: -1, roue: 0, vitesse: 0 };
}

function avancerDistance() {
  score += 1;
  scoreEl.textContent = metres();
}

function mettreAJourFinale() {
  // le garçon retombe s'il était en l'air, sauf quand il saute dans la voiture ou en sort
  if (phaseFinale !== "montee" && phaseFinale !== "sortie") {
    joueur.vy += 0.8;
    joueur.y += joueur.vy;
    if (joueur.y > SOL) { joueur.y = SOL; joueur.vy = 0; }
  }
  const arret = joueur.x - 60;  // la voiture s'arrête juste à côté du garçon
  const vitesseNormale = 6 + 1.5 * Math.floor(metres() / 500);

  if (phaseFinale === "arrivee") {
    vitesse *= 0.97;  // le décor ralentit pendant que la voiture freine
    const pas = Math.max(-14, Math.min(-0.8, (arret - voiture.x) * 0.06));
    voiture.x += pas;
    voiture.roue += -pas / 11;
    if (voiture.x <= arret + 1) {
      voiture.x = arret;
      vitesse = 0;
      phaseFinale = "montee";
      minuteurFinale = 0;
    }
  } else if (phaseFinale === "montee") {
    minuteurFinale++;
    joueur.y = SOL - Math.sin(Math.PI * Math.min(1, minuteurFinale / 30)) * 60;
    if (minuteurFinale >= 30) {
      joueurCache = true;
      joueur.y = SOL;
      voiture.vers = 1;  // la voiture repart de l'autre côté
      phaseFinale = typeFinale === "trajet" ? "trajet" : "depart";
      minuteurFinale = 0;
    }
  } else if (phaseFinale === "trajet") {
    // la voiture roule : le décor défile et la distance augmente jusqu'à 800 m
    vitesse += (vitesseNormale - vitesse) * 0.05;
    voiture.roue += vitesse / 11;
    avancerDistance();
    if (metres() >= FIN_TRAJET) phaseFinale = "descente";
  } else if (phaseFinale === "descente") {
    vitesse *= 0.96;  // la voiture freine
    voiture.roue += vitesse / 11;
    if (vitesse > 0.3) {
      avancerDistance();
    } else {
      vitesse = 0;
      joueurCache = false;  // le garçon sort de la voiture
      phaseFinale = "sortie";
      minuteurFinale = 0;
    }
  } else if (phaseFinale === "sortie") {
    minuteurFinale++;
    joueur.y = SOL - Math.sin(Math.PI * Math.min(1, minuteurFinale / 30)) * 60;
    if (minuteurFinale >= 30) {
      // la voiture s'en va et la course reprend, avec un petit moment sans obstacle
      joueur.y = SOL;
      voiture.vitesse = 0;
      etat = "jeu";
      vitesse = vitesseNormale;
      protection = 60;
      compteur = -20;
    }
  } else {
    minuteurFinale++;
    if (minuteurFinale > 20) {
      voiture.vitesse = Math.min(16, voiture.vitesse + 0.4);
      voiture.x += voiture.vitesse;
      voiture.roue += voiture.vitesse / 11;
    }
    if (voiture.x > canvas.width + 20) gagner();
  }
}

function sonVictoire() {
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return;
  audio = new AudioCtx();
  audio.resume();
  [[523, 0], [659, 0.15], [784, 0.3], [1047, 0.45], [784, 0.7], [1047, 0.85]].forEach(([freq, moment]) => {
    jouerNote(freq, audio.currentTime + moment, 0.25, "square", 0.12);
  });
}

function gagner() {
  etat = "gagne";
  debutGagne = Date.now();
  arreterMusique();
  sonVictoire();
  record = Math.max(record, metres());
  recordEl.textContent = record;
}

// ---------- Dessin ----------

let defilement = 0;

function dessinerJetpack(x, y, flamme) {
  const degrade = ctx.createLinearGradient(x, y, x + 14, y);
  degrade.addColorStop(0, "#ff6b5a");
  degrade.addColorStop(1, "#b3201a");
  ctx.fillStyle = degrade;
  ctx.beginPath();
  ctx.roundRect(x, y, 14, 28, 4);
  ctx.fill();
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = "#ccd";
  ctx.fillRect(x + 3, y + 4, 8, 4);          // petit voyant
  ctx.fillStyle = "#333";
  ctx.fillRect(x + 2, y + 26, 10, 4);        // tuyère
  if (flamme) {
    ctx.fillStyle = "#ff9a00";
    ctx.beginPath();
    ctx.moveTo(x + 1, y + 30);
    ctx.lineTo(x + 7, y + 30 + 14 + Math.random() * 12);
    ctx.lineTo(x + 13, y + 30);
    ctx.fill();
    ctx.fillStyle = "#ffe14d";
    ctx.beginPath();
    ctx.moveTo(x + 4, y + 30);
    ctx.lineTo(x + 7, y + 30 + 8 + Math.random() * 6);
    ctx.lineTo(x + 10, y + 30);
    ctx.fill();
  }
}

function dessinerBottes(x, y) {
  ctx.fillStyle = "#f2c230";
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 2;
  for (const dx of [0, 14]) {
    ctx.beginPath();
    ctx.roundRect(x + dx, y, 11, 26, 3);   // tige
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.roundRect(x + dx, y + 18, 18, 10, 4);  // pied
    ctx.fill();
    ctx.stroke();
  }
  ctx.fillStyle = "#fff";
  ctx.fillRect(x + 1, y + 4, 9, 3);
  ctx.fillRect(x + 15, y + 4, 9, 3);
}

function dessinerBouclier(x, y, l) {
  // x, y : centre du haut du bouclier ; l : demi-largeur
  const forme = () => {
    ctx.beginPath();
    ctx.moveTo(x - l, y);
    ctx.lineTo(x + l, y);
    ctx.lineTo(x + l, y + l * 1.1);
    ctx.quadraticCurveTo(x + l, y + l * 2, x, y + l * 2.3);
    ctx.quadraticCurveTo(x - l, y + l * 2, x - l, y + l * 1.1);
    ctx.closePath();
  };
  const degrade = ctx.createLinearGradient(x - l, y, x + l, y + l * 2);
  degrade.addColorStop(0, "#5ab0ff");
  degrade.addColorStop(1, "#1b4fb5");
  forme();
  ctx.fillStyle = degrade;
  ctx.fill();
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 3;
  ctx.stroke();
  // petite étoile blanche au milieu
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const r = i % 2 ? l * 0.25 : l * 0.6;
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    ctx.lineTo(x + Math.cos(a) * r, y + l * 0.95 + Math.sin(a) * r);
  }
  ctx.closePath();
  ctx.fill();
}

function dessinerObjet(obj) {
  if (obj.genre === "bottes") {
    dessinerBottes(obj.x + 3, obj.y + 6);
  } else if (obj.genre === "bouclier") {
    dessinerBouclier(obj.x + 15, obj.y, 15);
  } else {
    dessinerJetpack(obj.x + 8, obj.y + 6, false);
  }
}

// Le personnage est dessiné avec les pieds en (0, 0).
function dessinerCorps(pas, enLair) {
  ctx.lineCap = "round";
  // jambes
  ctx.strokeStyle = "#2b4c9b";
  ctx.lineWidth = 8;
  const pieds = enLair
    ? [[10, -6], [-8, -10]]
    : [[pas * 13, -3 - Math.max(0, -pas) * 8], [-pas * 13, -3 - Math.max(0, pas) * 8]];
  for (const [fx, fy] of pieds) {
    ctx.beginPath();
    ctx.moveTo(0, -20);
    ctx.lineTo(fx, fy);
    ctx.stroke();
    ctx.fillStyle = "#fff";           // baskets
    ctx.beginPath();
    ctx.ellipse(fx + 3, fy + 1, 7, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.strokeStyle = "#2b4c9b";
    ctx.lineWidth = 8;
  }
  // bras de derrière
  ctx.strokeStyle = "#c9570a";
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.moveTo(0, -42);
  ctx.lineTo(-pas * 14, -28);
  ctx.stroke();
  // sweat à capuche
  ctx.fillStyle = "#ff7a1a";
  ctx.beginPath();
  ctx.roundRect(-12, -50, 24, 34, 7);
  ctx.fill();
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = "#e5640a";
  ctx.fillRect(-7, -30, 14, 7);        // poche
  // bras de devant
  ctx.strokeStyle = "#ff7a1a";
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.moveTo(0, -42);
  ctx.lineTo(pas * 14, -28);
  ctx.stroke();
  // tête
  ctx.fillStyle = "#e0ac69";
  ctx.beginPath();
  ctx.arc(2, -60, 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 2;
  ctx.stroke();
  // casquette
  ctx.fillStyle = "#111";
  ctx.beginPath();
  ctx.arc(2, -62, 10.5, Math.PI, 0);
  ctx.fill();
  ctx.fillRect(6, -63, 13, 4);
  // œil
  ctx.fillStyle = "#000";
  ctx.beginPath();
  ctx.arc(7, -58, 1.8, 0, Math.PI * 2);
  ctx.fill();
}

function dessinerPersonnage() {
  const x = joueur.x;
  const y = joueur.y;
  const enLair = y < SOL - 3;
  if (joueurCache) return;  // il est dans la voiture

  // ombre sur la route
  const ecart = Math.min(1, (SOL - y) / 180);
  ctx.fillStyle = "rgba(0, 0, 0, " + (0.35 - ecart * 0.25) + ")";
  ctx.beginPath();
  ctx.ellipse(x, SOL + 4, 24 - ecart * 12, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  if (vol > 0) dessinerJetpack(x - 25, y - 50, true);

  ctx.save();
  if (joueur.glisse) {
    // allongé sur le dos, les pieds devant
    ctx.translate(x, y - 16);
    ctx.rotate(-1.45);
    ctx.translate(0, 20);
    dessinerCorps(0, false);
  } else {
    ctx.translate(x, y);
    // il court moins vite quand le décor ralentit
    dessinerCorps(Math.sin(Date.now() / 70) * Math.min(1, vitesse / 4), enLair || vol > 0);
  }
  ctx.restore();

  // bulle de bouclier autour du personnage (elle clignote quand elle va disparaître)
  if (bouclier > 0 && (bouclier > 90 || Math.floor(Date.now() / 100) % 2)) {
    const centreY = joueur.glisse ? y - 14 : y - 32;
    const bulle = ctx.createRadialGradient(x, centreY, 20, x, centreY, 52);
    bulle.addColorStop(0, "rgba(90, 176, 255, 0.1)");
    bulle.addColorStop(1, "rgba(90, 176, 255, 0.55)");
    ctx.fillStyle = bulle;
    ctx.beginPath();
    ctx.arc(x, centreY, 52, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#cfe8ff";
    ctx.lineWidth = 3;
    ctx.stroke();
  }
}

// La voiture de police saute par-dessus les obstacles posés au sol.
function sautPolice() {
  let saut = 0;
  for (const o of obstacles) {
    if (o.type === "haut") continue;  // elle passe dessous
    const t = (180 - o.x) / 270;      // 0 quand l'obstacle approche, 1 quand il est passé
    if (t > 0 && t < 1) saut = Math.max(saut, Math.sin(Math.PI * t) * 105);
  }
  return saut;
}

function dessinerPolice() {
  const px = 20;
  const saut = sautPolice();
  const clignote = Math.floor(Date.now() / 150) % 2;

  // ombre
  ctx.fillStyle = "rgba(0, 0, 0, " + (0.35 - Math.min(saut, 90) / 400) + ")";
  ctx.beginPath();
  ctx.ellipse(px + 45, SOL + 4, 48 - saut / 4, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.save();
  ctx.translate(0, -saut);

  // lueur de la sirène
  const lueur = ctx.createRadialGradient(px + 45, SOL - 48, 2, px + 45, SOL - 48, 60);
  lueur.addColorStop(0, clignote ? "rgba(255, 40, 40, 0.55)" : "rgba(40, 110, 255, 0.55)");
  lueur.addColorStop(1, "rgba(255, 255, 255, 0)");
  ctx.fillStyle = lueur;
  ctx.fillRect(px - 20, SOL - 110, 130, 110);

  // carrosserie
  ctx.fillStyle = "#f2f2f2";
  ctx.beginPath();
  ctx.roundRect(px, SOL - 34, 92, 26, 6);
  ctx.fill();
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 2;
  ctx.stroke();
  // bande noire et bleue
  ctx.fillStyle = "#111";
  ctx.fillRect(px + 2, SOL - 22, 88, 8);
  ctx.fillStyle = "#1b5fd1";
  ctx.fillRect(px + 2, SOL - 25, 88, 3);
  // cabine et vitres
  ctx.fillStyle = "#f2f2f2";
  ctx.beginPath();
  ctx.moveTo(px + 18, SOL - 34);
  ctx.lineTo(px + 28, SOL - 50);
  ctx.lineTo(px + 66, SOL - 50);
  ctx.lineTo(px + 78, SOL - 34);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#7fc4ee";
  ctx.beginPath();
  ctx.moveTo(px + 24, SOL - 36);
  ctx.lineTo(px + 31, SOL - 47);
  ctx.lineTo(px + 44, SOL - 47);
  ctx.lineTo(px + 44, SOL - 36);
  ctx.closePath();
  ctx.moveTo(px + 48, SOL - 36);
  ctx.lineTo(px + 48, SOL - 47);
  ctx.lineTo(px + 63, SOL - 47);
  ctx.lineTo(px + 72, SOL - 36);
  ctx.closePath();
  ctx.fill();
  // gyrophares
  ctx.fillStyle = clignote ? "#ff2a2a" : "#7a1010";
  ctx.fillRect(px + 38, SOL - 57, 9, 7);
  ctx.fillStyle = clignote ? "#103a7a" : "#2a7bff";
  ctx.fillRect(px + 47, SOL - 57, 9, 7);
  // phare avant
  ctx.fillStyle = "#ffe98a";
  ctx.fillRect(px + 87, SOL - 30, 5, 6);
  // roues qui tournent
  for (const wx of [px + 22, px + 70]) {
    ctx.fillStyle = "#111";
    ctx.beginPath();
    ctx.arc(wx, SOL - 5, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#bbb";
    ctx.lineWidth = 2;
    for (let i = 0; i < 3; i++) {
      const a = defilement / 8 + (i * Math.PI) / 3;
      ctx.beginPath();
      ctx.moveTo(wx - Math.cos(a) * 6, SOL - 5 - Math.sin(a) * 6);
      ctx.lineTo(wx + Math.cos(a) * 6, SOL - 5 + Math.sin(a) * 6);
      ctx.stroke();
    }
  }
  ctx.restore();
}

function dessinerObstacle(o) {
  const b = boiteObstacle(o);

  if (o.type === "pique") {
    // piques en métal
    for (let i = 0; i < 3; i++) {
      const px = o.x + i * 20;
      const metal = ctx.createLinearGradient(px, 0, px + 20, 0);
      metal.addColorStop(0, "#e8e8ee");
      metal.addColorStop(1, "#6b6b78");
      ctx.fillStyle = metal;
      ctx.beginPath();
      ctx.moveTo(px, SOL);
      ctx.lineTo(px + 10, SOL - 32);
      ctx.lineTo(px + 20, SOL);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "#000";
      ctx.lineWidth = 2;
      ctx.stroke();
    }
    return;
  }

  if (o.type === "pile") {
    // deux caisses empilées
    for (let i = 0; i < 2; i++) {
      const cy = SOL - 35 * (i + 1);
      ctx.fillStyle = i ? "#d08a45" : "#b06d2d";
      ctx.fillRect(b.x, cy, b.w, 35);
      ctx.strokeStyle = "#5a3213";
      ctx.lineWidth = 3;
      ctx.strokeRect(b.x + 1.5, cy + 1.5, b.w - 3, 32);
      ctx.beginPath();
      ctx.moveTo(b.x + 3, cy + 3);
      ctx.lineTo(b.x + b.w - 3, cy + 32);
      ctx.moveTo(b.x + b.w - 3, cy + 3);
      ctx.lineTo(b.x + 3, cy + 32);
      ctx.stroke();
    }
    return;
  }

  if (o.type === "barriere") {
    // barrière de chantier rouge et blanche, sur deux pieds
    ctx.fillStyle = "#333";
    ctx.fillRect(b.x + 4, b.y + b.h, 5, SOL - b.y - b.h);
    ctx.fillRect(b.x + b.w - 9, b.y + b.h, 5, SOL - b.y - b.h);
    ctx.fillStyle = "#fff";
    ctx.fillRect(b.x, b.y, b.w, b.h);
    ctx.fillStyle = "#e0262a";
    for (let sx = 0; sx < b.w; sx += 20) {
      ctx.fillRect(b.x + sx, b.y, 10, b.h);
    }
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2;
    ctx.strokeRect(b.x, b.y, b.w, b.h);
    return;
  }

  if (o.type === "bas") {
    // caisse en bois
    ctx.fillStyle = "#c27b3a";
    ctx.fillRect(b.x, b.y, b.w, b.h);
    ctx.strokeStyle = "#5a3213";
    ctx.lineWidth = 3;
    ctx.strokeRect(b.x + 1.5, b.y + 1.5, b.w - 3, b.h - 3);
    ctx.beginPath();
    ctx.moveTo(b.x + 3, b.y + 3);
    ctx.lineTo(b.x + b.w - 3, b.y + b.h - 3);
    ctx.moveTo(b.x + b.w - 3, b.y + 3);
    ctx.lineTo(b.x + 3, b.y + b.h - 3);
    ctx.stroke();
    ctx.fillStyle = "#000";
    ctx.fillRect(b.x, b.y, b.w, 3);
    return;
  }

  // drone de surveillance qui flotte (on glisse en dessous)
  const cx = b.x + b.w / 2;
  const cy = b.y + 28;
  ctx.fillStyle = "#3b3f4a";
  ctx.beginPath();
  ctx.ellipse(cx, cy, 20, 12, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = Math.floor(Date.now() / 200) % 2 ? "#ff2a2a" : "#7a1010";
  ctx.beginPath();
  ctx.arc(cx, cy + 2, 5, 0, Math.PI * 2);
  ctx.fill();
  // hélices qui vibrent
  ctx.strokeStyle = "#222";
  ctx.lineWidth = 3;
  const vib = Math.sin(Date.now() / 25) * 6;
  for (const dx of [-18, 18]) {
    ctx.beginPath();
    ctx.moveTo(cx + dx, cy - 12);
    ctx.lineTo(cx + dx, cy - 18);
    ctx.moveTo(cx + dx - 12 + vib, cy - 18);
    ctx.lineTo(cx + dx + 12 - vib, cy - 18);
    ctx.stroke();
  }
}

// Fond Los Angeles : étoiles, soleil, collines, immeubles, palmiers et route
// Nombre « au hasard » qui reste le même pour un même n : le décor est inventé au fur et à mesure,
// donc il ne se répète jamais.
function alea(n) {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
}
const etoiles = [];
for (let i = 0; i < 30; i++) {
  etoiles.push({ x: (i * 197) % canvas.width, y: (i * 61) % 130, r: 0.8 + (i % 3) * 0.5 });
}

// Le paysage change tous les 100 mètres
// ciel : dégradé du haut vers le bas ; milieu : ce qu'on voit au milieu du paysage ;
// sol : couleurs de la route ; particules : petits éléments qui bougent dans l'air
const paysages = [
  { nom: "Los Angeles", ciel: ["#0a1a4a", "#87ceeb"], etoiles: true, halo: "255, 190, 90",
    soleil: ["#ffe27a", "#ff7a3d"], lune: false, nuage: "rgba(255, 255, 255, 0.35)",
    collines: "#33508f", collines2: "#2a4380", brume: "rgba(255, 190, 140, 0.35)",
    milieu: "ville", immeubles: "#1c2a55", fenetres: "#ffd86b", decor: "palmier",
    sol: ["#3a3a44", "#16161c"], bordure: "#b9b9c4", lignes: "#f5d94a", neon: false, particules: "aucune" },
  { nom: "Désert", ciel: ["#d9702a", "#ffe0a8"], etoiles: false, halo: "255, 230, 150",
    soleil: ["#fff2a8", "#ffb347"], lune: false, nuage: "rgba(255, 240, 220, 0.45)",
    collines: "#c0773f", collines2: "#a8602f", brume: "rgba(255, 220, 160, 0.45)",
    milieu: "mesas", immeubles: "#8a4b25", fenetres: null, decor: "cactus",
    sol: ["#d8a45c", "#9c6a30"], bordure: "#efc888", lignes: "#fff0c0", neon: false, particules: "poussiere" },
  { nom: "Forêt", ciel: ["#16453a", "#b4ecb8"], etoiles: false, halo: "255, 255, 190",
    soleil: ["#fffbc0", "#ffe066"], lune: false, nuage: "rgba(255, 255, 255, 0.4)",
    collines: "#2f7a4a", collines2: "#25663c", brume: "rgba(200, 255, 210, 0.4)",
    milieu: "pins", immeubles: "#1d4d33", fenetres: null, decor: "sapin",
    sol: ["#5a4528", "#2b2012"], bordure: "#4c9a3c", lignes: "#7a6238", neon: false, particules: "lucioles" },
  { nom: "Montagne enneigée", ciel: ["#2a3f6a", "#eaf5ff"], etoiles: true, halo: "255, 255, 255",
    soleil: ["#ffffff", "#cfe6ff"], lune: false, nuage: "rgba(255, 255, 255, 0.5)",
    collines: "#9db7d6", collines2: "#85a2c8", brume: "rgba(255, 255, 255, 0.5)",
    milieu: "montagnes", immeubles: "#6f88ad", fenetres: null, decor: "sapinNeige",
    sol: ["#f4f8ff", "#b9cde6"], bordure: "#ffffff", lignes: "#9db7d6", neon: false, particules: "neige" },
  { nom: "Ville de nuit", ciel: ["#14002e", "#8a44b8"], etoiles: true, halo: "220, 200, 255",
    soleil: ["#fffbe8", "#d9d4ff"], lune: true, nuage: "rgba(190, 150, 240, 0.25)",
    collines: "#3a1d6b", collines2: "#2e1558", brume: "rgba(255, 120, 220, 0.3)",
    milieu: "ville", immeubles: "#1a0b3a", fenetres: "#ff7ad9", decor: "lampadaire",
    sol: ["#1c1030", "#0a0614"], bordure: "#ff4fd8", lignes: "#4ff0ff", neon: true, particules: "aucune" },
];
let paysageAffiche = 0;
let annonce = 0;  // temps qui reste pour montrer le nom du nouveau paysage

function indicePaysage() {
  if (typeof score !== "number") return 0;
  return Math.floor(metres() / 100) % paysages.length;
}

function dessinerCactus(x) {
  ctx.fillStyle = "#2e8b57";
  ctx.strokeStyle = "#0d3b24";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(x - 9, SOL - 120, 18, 120, 9);       // tronc
  ctx.roundRect(x - 35, SOL - 85, 14, 45, 7);        // bras gauche
  ctx.roundRect(x - 35, SOL - 52, 28, 12, 6);
  ctx.roundRect(x + 21, SOL - 100, 14, 50, 7);       // bras droit
  ctx.roundRect(x + 7, SOL - 62, 28, 12, 6);
  ctx.fill();
  ctx.stroke();
}

function dessinerSapin(x, neige) {
  ctx.fillStyle = "#5a3a22";
  ctx.fillRect(x - 6, SOL - 35, 12, 35);
  ctx.strokeStyle = neige ? "#6f88ad" : "#0d3b24";
  ctx.lineWidth = 3;
  [[95, 70], [75, 110], [55, 145]].forEach(([largeur, haut]) => {
    ctx.fillStyle = neige ? "#eef6ff" : "#1f6b3a";
    ctx.beginPath();
    ctx.moveTo(x - largeur / 2, SOL - haut + 45);
    ctx.lineTo(x, SOL - haut - 25);
    ctx.lineTo(x + largeur / 2, SOL - haut + 45);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  });
}

function dessinerLampadaire(x) {
  const lueur = ctx.createRadialGradient(x + 20, SOL - 150, 3, x + 20, SOL - 150, 70);
  lueur.addColorStop(0, "rgba(255, 220, 120, 0.7)");
  lueur.addColorStop(1, "rgba(255, 220, 120, 0)");
  ctx.fillStyle = lueur;
  ctx.fillRect(x - 60, SOL - 220, 160, 160);
  ctx.strokeStyle = "#222";
  ctx.lineWidth = 6;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(x, SOL);
  ctx.lineTo(x, SOL - 150);
  ctx.quadraticCurveTo(x, SOL - 165, x + 20, SOL - 160);
  ctx.stroke();
  ctx.fillStyle = "#ffe08a";
  ctx.beginPath();
  ctx.ellipse(x + 20, SOL - 155, 14, 6, 0, 0, Math.PI * 2);
  ctx.fill();
}

function dessinerPalmier(x) {
  // tronc
  const tronc = ctx.createLinearGradient(x - 5, 0, x + 12, 0);
  tronc.addColorStop(0, "#6b4426");
  tronc.addColorStop(1, "#3a2413");
  ctx.strokeStyle = tronc;
  ctx.lineWidth = 9;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(x, SOL);
  ctx.quadraticCurveTo(x + 14, SOL - 90, x + 4, SOL - 160);
  ctx.stroke();
  // feuilles
  ctx.strokeStyle = "#0e4d34";
  ctx.lineWidth = 6;
  for (let a = -2; a <= 2; a++) {
    ctx.beginPath();
    ctx.moveTo(x + 4, SOL - 160);
    ctx.quadraticCurveTo(x + 4 + a * 25, SOL - 200, x + 4 + a * 40, SOL - 148 + Math.abs(a) * 14);
    ctx.stroke();
  }
  // noix de coco
  ctx.fillStyle = "#3a2413";
  ctx.beginPath();
  ctx.arc(x - 2, SOL - 155, 4, 0, Math.PI * 2);
  ctx.arc(x + 9, SOL - 154, 4, 0, Math.PI * 2);
  ctx.fill();
}

// Transition : l'ancien paysage disparaît doucement pendant que le nouveau apparaît (1 seconde)
let paysagePrecedent = 0;
let fondu = 0;  // temps qui reste pour la transition
const DUREE_FONDU = 60;

function dessinerFond() {
  if (etat === "jeu" || etat === "finale") defilement += vitesse;

  // nouveau paysage : transition, nom affiché et nouvelle musique
  const indice = indicePaysage();
  if (indice !== paysageAffiche) {
    paysagePrecedent = paysageAffiche;
    paysageAffiche = indice;
    fondu = DUREE_FONDU;
    annonce = 150;
    if ((etat === "jeu" || etat === "finale") && musiquePaysage !== indice) demarrerMusique();
  }

  if (fondu > 0) {
    dessinerPaysage(paysages[paysagePrecedent]);
    ctx.globalAlpha = 1 - fondu / DUREE_FONDU;
    dessinerPaysage(paysages[paysageAffiche]);
    ctx.globalAlpha = 1;
    fondu--;
    if (fondu === DUREE_FONDU / 2) {
      // le fond de la page change au milieu de la transition
      const ciel = paysages[paysageAffiche].ciel;
      document.body.style.background = "linear-gradient(to bottom, " + ciel[0] + ", " + ciel[1] + ")";
    }
  } else {
    dessinerPaysage(paysages[paysageAffiche]);
  }
}

function dessinerPaysage(paysage) {
  const t = Date.now();
  const mod = (a, n) => ((a % n) + n) % n;

  // ciel
  const ciel = ctx.createLinearGradient(0, 0, 0, canvas.height);
  ciel.addColorStop(0, paysage.ciel[0]);
  ciel.addColorStop(1, paysage.ciel[1]);
  ctx.fillStyle = ciel;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // étoiles
  if (paysage.etoiles) {
    ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
    for (const e of etoiles) {
      ctx.beginPath();
      ctx.arc(e.x, e.y, e.r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // soleil (ou lune) avec sa lueur
  const lueur = ctx.createRadialGradient(620, 170, 40, 620, 170, 140);
  lueur.addColorStop(0, "rgba(" + paysage.halo + ", 0.55)");
  lueur.addColorStop(1, "rgba(" + paysage.halo + ", 0)");
  ctx.fillStyle = lueur;
  ctx.fillRect(460, 20, 320, 300);
  const soleil = ctx.createLinearGradient(0, 115, 0, 225);
  soleil.addColorStop(0, paysage.soleil[0]);
  soleil.addColorStop(1, paysage.soleil[1]);
  ctx.fillStyle = soleil;
  ctx.beginPath();
  ctx.arc(620, 170, 55, 0, Math.PI * 2);
  ctx.fill();
  if (paysage.lune) {
    ctx.fillStyle = "rgba(140, 140, 190, 0.4)";   // cratères
    for (const [cx, cy, r] of [[600, 150, 11], [642, 188, 15], [606, 196, 7], [650, 145, 6]]) {
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // nuages qui passent doucement
  ctx.fillStyle = paysage.nuage;
  const decalNuage = defilement * 0.1;
  const premierNuage = Math.floor(decalNuage / 260) - 1;
  for (let k = premierNuage; k < premierNuage + 6; k++) {
    if (alea(k + 9000) < 0.3) continue;
    const nx = k * 260 - decalNuage + alea(k + 9100) * 150 + 100;
    const ny = 30 + alea(k + 9200) * 100;
    ctx.beginPath();
    ctx.ellipse(nx, ny, 50, 16, 0, 0, Math.PI * 2);
    ctx.ellipse(nx - 28, ny + 5, 30, 12, 0, 0, Math.PI * 2);
    ctx.ellipse(nx + 30, ny + 4, 34, 13, 0, 0, Math.PI * 2);
    ctx.ellipse(nx + 4, ny - 10, 26, 14, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // deux rangées de collines : une très loin, une un peu plus près
  const vagues = (couleur, vit, base, amplitude) => {
    const decal = defilement * vit;
    ctx.fillStyle = couleur;
    ctx.beginPath();
    ctx.moveTo(0, SOL);
    for (let x = 0; x <= canvas.width; x += 10) {
      const u = x + decal;
      // trois vagues de tailles différentes : le relief ne se répète pas
      const h = base + amplitude * Math.sin(u / 127) + (amplitude / 2) * Math.sin(u / 53 + 1) + (amplitude / 3) * Math.sin(u / 29 + 2);
      ctx.lineTo(x, SOL - h);
    }
    ctx.lineTo(canvas.width, SOL);
    ctx.closePath();
    ctx.fill();
  };
  vagues(paysage.collines, 0.05, 125, 28);
  vagues(paysage.collines2, 0.1, 80, 20);

  // le milieu du paysage (lent) : ville, mesas, pins ou montagnes
  const decalVille = defilement * 0.2;
  const largeurCase = 90;
  const premiereCase = Math.floor(decalVille / largeurCase) - 1;
  for (let i = premiereCase; i < premiereCase + 12; i++) {
    {
      // chaque case a un bâtiment (ou une roche, un pin, une montagne) de taille inventée
      const b = { w: 40 + alea(i) * 40, h: 60 + alea(i + 1000) * 110 };
      const x = i * largeurCase - decalVille + (largeurCase - b.w) / 2;
      ctx.fillStyle = paysage.immeubles;
      if (paysage.milieu === "ville") {
        ctx.fillRect(x, SOL - b.h, b.w, b.h);
        ctx.fillStyle = "rgba(255, 255, 255, 0.07)";   // reflet sur le côté
        ctx.fillRect(x, SOL - b.h, 5, b.h);
        if (i % 3 === 0) {                                // antenne
          ctx.fillStyle = paysage.immeubles;
          ctx.fillRect(x + b.w / 2 - 1, SOL - b.h - 16, 3, 16);
        }
        for (let fx = 6; fx < b.w - 8; fx += 12) {
          for (let fy = 8; fy < b.h - 10; fy += 16) {
            if (paysage.fenetres && (i * 7 + fx * 3 + fy) % 5 < 2) {
              ctx.fillStyle = paysage.fenetres;
              ctx.fillRect(x + fx, SOL - b.h + fy, 6, 8);
            }
          }
        }
      } else if (paysage.milieu === "mesas") {
        const h = b.h * 0.9;
        ctx.beginPath();
        ctx.moveTo(x - 10, SOL);
        ctx.lineTo(x + 4, SOL - h);
        ctx.lineTo(x + b.w - 4, SOL - h);
        ctx.lineTo(x + b.w + 10, SOL);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = "rgba(255, 200, 120, 0.18)";   // bandes de roche
        ctx.fillRect(x - 2, SOL - h * 0.65, b.w + 4, 6);
        ctx.fillRect(x - 6, SOL - h * 0.3, b.w + 12, 8);
      } else if (paysage.milieu === "pins") {
        ctx.beginPath();
        ctx.moveTo(x - 8, SOL);
        ctx.lineTo(x + b.w / 2, SOL - b.h * 0.9);
        ctx.lineTo(x + b.w + 8, SOL);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = "rgba(255, 255, 255, 0.06)";
        ctx.beginPath();
        ctx.moveTo(x + b.w / 2, SOL - b.h * 0.9);
        ctx.lineTo(x + b.w / 2, SOL);
        ctx.lineTo(x - 8, SOL);
        ctx.closePath();
        ctx.fill();
      } else {
        const sommetY = SOL - b.h * 1.2;
        const gauche = x - 25;
        const droite = x + b.w + 25;
        const milieuX = x + b.w / 2;
        ctx.beginPath();
        ctx.moveTo(gauche, SOL);
        ctx.lineTo(milieuX, sommetY);
        ctx.lineTo(droite, SOL);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = "#f4f9ff";                       // sommet enneigé
        ctx.beginPath();
        ctx.moveTo(milieuX, sommetY);
        ctx.lineTo(milieuX + (droite - milieuX) * 0.3, sommetY + b.h * 1.2 * 0.3);
        ctx.lineTo(milieuX + 4, sommetY + b.h * 1.2 * 0.22);
        ctx.lineTo(milieuX - 6, sommetY + b.h * 1.2 * 0.32);
        ctx.lineTo(milieuX - (milieuX - gauche) * 0.3, sommetY + b.h * 1.2 * 0.3);
        ctx.closePath();
        ctx.fill();
      }
    }
  }

  // brume au pied du paysage
  const brume = ctx.createLinearGradient(0, SOL - 100, 0, SOL);
  brume.addColorStop(0, "rgba(255, 255, 255, 0)");
  brume.addColorStop(1, paysage.brume);
  ctx.fillStyle = brume;
  ctx.fillRect(0, SOL - 100, canvas.width, 100);

  // décor de devant : palmiers, cactus, sapins ou lampadaires (plus rapide)
  const espace = 300;
  const decalPalmier = defilement * 0.5;
  const premierDecor = Math.floor(decalPalmier / espace) - 1;
  for (let k = premierDecor; k < premierDecor + 5; k++) {
    if (alea(k + 5000) < 0.25) continue;  // parfois il n'y a rien
    const x = k * espace - decalPalmier + alea(k + 7000) * 150;
    if (paysage.decor === "palmier") dessinerPalmier(x + 100);
    if (paysage.decor === "cactus") dessinerCactus(x + 100);
    if (paysage.decor === "sapin") dessinerSapin(x + 100, false);
    if (paysage.decor === "sapinNeige") dessinerSapin(x + 100, true);
    if (paysage.decor === "lampadaire") dessinerLampadaire(x + 100);
  }

  // route : bord, sol et lignes qui défilent (les couleurs changent avec le paysage)
  const route = ctx.createLinearGradient(0, SOL, 0, canvas.height);
  route.addColorStop(0, paysage.sol[0]);
  route.addColorStop(1, paysage.sol[1]);
  ctx.fillStyle = route;
  ctx.fillRect(0, SOL, canvas.width, canvas.height - SOL);
  if (paysage.neon) {
    ctx.shadowColor = paysage.bordure;
    ctx.shadowBlur = 14;
  }
  ctx.fillStyle = paysage.bordure;
  ctx.fillRect(0, SOL - 3, canvas.width, 5);
  ctx.shadowBlur = 0;
  ctx.fillStyle = "#000";
  ctx.fillRect(0, SOL + 2, canvas.width, 3);
  ctx.fillStyle = paysage.lignes;
  const decalLigne = defilement % 90;
  for (let x = -decalLigne; x < canvas.width; x += 90) {
    ctx.fillRect(x, 372, 45, 5);
  }

  // particules dans l'air
  if (paysage.particules === "neige") {
    ctx.fillStyle = "#fff";
    for (let i = 0; i < 50; i++) {
      const fx = mod((i * 173) % 800 + Math.sin(t / 600 + i) * 15 - defilement * 0.4, canvas.width);
      const fy = mod((i * 97) % 400 + t * (0.03 + (i % 3) * 0.015), canvas.height);
      ctx.beginPath();
      ctx.arc(fx, fy, 1.5 + (i % 3), 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (paysage.particules === "lucioles") {
    for (let i = 0; i < 18; i++) {
      const fx = mod((i * 211) % 800 - defilement * 0.3, canvas.width);
      const fy = 150 + ((i * 53) % 170) + Math.sin(t / 500 + i) * 12;
      const lumiere = 0.35 + 0.65 * Math.pow(Math.sin(t / 300 + i), 2);
      ctx.fillStyle = "rgba(255, 255, 140, " + lumiere + ")";
      ctx.beginPath();
      ctx.arc(fx, fy, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (paysage.particules === "poussiere") {
    ctx.strokeStyle = "rgba(255, 230, 180, 0.35)";
    ctx.lineWidth = 2;
    for (let i = 0; i < 14; i++) {
      const fx = mod((i * 131) % 800 - defilement * 1.5, canvas.width);
      const fy = 120 + ((i * 41) % 200);
      ctx.beginPath();
      ctx.moveTo(fx, fy);
      ctx.lineTo(fx + 30, fy);
      ctx.stroke();
    }
  }
}

function ecrireTexte(texte, x, y, taille, trait) {
  ctx.font = taille + "px " + POLICE;
  ctx.lineJoin = "round";
  ctx.strokeStyle = "#fff";
  ctx.lineWidth = trait;
  ctx.strokeText(texte, x, y);
  ctx.fillStyle = "#000";
  ctx.fillText(texte, x, y);
}

// Grosse tête de dessin animé dont les mains font « six seven » (une monte, l'autre descend)
function dessinerGrosseTete() {
  const t = Date.now();
  const duree = t - debutPerdu;
  const p = Math.sin(t / 130);  // -1 à 1 : le rythme des mains

  // la tête arrive en rebondissant (de petite à grosse)
  const x = Math.min(1, duree / 350) - 1;
  const rebond = 1 + 2.70158 * x * x * x + 1.70158 * x * x;
  const echelle = (0.2 + 0.8 * rebond) * (1 + 0.03 * Math.abs(p));

  // fond sombre et rayons qui tournent
  ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.translate(400, 215);
  ctx.rotate(t / 3000);
  for (let i = 0; i < 16; i++) {
    ctx.fillStyle = i % 2 ? "rgba(255, 210, 0, 0.22)" : "rgba(255, 70, 70, 0.18)";
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, 700, (i * Math.PI) / 8, ((i + 1) * Math.PI) / 8);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();

  ctx.save();
  // petit tremblement au début
  if (duree < 500) ctx.translate((Math.random() - 0.5) * 8, (Math.random() - 0.5) * 8);
  ctx.translate(400, 215);
  ctx.scale(echelle, echelle);
  ctx.lineJoin = "round";
  ctx.lineCap = "round";

  // bras et mains : l'une monte pendant que l'autre descend, avec un 6 et un 7
  [[-1, p * 45, "6"], [1, -p * 45, "7"]].forEach(([cote, dy, chiffre]) => {
    const hx = cote * 175;
    const hy = 20 + dy;
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 28;
    ctx.beginPath();
    ctx.moveTo(cote * 80, 120);
    ctx.lineTo(hx, hy + 20);
    ctx.stroke();
    ctx.strokeStyle = "#d9a05a";
    ctx.lineWidth = 22;
    ctx.stroke();
    // main : paume, doigts et pouce
    ctx.fillStyle = "#e8b878";
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(hx, hy, 34, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    for (let i = -1.5; i <= 1.5; i++) {
      ctx.beginPath();
      ctx.roundRect(hx + i * 15 - 7, hy - 62, 14, 34, 7);
      ctx.fill();
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.ellipse(hx - cote * 36, hy + 5, 10, 18, cote * 0.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.textAlign = "center";
    ecrireTexte(chiffre, hx, hy + 14, 42, 6);
  });

  // oreilles et tête
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 3;
  ctx.fillStyle = "#e0a15f";
  for (const dx of [-100, 100]) {
    ctx.beginPath();
    ctx.ellipse(dx, 0, 16, 26, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }
  const peau = ctx.createRadialGradient(-30, -50, 10, 0, 0, 110);
  peau.addColorStop(0, "#f8d3a0");
  peau.addColorStop(1, "#d9a05a");
  ctx.fillStyle = peau;
  ctx.beginPath();
  ctx.arc(0, 0, 100, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  // cheveux
  ctx.fillStyle = "#2a1a10";
  ctx.beginPath();
  ctx.moveTo(-98, -25);
  ctx.quadraticCurveTo(-110, -105, -45, -108);
  ctx.quadraticCurveTo(0, -135, 45, -108);
  ctx.quadraticCurveTo(110, -105, 98, -25);
  ctx.quadraticCurveTo(60, -75, 0, -70);
  ctx.quadraticCurveTo(-60, -75, -98, -25);
  ctx.fill();
  ctx.stroke();
  // joues rouges
  ctx.fillStyle = "rgba(255, 90, 90, 0.35)";
  for (const dx of [-62, 62]) {
    ctx.beginPath();
    ctx.ellipse(dx, 25, 20, 12, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  // yeux qui suivent les mains
  for (const dx of [-37, 37]) {
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(dx, -22, 25, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.arc(dx + p * 8, -20, 11, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(dx + p * 8 - 3, -24, 3.5, 0, Math.PI * 2);
    ctx.fill();
  }
  // sourcils levés
  ctx.strokeStyle = "#2a1a10";
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.moveTo(-65, -62);
  ctx.quadraticCurveTo(-40, -78, -15, -60);
  ctx.moveTo(65, -62);
  ctx.quadraticCurveTo(40, -78, 15, -60);
  ctx.stroke();
  // bouche qui crie, avec dents et langue
  const ouverture = 24 + Math.abs(p) * 16;
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 3;
  ctx.fillStyle = "#5a0d0d";
  ctx.beginPath();
  ctx.ellipse(0, 48, 42, ouverture, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(0, 48, 42, ouverture, 0, 0, Math.PI * 2);
  ctx.clip();
  ctx.fillStyle = "#fff";
  ctx.fillRect(-30, 48 - ouverture, 60, 12);
  ctx.fillStyle = "#e0566b";
  ctx.beginPath();
  ctx.ellipse(0, 48 + ouverture * 0.7, 26, ouverture * 0.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  // goutte de sueur
  ctx.fillStyle = "#7fd0ff";
  const goutte = (t / 12) % 50;
  ctx.beginPath();
  ctx.ellipse(80, -60 + goutte, 6, 9, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // textes qui pulsent
  ctx.textAlign = "center";
  ecrireTexte("Attrapé !", 400, 55, 40, 6);
  ecrireTexte("SIX SEVEN !", 400, 358, 42 + Math.abs(p) * 8, 7);
  ecrireTexte("Appuie sur Espace pour rejouer", 400, 392, 20, 4);
}

function dessiner() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  dessinerFond();
  dessinerOiseaux();

  dessinerPolice();
  for (const obj of objets) dessinerObjet(obj);
  for (const o of obstacles) dessinerObstacle(o);
  dessinerVoitureFuite();
  dessinerPersonnage();

  if (etat === "gagne") dessinerVictoire();

  if (annonce > 0) {
    annonce--;
    ctx.textAlign = "center";
    ecrireTexte(paysages[paysageAffiche].nom, canvas.width / 2, 70, 38, 6);
  }

  ctx.textAlign = "left";
  let ligne = 35;
  const bonus = [["Jetpack", vol], ["Bottes", bottes], ["Bouclier", bouclier]];
  for (const [nom, reste] of bonus) {
    if (reste > 0) {
      ecrireTexte(nom + " : " + Math.ceil(reste / 60) + " s", 15, ligne, 26, 4);
      ligne += 32;
    }
  }

  if (etat === "perdu") dessinerGrosseTete();

  if (etat === "attente") {
    ctx.fillStyle = "rgba(255, 255, 255, 0.55)";
    ctx.beginPath();
    ctx.roundRect(190, 85, 420, 140, 18);
    ctx.fill();
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.textAlign = "center";
    ecrireTexte("Cours et Esquive", canvas.width / 2, 150, 50, 6);
    ecrireTexte("Appuie sur Espace pour jouer", canvas.width / 2, 200, 26, 5);
  }
}

function dessinerVoitureFuite() {
  if (!voiture) return;
  ctx.save();
  if (voiture.vers < 0) {
    ctx.translate(voiture.x + 120, 0);  // elle roule vers la gauche : on la retourne
    ctx.scale(-1, 1);
  } else {
    ctx.translate(voiture.x, 0);
  }
  // ombre
  ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
  ctx.beginPath();
  ctx.ellipse(60, SOL + 4, 58, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  // carrosserie rouge
  const corps = ctx.createLinearGradient(0, SOL - 40, 0, SOL - 10);
  corps.addColorStop(0, "#ff4a4a");
  corps.addColorStop(1, "#a50f0f");
  ctx.fillStyle = corps;
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(0, SOL - 38, 120, 28, 9);
  ctx.fill();
  ctx.stroke();
  // cabine et vitres
  ctx.beginPath();
  ctx.moveTo(30, SOL - 38);
  ctx.lineTo(44, SOL - 64);
  ctx.lineTo(86, SOL - 64);
  ctx.lineTo(104, SOL - 38);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#9fd8f5";
  ctx.beginPath();
  ctx.moveTo(38, SOL - 40);
  ctx.lineTo(49, SOL - 59);
  ctx.lineTo(84, SOL - 59);
  ctx.lineTo(97, SOL - 40);
  ctx.closePath();
  ctx.fill();
  // le garçon assis dans la voiture
  if (joueurCache) {
    ctx.fillStyle = "#e0ac69";
    ctx.beginPath();
    ctx.arc(70, SOL - 50, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#111";
    ctx.beginPath();
    ctx.arc(70, SOL - 52, 9.5, Math.PI, 0);
    ctx.fill();
    ctx.fillRect(72, SOL - 53, 11, 3);
  }
  // bande blanche, phare et feu arrière
  ctx.fillStyle = "#fff";
  ctx.fillRect(8, SOL - 24, 104, 3);
  ctx.fillStyle = "#ffe98a";
  ctx.fillRect(114, SOL - 32, 6, 7);
  ctx.fillStyle = "#ff2a2a";
  ctx.fillRect(0, SOL - 32, 5, 7);
  // roues qui tournent
  for (const wx of [28, 92]) {
    ctx.fillStyle = "#111";
    ctx.beginPath();
    ctx.arc(wx, SOL - 8, 11, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#bbb";
    ctx.lineWidth = 2;
    for (let i = 0; i < 3; i++) {
      const a = voiture.roue + (i * Math.PI) / 3;
      ctx.beginPath();
      ctx.moveTo(wx - Math.cos(a) * 7, SOL - 8 - Math.sin(a) * 7);
      ctx.lineTo(wx + Math.cos(a) * 7, SOL - 8 + Math.sin(a) * 7);
      ctx.stroke();
    }
  }
  ctx.restore();
}

// Écran de victoire avec des confettis
function dessinerVictoire() {
  const t = Date.now();
  const couleurs = ["#ff4a4a", "#ffd23f", "#3fd0ff", "#7dff6b", "#ff7ad9"];
  ctx.fillStyle = "rgba(255, 255, 255, 0.55)";
  ctx.beginPath();
  ctx.roundRect(150, 60, 500, 270, 18);
  ctx.fill();
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 3;
  ctx.stroke();
  for (let i = 0; i < 70; i++) {
    const cx = (i * 113 + Math.sin(t / 400 + i) * 30) % canvas.width;
    const cy = ((i * 57) % canvas.height + (t - debutGagne) * (0.08 + (i % 4) * 0.04)) % canvas.height;
    ctx.fillStyle = couleurs[i % couleurs.length];
    ctx.fillRect(cx, cy, 8, 5);
  }
  ctx.textAlign = "center";
  ecrireTexte("Bravo !", 400, 140, 64, 8);
  ecrireTexte("Tu as échappé à la police !", 400, 195, 30, 5);
  ecrireTexte("Distance : " + DISTANCE_FIN + " m", 400, 240, 26, 5);
  ecrireTexte("Appuie sur Espace pour rejouer", 400, 300, 24, 5);
}

// Oiseaux gentils : ils volent dans le ciel et ne font aucun mal
let oiseaux = [];

function mettreAJourOiseaux() {
  if (oiseaux.length < 4 && Math.random() < 0.01) {
    oiseaux.push({
      x: canvas.width + 30,
      y: 40 + Math.random() * 160,
      v: 2 + Math.random() * 2,
      taille: 8 + Math.random() * 6,
      decalage: Math.random() * 10,
    });
  }
  for (const o of oiseaux) o.x -= o.v;
  oiseaux = oiseaux.filter((o) => o.x > -40);
}

function dessinerOiseaux() {
  ctx.strokeStyle = "#111";
  ctx.lineWidth = 3;
  ctx.lineCap = "round";
  for (const o of oiseaux) {
    const aile = Math.sin(Date.now() / 120 + o.decalage) * o.taille * 0.8;
    ctx.beginPath();
    ctx.moveTo(o.x - o.taille * 1.5, o.y - aile);
    ctx.quadraticCurveTo(o.x - o.taille * 0.6, o.y - aile * 0.2, o.x, o.y);
    ctx.quadraticCurveTo(o.x + o.taille * 0.6, o.y - aile * 0.2, o.x + o.taille * 1.5, o.y - aile);
    ctx.stroke();
  }
}

function boucle() {
  mettreAJourOiseaux();
  mettreAJour();
  dessiner();
  requestAnimationFrame(boucle);
}

joueur = { x: 200, y: SOL, vy: 0, glisse: false, tempsGlisse: 0 };
obstacles = [];
boucle();
