let canvas = document.getElementById("jeu");   // change en mode 2 joueurs (une toile par joueur)
let ctx = canvas.getContext("2d");
const scoreEl = document.getElementById("score");
const recordEl = document.getElementById("record");

const SOL = 330;
const POLICE = "'Permanent Marker', 'Ink Free', 'Segoe Print', 'Marker Felt', 'Comic Sans MS', cursive";

// ---------- Pièces, boutiques et skins ----------
const PRIX_SKIN = 50;
const accueilEl = document.getElementById("accueil");
const messageEl = document.getElementById("messageBoutique");

const SKINS_PERSO = [
  { id: "normal", nom: "Normal" },
  { id: "spiderman", nom: "Spider-Man" },
  { id: "ronaldo", nom: "Ronaldo" },
  { id: "zorok", nom: "Zorok" },
];
const SKINS_VOITURE = [
  { id: "normale", nom: "Police" },
  { id: "taxi", nom: "Taxi" },
  { id: "tank", nom: "Tank" },
  { id: "volante", nom: "Voiture volante" },
];

// couleurs du personnage pour chaque skin
const COULEURS_PERSO = {
  normal:    { jambes: "#2b4c9b", haut: "#ff7a1a", bras: "#c9570a", poche: "#e5640a", peau: "#e0ac69", mains: "#e0ac69", cheveux: "#111", chaussures: "#fff", visiere: true },
  spiderman: { jambes: "#1b3fa0", haut: "#d81e2c", bras: "#a01420", poche: "#1b3fa0", peau: "#d81e2c", mains: "#d81e2c", cheveux: "#d81e2c", chaussures: "#d81e2c", visiere: false },
  ronaldo:   { jambes: "#e0ac69", haut: "#c8102e", bras: "#9d0c24", poche: "#0a7a2f", peau: "#e0ac69", mains: "#e0ac69", cheveux: "#2a1a10", chaussures: "#111", chaussettes: "#c8102e", short: "#0a7a2f", visiere: false },
  zorok:     { jambes: "#5b2a86", haut: "#7a3cb8", bras: "#5b2a86", poche: "#3fd04a", peau: "#4fd45a", mains: "#4fd45a", cheveux: "#2a7a30", chaussures: "#2a1a40", visiere: false },
};
// couleurs de la voiture de fuite pour chaque skin
const COULEURS_VOITURE = {
  normale: ["#ff4a4a", "#a50f0f"],
  taxi:    ["#ffe14d", "#d9a400"],
  tank:    ["#6b7a3a", "#3a4420"],
  volante: ["#6fc3ff", "#1b5fd1"],
};

// Petits sons d'effets (pièce, saut, bonus, achat...). Ils ont leur propre contexte audio,
// pour ne pas être coupés quand la musique s'arrête.
let audioEffets = null;

function noteEffet(freq, retard, duree, forme, force) {
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return;
  if (!audioEffets) audioEffets = new AudioCtx();
  audioEffets.resume();
  const debut = audioEffets.currentTime + retard;
  const osc = audioEffets.createOscillator();
  const volume = audioEffets.createGain();
  osc.type = forme;
  osc.frequency.value = freq;
  volume.gain.setValueAtTime(force, debut);
  volume.gain.exponentialRampToValueAtTime(0.001, debut + duree);
  osc.connect(volume);
  volume.connect(audioEffets.destination);
  osc.start(debut);
  osc.stop(debut + duree);
}

function sonEffet(nom) {
  if (nom === "piece") {
    noteEffet(988, 0, 0.08, "square", 0.07);
    noteEffet(1319, 0.08, 0.16, "square", 0.07);
  } else if (nom === "saut") {
    noteEffet(330, 0, 0.08, "triangle", 0.15);
    noteEffet(440, 0.06, 0.1, "triangle", 0.15);
  } else if (nom === "roulade") {
    [300, 450, 650, 900].forEach((f, i) => noteEffet(f, i * 0.04, 0.08, "sawtooth", 0.06));
  } else if (nom === "bonus") {
    [523, 659, 784, 1047].forEach((f, i) => noteEffet(f, i * 0.07, 0.12, "square", 0.06));
  } else if (nom === "achat") {
    [784, 988, 1175, 1568].forEach((f, i) => noteEffet(f, i * 0.09, 0.18, "triangle", 0.15));
  } else if (nom === "equiper") {
    noteEffet(659, 0, 0.08, "triangle", 0.15);
    noteEffet(880, 0.08, 0.14, "triangle", 0.15);
  } else if (nom === "refus") {
    noteEffet(196, 0, 0.2, "sawtooth", 0.1);
    noteEffet(147, 0.12, 0.25, "sawtooth", 0.1);
  } else if (nom === "perdu") {
    [392, 330, 262, 196].forEach((f, i) => noteEffet(f, i * 0.12, 0.2, "triangle", 0.15));
  }
}

let nbPieces = 0;
let skinsAchetes = ["normal", "normale"];
let skinPerso = "normal";
let skinVoiture = "normale";

let meilleursScores = [];  // les 5 meilleures distances, de la plus grande à la plus petite

function ajouterScore(distance) {
  if (distance <= 0) return;
  meilleursScores.push(distance);
  meilleursScores.sort((a, b) => b - a);
  meilleursScores = meilleursScores.slice(0, 5);
  sauvegarder();
}

function afficherScores() {
  const liste = document.getElementById("listeScores");
  liste.innerHTML = "";
  if (meilleursScores.length === 0) {
    liste.textContent = "Pas encore de score. À toi de jouer !";
    return;
  }
  const medailles = ["🥇", "🥈", "🥉", "4.", "5."];
  meilleursScores.forEach((distance, i) => {
    const ligne = document.createElement("div");
    ligne.textContent = medailles[i] + " " + distance + " m";
    liste.appendChild(ligne);
  });
}

function sauvegarder() {
  try {
    localStorage.setItem("coursEsquive", JSON.stringify({ nbPieces, skinsAchetes, skinPerso, skinVoiture, meilleursScores }));
  } catch (e) { /* pas grave : on ne sauvegarde pas */ }
}

function charger() {
  try {
    const d = JSON.parse(localStorage.getItem("coursEsquive"));
    if (!d) return;
    nbPieces = Number(d.nbPieces) || 0;
    if (Array.isArray(d.skinsAchetes)) skinsAchetes = d.skinsAchetes;
    if (COULEURS_PERSO[d.skinPerso]) skinPerso = d.skinPerso;
    if (COULEURS_VOITURE[d.skinVoiture]) skinVoiture = d.skinVoiture;
    if (Array.isArray(d.meilleursScores)) {
      meilleursScores = d.meilleursScores.map(Number).filter((n) => n > 0).slice(0, 5);
      record = meilleursScores[0] || 0;
      recordEl.textContent = record;
    }
  } catch (e) { /* on garde les valeurs de départ */ }
}

function afficherPieces() {
  document.getElementById("pieces").textContent = nbPieces;
  document.getElementById("piecesAccueil").textContent = nbPieces;
}

// Petit dessin d'un skin pour la boutique (on réutilise les fonctions de dessin du jeu)
function dessinerApercu(type, id, toile) {
  const sauve = { ctx, skinPerso, skinVoiture, voiture, joueurCache };
  ctx = toile.getContext("2d");
  ctx.clearRect(0, 0, toile.width, toile.height);
  ctx.save();
  if (type === "perso") {
    skinPerso = id;
    ctx.translate(toile.width / 2, toile.height - 8);
    dessinerCorps(0, false);
  } else {
    skinVoiture = id;
    voiture = { x: 0, vers: 1, roue: 0, vitesse: 0 };
    joueurCache = false;
    ctx.translate(5, toile.height - 10);
    ctx.scale(0.85, 0.85);
    ctx.translate(0, -SOL);
    dessinerVoitureFuite();
  }
  ctx.restore();
  ({ ctx, skinPerso, skinVoiture, voiture, joueurCache } = sauve);
}

function remplirBoutique(conteneurId, type, skins, choisi, choisir) {
  const conteneur = document.getElementById(conteneurId);
  conteneur.innerHTML = "";
  for (const skin of skins) {
    const bouton = document.createElement("button");
    const possede = skinsAchetes.includes(skin.id);
    const texte = document.createElement("span");
    if (skin.id === choisi) {
      texte.textContent = skin.nom + " ✔ Équipé";
      bouton.className = "choisi";
    } else if (possede) {
      texte.textContent = skin.nom + " — Équiper";
      bouton.className = "possede";
    } else {
      texte.textContent = skin.nom + " — " + PRIX_SKIN + " pièces";
    }
    const apercu = document.createElement("canvas");
    apercu.width = type === "perso" ? 70 : 130;
    apercu.height = 100;
    dessinerApercu(type, skin.id, apercu);
    bouton.appendChild(apercu);
    bouton.appendChild(texte);
    bouton.addEventListener("click", () => {
      if (!possede) {
        if (nbPieces < PRIX_SKIN) {
          messageEl.textContent = "Pas assez de pièces ! Il en faut " + PRIX_SKIN + ".";
          sonEffet("refus");
          return;
        }
        nbPieces -= PRIX_SKIN;
        skinsAchetes.push(skin.id);
        sonEffet("achat");
        messageEl.textContent = skin.nom + " est à toi ! Clique sur « Équiper » pour le mettre.";
      } else {
        choisir(skin.id);   // le skin est équipé tout de suite
        sonEffet("equiper");
        messageEl.textContent = skin.nom + " est équipé !";
      }
      sauvegarder();
      afficherBoutiques();
    });
    conteneur.appendChild(bouton);
  }
}

function afficherBoutiques() {
  remplirBoutique("listePersos", "perso", SKINS_PERSO, skinPerso, (id) => { skinPerso = id; });
  remplirBoutique("listeVoitures", "voiture", SKINS_VOITURE, skinVoiture, (id) => { skinVoiture = id; });
  afficherPieces();
  afficherScores();
}

function ouvrirAccueil() {
  sauvegarder();
  arreterMusique();
  if (window.speechSynthesis) speechSynthesis.cancel();
  etat = "attente";
  choisirMode(false);
  messageEl.textContent = "";
  afficherBoutiques();
  accueilEl.classList.remove("cache");
}

// Met la page en plein écran (Échap pour sortir). Si le navigateur refuse, le jeu continue normalement.
function pleinEcran() {
  if (document.fullscreenElement || !document.documentElement.requestFullscreen) return;
  document.documentElement.requestFullscreen().catch(() => {});
}

function lancerPartie() {
  pleinEcran();
  accueilEl.classList.add("cache");
  choisirMode(false);
  recommencer();
}

// ---------- Mode 2 joueurs : l'écran est partagé en deux ----------
// Chaque joueur a sa propre toile et sa propre course. Le code du jeu utilise des variables
// communes : avant de faire jouer un joueur, on charge son état, puis on le range.
const toiles = [document.getElementById("jeu"), document.getElementById("jeu2")];
const dessins = toiles.map((t) => t.getContext("2d"));
let deuxJoueurs = false;
let etatsJoueurs = [];
let finDeuxJoueurs = false;
let gagnantDeuxJoueurs = -1;   // 0 = joueur 1, 1 = joueur 2, -1 = égalité

function prendreEtat() {
  return {
    joueur, obstacles, vitesse, score, compteur, etat, objets, pieces, etincelles, vol, protection, bottes, bouclier,
    voiture, typeFinale, trajetFait, phaseFinale, minuteurFinale, joueurCache, debutGagne, defilement,
    paysageAffiche, paysagePrecedent, fondu, annonce,
  };
}

function poserEtat(e) {
  ({
    joueur, obstacles, vitesse, score, compteur, etat, objets, pieces, etincelles, vol, protection, bottes, bouclier,
    voiture, typeFinale, trajetFait, phaseFinale, minuteurFinale, joueurCache, debutGagne, defilement,
    paysageAffiche, paysagePrecedent, fondu, annonce,
  } = e);
}

// En 2 joueurs, chaque toile prend toute la largeur de la fenêtre : on l'élargit
// (sans l'étirer) pour que le décor remplisse la moitié d'écran.
function ajusterToiles() {
  const hauteurAffichee = Math.max(150, (window.innerHeight - 80) / 2);
  const largeur = deuxJoueurs
    ? Math.min(2400, Math.max(800, Math.round((400 * window.innerWidth) / hauteurAffichee)))
    : 800;
  for (const t of toiles) if (t.width !== largeur) t.width = largeur;
}
window.addEventListener("resize", ajusterToiles);

function choisirMode(deux) {
  deuxJoueurs = deux;
  document.body.classList.toggle("deux", deux);
  toiles[1].hidden = !deux;
  ajusterToiles();
  if (!deux) {
    canvas = toiles[0];
    ctx = dessins[0];
  }
  document.getElementById("aide").innerHTML = deux
    ? "Joueur 1 (haut) : W = sauter, S = roulade &nbsp;&nbsp; Joueur 2 (bas) : ↑ = sauter, ↓ = roulade"
    : "Espace = sauter &nbsp;&nbsp; Flèche du bas = roulade";
}

function lancerPartie2() {
  pleinEcran();
  accueilEl.classList.add("cache");
  choisirMode(true);
  etatsJoueurs = [];
  finDeuxJoueurs = false;
  for (let i = 0; i < 2; i++) {
    recommencer();
    etatsJoueurs.push(prendreEtat());
  }
}

function actionJoueur(i, action) {
  poserEtat(etatsJoueurs[i]);
  if (etat === "jeu") action();
  etatsJoueurs[i] = prendreEtat();
}

function touchesDeuxJoueurs(e) {
  const actions = { KeyW: [0, sauter], KeyS: [0, glisser], ArrowUp: [1, sauter], ArrowDown: [1, glisser] };
  if (actions[e.code]) {
    e.preventDefault();
    actionJoueur(actions[e.code][0], actions[e.code][1]);
  } else if ((e.code === "Space" || e.code === "Enter") && finDeuxJoueurs) {
    e.preventDefault();
    lancerPartie2();
  }
}

function distanceDe(e) {
  return e.etat === "gagne" ? DISTANCE_FIN : Math.floor(e.score / 6);
}

function boucleDeuxJoueurs() {
  // 1) on fait avancer chaque course
  for (let i = 0; i < 2; i++) {
    canvas = toiles[i];
    ctx = dessins[i];
    poserEtat(etatsJoueurs[i]);
    mettreAJour();
    etatsJoueurs[i] = prendreEtat();
  }
  // 2) quand les deux ont fini, la plus grande distance gagne
  const fini = etatsJoueurs.every((e) => e.etat === "perdu" || e.etat === "gagne");
  if (fini && !finDeuxJoueurs) {
    finDeuxJoueurs = true;
    arreterMusique();
    const [a, b] = etatsJoueurs.map(distanceDe);
    gagnantDeuxJoueurs = a > b ? 0 : b > a ? 1 : -1;
  }
  // 3) on dessine chaque moitié de l'écran
  for (let i = 0; i < 2; i++) {
    canvas = toiles[i];
    ctx = dessins[i];
    poserEtat(etatsJoueurs[i]);
    dessiner();
    ctx.textAlign = "right";
    ecrireTexte("Joueur " + (i + 1) + " : " + distanceDe(etatsJoueurs[i]) + " m", canvas.width - 15, 35, 26, 4);
    if (finDeuxJoueurs) {
      ctx.textAlign = "center";
      ecrireTexte(gagnantDeuxJoueurs === -1 ? "Égalité !" : "Joueur " + (gagnantDeuxJoueurs + 1) + " gagne !", canvas.width / 2, 210, 46, 7);
      ecrireTexte("Espace = rejouer", canvas.width / 2, 250, 24, 5);
    }
    etatsJoueurs[i] = prendreEtat();
  }
}

let joueur, obstacles, vitesse, score, record = 0, etat = "attente", compteur;
let pieces = [];     // pièces à ramasser dans la course
let etincelles = []; // petites étincelles quand on ramasse une pièce
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

// moment où la partie est perdue
let debutPerdu = 0;

function recommencer() {
  if (window.speechSynthesis) speechSynthesis.cancel();
  objets = [];
  pieces = [];
  etincelles = [];
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
  if (!accueilEl.classList.contains("cache")) return;  // sur la page d'accueil, on utilise START
  if (etat === "finale") return;  // pendant la fin, les touches ne font rien
  if (etat !== "jeu") { recommencer(); return; }
  if (vol > 0) return;
  if (joueur.y >= SOL && !joueur.glisse) {
    joueur.vy = bottes > 0 ? -17 : -13;
    sonEffet("saut");
  }
}

function glisser() {
  if (etat !== "jeu" || vol > 0) return;
  if (joueur.y >= SOL && !joueur.glisse) {
    joueur.glisse = true;   // « glisse » veut dire ici : en roulade
    joueur.tempsGlisse = 40;
    sonEffet("roulade");
  }
}

document.addEventListener("keydown", (e) => {
  if (deuxJoueurs) { touchesDeuxJoueurs(e); return; }
  if (e.code === "Space") { e.preventDefault(); sauter(); }
  if (e.code === "ArrowDown") { e.preventDefault(); glisser(); }
});
document.getElementById("btnSaut").addEventListener("click", sauter);
document.getElementById("btnGlisse").addEventListener("click", glisser);
document.getElementById("btnStart").addEventListener("click", lancerPartie);
document.getElementById("btn2Joueurs").addEventListener("click", lancerPartie2);
document.getElementById("btnAccueil").addEventListener("click", (e) => {
  e.currentTarget.blur();  // pour que la barre Espace ne le déclenche pas
  ouvrirAccueil();
});

charger();
afficherBoutiques();

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
      sonEffet("bonus");
      objets = [];
      break;
    }
  }

  // des pièces apparaissent de temps en temps, au hasard, à trois hauteurs différentes
  if (vol === 0 && Math.random() < 0.006) {
    const hauteurs = [SOL - 30, SOL - 80, SOL - 130];
    pieces.push({ x: canvas.width + 20, y: hauteurs[Math.floor(Math.random() * hauteurs.length)], r: 12 });
  }
  for (const p of pieces) p.x -= vitesse;
  pieces = pieces.filter((p) => p.x > -30);
  const corps = boiteJoueur();
  pieces = pieces.filter((p) => {
    const prise = touche(corps, { x: p.x - p.r, y: p.y - p.r, w: p.r * 2, h: p.r * 2 });
    if (prise) {
      nbPieces++;
      sonEffet("piece");
      for (let i = 0; i < 8; i++) {   // petites étincelles dorées
        const angle = (i * Math.PI) / 4;
        etincelles.push({ x: p.x, y: p.y, vx: Math.cos(angle) * 3, vy: Math.sin(angle) * 3, vie: 20 });
      }
    }
    return !prise;
  });
  for (const e of etincelles) {
    e.x += e.vx - vitesse * 0.5;
    e.y += e.vy;
    e.vie--;
  }
  etincelles = etincelles.filter((e) => e.vie > 0);
  if (nbPieces !== Number(document.getElementById("pieces").textContent)) afficherPieces();

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
      sauvegarder();
      debutPerdu = Date.now();
      sonEffet("perdu");
      if (!deuxJoueurs) arreterMusique();   // en 2 joueurs, la musique continue pour l'autre joueur
      record = Math.max(record, metres());
      recordEl.textContent = record;
      ajouterScore(metres());
    }
  }

  // il n'y a pas de fin : on court tant qu'on ne se cogne pas
  if (etat === "jeu" && !trajetFait && metres() >= DEBUT_TRAJET) demarrerFinale("trajet");
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
  pieces = [];
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
  sauvegarder();
  debutGagne = Date.now();
  if (!deuxJoueurs) {
    arreterMusique();
    sonVictoire();
  }
  record = Math.max(record, metres());
  recordEl.textContent = record;
  ajouterScore(metres());
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
// Chaque skin a ses propres détails : tenue, mains, tête.
function dessinerCorps(pas, enLair) {
  const c = COULEURS_PERSO[skinPerso];
  const forme = () => {
    ctx.beginPath();
    ctx.roundRect(-12, -50, 24, 34, 7);
  };
  ctx.lineCap = "round";
  // jambes, chaussettes et chaussures
  const pieds = enLair
    ? [[10, -6], [-8, -10]]
    : [[pas * 13, -3 - Math.max(0, -pas) * 8], [-pas * 13, -3 - Math.max(0, pas) * 8]];
  for (const [fx, fy] of pieds) {
    ctx.strokeStyle = c.jambes;
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(0, -20);
    ctx.lineTo(fx, fy);
    ctx.stroke();
    if (c.chaussettes) {
      ctx.strokeStyle = c.chaussettes;
      ctx.beginPath();
      ctx.moveTo(fx * 0.5, -20 + (fy + 20) * 0.5);
      ctx.lineTo(fx, fy);
      ctx.stroke();
    }
    ctx.fillStyle = c.chaussures;
    ctx.beginPath();
    ctx.ellipse(fx + 3, fy + 1, 7, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = skinPerso === "zorok" ? "#5dff6e" : "#000";   // semelles lumineuses pour Zorok
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }
  if (skinPerso === "ronaldo") {
    // short vert
    ctx.fillStyle = c.short;
    ctx.beginPath();
    ctx.roundRect(-12, -28, 24, 13, 4);
    ctx.fill();
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  // bras de derrière et sa main
  ctx.strokeStyle = c.bras;
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.moveTo(0, -42);
  ctx.lineTo(-pas * 14, -28);
  ctx.stroke();
  ctx.fillStyle = c.mains;
  ctx.beginPath();
  ctx.arc(-pas * 14, -28, 4.5, 0, Math.PI * 2);
  ctx.fill();

  // torse
  forme();
  ctx.fillStyle = c.haut;
  ctx.fill();
  ctx.save();
  forme();
  ctx.clip();
  if (skinPerso === "normal") {
    ctx.fillStyle = c.poche;
    ctx.fillRect(-7, -30, 14, 7);                       // poche
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-3, -50);
    ctx.lineTo(-3, -42);
    ctx.moveTo(3, -50);
    ctx.lineTo(3, -42);                                 // cordons du capuchon
    ctx.stroke();
  } else if (skinPerso === "spiderman") {
    ctx.fillStyle = c.poche;                            // côtés et ceinture bleus
    ctx.fillRect(-12, -50, 5, 34);
    ctx.fillRect(7, -50, 5, 34);
    ctx.fillRect(-12, -22, 24, 6);
    ctx.strokeStyle = "#000";                           // toile d'araignée
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const a = -Math.PI / 2 + (i * Math.PI) / 5 - Math.PI / 10;
      ctx.moveTo(0, -46);
      ctx.lineTo(Math.cos(a) * 20, -46 + Math.sin(a) * 20 + 14);
    }
    ctx.stroke();
    for (const r of [5, 9, 13]) {
      ctx.beginPath();
      ctx.arc(0, -46, r, 0.2, Math.PI - 0.2);
      ctx.stroke();
    }
    ctx.fillStyle = "#000";                             // petite araignée sur la poitrine
    ctx.beginPath();
    ctx.ellipse(0, -36, 2.5, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    for (const dy of [-39, -36, -33]) {
      ctx.moveTo(-6, dy + 2);
      ctx.lineTo(0, dy);
      ctx.lineTo(6, dy + 2);
    }
    ctx.stroke();
  } else if (skinPerso === "ronaldo") {
    ctx.fillStyle = c.poche;                            // col vert et bas du maillot
    ctx.beginPath();
    ctx.moveTo(-7, -50);
    ctx.lineTo(7, -50);
    ctx.lineTo(0, -41);
    ctx.closePath();
    ctx.fill();
    ctx.fillRect(-12, -30, 24, 3);
    ctx.fillStyle = "#fff";                             // numéro 7
    ctx.font = "bold 15px Impact, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("7", 0, -32);
  } else if (skinPerso === "zorok") {
    ctx.strokeStyle = "#3a1a5e";                        // plaques de l'armure
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-12, -44);
    ctx.lineTo(12, -36);
    ctx.moveTo(-12, -30);
    ctx.lineTo(12, -22);
    ctx.stroke();
    ctx.fillStyle = "#ffe14d";                          // ceinture
    ctx.fillRect(-12, -23, 24, 4);
    const lueur = ctx.createRadialGradient(0, -38, 1, 0, -38, 9);   // cœur d'énergie
    lueur.addColorStop(0, "#eaffea");
    lueur.addColorStop(0.5, "#3fff5a");
    lueur.addColorStop(1, "rgba(63, 255, 90, 0)");
    ctx.fillStyle = lueur;
    ctx.beginPath();
    ctx.arc(0, -38, 9, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
  forme();
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 2;
  ctx.stroke();

  // épaulière pointue de Zorok
  if (skinPerso === "zorok") {
    ctx.fillStyle = "#3a1a5e";
    ctx.beginPath();
    ctx.moveTo(-4, -50);
    ctx.lineTo(4, -58);
    ctx.lineTo(10, -48);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  // bras de devant et sa main
  ctx.strokeStyle = c.haut;
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.moveTo(0, -42);
  ctx.lineTo(pas * 14, -28);
  ctx.stroke();
  if (skinPerso === "ronaldo") {
    ctx.strokeStyle = "#ffd23f";                        // brassard de capitaine
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.moveTo(pas * 3, -40);
    ctx.lineTo(pas * 5, -37);
    ctx.stroke();
  }
  ctx.fillStyle = c.mains;
  ctx.beginPath();
  ctx.arc(pas * 14, -28, 4.5, 0, Math.PI * 2);
  ctx.fill();

  // tête
  if (skinPerso === "zorok") {
    // antennes avec des boules lumineuses
    ctx.strokeStyle = c.peau;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(-2, -69);
    ctx.quadraticCurveTo(-8, -76, -7, -84);
    ctx.moveTo(6, -70);
    ctx.quadraticCurveTo(12, -77, 12, -85);
    ctx.stroke();
    ctx.fillStyle = Math.floor(Date.now() / 300) % 2 ? "#ffe14d" : "#fff7a8";
    ctx.beginPath();
    ctx.arc(-7, -85, 3.5, 0, Math.PI * 2);
    ctx.arc(12, -86, 3.5, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = c.peau;
  ctx.beginPath();
  ctx.arc(2, -60, 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 2;
  ctx.stroke();

  if (skinPerso === "spiderman") {
    // fils de la toile sur la cagoule
    ctx.save();
    ctx.beginPath();
    ctx.arc(2, -60, 10, 0, Math.PI * 2);
    ctx.clip();
    ctx.strokeStyle = "rgba(0, 0, 0, 0.55)";
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4;
      ctx.moveTo(2, -60);
      ctx.lineTo(2 + Math.cos(a) * 12, -60 + Math.sin(a) * 12);
    }
    ctx.stroke();
    for (const r of [4, 7]) {
      ctx.beginPath();
      ctx.arc(2, -60, r, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
    // grands yeux blancs
    ctx.fillStyle = "#fff";
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(3, -61);
    ctx.lineTo(13, -65);
    ctx.lineTo(13, -58);
    ctx.lineTo(6, -55.5);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  } else if (skinPerso === "zorok") {
    // grand œil noir qui brille et petite bouche
    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.ellipse(7, -60, 5.5, 3.6, -0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ffe14d";
    ctx.beginPath();
    ctx.arc(8.5, -61, 1.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#1c5a22";
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.moveTo(5, -54);
    ctx.quadraticCurveTo(8, -52, 11, -54);
    ctx.stroke();
  } else if (skinPerso === "ronaldo") {
    // cheveux noirs avec une mèche relevée
    ctx.fillStyle = c.cheveux;
    ctx.beginPath();
    ctx.arc(2, -62, 10.5, Math.PI, 0);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(8, -71, 7, 3.5, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#000";                             // œil, sourcil et sourire
    ctx.beginPath();
    ctx.arc(7, -59, 1.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#2a1a10";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(4, -63);
    ctx.lineTo(10, -63.5);
    ctx.stroke();
    ctx.strokeStyle = "#7a3a20";
    ctx.beginPath();
    ctx.arc(7, -55, 3, 0.2, Math.PI - 0.6);
    ctx.stroke();
  } else {
    // casquette
    ctx.fillStyle = c.cheveux;
    ctx.beginPath();
    ctx.arc(2, -62, 10.5, Math.PI, 0);
    ctx.fill();
    ctx.fillRect(6, -63, 13, 4);
    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.arc(7, -58, 1.8, 0, Math.PI * 2);
    ctx.fill();
  }
}

// Une pièce dorée qui tourne
function dessinerPiece(p) {
  const tour = Math.abs(Math.cos(Date.now() / 200 + p.x / 40));
  ctx.fillStyle = "#ffd23f";
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(p.x, p.y, Math.max(3, p.r * tour), p.r, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
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

  if (skinPerso === "zorok") {
    // aura verte qui pulse autour de Zorok
    const centreAura = joueur.glisse ? y - 14 : y - 40;
    const rayon = 50 + Math.sin(Date.now() / 150) * 5;
    const aura = ctx.createRadialGradient(x, centreAura, 8, x, centreAura, rayon);
    aura.addColorStop(0, "rgba(80, 255, 110, 0.35)");
    aura.addColorStop(1, "rgba(80, 255, 110, 0)");
    ctx.fillStyle = aura;
    ctx.beginPath();
    ctx.arc(x, centreAura, rayon, 0, Math.PI * 2);
    ctx.fill();
  } else if (skinPerso === "ronaldo" && !enLair && !joueur.glisse) {
    // un ballon de foot roule devant Ronaldo
    const bx = x + 36;
    const tour = Date.now() / 90;
    ctx.fillStyle = "#fff";
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(bx, SOL - 7, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.arc(bx + Math.cos(tour) * 3, SOL - 7 + Math.sin(tour) * 3, 2.2, 0, Math.PI * 2);
    ctx.fill();
  }

  if (vol > 0) dessinerJetpack(x - 25, y - 50, true);

  ctx.save();
  if (joueur.glisse) {
    // roulade : il se met en boule et tourne vite, comme Sonic
    const angle = (Date.now() / 45) % (Math.PI * 2);
    ctx.translate(x, y - 15);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";   // lignes de vitesse derrière lui
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.beginPath();
    for (const dy of [-10, 0, 10]) {
      ctx.moveTo(-22 - Math.random() * 6, dy);
      ctx.lineTo(-40 - Math.random() * 14, dy);
    }
    ctx.stroke();
    ctx.rotate(angle);
    ctx.scale(0.4, 0.4);
    ctx.translate(0, 38);
    dessinerCorps(0, true);
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

  // si on a équipé une voiture, c'est elle qui nous poursuit, à la place de la police
  if (skinVoiture !== "normale") {
    const voitureFuite = voiture;
    const etaitCache = joueurCache;
    voiture = { x: -5, vers: 1, roue: defilement / 11, vitesse: 0 };
    joueurCache = false;
    ctx.save();
    ctx.translate(0, -saut);
    dessinerVoitureFuite();
    ctx.restore();
    voiture = voitureFuite;
    joueurCache = etaitCache;
    return;
  }
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
  for (let k = premierNuage; k < premierNuage + Math.ceil(canvas.width / 260) + 2; k++) {
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
  for (let i = premiereCase; i < premiereCase + Math.ceil(canvas.width / largeurCase) + 2; i++) {
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
  for (let k = premierDecor; k < premierDecor + Math.ceil(canvas.width / espace) + 2; k++) {
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
  ctx.font = "bold " + taille + "px " + POLICE;
  ctx.lineJoin = "round";
  ctx.strokeStyle = "#fff";
  ctx.lineWidth = trait;
  ctx.strokeText(texte, x, y);
  ctx.fillStyle = "#000";
  ctx.fillText(texte, x, y);
}

// Écran quand on se cogne : un message gentil, sans grosse tête
function dessinerPerdu() {
  const pulse = Math.sin(Date.now() / 200);
  ctx.fillStyle = "rgba(255, 255, 255, 0.55)";
  ctx.beginPath();
  ctx.roundRect(190, 100, 420, 200, 18);
  ctx.fill();
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.textAlign = "center";
  ecrireTexte("Perdu !", 400, 180, 64 + pulse * 4, 8);
  ecrireTexte("Dommage, retente ta chance !", 400, 230, 26, 5);
  if (!deuxJoueurs) ecrireTexte("Appuie sur Espace pour rejouer", 400, 275, 22, 4);
}

function dessiner() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  dessinerFond();
  dessinerOiseaux();

  dessinerPolice();
  for (const obj of objets) dessinerObjet(obj);
  for (const p of pieces) dessinerPiece(p);
  for (const e of etincelles) {
    ctx.globalAlpha = e.vie / 20;
    ctx.fillStyle = "#ffd23f";
    ctx.beginPath();
    ctx.arc(e.x, e.y, 3, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  for (const o of obstacles) dessinerObstacle(o);
  dessinerVoitureFuite();
  dessinerPersonnage();

  // les écrans de fin sont dessinés pour une toile de 800 : on les recentre si la toile est plus large
  const decalageCentre = (canvas.width - 800) / 2;
  ctx.save();
  ctx.translate(decalageCentre, 0);
  if (etat === "gagne") dessinerVictoire();
  ctx.restore();

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

  ctx.save();
  ctx.translate(decalageCentre, 0);
  if (etat === "perdu") dessinerPerdu();
  ctx.restore();

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

// ---------- Les voitures de fuite : une par skin ----------
// On dessine toujours une voiture de 120 de large, avec l'arrière à gauche (x = 0).

function dessinerRoueVoiture(wx, wy, r) {
  ctx.fillStyle = "#111";
  ctx.beginPath();
  ctx.arc(wx, wy, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#d4d4dc";                            // jante
  ctx.beginPath();
  ctx.arc(wx, wy, r * 0.62, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#6b6b78";
  ctx.lineWidth = 2;
  for (let i = 0; i < 5; i++) {
    const a = voiture.roue + (i * Math.PI * 2) / 5;     // les branches tournent
    ctx.beginPath();
    ctx.moveTo(wx, wy);
    ctx.lineTo(wx + Math.cos(a) * r * 0.6, wy + Math.sin(a) * r * 0.6);
    ctx.stroke();
  }
  ctx.fillStyle = "#333";
  ctx.beginPath();
  ctx.arc(wx, wy, r * 0.18, 0, Math.PI * 2);
  ctx.fill();
}

// Le garçon assis dans la voiture : on voit sa tête et sa casquette (ou son masque)
function dessinerPassager(x, y) {
  const c = COULEURS_PERSO[skinPerso];
  ctx.fillStyle = c.peau;
  ctx.beginPath();
  ctx.arc(x, y, 9, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.fillStyle = c.cheveux;
  ctx.beginPath();
  ctx.arc(x, y - 2, 9.5, Math.PI, 0);
  ctx.fill();
  if (c.visiere) ctx.fillRect(x + 2, y - 3, 11, 3);
  ctx.fillStyle = skinPerso === "spiderman" ? "#fff" : "#000";
  ctx.beginPath();
  ctx.arc(x + 5, y, skinPerso === "spiderman" ? 2.6 : 1.8, 0, Math.PI * 2);
  ctx.fill();
}

function degradeVoiture(haut, bas, couleurs) {
  const d = ctx.createLinearGradient(0, haut, 0, bas);
  d.addColorStop(0, couleurs[0]);
  d.addColorStop(1, couleurs[1]);
  return d;
}

function dessinerPhareAvant(x, y) {
  const lueur = ctx.createRadialGradient(x, y, 1, x, y, 16);
  lueur.addColorStop(0, "rgba(255, 240, 160, 0.8)");
  lueur.addColorStop(1, "rgba(255, 240, 160, 0)");
  ctx.fillStyle = lueur;
  ctx.fillRect(x - 16, y - 16, 32, 32);
  ctx.fillStyle = "#fff6c0";
  ctx.fillRect(x - 3, y - 3, 6, 6);
}

// Voiture de sport rouge : spoiler, bandes de course, vitres brillantes
function dessinerVoitureSport(couleurs) {
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 2;
  // spoiler arrière
  ctx.fillStyle = "#222";
  ctx.fillRect(2, SOL - 52, 4, 14);
  ctx.fillRect(-4, SOL - 54, 22, 4);
  // carrosserie basse et allongée
  ctx.fillStyle = degradeVoiture(SOL - 42, SOL - 10, couleurs);
  ctx.beginPath();
  ctx.moveTo(0, SOL - 14);
  ctx.lineTo(0, SOL - 32);
  ctx.quadraticCurveTo(2, SOL - 40, 14, SOL - 40);
  ctx.lineTo(96, SOL - 38);
  ctx.quadraticCurveTo(122, SOL - 32, 122, SOL - 20);
  ctx.lineTo(122, SOL - 14);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  // cabine
  ctx.beginPath();
  ctx.moveTo(26, SOL - 40);
  ctx.quadraticCurveTo(38, SOL - 66, 56, SOL - 66);
  ctx.lineTo(76, SOL - 66);
  ctx.quadraticCurveTo(92, SOL - 60, 102, SOL - 39);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  // vitres
  ctx.fillStyle = "#9fd8f5";
  ctx.beginPath();
  ctx.moveTo(34, SOL - 41);
  ctx.quadraticCurveTo(42, SOL - 60, 56, SOL - 60);
  ctx.lineTo(74, SOL - 60);
  ctx.quadraticCurveTo(86, SOL - 56, 93, SOL - 41);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";         // reflet
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(46, SOL - 56);
  ctx.lineTo(40, SOL - 43);
  ctx.moveTo(56, SOL - 57);
  ctx.lineTo(50, SOL - 43);
  ctx.stroke();
  if (joueurCache) dessinerPassager(68, SOL - 51);
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 2;
  // montant de porte, poignée et bandes de course
  ctx.beginPath();
  ctx.moveTo(62, SOL - 40);
  ctx.lineTo(62, SOL - 16);
  ctx.stroke();
  ctx.fillStyle = "#222";
  ctx.fillRect(52, SOL - 35, 8, 3);
  ctx.fillStyle = "#fff";
  ctx.fillRect(4, SOL - 28, 114, 3);
  ctx.fillStyle = "#222";
  ctx.fillRect(4, SOL - 24, 114, 2);
  // reflet sur le capot
  ctx.strokeStyle = "rgba(255, 255, 255, 0.45)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(10, SOL - 37);
  ctx.lineTo(92, SOL - 36);
  ctx.stroke();
  // pare-chocs, phares
  ctx.fillStyle = "#333";
  ctx.fillRect(0, SOL - 15, 122, 5);
  ctx.fillStyle = "#ff2a2a";
  ctx.fillRect(0, SOL - 32, 5, 8);
  dessinerPhareAvant(119, SOL - 26);
  // roues dans leurs passages
  for (const wx of [28, 92]) {
    ctx.fillStyle = "#1a1a20";
    ctx.beginPath();
    ctx.arc(wx, SOL - 10, 15, Math.PI, 0);
    ctx.fill();
    dessinerRoueVoiture(wx, SOL - 10, 12);
  }
}

// Taxi jaune : damier, enseigne sur le toit, vitres larges
function dessinerTaxi(couleurs) {
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 2;
  ctx.fillStyle = degradeVoiture(SOL - 42, SOL - 10, couleurs);
  ctx.beginPath();
  ctx.roundRect(0, SOL - 40, 120, 30, 8);
  ctx.fill();
  ctx.stroke();
  // cabine haute (comme un vrai taxi)
  ctx.beginPath();
  ctx.moveTo(22, SOL - 40);
  ctx.lineTo(32, SOL - 66);
  ctx.lineTo(88, SOL - 66);
  ctx.lineTo(104, SOL - 40);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#b8e6fa";
  ctx.beginPath();
  ctx.moveTo(30, SOL - 42);
  ctx.lineTo(38, SOL - 61);
  ctx.lineTo(60, SOL - 61);
  ctx.lineTo(60, SOL - 42);
  ctx.closePath();
  ctx.moveTo(65, SOL - 42);
  ctx.lineTo(65, SOL - 61);
  ctx.lineTo(86, SOL - 61);
  ctx.lineTo(97, SOL - 42);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  if (joueurCache) dessinerPassager(48, SOL - 52);
  // damier noir et blanc sur le côté
  for (let i = 0; i < 20; i++) {
    for (let j = 0; j < 2; j++) {
      ctx.fillStyle = (i + j) % 2 ? "#000" : "#fff";
      ctx.fillRect(4 + i * 5.6, SOL - 27 + j * 5, 5.6, 5);
    }
  }
  ctx.strokeRect(4, SOL - 27, 112, 10);
  // enseigne lumineuse sur le toit
  ctx.fillStyle = "#fffbe0";
  ctx.beginPath();
  ctx.roundRect(48, SOL - 77, 30, 11, 3);
  ctx.fill();
  ctx.stroke();
  ctx.save();
  ctx.translate(63, SOL - 68);
  if (voiture.vers < 0) ctx.scale(-1, 1);               // le texte ne doit pas être à l'envers
  ctx.fillStyle = "#000";
  ctx.font = "bold 9px Impact, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("TAXI", 0, 0);
  ctx.restore();
  // pare-chocs chromés, phares
  ctx.fillStyle = "#d4d4dc";
  ctx.fillRect(0, SOL - 16, 120, 5);
  ctx.fillStyle = "#ff2a2a";
  ctx.fillRect(0, SOL - 36, 5, 8);
  dessinerPhareAvant(117, SOL - 30);
  for (const wx of [28, 92]) {
    ctx.fillStyle = "#1a1a20";
    ctx.beginPath();
    ctx.arc(wx, SOL - 10, 15, Math.PI, 0);
    ctx.fill();
    dessinerRoueVoiture(wx, SOL - 10, 12);
  }
}

// Tank militaire : chenilles, camouflage, tourelle, long canon
function dessinerTank(couleurs) {
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 2;
  // coque camouflée
  ctx.fillStyle = degradeVoiture(SOL - 42, SOL - 18, couleurs);
  ctx.beginPath();
  ctx.moveTo(6, SOL - 18);
  ctx.lineTo(0, SOL - 36);
  ctx.lineTo(96, SOL - 40);
  ctx.lineTo(124, SOL - 26);
  ctx.lineTo(120, SOL - 18);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.save();
  ctx.clip();
  ctx.fillStyle = "rgba(30, 40, 10, 0.55)";
  for (const [tx, ty, tr] of [[20, SOL - 30, 10], [52, SOL - 24, 8], [84, SOL - 33, 11], [108, SOL - 24, 7]]) {
    ctx.beginPath();
    ctx.ellipse(tx, ty, tr * 1.5, tr * 0.7, 0.3, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
  // étoile blanche sur la coque
  ctx.fillStyle = "#e8e8d0";
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const r = i % 2 ? 3 : 7;
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    ctx.lineTo(100 + Math.cos(a) * r, SOL - 28 + Math.sin(a) * r);
  }
  ctx.closePath();
  ctx.fill();
  // canon avec frein de bouche
  ctx.fillStyle = "#3a4420";
  ctx.fillRect(84, SOL - 63, 50, 7);
  ctx.strokeRect(84, SOL - 63, 50, 7);
  ctx.fillRect(130, SOL - 66, 8, 13);
  ctx.strokeRect(130, SOL - 66, 8, 13);
  // tourelle
  ctx.fillStyle = degradeVoiture(SOL - 76, SOL - 44, couleurs);
  ctx.beginPath();
  ctx.moveTo(30, SOL - 40);
  ctx.lineTo(36, SOL - 70);
  ctx.lineTo(78, SOL - 70);
  ctx.lineTo(92, SOL - 54);
  ctx.lineTo(90, SOL - 40);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  // trappe ouverte avec le garçon dedans
  ctx.fillStyle = "#222";
  ctx.beginPath();
  ctx.ellipse(54, SOL - 70, 10, 3, 0, 0, Math.PI * 2);
  ctx.fill();
  if (joueurCache) dessinerPassager(54, SOL - 76);
  // chenilles avec leurs roues
  ctx.fillStyle = "#26262c";
  ctx.beginPath();
  ctx.roundRect(-4, SOL - 22, 130, 22, 11);
  ctx.fill();
  ctx.stroke();
  for (let i = 0; i < 5; i++) {
    const wx = 10 + i * 26;
    ctx.fillStyle = "#555";
    ctx.beginPath();
    ctx.arc(wx, SOL - 11, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#999";
    ctx.lineWidth = 2;
    const a = voiture.roue + i;
    ctx.beginPath();
    ctx.moveTo(wx - Math.cos(a) * 6, SOL - 11 - Math.sin(a) * 6);
    ctx.lineTo(wx + Math.cos(a) * 6, SOL - 11 + Math.sin(a) * 6);
    ctx.stroke();
  }
}

// Voiture volante futuriste : dôme en verre, ailes, réacteurs et lueur sous la voiture
function dessinerVoitureVolante(couleurs) {
  const t = Date.now();
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 2;
  // lueur bleue sous la voiture
  const lueur = ctx.createRadialGradient(60, SOL - 8, 4, 60, SOL - 8, 70);
  lueur.addColorStop(0, "rgba(90, 220, 255, 0.55)");
  lueur.addColorStop(1, "rgba(90, 220, 255, 0)");
  ctx.fillStyle = lueur;
  ctx.fillRect(-10, SOL - 50, 140, 70);
  // flamme du réacteur arrière
  ctx.fillStyle = "#ff9a00";
  ctx.beginPath();
  ctx.moveTo(2, SOL - 30);
  ctx.lineTo(-18 - Math.random() * 14, SOL - 24);
  ctx.lineTo(2, SOL - 18);
  ctx.fill();
  ctx.fillStyle = "#ffe14d";
  ctx.beginPath();
  ctx.moveTo(2, SOL - 27);
  ctx.lineTo(-8 - Math.random() * 8, SOL - 24);
  ctx.lineTo(2, SOL - 21);
  ctx.fill();
  // aile du fond
  ctx.fillStyle = "#cfe3ff";
  ctx.beginPath();
  ctx.moveTo(34, SOL - 38);
  ctx.lineTo(8, SOL - 68);
  ctx.lineTo(18, SOL - 68);
  ctx.lineTo(62, SOL - 38);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  // coque aérodynamique
  ctx.fillStyle = degradeVoiture(SOL - 46, SOL - 12, couleurs);
  ctx.beginPath();
  ctx.moveTo(0, SOL - 22);
  ctx.quadraticCurveTo(0, SOL - 40, 22, SOL - 42);
  ctx.lineTo(92, SOL - 40);
  ctx.quadraticCurveTo(126, SOL - 32, 124, SOL - 22);
  ctx.quadraticCurveTo(122, SOL - 12, 100, SOL - 12);
  ctx.lineTo(18, SOL - 12);
  ctx.quadraticCurveTo(0, SOL - 12, 0, SOL - 22);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  // dôme en verre
  const verre = ctx.createLinearGradient(0, SOL - 70, 0, SOL - 40);
  verre.addColorStop(0, "rgba(220, 245, 255, 0.95)");
  verre.addColorStop(1, "rgba(120, 190, 240, 0.85)");
  ctx.fillStyle = verre;
  ctx.beginPath();
  ctx.moveTo(34, SOL - 41);
  ctx.quadraticCurveTo(44, SOL - 74, 68, SOL - 72);
  ctx.quadraticCurveTo(88, SOL - 70, 98, SOL - 40);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  if (joueurCache) dessinerPassager(66, SOL - 56);
  ctx.strokeStyle = "rgba(255, 255, 255, 0.9)";         // reflet du dôme
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(46, SOL - 58);
  ctx.quadraticCurveTo(52, SOL - 68, 62, SOL - 68);
  ctx.stroke();
  // lumières néon sur le côté
  ctx.fillStyle = "#4ff0ff";
  ctx.fillRect(14, SOL - 26, 90, 3);
  ctx.fillStyle = "#fff";
  ctx.fillRect(14, SOL - 26, 90, 1);
  // aile de devant
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 2;
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.moveTo(40, SOL - 30);
  ctx.lineTo(12, SOL - 60);
  ctx.lineTo(24, SOL - 60);
  ctx.lineTo(72, SOL - 30);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  // phare et feu clignotant
  dessinerPhareAvant(118, SOL - 26);
  ctx.fillStyle = Math.floor(t / 250) % 2 ? "#ff2a2a" : "#7a1010";
  ctx.beginPath();
  ctx.arc(14, SOL - 62, 3, 0, Math.PI * 2);
  ctx.fill();
  // deux réacteurs sous la voiture, avec de petites flammes
  for (const wx of [32, 92]) {
    ctx.fillStyle = "#333";
    ctx.fillRect(wx - 7, SOL - 13, 14, 5);
    ctx.fillStyle = "#4ff0ff";
    ctx.beginPath();
    ctx.moveTo(wx - 6, SOL - 8);
    ctx.lineTo(wx, SOL + 4 + Math.random() * 10);
    ctx.lineTo(wx + 6, SOL - 8);
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.moveTo(wx - 3, SOL - 8);
    ctx.lineTo(wx, SOL - 2 + Math.random() * 5);
    ctx.lineTo(wx + 3, SOL - 8);
    ctx.fill();
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
  // ombre sur la route (plus petite et plus claire quand la voiture vole)
  ctx.fillStyle = "rgba(0, 0, 0, " + (skinVoiture === "volante" ? 0.2 : 0.35) + ")";
  ctx.beginPath();
  ctx.ellipse(60, SOL + 4, skinVoiture === "volante" ? 42 : 58, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  const couleurs = COULEURS_VOITURE[skinVoiture];
  if (skinVoiture === "taxi") {
    dessinerTaxi(couleurs);
  } else if (skinVoiture === "tank") {
    dessinerTank(couleurs);
  } else if (skinVoiture === "volante") {
    ctx.translate(0, -26 + Math.sin(Date.now() / 150) * 4);   // elle flotte au-dessus de la route
    dessinerVoitureVolante(couleurs);
  } else {
    dessinerVoitureSport(couleurs);
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
  if (!deuxJoueurs) ecrireTexte("Appuie sur Espace pour rejouer", 400, 300, 24, 5);
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
  if (deuxJoueurs) {
    boucleDeuxJoueurs();
  } else {
    mettreAJour();
    dessiner();
  }
  requestAnimationFrame(boucle);
}

joueur = { x: 200, y: SOL, vy: 0, glisse: false, tempsGlisse: 0 };
obstacles = [];
boucle();
