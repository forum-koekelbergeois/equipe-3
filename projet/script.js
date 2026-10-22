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
  { id: "zorok", nom: "Zorok" },
  { id: "ninja", nom: "Ninja" },
  { id: "robot", nom: "Robot" },
  { id: "pirate", nom: "Pirate" },
];
const SKINS_VOITURE = [
  { id: "normale", nom: "Police" },
  { id: "taxi", nom: "Taxi" },
  { id: "tank", nom: "Tank" },
  { id: "volante", nom: "Voiture volante" },
  { id: "arcenciel", nom: "Arc-en-ciel" },
  { id: "glace", nom: "Voiture glace" },
  { id: "fusee", nom: "Voiture fusée" },
];

// couleurs du personnage pour chaque skin
const COULEURS_PERSO = {
  normal:    { jambes: "#2b4c9b", haut: "#ff7a1a", bras: "#c9570a", poche: "#e5640a", peau: "#e0ac69", mains: "#e0ac69", cheveux: "#111", chaussures: "#fff", visiere: true },
  zorok:     { jambes: "#5b2a86", haut: "#7a3cb8", bras: "#5b2a86", poche: "#3fd04a", peau: "#4fd45a", mains: "#4fd45a", cheveux: "#2a7a30", chaussures: "#2a1a40", visiere: false },
  ninja:     { jambes: "#1a1a22", haut: "#25252f", bras: "#15151c", poche: "#d81e2c", peau: "#25252f", mains: "#25252f", cheveux: "#25252f", chaussures: "#d81e2c", visiere: false },
  robot:     { jambes: "#6c7a89", haut: "#aab6c3", bras: "#7d8a98", poche: "#3fc8ff", peau: "#c9d3dc", mains: "#6c7a89", cheveux: "#6c7a89", chaussures: "#44505c", visiere: false },
  pirate:    { jambes: "#5a3a22", haut: "#f2ead2", bras: "#d6cba8", poche: "#a01420", peau: "#e0ac69", mains: "#e0ac69", cheveux: "#111", chaussures: "#2a1a10", visiere: false },
};
// couleurs de la voiture de fuite pour chaque skin
const COULEURS_VOITURE = {
  normale: ["#ff4a4a", "#a50f0f"],
  taxi:    ["#ffe14d", "#d9a400"],
  tank:    ["#6b7a3a", "#3a4420"],
  volante: ["#6fc3ff", "#1b5fd1"],
  arcenciel: ["#ff7ad9", "#a02fd0"],
  glace:   ["#ffc2e0", "#ff7ab5"],
  fusee:   ["#e8eef5", "#8896a8"],
};

// 22 personnages originaux. Chacun a des couleurs, un accessoire et un pouvoir.
// [id, nom, haut, jambes, cheveux, peau, accessoire, détail, cape, chaussures]
const AUTRES_PERSOS = [
  ["grimpeur", "Grimpeur", "#2fb5a8", "#1a5a6a", "#ffb300", "#f2c28a", "bandeau", "#ffb300", undefined, "#ff7a1a"],
  ["champion", "Champion", "#7a3ad8", "#ffd23f", "#5a3a22", "#e0ac69", "bandeau", "#ffd23f", undefined, "#ffd23f"],
  ["piko", "Piko", "#8a4fd8", "#6a3ab5", "#2fd0c0", "#8a4fd8", "herisson", "#ffb347", undefined, "#3fd04a"],
  ["ressort", "Ressort", "#ffd23f", "#2f9a4a", "#ff7a1a", "#f2c28a", "bandeau", "#2f9a4a", undefined, "#ff7a1a"],
  ["sauterelle", "Sauterelle", "#7ad83f", "#3a8a2a", "#2a5a1a", "#bfe07a", "pointes", "#ffffff"],
  ["lapin", "Lapin turbo", "#f4f4f4", "#c0c0d0", "#ffb0d0", "#f4f4f4", "oreilles", "#ff6b9a"],
  ["panthere", "Panthère des toits", "#1a2a3a", "#0a1a2a", "#1a2a3a", "#2a3a4a", "oreilles", "#3fe0ff", "#0a6a8a"],
  ["aigle", "Aigle d'or", "#f4f4f4", "#ffb300", "#ffb300", "#f2c28a", "aucun", "#ffb300", "#ffb300"],
  ["plongeur", "Plongeur", "#1a8ad8", "#0a4a8a", "#ffd23f", "#ffd23f", "casque", "#aee6ff"],
  ["colosse", "Colosse de pierre", "#8a8f99", "#5a5f69", "#6a6f79", "#8a8f99", "aucun", "#8a8f99"],
  ["dragonnet", "Dragonnet", "#2fb59a", "#1a6a5a", "#ffd23f", "#2fb59a", "pointes", "#ffd23f"],
  ["lynx", "Lynx des neiges", "#cfe6ff", "#5a7aaa", "#8aa8d8", "#cfe6ff", "oreilles", "#5a7aaa"],
  ["lutin", "Lutin des bois", "#8a5a2a", "#3a2a1a", "#e0262a", "#f2c28a", "chapeau", "#e0262a"],
  ["cubix", "Cubix", "#ff5a8a", "#4a2a8a", "#ffd23f", "#f2c28a", "aucun", "#ff5a8a"],
  ["apprenti", "Apprenti sorcier", "#5a2a8a", "#2a1a4a", "#8a3fe0", "#f2c28a", "chapeau", "#8a3fe0", "#3a1a6a"],
  ["fee", "Fée du givre", "#f4d0ff", "#b08ad8", "#ffffff", "#f2c28a", "bandeau", "#ffd23f", "#d8f0ff"],
  ["cosmo", "Cosmo", "#f4f4f4", "#e0e0e8", "#f4f4f4", "#f2c28a", "casque", "#ffb300", undefined, "#ff7a1a"],
  ["abeille", "Abeille", "#ffd23f", "#111111", "#111111", "#f2c28a", "bandeau", "#111111"],
  ["chevalier", "Chevalier vert", "#2a8a5a", "#1a4a3a", "#cfd4dc", "#f2c28a", "casque", "#f2c28a"],
  ["viking", "Viking", "#8a5a2a", "#3a2a1a", "#d8d0b8", "#f2c28a", "oreilles", "#ffb300", "#7a3a1a"],
  ["dino", "Dino", "#ff9a3f", "#ff9a3f", "#ffd23f", "#ff9a3f", "museau", "#fff3d0"],
  ["nuage", "Nuage", "#bfe6ff", "#bfe6ff", "#bfe6ff", "#bfe6ff", "joues", "#ff9ab0"],
];
for (const [id, nom, haut, jambes, cheveux, peau, acc, detail, cape, chaussures] of AUTRES_PERSOS) {
  SKINS_PERSO.push({ id, nom });
  COULEURS_PERSO[id] = { jambes, haut, bras: jambes, poche: detail, peau, mains: peau, cheveux, chaussures: chaussures || cape || "#fff", visiere: false, acc, cape };
}

// Pouvoirs : [nom, genre]. On peut s'en servir 20 fois par partie avec la touche M.
const NB_POUVOIRS = 20;
const texteNbPouvoirs = (n) => (n === Infinity ? "∞" : n);
const POUVOIRS = {
  zorok: ["Rayon vert", "boum"], ninja: ["Esquive", "bouclier"], robot: ["Propulseurs", "vol"], pirate: ["Canon", "boum"],
  grimpeur: ["Grappin", "aimant"], champion: ["Tir puissant", "boum"], piko: ["Tourbillon", "boum"],
  ressort: ["Super ressort", "megasaut"], sauterelle: ["Saut vert", "megasaut"], lapin: ["Bond éclair", "boum"],
  panthere: ["Cape d'ombre", "bouclier"], aigle: ["Envol", "vol"], plongeur: ["Jet sous-marin", "vol"],
  colosse: ["Coup de poing", "boum"], dragonnet: ["Écailles", "bouclier"], lynx: ["Ombres jumelles", "double"],
  lutin: ["Écorce", "bouclier"], cubix: ["Bombe", "boum"], apprenti: ["Aimant magique", "aimant"],
  fee: ["Gel", "boum"], cosmo: ["Fusée", "vol"], abeille: ["Miel collant", "aimant"],
  chevalier: ["Écu", "bouclier"], viking: ["Hache", "boum"], dino: ["Saut de dino", "double"], nuage: ["Souffle", "aimant"],
};
const GENRES_POUVOIR = {
  boum: "efface les obstacles", bouclier: "bouclier 6 s", vol: "vole 2,5 s",
  megasaut: "saut géant", double: "double saut 5 s", aimant: "attire les pièces",
};

// [id, nom, couleur du haut, couleur du bas]
const AUTRES_VOITURES = [
  ["foudre", "Foudre rouge", "#ff3b3b", "#a50f0f"],
  ["ombre", "Voiture de la nuit", "#3a2a6a", "#12082a"],
  ["coccinelle", "Coccinelle à pois", "#e0262a", "#8a0f14"],
  ["jardin", "Voiture jardin", "#ff9ad0", "#2fa84a"],
  ["neon", "Voiture néon", "#2a2a3a", "#0a0a18"],
  ["pompier", "Voiture pompier", "#ff3b2a", "#9a1008"],
  ["abeille", "Voiture abeille", "#ffe14d", "#d9a400"],
  ["flammes", "Voiture à flammes", "#2a2a2f", "#08080a"],
  ["radar", "Voiture radar", "#5a7a9a", "#2a3a5a"],
  ["rallye", "Voiture de rallye", "#ffffff", "#aab0bc"],
  ["rouille", "Voiture rouillée", "#b5733a", "#6a3a18"],
  ["f1", "Formule 1", "#ff2a2a", "#8a0a0a"],
  ["kartpois", "Kart à pois", "#3fa0ff", "#1a4ab5"],
  ["licorne", "Licorne", "#ffffff", "#ffc2e8"],
  ["lapin", "Voiture lapin", "#f4f4f4", "#ffb0d0"],
  ["herisson", "Voiture hérisson", "#8a4fd8", "#4a2a8a"],
  ["hibou", "Voiture hibou", "#b5733a", "#5a3213"],
  ["pizza", "Voiture pizza", "#ffb347", "#d9780a"],
  ["etoiles", "Voiture étoiles", "#1a2a6a", "#080f2a"],
  ["dino", "Voiture dino", "#4ac860", "#1f7a32"],
];
for (const [id, nom, haut, bas] of AUTRES_VOITURES) {
  SKINS_VOITURE.push({ id: "v_" + id, nom });
  COULEURS_VOITURE["v_" + id] = [haut, bas];
}

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
  } else if (nom === "sirene") {
    [0, 1, 2, 3, 4, 5].forEach((i) => noteEffet(i % 2 ? 760 : 960, i * 0.25, 0.22, "square", 0.05));
  } else if (nom === "perdu") {
    [392, 330, 262, 196].forEach((f, i) => noteEffet(f, i * 0.12, 0.2, "triangle", 0.15));
  }
}

let nbPieces = 0;
const PRIX_HELICO = 100;
let helicoAchete = false;   // l'hélicoptère (touche C) s'achète sur la page d'accueil
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
    localStorage.setItem("coursEsquive", JSON.stringify({ nbPieces, skinsAchetes, skinPerso, skinVoiture, meilleursScores, helicoAchete }));
  } catch (e) { /* pas grave : on ne sauvegarde pas */ }
}

function charger() {
  try {
    const d = JSON.parse(localStorage.getItem("coursEsquive"));
    if (!d) return;
    nbPieces = Number(d.nbPieces) || 0;
    helicoAchete = d.helicoAchete === true;
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
    if (type === "perso" && POUVOIRS[skin.id]) {
      const [nomPouvoir, genre] = POUVOIRS[skin.id];
      const info = document.createElement("small");
      info.style.display = "block";
      info.textContent = "⚡ " + nomPouvoir + " : " + GENRES_POUVOIR[genre] + " (×" + texteNbPouvoirs(NB_POUVOIRS) + ")";
      texte.appendChild(info);
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
  afficherHelico();
}

function afficherHelico() {
  const bouton = document.getElementById("btnAcheterHelico");
  bouton.textContent = helicoAchete ? "🚁 Hélicoptère ✔ Prêt (1 utilisation)" : "🚁 Hélicoptère — " + PRIX_HELICO + " pièces (1 utilisation)";
  bouton.className = helicoAchete ? "possede" : "";
  document.getElementById("btnHelico").hidden = !helicoAchete;   // le bouton du jeu n'apparaît qu'une fois acheté
}

document.getElementById("btnAcheterHelico").addEventListener("click", () => {
  if (helicoAchete) {
    messageEl.textContent = "Ton hélicoptère est prêt ! Appuie sur C pendant la course (une seule fois).";
  } else if (nbPieces < PRIX_HELICO) {
    messageEl.textContent = "Pas assez de pièces ! Il en faut " + PRIX_HELICO + ".";
    sonEffet("refus");
  } else {
    nbPieces -= PRIX_HELICO;
    helicoAchete = true;
    sonEffet("achat");
    messageEl.textContent = "Hélicoptère acheté ! Il sert une seule fois : appuie sur C pendant la course pour aller à 2000 m.";
    sauvegarder();
    afficherBoutiques();
  }
});

// L'accueil existe en deux versions (1 joueur et 2 joueurs) avec les mêmes boutiques.
let accueilDeux = false;

function reglerAccueil(deux) {
  accueilDeux = deux;
  document.getElementById("lieuAccueil").textContent = deux ? "Los Angeles — 2 joueurs" : "Los Angeles";
  document.getElementById("btn2Joueurs").textContent = deux ? "1 JOUEUR" : "2 JOUEURS";
}

// ---------- Pause ----------
let enPause = false;

function dessinerPause() {
  for (const t of toiles) {
    if (t.hidden) continue;
    const c = t.getContext("2d");
    c.fillStyle = "rgba(0, 0, 0, 0.5)";
    c.fillRect(0, 0, t.width, t.height);
    c.fillStyle = "#fff";
    c.font = "bold 64px " + POLICE;
    c.textAlign = "center";
    c.fillText("PAUSE", t.width / 2, t.height / 2);
  }
}

function basculerPause() {
  if (!accueilEl.classList.contains("cache")) return;   // pas de pause sur l'accueil
  enPause = !enPause;
  document.getElementById("btnPause").textContent = enPause ? "Reprendre" : "Pause";
  if (enPause) {
    dessinerPause();
    if (audio) audio.suspend();
  } else if (audio) {
    audio.resume();
  }
}

function ouvrirAccueil() {
  sauvegarder();
  arreterMusique();
  if (window.speechSynthesis) speechSynthesis.cancel();
  etat = "attente";
  enPause = false;
  document.getElementById("btnPause").textContent = "Pause";
  reglerAccueil(deuxJoueurs);
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
  document.getElementById("btnPause").textContent = "Pause";
  pleinEcran();
  accueilEl.classList.add("cache");
  enPause = false;
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
    ? "Joueur 1 (haut) : Z = sauter, S = roulade, A = pouvoir, C = hélico &nbsp;&nbsp; Joueur 2 (bas) : ↑ = sauter, ↓ = roulade, M = pouvoir, N = hélico &nbsp;&nbsp; Q = quitter"
    : "Espace = sauter &nbsp;&nbsp; Flèche du bas = roulade &nbsp;&nbsp; M = pouvoir &nbsp;&nbsp; C = hélicoptère &nbsp;&nbsp; Q = quitter";
}

function lancerPartie2() {
  pleinEcran();
  accueilEl.classList.add("cache");
  enPause = false;
  document.getElementById("btnPause").textContent = "Pause";
  choisirMode(true);
  etatsJoueurs = [];
  finDeuxJoueurs = false;
  for (let i = 0; i < 2; i++) {
    recommencer();
    etatsJoueurs.push(prendreEtat());
  }
}

function actionJoueur(i, action) {
  if (enPause) return;
  poserEtat(etatsJoueurs[i]);
  if (etat === "jeu") action();
  etatsJoueurs[i] = prendreEtat();
}

function touchesDeuxJoueurs(e) {
  // clavier AZERTY : on lit la lettre écrite sur la touche (e.key), pas sa place
  const actions = {
    z: [0, sauter], s: [0, glisser], a: [0, utiliserPouvoir], c: [0, utiliserHelico],
    ArrowUp: [1, sauter], ArrowDown: [1, glisser], m: [1, utiliserPouvoir], n: [1, utiliserHelico],
  };
  const lettre = e.key.length === 1 ? e.key.toLowerCase() : e.key;
  if (actions[lettre]) {
    e.preventDefault();
    actionJoueur(actions[lettre][0], actions[lettre][1]);
  } else if ((e.code === "Space" || e.code === "Enter") && finDeuxJoueurs && !enPause) {
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
    ecrireTexte(texteEtatPouvoir(), canvas.width - 15, 62, 18, 3);
    if (finDeuxJoueurs) {
      ctx.textAlign = "center";
      ecrireTexte(gagnantDeuxJoueurs === -1 ? "Égalité !" : "Joueur " + (gagnantDeuxJoueurs + 1) + " gagne !", canvas.width / 2, 210, 46, 7);
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
let bottes = 0;      // temps qui reste avec les bottes (double saut)
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
  { // Rap : beat original, lent et lourd (grosse caisse, caisse claire sur 2 et 4, charleston, basse 808)
    kicks: [0, 3, 10, 16, 19, 26], snares: [8, 24], pasHats: 2, forceHats: 0.07,
    basse: [55, 55, 65, 55, 49, 49, 58, 49], formeBasse: "sine",
    melodie: [440, 0, 0, 523, 0, 440, 0, 392, 349, 0, 0, 392, 0, 349, 0, 0],
    formeMelodie: "triangle", forceMelodie: 0.09, duree: 0.3 },
  { // Rap trap : charleston rapide, basse très grave
    kicks: [0, 6, 10, 14, 16, 22, 26], snares: [8, 24], pasHats: 1, forceHats: 0.04,
    basse: [49, 49, 58, 49, 44, 44, 52, 49], formeBasse: "sine",
    melodie: [330, 0, 392, 0, 330, 0, 294, 0, 262, 0, 294, 0, 330, 0, 0, 0],
    formeMelodie: "sine", forceMelodie: 0.08, duree: 0.35 },
  { // Rap old school : rythme sautillant, notes brillantes
    kicks: [0, 4, 10, 16, 20, 26], snares: [8, 24, 30], pasHats: 2, forceHats: 0.06,
    basse: [65, 65, 73, 65, 58, 58, 65, 73], formeBasse: "triangle",
    melodie: [523, 0, 587, 0, 659, 0, 587, 0, 523, 0, 440, 0, 392, 0, 440, 0],
    formeMelodie: "square", forceMelodie: 0.04, duree: 0.2 },
  { // Rap tranquille : lent, avec de longues notes douces
    kicks: [0, 12, 16, 28], snares: [8, 24], pasHats: 4, forceHats: 0.04,
    basse: [55, 55, 55, 65, 49, 49, 49, 58], formeBasse: "sine",
    melodie: [659, 0, 0, 587, 0, 0, 523, 0, 0, 587, 0, 0, 494, 0, 0, 0],
    formeMelodie: "sine", forceMelodie: 0.1, duree: 0.45 },
  { // Rap dur : rythme serré et notes tranchantes
    kicks: [0, 3, 6, 16, 19, 22, 28], snares: [12, 28], pasHats: 1, forceHats: 0.05,
    basse: [41, 41, 49, 41, 37, 37, 44, 41], formeBasse: "sine",
    melodie: [392, 0, 392, 0, 466, 0, 440, 0, 392, 0, 349, 0, 392, 0, 0, 0],
    formeMelodie: "sawtooth", forceMelodie: 0.03, duree: 0.15 },
];

// La musique change tous les 100 mètres : les beats se suivent toujours dans le même ordre
function blocMusique() {
  return Math.floor(metres() / 100);
}

function planifierMusique() {
  const m = musiques[musiquePaysage % musiques.length];
  const pas = 0.125;
  for (const p of m.kicks) jouerGrosseCaisse(prochainTemps + p * pas);
  for (const p of m.snares) jouerBruit(prochainTemps + p * pas, 0.15, 0.25, 1500);
  if (m.pasHats > 0) {
    for (let p = 0; p < 32; p += m.pasHats) jouerBruit(prochainTemps + p * pas, 0.04, m.forceHats, 7000);
  }
  // basse : une note toutes les demi-secondes
  m.basse.forEach((freq, i) => {
    jouerNote(freq, prochainTemps + i * 0.5, 0.45, m.formeBasse, 0.3);
  });
  // mélodie : une note tous les quarts de seconde, toujours la même (aucun hasard)
  m.melodie.forEach((freq, i) => {
    if (freq === 0) return;
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
  musiquePaysage = blocMusique();
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
  nouvelleSuitePaysages();
  joueur = { x: 200, y: SOL, vy: 0, glisse: false, tempsGlisse: 0, pouvoirs: NB_POUVOIRS, aimant: 0 };
  obstacles = [];
  vitesse = 6;
  score = 0;
  compteur = 0;
  etat = "jeu";
  demarrerMusique();  // après la remise à zéro, pour commencer avec la musique du premier paysage
}

// Effet visible du pouvoir pour chaque personnage : [forme, couleur 1, couleur 2]
const EFFETS_POUVOIR = {
  zorok: ["rayon", "#3fff5a", "#eaffea"],
  ninja: ["aura", "#222233", "#d81e2c"],
  robot: ["flamme", "#3fc8ff", "#ffffff"],
  pirate: ["boulet", "#222222", "#ff9a00"],
  grimpeur: ["lasso", "#ffb300", "#ffffff"],
  champion: ["boulet", "#ffffff", "#7a3ad8"],
  piko: ["onde", "#8a4fd8", "#ffb347"],
  ressort: ["etoiles", "#ffd23f", "#2f9a4a"],
  sauterelle: ["etoiles", "#7ad83f", "#ffffff"],
  lapin: ["eclair", "#ffb0d0", "#ffffff"],
  panthere: ["aura", "#0a6a8a", "#3fe0ff"],
  aigle: ["vitesse", "#ffb300", "#ffffff"],
  plongeur: ["flamme", "#3fc8ff", "#ffffff"],
  colosse: ["onde", "#b0b4bc", "#5a5f69"],
  dragonnet: ["aura", "#2fe0b0", "#ffffff"],
  lynx: ["clones", "#8aa8d8", "#cfe6ff"],
  lutin: ["aura", "#8a5a2a", "#7ad83f"],
  cubix: ["explosion", "#ff5a8a", "#ffe14d"],
  apprenti: ["spirale", "#8a3fe0", "#ffd23f"],
  fee: ["onde", "#aee6ff", "#ffffff"],
  cosmo: ["vitesse", "#ffb300", "#ffffff"],
  abeille: ["lasso", "#ffd23f", "#111111"],
  chevalier: ["aura", "#2a8a5a", "#ffffff"],
  viking: ["onde", "#ffb347", "#ffffff"],
  dino: ["etoiles", "#ff9a3f", "#ffffff"],
  nuage: ["spirale", "#bfe6ff", "#ffffff"],
};

function dessinerEffetPouvoir() {
  const e = joueur && joueur.effet;
  if (!e || etat !== "jeu") return;
  const [forme, c1, c2] = e.spec;
  const t = e.t;
  const p = t / 45;                      // 0 au début, 1 à la fin
  const x = joueur.x;
  const y = joueur.y - 35;               // le milieu du corps
  ctx.save();
  ctx.globalAlpha = Math.max(0, 1 - p * p);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  if (forme === "toile") {
    // des fils de toile partent vers l'avant et forment une toile
    const bouts = [];
    for (let i = -2; i <= 2; i++) {
      const bx = x + 12 + t * 16;
      const by = y + i * t * 2.6;
      bouts.push([bx, by]);
      ctx.strokeStyle = c1;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x + 12, y);
      ctx.lineTo(bx, by);
      ctx.stroke();
    }
    ctx.strokeStyle = c2;
    ctx.lineWidth = 1.5;
    for (const k of [0.4, 0.7, 1]) {
      ctx.beginPath();
      bouts.forEach(([bx, by], i) => {
        const px = x + 12 + (bx - x - 12) * k;
        const py = y + (by - y) * k;
        if (i) ctx.lineTo(px, py); else ctx.moveTo(px, py);
      });
      ctx.stroke();
    }
  } else if (forme === "eclair") {
    // un éclair en zigzag
    const longueur = Math.min(t * 40, 520);
    for (const [couleur, largeur] of [[c1, 6], [c2, 2]]) {
      ctx.strokeStyle = couleur;
      ctx.lineWidth = largeur;
      ctx.beginPath();
      ctx.moveTo(x + 12, y);
      for (let d = 20; d < longueur; d += 20) ctx.lineTo(x + 12 + d, y + (d / 20 % 2 ? -1 : 1) * (6 + Math.random() * 10));
      ctx.stroke();
    }
  } else if (forme === "rayon") {
    const longueur = Math.min(t * 50, 600);
    ctx.fillStyle = c1;
    ctx.fillRect(x + 12, y - 8, longueur, 16);
    ctx.fillStyle = c2;
    ctx.fillRect(x + 12, y - 3, longueur, 6);
  } else if (forme === "onde") {
    for (const [couleur, rayon, largeur] of [[c1, p * 280, 8], [c2, p * 190, 4]]) {
      ctx.strokeStyle = couleur;
      ctx.lineWidth = largeur * (1 - p) + 1;
      ctx.beginPath();
      ctx.arc(x, y, rayon, 0, Math.PI * 2);
      ctx.stroke();
    }
  } else if (forme === "aura") {
    const rayon = 35 + p * 55;
    const lueur = ctx.createRadialGradient(x, y, 5, x, y, rayon);
    lueur.addColorStop(0, c2);
    lueur.addColorStop(0.5, c1);
    lueur.addColorStop(1, "rgba(255, 255, 255, 0)");
    ctx.globalAlpha *= 0.7;
    ctx.fillStyle = lueur;
    ctx.beginPath();
    ctx.arc(x, y, rayon, 0, Math.PI * 2);
    ctx.fill();
  } else if (forme === "flamme") {
    // des flammes sortent des pieds
    for (let i = -2; i <= 2; i++) {
      const bas = joueur.y + 20 + Math.random() * 25 + p * 20;
      ctx.fillStyle = i % 2 ? c1 : c2;
      ctx.beginPath();
      ctx.moveTo(x + i * 6 - 4, joueur.y - 4);
      ctx.lineTo(x + i * 6, bas);
      ctx.lineTo(x + i * 6 + 4, joueur.y - 4);
      ctx.fill();
    }
  } else if (forme === "etoiles") {
    // des étoiles montent depuis les pieds
    for (let i = 0; i < 10; i++) {
      const px = x + Math.cos(i * 1.3 + t * 0.2) * (12 + p * 40);
      const py = joueur.y - p * 90 - i * 5;
      ctx.fillStyle = i % 2 ? c1 : c2;
      ctx.beginPath();
      ctx.moveTo(px, py - 6);
      ctx.lineTo(px + 3, py);
      ctx.lineTo(px, py + 6);
      ctx.lineTo(px - 3, py);
      ctx.closePath();
      ctx.fill();
    }
  } else if (forme === "clones") {
    // des clones transparents derrière le personnage
    ctx.fillStyle = c1;
    for (const dx of [-45, -90, -135]) {
      ctx.globalAlpha = Math.max(0, 0.45 - p * 0.45);
      ctx.beginPath();
      ctx.roundRect(x + dx - 12, joueur.y - 50, 24, 34, 7);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(x + dx + 2, joueur.y - 60, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = c2;
      ctx.fillRect(x + dx - 8, joueur.y - 66, 20, 3);
      ctx.fillStyle = c1;
    }
  } else if (forme === "lasso") {
    // un grand lasso doré qui tourne autour du personnage
    ctx.strokeStyle = c1;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.ellipse(x, y, 30 + p * 90, 14 + p * 35, t * 0.35, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = c2;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(x, y, 26 + p * 80, 11 + p * 30, t * 0.35, 0, Math.PI * 2);
    ctx.stroke();
  } else if (forme === "boulet") {
    // un boulet (ou un ballon) part vers l'avant et laisse une traînée
    const bx = x + 20 + t * 24;
    ctx.strokeStyle = c2;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(bx - 50, y);
    ctx.lineTo(bx, y);
    ctx.stroke();
    ctx.fillStyle = c1;
    ctx.beginPath();
    ctx.arc(bx, y, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2;
    ctx.stroke();
  } else if (forme === "explosion") {
    // grosse explosion devant le personnage
    const rayon = 20 + p * 150;
    const lueur = ctx.createRadialGradient(x + 80, y, 5, x + 80, y, rayon);
    lueur.addColorStop(0, c2);
    lueur.addColorStop(0.6, c1);
    lueur.addColorStop(1, "rgba(255, 80, 0, 0)");
    ctx.fillStyle = lueur;
    ctx.beginPath();
    ctx.arc(x + 80, y, rayon, 0, Math.PI * 2);
    ctx.fill();
  } else if (forme === "spirale") {
    // des petites lumières tournent vers le personnage
    for (let i = 0; i < 14; i++) {
      const angle = i * 0.45 + t * 0.35;
      const rayon = (1 - p) * (40 + i * 9);
      ctx.fillStyle = i % 2 ? c1 : c2;
      ctx.beginPath();
      ctx.arc(x + Math.cos(angle) * rayon, y + Math.sin(angle) * rayon, 3.5, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (forme === "vitesse") {
    // lignes de vitesse derrière le personnage
    for (let i = -3; i <= 3; i++) {
      ctx.strokeStyle = i % 2 ? c1 : c2;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(x - 20, y + i * 11);
      ctx.lineTo(x - 40 - t * 7 - Math.abs(i) * 10, y + i * 11);
      ctx.stroke();
    }
  }
  ctx.restore();
}

function texteEtatPouvoir() {
  const pouvoir = POUVOIRS[skinPerso];
  if (!pouvoir) return "Pas de pouvoir";
  return pouvoir[0] + " ×" + texteNbPouvoirs(joueur && joueur.pouvoirs !== undefined ? joueur.pouvoirs : NB_POUVOIRS);
}

// Pouvoir du personnage équipé (nombre d'utilisations : NB_POUVOIRS)
function utiliserPouvoir() {
  if (!accueilEl.classList.contains("cache") || enPause || etat !== "jeu" || joueur.helico) return;
  const pouvoir = POUVOIRS[skinPerso];
  if (!pouvoir) return;
  if (joueur.pouvoirs <= 0) { sonEffet("refus"); return; }
  joueur.pouvoirs--;
  if (EFFETS_POUVOIR[skinPerso]) joueur.effet = { spec: EFFETS_POUVOIR[skinPerso], t: 0 };
  const genre = pouvoir[1];
  if (genre === "boum") {
    obstacles = [];
    compteur = 0;
    protection = Math.max(protection, 20);
  } else if (genre === "bouclier") {
    bouclier = DUREE_BOUCLIER;
  } else if (genre === "vol") {
    vol = 150;
    joueur.glisse = false;
  } else if (genre === "megasaut") {
    joueur.glisse = false;
    joueur.vy = -21;
  } else if (genre === "double") {
    bottes = DUREE_BOTTES;
  } else if (genre === "aimant") {
    joueur.aimant = 300;
  }
  sonEffet("bonus");
}

// ---------- Hélicoptère : il emmène le joueur à 2000 m en 2 secondes ----------
const DISTANCE_HELICO = 2000;
const IMAGES_HELICO = 120;   // 2 secondes à 60 images par seconde

function utiliserHelico() {
  if (!helicoAchete) return;   // il faut d'abord l'acheter sur la page d'accueil
  if (!accueilEl.classList.contains("cache") || enPause || etat !== "jeu") return;
  if (joueur.helico || vol > 0 || metres() >= DISTANCE_HELICO) return;
  joueur.helico = { t: 0, depart: score, cible: DISTANCE_HELICO * 6 };
  helicoAchete = false;   // il ne sert qu'une seule fois : pour le reprendre, il faut le racheter
  sauvegarder();
  afficherHelico();
  joueur.glisse = false;
  trajetFait = true;   // pas de trajet en voiture après l'arrivée
  sonEffet("bonus");
}

function mettreAJourHelico() {
  const h = joueur.helico;
  h.t++;
  obstacles = [];
  objets = [];
  pieces = [];
  const vitesseNormale = 6 + 1.5 * Math.floor(DISTANCE_HELICO / 500);
  if (h.t <= 25) {
    // l'hélicoptère arrive : le décor ralentit
    joueur.y = SOL;
    vitesse *= 0.92;
  } else if (h.t < 96) {
    // le joueur est monté : le décor défile très vite et la distance grimpe jusqu'à 2000 m
    joueurCache = true;
    joueur.y = SOL;
    const p = (h.t - 25) / 70;
    const douce = p * p * (3 - 2 * p);
    score = h.depart + (h.cible - h.depart) * douce;
    vitesse = 8 + 45 * Math.sin(Math.PI * p);
    scoreEl.textContent = metres();
  } else {
    // l'hélicoptère dépose le joueur, qui retombe sur la route
    if (h.t === 96) {
      joueurCache = false;
      joueur.y = SOL - 120;
      joueur.vy = 0;
    }
    joueur.vy += 0.8;
    joueur.y += joueur.vy;
    if (joueur.y > SOL) { joueur.y = SOL; joueur.vy = 0; }
    vitesse += (vitesseNormale - vitesse) * 0.2;
  }
  if (h.t >= IMAGES_HELICO) {
    score = h.cible;
    scoreEl.textContent = metres();
    joueur.helico = null;
    joueurCache = false;
    joueur.y = SOL;
    joueur.vy = 0;
    vitesse = vitesseNormale;
    protection = 60;   // un petit moment sans danger
    compteur = -20;
  }
}

// Dessin de l'hélicoptère (rouge, avec le joueur dans la cabine)
function dessinerHelico() {
  const h = joueur && joueur.helico;
  if (!h || etat !== "jeu") return;
  const t = h.t;
  const hauteur = SOL - 150;
  let y;
  if (t <= 25) {
    const p = t / 25;
    y = -60 + (hauteur + 60) * (1 - (1 - p) * (1 - p));
  } else if (t < 96) {
    y = hauteur + Math.sin(t / 6) * 3;
  } else {
    const p = (t - 96) / 24;
    y = hauteur - p * p * 320;   // il repart vers le haut
  }
  const x = joueur.x - 8;
  const a = Date.now() / 25;
  ctx.save();
  ctx.translate(x, y);
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  // patins
  ctx.strokeStyle = "#222";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-34, 30);
  ctx.lineTo(40, 30);
  ctx.moveTo(-18, 18);
  ctx.lineTo(-20, 30);
  ctx.moveTo(18, 18);
  ctx.lineTo(20, 30);
  ctx.stroke();
  // queue
  ctx.fillStyle = "#b8321e";
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-28, -8);
  ctx.lineTo(-88, -16);
  ctx.lineTo(-88, -6);
  ctx.lineTo(-28, 10);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  // hélice de queue
  ctx.strokeStyle = "#222";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-88, -11 - Math.sin(a) * 13);
  ctx.lineTo(-88, -11 + Math.sin(a) * 13);
  ctx.stroke();
  // cabine
  const carrosserie = ctx.createLinearGradient(0, -24, 0, 24);
  carrosserie.addColorStop(0, "#ff6a3d");
  carrosserie.addColorStop(1, "#c23b2a");
  ctx.fillStyle = carrosserie;
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.ellipse(0, 0, 40, 24, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  // vitre
  ctx.fillStyle = "#a8dcff";
  ctx.beginPath();
  ctx.ellipse(12, -4, 20, 14, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  if (joueurCache) dessinerPassager(10, -3);   // le joueur est dans l'hélicoptère
  // hélice principale qui tourne
  ctx.fillStyle = "#222";
  ctx.fillRect(-3, -34, 6, 12);
  const longueur = 80 * Math.abs(Math.cos(a)) + 14;
  ctx.strokeStyle = "rgba(40, 40, 40, 0.35)";
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.moveTo(-86, -36);
  ctx.lineTo(86, -36);
  ctx.stroke();
  ctx.strokeStyle = "#111";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(-longueur, -36);
  ctx.lineTo(longueur, -36);
  ctx.stroke();
  ctx.restore();
}

function sauter() {
  if (!accueilEl.classList.contains("cache")) return;  // sur la page d'accueil, on utilise START
  if (enPause || joueur.helico || etat === "arrestation") return;   // pendant l'arrestation, on regarde la scène
  if (etat === "finale") return;  // pendant la fin, les touches ne font rien
  if (etat !== "jeu") { recommencer(); return; }
  if (vol > 0) return;
  if (joueur.y >= SOL) {
    joueur.glisse = false;   // on peut sauter tout de suite, même en roulade
    joueur.saut2 = false;
    joueur.vy = -13;
    sonEffet("saut");
  } else if (bottes > 0 && !joueur.saut2) {
    joueur.saut2 = true;     // avec les bottes : un deuxième saut en l'air
    joueur.vy = -13;
    sonEffet("saut");
  }
}

function glisser() {
  if (enPause || etat !== "jeu" || vol > 0 || joueur.helico) return;
  if (joueur.y >= SOL && !joueur.glisse) {
    joueur.glisse = true;   // « glisse » veut dire ici : en roulade
    joueur.tempsGlisse = 40;
    sonEffet("roulade");
  }
}

document.addEventListener("keydown", (e) => {
  if (e.key.toLowerCase() === "p") { basculerPause(); return; }
  if (e.key.toLowerCase() === "q") {
    // Q = quitter tout de suite et retourner au menu (pendant la partie ou sur l'écran « Perdu »)
    if (accueilEl.classList.contains("cache")) ouvrirAccueil();
    return;
  }
  if (deuxJoueurs) { touchesDeuxJoueurs(e); return; }
  if (e.key.toLowerCase() === "m") utiliserPouvoir();
  if (e.key.toLowerCase() === "c") utiliserHelico();
  if (e.code === "Space") { e.preventDefault(); sauter(); }
  if (e.code === "ArrowDown") { e.preventDefault(); glisser(); }
});
document.getElementById("btnSaut").addEventListener("click", sauter);
document.getElementById("btnGlisse").addEventListener("click", glisser);
document.getElementById("btnStart").addEventListener("click", () => {
  if (accueilDeux) lancerPartie2(); else lancerPartie();
});
document.getElementById("btn2Joueurs").addEventListener("click", () => reglerAccueil(!accueilDeux));
document.getElementById("btnHelico").addEventListener("click", (e) => {
  e.currentTarget.blur();  // pour que la barre Espace ne le déclenche pas
  utiliserHelico();
});
document.getElementById("btnPouvoir").addEventListener("click", (e) => {
  e.currentTarget.blur();  // pour que la barre Espace ne le déclenche pas
  utiliserPouvoir();
});
document.getElementById("btnPause").addEventListener("click", (e) => {
  e.currentTarget.blur();  // pour que la barre Espace ne le déclenche pas
  basculerPause();
});
document.getElementById("btnAccueil").addEventListener("click", (e) => {
  e.currentTarget.blur();  // pour que la barre Espace ne le déclenche pas
  ouvrirAccueil();
});


function creerObstacle(x) {
  // "bas" : on saute par-dessus. "haut" : on glisse en dessous.
  // "pique" : des piques au sol, on saute par-dessus.
  // Tous les 500 mètres, de nouveaux obstacles arrivent :
  // "pile" (caisses empilées, dès 500 m) et "barriere" (dès 1000 m).
  const niveau = Math.floor(metres() / 500);
  const types = ["bas", "haut", "pique"];
  if (niveau >= 1) types.push("pile", "tonneau");
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
  if (o.type === "tonneau") return { x: o.x + 2, y: SOL - 55, w: o.w - 4, h: 55 };  // on saute par-dessus
  if (o.type === "barriere") return { x: o.x, y: SOL - 60, w: o.w, h: 25 };  // on saute dessus ou on glisse dessous
  return { x: o.x, y: SOL - 95, w: o.w, h: 50 }; // flotte : laisse le passage en bas
}

function touche(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function mettreAJour() {
  if (etat === "finale") { mettreAJourFinale(); return; }
  if (etat === "arrestation") { mettreAJourArrestation(); return; }
  if (etat !== "jeu") return;
  if (joueur.helico) { mettreAJourHelico(); return; }
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
  if (joueur.effet && ++joueur.effet.t > 45) joueur.effet = null;   // l'effet du pouvoir dure 45 images
  if (bottes > 0) bottes--;
  if (bouclier > 0) bouclier--;

  // un objet spécial apparaît parfois, au hasard, quand il n'y a pas d'obstacle à côté :
  // jetpack (voler), bottes (double saut) ou bouclier (protection)
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
  if (joueur.aimant > 0) {
    // l'aimant attire les pièces vers le personnage
    joueur.aimant--;
    for (const p of pieces) {
      const dx = joueur.x - p.x;
      const dy = joueur.y - 30 - p.y;
      const d = Math.hypot(dx, dy);
      if (d > 1 && d < 350) {
        p.x += (dx / d) * 9;
        p.y += (dy / d) * 9;
      }
    }
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
      etat = "arrestation";   // la police arrête le personnage, puis c'est l'écran « Perdu »
      joueur.arret = { t: 0 };
      joueur.glisse = false;
      sauvegarder();
      debutPerdu = Date.now();
      sonEffet("perdu");
      if (!deuxJoueurs) arreterMusique();   // en 2 joueurs, la musique continue pour l'autre joueur
      record = Math.max(record, metres());
      recordEl.textContent = record;
      ajouterScore(metres());
      break;
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
  if (c.cape) {
    // cape derrière le dos
    ctx.fillStyle = c.cape;
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 1.5;
    // la cape flotte : elle ondule et s'allonge quand le personnage court vite
    const onde = Math.sin(Date.now() / 90) * 5;
    ctx.beginPath();
    ctx.moveTo(-4, -48);
    ctx.lineTo(-18, -36 + onde * 0.5);
    ctx.lineTo(-30 - Math.abs(pas) * 5, -14 + onde);
    ctx.lineTo(-6, -16);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }
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
  } else if (skinPerso === "piko") {
    ctx.fillStyle = c.poche;                            // ventre orange clair
    ctx.beginPath();
    ctx.ellipse(1, -31, 9, 13, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = c.cheveux;                          // petite ceinture turquoise
    ctx.fillRect(-12, -22, 24, 4);
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

  if (skinPerso === "zorok") {
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
  } else if (skinPerso === "ninja") {
    // cagoule noire avec une bande rouge et une fente pour les yeux
    ctx.fillStyle = "#d81e2c";
    ctx.fillRect(-8, -68, 20, 4);
    ctx.fillStyle = "#f2d2a8";
    ctx.fillRect(3, -62, 9, 5);
    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.arc(8, -59.5, 1.6, 0, Math.PI * 2);
    ctx.fill();
  } else if (skinPerso === "robot") {
    // antenne, visière bleue et yeux lumineux
    ctx.strokeStyle = "#44505c";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(2, -70);
    ctx.lineTo(2, -78);
    ctx.stroke();
    ctx.fillStyle = Math.floor(Date.now() / 300) % 2 ? "#ff4a4a" : "#ffb0b0";
    ctx.beginPath();
    ctx.arc(2, -79, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = c.poche;
    ctx.fillRect(-3, -64, 17, 7);
    ctx.fillStyle = "#fff";
    ctx.fillRect(5, -62, 3, 3);
    ctx.fillRect(10, -62, 3, 3);
  } else if (skinPerso === "pirate") {
    // chapeau noir avec une tête de mort, cache-œil
    ctx.fillStyle = "#111";
    ctx.beginPath();
    ctx.moveTo(-10, -66);
    ctx.lineTo(2, -80);
    ctx.lineTo(14, -66);
    ctx.closePath();
    ctx.fill();
    ctx.fillRect(-12, -67, 28, 4);
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(2, -71, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.arc(7, -59, 3, 0, Math.PI * 2);   // cache-œil
    ctx.fill();
    ctx.strokeStyle = "#7a3a20";
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.arc(7, -55, 3, 0.2, Math.PI - 0.6);
    ctx.stroke();
  } else {
    // casquette
    ctx.fillStyle = c.cheveux;
    ctx.beginPath();
    ctx.arc(2, -62, 10.5, Math.PI, 0);
    ctx.fill();
    if (c.visiere) ctx.fillRect(6, -63, 13, 4);
    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.arc(7, -58, 1.8, 0, Math.PI * 2);
    ctx.fill();
    if (c.acc) dessinerAccessoire(c);
  }
}

// Détail de la tête des personnages connus (moustache, pointes, oreilles...)
function dessinerAccessoire(c) {
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 1.5;
  if (c.acc === "moustache") {
    ctx.fillStyle = "#3a1a0a";
    ctx.fillRect(4, -55, 9, 3);
    ctx.fillStyle = c.cheveux;                           // casquette avec visière
    ctx.fillRect(6, -63, 12, 3);
  } else if (c.acc === "pointes" || c.acc === "oreilles") {
    ctx.fillStyle = c.cheveux;
    const haut = c.acc === "pointes" ? 14 : 18;
    const decalages = c.acc === "pointes" ? [-7, 0, 7] : [-6, 6];
    for (const d of decalages) {
      ctx.beginPath();
      ctx.moveTo(d - 3, -66);
      ctx.lineTo(d + 2 + (c.acc === "oreilles" ? d / 3 : 0), -66 - haut);
      ctx.lineTo(d + 7, -66);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
    if (c.acc === "oreilles") {
      ctx.fillStyle = c.poche;                           // joue rouge
      ctx.beginPath();
      ctx.arc(8, -55, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (c.acc === "herisson") {
    // piquants turquoise rejetés vers l'arrière, petites oreilles rondes, museau clair et nez rose
    ctx.fillStyle = c.cheveux;
    for (const [bx, by, sx, sy] of [[-6, -68, -24, -78], [-2, -70, -20, -62], [0, -66, -22, -52], [2, -71, -8, -86], [6, -70, 4, -88]]) {
      ctx.beginPath();
      ctx.moveTo(bx - 4, by + 2);
      ctx.lineTo(sx, sy);
      ctx.lineTo(bx + 5, by + 4);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
    ctx.fillStyle = c.peau;
    ctx.beginPath();
    ctx.arc(8, -70, 4, 0, Math.PI * 2);                 // oreille
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = c.poche;
    ctx.beginPath();
    ctx.ellipse(10, -56, 7, 5, 0, 0, Math.PI * 2);      // museau
    ctx.fill();
    ctx.fillStyle = "#ff6b9a";
    ctx.beginPath();
    ctx.arc(15, -57, 2, 0, Math.PI * 2);                // nez
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(8, -61, 3, 0, Math.PI * 2);                 // œil
    ctx.fill();
    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.arc(9, -61, 1.4, 0, Math.PI * 2);
    ctx.fill();
  } else if (c.acc === "masque") {
    ctx.fillStyle = c.cheveux;
    ctx.fillRect(-8, -66, 20, 7);                        // cagoule jusqu'aux yeux
    ctx.beginPath();
    ctx.moveTo(-8, -66);
    ctx.lineTo(-6, -76);
    ctx.lineTo(-2, -66);
    ctx.moveTo(6, -66);
    ctx.lineTo(10, -76);
    ctx.lineTo(12, -66);
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.fillRect(5, -63, 5, 3);
  } else if (c.acc === "casque") {
    ctx.fillStyle = c.poche;                             // visière du casque
    ctx.fillRect(3, -64, 10, 8);
    ctx.strokeRect(3, -64, 10, 8);
    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.arc(8, -60, 1.6, 0, Math.PI * 2);
    ctx.fill();
  } else if (c.acc === "bandeau") {
    ctx.fillStyle = c.poche;
    ctx.fillRect(-8, -67, 21, 4);
  } else if (c.acc === "chapeau") {
    ctx.fillStyle = c.cheveux;                           // grand bonnet pointu
    ctx.beginPath();
    ctx.moveTo(-8, -66);
    ctx.lineTo(-20, -56);
    ctx.lineTo(10, -72);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  } else if (c.acc === "lunettes") {
    ctx.beginPath();
    ctx.arc(4, -59, 3, 0, Math.PI * 2);
    ctx.arc(11, -59, 3, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();                                     // cicatrice en éclair
    ctx.moveTo(1, -69);
    ctx.lineTo(3, -66);
    ctx.lineTo(1, -65);
    ctx.stroke();
  } else if (c.acc === "tresse") {
    ctx.fillStyle = c.cheveux;
    ctx.save();                                          // la tresse se balance
    ctx.translate(-9, -60);
    ctx.rotate(Math.sin(Date.now() / 100) * 0.25);
    ctx.beginPath();
    ctx.roundRect(-3.5, 0, 7, 24, 3);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  } else if (c.acc === "museau") {
    ctx.fillStyle = c.poche;
    ctx.beginPath();
    ctx.ellipse(12, -57, 7, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  } else if (c.acc === "joues") {
    ctx.fillStyle = c.poche;
    ctx.beginPath();
    ctx.arc(9, -55, 2.8, 0, Math.PI * 2);
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

// ---------- Animations des skins ----------
// Chaque skin a un style de mouvement. Le tempo et la hauteur des mouvements changent aussi d'un skin à l'autre.
const STYLES_ANIMATION = {
  normal: "normal", zorok: "vol", ninja: "ninja", robot: "robot", pirate: "lourd",
  grimpeur: "bondit", champion: "danse", piko: "tourbillon", ressort: "rebond", sauterelle: "rebond",
  lapin: "bondit", panthere: "glisse", aigle: "vol", plongeur: "vol", colosse: "lourd", dragonnet: "tourbillon",
  lynx: "ninja", lutin: "bondit", cubix: "robot", apprenti: "glisse", fee: "glisse", cosmo: "vol",
  abeille: "tourbillon", chevalier: "lourd", viking: "lourd", dino: "rebond", nuage: "danse",
};

// petit nombre tiré du nom du skin : il donne à chaque skin son propre tempo et sa propre hauteur de mouvement
function reglagesAnimation() {
  let h = 0;
  for (const lettre of skinPerso) h += lettre.charCodeAt(0);
  return {
    style: STYLES_ANIMATION[skinPerso] || "normal",
    tempo: 0.85 + (h % 7) * 0.06,
    ampli: 0.8 + (h % 5) * 0.12,
  };
}

// Place et incline le corps selon le style (le dessin est déjà au niveau des pieds) et renvoie le pas des jambes
function animerCourse(enLair) {
  const { style, tempo, ampli } = reglagesAnimation();
  const t = Date.now() * tempo;
  const v = Math.min(1, vitesse / 4);   // il bouge moins quand le décor ralentit
  let pas = Math.sin(t / 70) * v;
  if (enLair) {
    let penche = Math.max(-0.25, Math.min(0.25, joueur.vy * 0.015));
    if (style === "tourbillon") penche += Math.sin(t / 55) * 0.2;
    if (style === "danse") penche += Math.sin(t / 120) * 0.15;
    ctx.rotate(penche);
    if (style === "bondit" || style === "rebond") {
      // il s'étire quand il monte et s'aplatit quand il descend
      const etire = Math.max(-0.12, Math.min(0.12, -joueur.vy * 0.01)) * ampli;
      ctx.scale(1 - etire * 0.6, 1 + etire);
    }
    return pas;
  }
  if (style === "rebond") {
    const s = Math.abs(Math.sin(t / 110));
    ctx.translate(0, -s * 10 * ampli * v);
    ctx.scale(1 + 0.07 * (1 - s) * v, 1 - 0.07 * (1 - s) * v);   // il s'écrase à chaque contact avec le sol
  } else if (style === "bondit") {
    const s = Math.abs(Math.sin(t / 160));
    ctx.translate(0, -s * 14 * ampli * v);
    ctx.rotate(0.05 * v);
    pas *= 0.5;
  } else if (style === "glisse") {
    ctx.translate(0, -6 * ampli - Math.sin(t / 200) * 3);
    ctx.rotate(0.12 * v);
    pas *= 0.3;
  } else if (style === "vol") {
    ctx.translate(0, -10 * ampli - Math.sin(t / 180) * 4);
    ctx.rotate(0.15 * v);
    pas = 0.25;
  } else if (style === "lourd") {
    ctx.translate(0, -Math.abs(Math.sin(t / 90)) * 5 * ampli * v);
    ctx.rotate(Math.sin(t / 90) * 0.06 * v);
    pas = Math.sin(t / 90) * v;
  } else if (style === "ninja") {
    ctx.translate(0, 3);
    ctx.rotate(0.24 * v);
    pas = Math.sin(t / 50) * v;
  } else if (style === "robot") {
    ctx.translate(0, -(Math.floor(t / 120) % 2) * 2 * ampli);   // mouvements saccadés
    pas = Math.round(Math.sin(t / 90) * 2) / 2 * v;
  } else if (style === "danse") {
    ctx.translate(Math.sin(t / 140) * 3, -Math.abs(Math.sin(t / 140)) * 4 * ampli);
    ctx.rotate(Math.sin(t / 140) * 0.16);
  } else if (style === "tourbillon") {
    ctx.translate(0, -Math.abs(Math.sin(t / 70)) * 3 * v);
    ctx.rotate(0.07 * v + Math.sin(t / 55) * 0.12 * v);
  } else {
    ctx.translate(0, -Math.abs(Math.sin(t / 70)) * 3 * v);   // style normal : petit rebond et corps penché
    ctx.rotate(0.07 * v);
  }
  return pas;
}

// Traces et particules derrière le personnage, propres à chaque style
function effetsCourse(x, y, enLair) {
  const { style, tempo } = reglagesAnimation();
  const c = COULEURS_PERSO[skinPerso];
  const t = Date.now() * tempo;
  const couleur = c.poche || c.haut;
  ctx.save();
  if (style === "lourd" && !enLair) {
    // nuages de poussière à chaque pas lourd
    for (let i = 0; i < 3; i++) {
      const age = ((t / 6 + i * 20) % 60) / 60;
      ctx.fillStyle = "rgba(190, 160, 120, " + (0.45 * (1 - age)) + ")";
      ctx.beginPath();
      ctx.arc(x - 18 - age * 50, SOL - 4 - age * 10, 3 + age * 7, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (style === "ninja") {
    // images fantômes derrière lui
    for (const [dx, alpha] of [[24, 0.25], [48, 0.14]]) {
      ctx.fillStyle = "rgba(20, 20, 30, " + alpha + ")";
      ctx.beginPath();
      ctx.roundRect(x - dx - 12, y - 50, 24, 34, 7);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(x - dx + 2, y - 60, 10, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (style === "glisse" || style === "vol") {
    // traînée de lumière dans la couleur du skin
    ctx.strokeStyle = couleur;
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    for (let i = 0; i < 4; i++) {
      ctx.globalAlpha = 0.35 - i * 0.07;
      const dy = -12 - i * 12;
      const longueur = 30 + Math.sin(t / 90 + i) * 8;
      ctx.beginPath();
      ctx.moveTo(x - 16, y + dy);
      ctx.lineTo(x - 16 - longueur, y + dy);
      ctx.stroke();
    }
  } else if (style === "robot" && !enLair) {
    // petites étincelles près des pieds
    ctx.fillStyle = "#ffe14d";
    for (let i = 0; i < 3; i++) {
      if (Math.random() < 0.5) continue;
      ctx.fillRect(x - 10 - Math.random() * 14, SOL - 2 - Math.random() * 12, 2.5, 2.5);
    }
  } else if (style === "danse") {
    // des notes de musique montent au-dessus de la tête
    ctx.fillStyle = couleur;
    ctx.font = "bold 18px " + POLICE;
    for (let i = 0; i < 2; i++) {
      const age = ((t / 14 + i * 40) % 80) / 80;
      ctx.globalAlpha = 1 - age;
      ctx.fillText(i ? "♫" : "♪", x - 6 + Math.sin(age * 6 + i) * 14, y - 80 - age * 40);
    }
  } else if (style === "tourbillon") {
    // petits tourbillons de vent autour des pieds
    ctx.strokeStyle = "rgba(255, 255, 255, 0.6)";
    ctx.lineWidth = 2;
    for (let i = 0; i < 2; i++) {
      const a = t / 60 + i * Math.PI;
      ctx.beginPath();
      ctx.arc(x - 8, y - 6, 14 + i * 6, a, a + 2);
      ctx.stroke();
    }
  } else if (style === "bondit" && !enLair) {
    // petits ronds de couleur qui sautent derrière lui
    ctx.fillStyle = couleur;
    for (let i = 0; i < 3; i++) {
      const age = ((t / 8 + i * 25) % 60) / 60;
      ctx.globalAlpha = 0.6 * (1 - age);
      ctx.beginPath();
      ctx.arc(x - 20 - age * 40, SOL - 6 - Math.sin(age * Math.PI) * 14, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (style === "rebond" && !enLair) {
    // petites étoiles à chaque rebond
    ctx.fillStyle = couleur;
    const s = Math.abs(Math.sin(t / 110));
    if (s < 0.25) {
      ctx.globalAlpha = 1 - s * 4;
      for (const d of [-14, 0, 14]) ctx.fillRect(x + d - 18, SOL - 8 - Math.random() * 6, 3, 3);
    }
  }
  ctx.restore();
}

// ---------- Réaction quand on perd : chaque style a la sienne ----------
const DEFAITES = {
  rebond: "etourdi", bondit: "surpris", glisse: "fantome", vol: "toupie", lourd: "colere",
  ninja: "fumee", robot: "courtcircuit", danse: "triste", tourbillon: "sueur", normal: "normal",
};

// Place le corps (pieds en 0, 0) pendant la réaction : t compte les images
function animerDefaite(t) {
  const { style, tempo, ampli } = reglagesAnimation();
  const f = t * tempo;
  const mode = DEFAITES[style] || "normal";
  if (mode === "etourdi") {
    ctx.rotate(Math.sin(f / 5) * 0.25 * ampli);                       // il titube
  } else if (mode === "surpris") {
    ctx.translate(0, -Math.abs(Math.sin(f / 6)) * 18 * ampli);        // il sursaute
  } else if (mode === "fantome") {
    ctx.globalAlpha *= 0.55 + 0.25 * Math.sin(f / 8);                 // il devient transparent
    ctx.translate(0, -6 + Math.sin(f / 10) * 4);
  } else if (mode === "toupie") {
    ctx.translate(0, -30);                                            // il tourne sur lui-même
    ctx.rotate(f / 5);
    ctx.translate(0, 30);
  } else if (mode === "colere") {
    ctx.translate(Math.sin(f * 1.7) * 2 * ampli, -Math.abs(Math.sin(f / 3)) * 6 * ampli);   // il tape du pied
  } else if (mode === "fumee") {
    ctx.globalAlpha *= 0.35 + 0.65 * Math.abs(Math.cos(f / 8));       // il essaie de disparaître
  } else if (mode === "courtcircuit") {
    ctx.translate((Math.random() - 0.5) * 4 * ampli, 0);              // il grésille
    ctx.rotate((Math.random() - 0.5) * 0.12);
  } else if (mode === "triste") {
    ctx.translate(0, 3);                                              // il baisse la tête
    ctx.rotate(0.3 + Math.sin(f / 20) * 0.05);
  } else if (mode === "sueur") {
    ctx.translate(Math.sin(f * 1.5) * 3 * ampli, 0);                  // il tremble de peur
  } else {
    ctx.rotate(0.12);
  }
}

// Petits dessins autour du personnage pendant la réaction (étoiles, fumée, larmes...)
function decorDefaite(t) {
  const { style, tempo } = reglagesAnimation();
  const f = t * tempo;
  const mode = DEFAITES[style] || "normal";
  ctx.save();
  ctx.textAlign = "center";
  if (mode === "etourdi") {
    ctx.fillStyle = "#ffd23f";
    for (let i = 0; i < 3; i++) {
      const a = f / 4 + i * 2.1;
      const sx = 2 + Math.cos(a) * 16;
      const sy = -82 + Math.sin(a) * 5;
      ctx.beginPath();
      ctx.moveTo(sx, sy - 5);
      ctx.lineTo(sx + 2.5, sy);
      ctx.lineTo(sx, sy + 5);
      ctx.lineTo(sx - 2.5, sy);
      ctx.closePath();
      ctx.fill();
    }
  } else if (mode === "surpris") {
    ecrireTexte("!", 2, -90, 36, 5);
  } else if (mode === "fantome") {
    ecrireTexte("?", 16, -80, 28, 4);
  } else if (mode === "colere") {
    for (let i = 0; i < 2; i++) {
      const age = ((f / 2 + i * 15) % 30) / 30;
      ctx.fillStyle = "rgba(235, 235, 235, " + 0.7 * (1 - age) + ")";
      ctx.beginPath();
      ctx.arc(-8 + i * 20 + Math.sin(age * 6) * 3, -72 - age * 24, 3 + age * 5, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (mode === "fumee") {
    for (let i = 0; i < 6; i++) {
      const r = 14 + ((f / 2) % 20);
      const a = i * 1.05 + f / 20;
      ctx.fillStyle = "rgba(170, 170, 180, 0.5)";
      ctx.beginPath();
      ctx.arc(Math.cos(a) * r * 1.2, -30 + Math.sin(a) * r, 8 + (i % 3) * 2, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (mode === "courtcircuit") {
    ctx.strokeStyle = "#ffe14d";
    ctx.lineWidth = 2;
    for (let i = 0; i < 4; i++) {
      if (Math.random() < 0.4) continue;
      const sx = -14 + Math.random() * 30;
      const sy = -20 - Math.random() * 40;
      const a = Math.random() * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(sx + Math.cos(a) * 7, sy + Math.sin(a) * 7);
      ctx.stroke();
    }
    ctx.fillStyle = "rgba(120, 120, 130, 0.5)";
    ctx.beginPath();
    ctx.arc(2, -78 - ((f / 3) % 20), 4, 0, Math.PI * 2);
    ctx.fill();
  } else if (mode === "triste") {
    ctx.fillStyle = "#5ab0ff";
    for (let i = 0; i < 2; i++) {
      const age = ((f / 2 + i * 12) % 24) / 24;
      ctx.globalAlpha = 1 - age;
      ctx.beginPath();
      ctx.arc(9, -57 + age * 40, 2.3, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (mode === "sueur") {
    ctx.fillStyle = "#8ad4ff";
    for (let i = 0; i < 3; i++) {
      const age = ((f / 2 + i * 8) % 20) / 20;
      ctx.globalAlpha = 1 - age;
      ctx.beginPath();
      ctx.arc(2 + (i - 1) * 28 * age, -70 - age * 14 + age * age * 30, 2.6, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (mode === "normal") {
    ecrireTexte("...", 2, -84, 28, 4);
  }
  ctx.restore();
}

// Ombre douce posée sur la route. Le soleil est à droite : l'ombre est un peu décalée vers la gauche.
function ombreSol(x, largeur, alpha) {
  ctx.save();
  ctx.translate(x - largeur * 0.25, SOL + 4);
  ctx.scale(1, 0.18);
  const degrade = ctx.createRadialGradient(0, 0, 0, 0, 0, largeur);
  degrade.addColorStop(0, "rgba(0, 0, 0, " + alpha + ")");
  degrade.addColorStop(0.6, "rgba(0, 0, 0, " + alpha * 0.5 + ")");
  degrade.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = degrade;
  ctx.beginPath();
  ctx.arc(0, 0, largeur, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

// Lumière du soleil sur toute la scène : lueur chaude près du soleil, coins un peu plus sombres
function dessinerLumiere() {
  const paysage = paysages[paysageAffiche];
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  const soleil = ctx.createRadialGradient(620, 170, 20, 620, 170, canvas.width * 0.7);
  soleil.addColorStop(0, "rgba(" + paysage.halo + ", 0.16)");
  soleil.addColorStop(1, "rgba(" + paysage.halo + ", 0)");
  ctx.fillStyle = soleil;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.restore();
  const bords = ctx.createRadialGradient(canvas.width / 2, canvas.height / 2, canvas.height * 0.45, canvas.width / 2, canvas.height / 2, canvas.width * 0.6);
  bords.addColorStop(0, "rgba(0, 0, 0, 0)");
  bords.addColorStop(1, "rgba(0, 0, 0, 0.32)");
  ctx.fillStyle = bords;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function dessinerPersonnage() {
  const x = joueur.x;
  const y = joueur.y;
  const enLair = y < SOL - 3;
  if (joueurCache) return;  // il est dans la voiture

  // ombre sur la route
  const ecart = Math.min(1, (SOL - y) / 180);
  ombreSol(x, 40 - ecart * 16, 0.55 - ecart * 0.4);

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
  }

  if (vol > 0) dessinerJetpack(x - 25, y - 50, true);

  if (!joueur.glisse && !joueur.arret) effetsCourse(x, y, enLair || vol > 0);   // traces et particules propres à chaque skin
  ctx.save();
  if (joueur.glisse) {
    // roulade : il se met en boule et tourne vite
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
    if (joueur.arret) {
      // le personnage vient de se cogner : chaque style a sa réaction pendant que la police arrive
      const ta = joueur.arret.t;
      if (ta <= 50) animerDefaite(ta);
      dessinerCorps(0, enLair);
      if (ta <= 50) decorDefaite(ta);
    } else {
      // chaque skin a sa façon de bouger (le pas est calculé par son style d'animation)
      const pas = animerCourse(enLair || vol > 0);
      dessinerCorps(pas, enLair || vol > 0);
    }
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

// ---------- Arrestation : le personnage monte dans la voiture de police, puis il est en prison ----------
// joueur.arret.t compte les images : 0-50 la police arrive, 50-90 il monte dans la voiture,
// 90-170 la voiture repart, 140-170 l'écran s'assombrit, 170-230 la prison apparaît.
let decalPolice = 0;   // de combien la voiture de police avance pendant l'arrestation

function mettreAJourArrestation() {
  const a = joueur.arret;
  a.t++;
  if (a.t === 2 || a.t === 90) sonEffet("sirene");
  if (a.t <= 50) {
    // le personnage retombe s'il était en l'air, la police arrive
    joueur.vy += 0.8;
    joueur.y += joueur.vy;
    if (joueur.y > SOL) { joueur.y = SOL; joueur.vy = 0; }
  } else if (a.t <= 90) {
    // il saute dans la voiture de police
    const p = (a.t - 50) / 40;
    joueur.x = 200 - 70 * (p * p * (3 - 2 * p));
    joueur.y = SOL - Math.sin(Math.PI * p) * 25;
  }
  if (a.t > 90) joueurCache = true;   // il est dans la voiture
  if (a.t >= 230) {
    joueur.arret = null;
    joueur.prison = true;
    etat = "perdu";
    debutPerdu = Date.now();
  }
}

function calculerDecalPolice() {
  const a = joueur && joueur.arret;
  if (!a) { decalPolice = 0; return; }
  if (a.t <= 50) {
    const p = a.t / 50;
    decalPolice = 60 * (1 - (1 - p) * (1 - p));
  } else if (a.t <= 90) {
    decalPolice = 60;
  } else {
    const q = a.t - 90;   // la voiture accélère et sort de l'écran
    decalPolice = 60 + q * 2 + q * q * 0.35;
  }
}

// Cellule de prison : mur de briques, petite fenêtre, personnage avec un boulet, barreaux qui descendent
function dessinerPrison(prog) {
  const w = canvas.width;
  const h = canvas.height;
  ctx.save();
  ctx.globalAlpha = Math.min(1, prog * 2);
  const fond = ctx.createLinearGradient(0, 0, 0, h);
  fond.addColorStop(0, "#2a2a35");
  fond.addColorStop(1, "#08080d");
  ctx.fillStyle = fond;
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = "rgba(255, 255, 255, 0.06)";
  ctx.lineWidth = 2;
  for (let ligne = 0; ligne * 30 < SOL; ligne++) {
    for (let x = -(ligne % 2) * 30; x < w; x += 60) ctx.strokeRect(x, ligne * 30, 60, 30);
  }
  ctx.fillStyle = "#17171e";   // sol de la cellule
  ctx.fillRect(0, SOL, w, h - SOL);
  ctx.fillStyle = "#000";
  ctx.fillRect(0, SOL, w, 4);
  // petite fenêtre avec la lune
  const fx = w * 0.78;
  ctx.fillStyle = "#0b1d4a";
  ctx.fillRect(fx, 50, 70, 90);
  ctx.fillStyle = "#fffbe8";
  ctx.beginPath();
  ctx.arc(fx + 45, 85, 14, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#555";
  ctx.lineWidth = 4;
  ctx.strokeRect(fx, 50, 70, 90);
  // le personnage, triste, avec un boulet au pied
  ctx.save();
  ctx.translate(w * 0.12, SOL + 8);
  ctx.save();
  const tPrison = Date.now() / 16;   // en prison, il continue sa réaction en boucle
  animerDefaite(tPrison);
  dessinerCorps(0, false);
  decorDefaite(tPrison);
  ctx.restore();
  ctx.strokeStyle = "#333";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(8, -3);
  ctx.lineTo(28, -6);
  ctx.stroke();
  ctx.fillStyle = "#1a1a1a";
  ctx.beginPath();
  ctx.arc(36, -9, 9, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  // barreaux qui descendent
  const barres = Math.min(1, prog * 1.6);
  const metal = ctx.createLinearGradient(0, 0, 8, 0);
  metal.addColorStop(0, "#c8ccd4");
  metal.addColorStop(1, "#4a4f59");
  ctx.fillStyle = metal;
  for (let x = 18; x < w; x += 36) ctx.fillRect(x, 0, 8, h * barres);
  ctx.fillStyle = "#5a5f69";
  ctx.fillRect(0, 0, w, 14 * barres);
  ctx.fillRect(0, 140 * barres, w, 8);
  ctx.globalAlpha = 1;
  if (prog > 0.5) {
    ctx.textAlign = "center";
    ecrireTexte("En prison !", w / 2, 70, 46, 7);
  }
  ctx.restore();
}

// Par-dessus la scène : lumière de sirène, texte, fondu au noir, puis la prison
function dessinerArrestation() {
  const a = joueur && joueur.arret;
  if (a) {
    if (a.t < 170) {
      ctx.fillStyle = Math.floor(Date.now() / 150) % 2 ? "rgba(255, 0, 0, 0.12)" : "rgba(0, 80, 255, 0.12)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    if (a.t > 10 && a.t < 110) {
      ctx.textAlign = "center";
      ecrireTexte("Police ! Tu es arrêté !", canvas.width / 2, 110, 40, 6);
    }
    if (a.t >= 140) {
      ctx.fillStyle = "rgba(0, 0, 0, " + Math.min(1, (a.t - 140) / 30) + ")";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    if (a.t >= 170) dessinerPrison(Math.min(1, (a.t - 170) / 60));
  } else if (joueur && joueur.prison) {
    dessinerPrison(1);
  }
}

// La voiture de police saute par-dessus les obstacles posés au sol.
function sautPolice() {
  if (joueur && joueur.arret) return 0;   // pendant l'arrestation, elle ne saute plus
  let saut = 0;
  for (const o of obstacles) {
    if (o.type === "haut") continue;  // elle passe dessous
    const t = (180 - o.x) / 270;      // 0 quand l'obstacle approche, 1 quand il est passé
    if (t > 0 && t < 1) saut = Math.max(saut, Math.sin(Math.PI * t) * 105);
  }
  return saut;
}

function dessinerPolice() {
  ctx.save();
  ctx.translate(decalPolice, 0);   // pendant l'arrestation, la voiture avance jusqu'au personnage
  dessinerPoliceBase();
  ctx.restore();
}

function dessinerPoliceBase() {
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

  if (o.type === "tonneau") {
    // tonneau rouge avec deux bandes de métal et un signe de danger jaune
    ctx.fillStyle = "#d8322a";
    ctx.beginPath();
    ctx.roundRect(o.x, SOL - 55, o.w, 55, 8);
    ctx.fill();
    ctx.fillStyle = "#7a7a86";
    ctx.fillRect(o.x, SOL - 45, o.w, 5);
    ctx.fillRect(o.x, SOL - 15, o.w, 5);
    ctx.fillStyle = "#ffd23f";
    ctx.beginPath();
    ctx.moveTo(o.x + o.w / 2, SOL - 38);
    ctx.lineTo(o.x + o.w / 2 + 8, SOL - 22);
    ctx.lineTo(o.x + o.w / 2 - 8, SOL - 22);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.beginPath();
    ctx.roundRect(o.x, SOL - 55, o.w, 55, 8);
    ctx.stroke();
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
for (let i = 0; i < 90; i++) {
  etoiles.push({ x: (i * 197) % 2400, y: (i * 61) % 130, r: 0.8 + (i % 3) * 0.5 });
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

// Les 5 premiers paysages (Los Angeles d'abord, puis les 4 autres dans le désordre) sont dessinés à la main.
// Après, un tout nouveau paysage est inventé tous les 100 mètres : un fond ne revient jamais.
const NB_PAYSAGES_BASE = 5;
let graineDecor = 0;
const blocsPaysage = [0];   // blocsPaysage[n] = numéro du paysage des mètres 100n à 100n+99

// [nom, milieu, décor, particules, nuit, néon, neige, teinte]
const MODELES_PAYSAGE = [
  ["Plage tropicale", "mesas", "palmier", "aucune", false, false, false, 190],
  ["Canyon rouge", "mesas", "cactus", "poussiere", false, false, false, 15],
  ["Jungle", "pins", "sapin", "lucioles", false, false, false, 130],
  ["Prairie fleurie", "pins", "sapin", "aucune", false, false, false, 95],
  ["Volcan", "montagnes", "cactus", "poussiere", true, false, false, 5],
  ["Banquise", "montagnes", "sapinNeige", "neige", false, false, true, 200],
  ["Ville futuriste", "ville", "lampadaire", "aucune", true, true, false, 280],
  ["Port de nuit", "ville", "lampadaire", "aucune", true, false, false, 220],
  ["Savane", "mesas", "palmier", "poussiere", false, false, false, 40],
  ["Forêt d'automne", "pins", "sapin", "lucioles", false, false, false, 25],
  ["Village de montagne", "montagnes", "sapin", "aucune", false, false, false, 150],
  ["Nuit du désert", "mesas", "cactus", "lucioles", true, false, false, 250],
  ["Ville enneigée", "ville", "sapinNeige", "neige", false, false, true, 210],
  ["Fête foraine", "ville", "lampadaire", "lucioles", true, true, false, 320],
];
const MUSIQUE_MILIEU = { ville: 0, mesas: 1, pins: 2, montagnes: 3 };

// Invente un nouveau paysage (numéro n >= 5) : modèle et couleurs différents des précédents
function creerPaysage(n) {
  const rang = n - NB_PAYSAGES_BASE;
  const tour = Math.floor(rang / MODELES_PAYSAGE.length);
  // à chaque tour de la liste, l'ordre est mélangé et les couleurs changent
  const ordre = MODELES_PAYSAGE.map((_, i) => i)
    .sort((a, b) => alea(a + tour * 100 + graineDecor) - alea(b + tour * 100 + graineDecor));
  const [nom, milieu, decor, particules, nuit, neon, neige, teinteBase] = MODELES_PAYSAGE[ordre[rang % MODELES_PAYSAGE.length]];
  const h = Math.round(teinteBase + tour * 41 + alea(n + graineDecor) * 40 - 20 + 360) % 360;
  const hsl = (dh, s, l, a) => "hsla(" + ((h + dh + 360) % 360) + ", " + s + "%, " + l + "%, " + (a === undefined ? 1 : a) + ")";
  return {
    nom, milieu, decor, particules, neon,
    musique: neon ? 4 : MUSIQUE_MILIEU[milieu],
    ciel: nuit ? [hsl(0, 60, 8), hsl(30, 55, 35)] : [hsl(0, 55, neige ? 55 : 45), hsl(20, 70, 82)],
    etoiles: nuit,
    halo: nuit ? "220, 200, 255" : "255, 230, 160",
    soleil: nuit ? ["#fffbe8", "#d9d4ff"] : [hsl(40, 100, 88), hsl(20, 100, 62)],
    lune: nuit && alea(n + 77 + graineDecor) < 0.6,
    nuage: nuit ? "rgba(190, 150, 240, 0.25)" : "rgba(255, 255, 255, 0.4)",
    collines: hsl(0, 35, nuit ? 22 : neige ? 72 : 36),
    collines2: hsl(0, 38, nuit ? 17 : neige ? 66 : 30),
    brume: nuit ? "rgba(255, 120, 220, 0.25)" : "rgba(255, 255, 255, 0.4)",
    immeubles: hsl(10, 35, nuit ? 12 : neige ? 55 : 26),
    fenetres: milieu === "ville" ? (nuit ? hsl(180, 100, 72) : "#ffd86b") : null,
    sol: neige ? ["#f4f8ff", "#b9cde6"] : [hsl(0, 15, nuit ? 14 : 28), hsl(0, 20, nuit ? 6 : 12)],
    bordure: neige ? "#ffffff" : hsl(180, 60, 70),
    lignes: neige ? "#9db7d6" : (nuit ? hsl(180, 100, 70) : "#f5d94a"),
    particules,
  };
}

function nouvelleSuitePaysages() {
  graineDecor = Math.random() * 1000;
  blocsPaysage.length = 1;
  paysages.length = NB_PAYSAGES_BASE;   // on oublie les paysages inventés pendant la partie d'avant
  paysageAffiche = 0;
  paysagePrecedent = 0;
  fondu = 0;
}

function indicePaysage() {
  if (typeof score !== "number") return 0;
  const bloc = Math.floor(metres() / 100);
  while (blocsPaysage.length <= bloc) {
    const n = blocsPaysage.length;
    if (n < NB_PAYSAGES_BASE) {
      // les paysages 1 à 4 passent chacun une fois, dans un ordre tiré au hasard
      const restants = [1, 2, 3, 4].filter((i) => !blocsPaysage.includes(i));
      blocsPaysage.push(restants[Math.floor(alea(n + graineDecor) * restants.length)]);
    } else {
      paysages.push(creerPaysage(paysages.length));
      blocsPaysage.push(paysages.length - 1);
    }
  }
  return blocsPaysage[bloc];
}

function dessinerMontgolfiere(x, y, taille, couleur) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(taille, taille);
  ctx.fillStyle = couleur;
  ctx.beginPath();
  ctx.ellipse(0, 0, 18, 22, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(255, 255, 255, 0.7)";   // bande claire au milieu
  ctx.beginPath();
  ctx.ellipse(0, 0, 7, 22, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.ellipse(0, 0, 18, 22, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = "#333";                      // cordes et panier
  ctx.beginPath();
  ctx.moveTo(-10, 18);
  ctx.lineTo(-5, 34);
  ctx.moveTo(10, 18);
  ctx.lineTo(5, 34);
  ctx.stroke();
  ctx.fillStyle = "#8a5a2a";
  ctx.fillRect(-6, 34, 12, 8);
  ctx.strokeRect(-6, 34, 12, 8);
  ctx.restore();
}

// Rangée de silhouettes très lointaines et très pâles, derrière le milieu du paysage
function silhouettesLointaines(paysage) {
  const decal = defilement * 0.12;
  const largeurCase = 70;
  const premiere = Math.floor(decal / largeurCase) - 1;
  ctx.globalAlpha *= 0.4;
  ctx.fillStyle = paysage.immeubles;
  for (let i = premiere; i < premiere + Math.ceil(canvas.width / largeurCase) + 2; i++) {
    const w = 22 + alea(i + 20000) * 30;
    const h = 40 + alea(i + 20100) * 70;
    const x = i * largeurCase - decal;
    ctx.beginPath();
    if (paysage.milieu === "ville") {
      ctx.rect(x, SOL - h, w, h);
    } else if (paysage.milieu === "mesas") {
      ctx.moveTo(x - 6, SOL);
      ctx.lineTo(x + 3, SOL - h * 0.7);
      ctx.lineTo(x + w - 3, SOL - h * 0.7);
      ctx.lineTo(x + w + 6, SOL);
    } else {
      ctx.moveTo(x - 6, SOL);
      ctx.lineTo(x + w / 2, SOL - h * (paysage.milieu === "montagnes" ? 1.3 : 0.9));
      ctx.lineTo(x + w + 6, SOL);
    }
    ctx.closePath();
    ctx.fill();
  }
  ctx.globalAlpha /= 0.4;
}

// Petits objets au bord de la route, différents selon le paysage
function dessinerDetailsRoute(paysage) {
  const espace = 260;
  const decal = defilement * 0.5;
  const premier = Math.floor(decal / espace) - 1;
  for (let k = premier; k < premier + Math.ceil(canvas.width / espace) + 2; k++) {
    if (alea(k + 16000) < 0.35) continue;
    const x = k * espace - decal + alea(k + 16100) * 200;
    const choix = alea(k + 16200);
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#000";
    if (paysage.milieu === "ville") {
      if (choix < 0.5) {
        // panneau sur son poteau
        ctx.fillStyle = "#555";
        ctx.fillRect(x, SOL - 60, 4, 60);
        ctx.fillStyle = "hsl(" + Math.floor(alea(k + 16300) * 360) + ", 70%, 55%)";
        ctx.fillRect(x - 14, SOL - 82, 32, 22);
        ctx.strokeRect(x - 14, SOL - 82, 32, 22);
        ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
        ctx.fillRect(x - 9, SOL - 76, 22, 3);
        ctx.fillRect(x - 9, SOL - 70, 14, 3);
      } else {
        // bouche d'incendie
        ctx.fillStyle = "#d8322a";
        ctx.fillRect(x, SOL - 22, 12, 22);
        ctx.fillRect(x - 3, SOL - 16, 18, 6);
        ctx.beginPath();
        ctx.arc(x + 6, SOL - 22, 7, Math.PI, 0);
        ctx.fill();
        ctx.stroke();
      }
    } else if (paysage.milieu === "mesas") {
      // boule d'herbes sèches qui roule
      const angle = decal / 12 + k;
      ctx.strokeStyle = "#8a6a3a";
      ctx.beginPath();
      ctx.arc(x, SOL - 13, 12, 0, Math.PI * 2);
      for (let i = 0; i < 4; i++) {
        ctx.moveTo(x + Math.cos(angle + i * 0.8) * 12, SOL - 13 + Math.sin(angle + i * 0.8) * 12);
        ctx.lineTo(x - Math.cos(angle + i * 0.8) * 12, SOL - 13 - Math.sin(angle + i * 0.8) * 12);
      }
      ctx.stroke();
    } else if (paysage.milieu === "pins") {
      // champignon rouge à points blancs, avec une petite fleur à côté
      ctx.fillStyle = "#f4ead0";
      ctx.fillRect(x - 3, SOL - 10, 6, 10);
      ctx.fillStyle = "#d8322a";
      ctx.beginPath();
      ctx.ellipse(x, SOL - 10, 11, 8, 0, Math.PI, 0);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#fff";
      ctx.fillRect(x - 5, SOL - 15, 3, 3);
      ctx.fillRect(x + 2, SOL - 13, 3, 3);
      ctx.strokeStyle = "#2f7a4a";
      ctx.beginPath();
      ctx.moveTo(x + 22, SOL);
      ctx.lineTo(x + 22, SOL - 14);
      ctx.stroke();
      ctx.fillStyle = "hsl(" + Math.floor(alea(k + 16400) * 360) + ", 80%, 65%)";
      ctx.beginPath();
      ctx.arc(x + 22, SOL - 16, 4, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // petit bonhomme de neige
      ctx.fillStyle = "#fff";
      ctx.strokeStyle = "#6f88ad";
      ctx.beginPath();
      ctx.arc(x, SOL - 11, 11, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(x, SOL - 29, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#000";
      ctx.fillRect(x - 3, SOL - 32, 2, 2);
      ctx.fillRect(x + 2, SOL - 32, 2, 2);
      ctx.fillStyle = "#ff8a1a";
      ctx.beginPath();
      ctx.moveTo(x, SOL - 29);
      ctx.lineTo(x + 8, SOL - 27);
      ctx.lineTo(x, SOL - 26);
      ctx.fill();
    }
  }
}

// Petits détails posés au bord de la route : buissons, rochers ou tas de neige
function dessinerDetailSol(x, genre, taille) {
  if (genre === "palmier" || genre === "sapin") {
    ctx.fillStyle = genre === "palmier" ? "#2f7a4a" : "#1f6b3a";
    for (const [dx, r] of [[-12, 9], [0, 13], [13, 8]]) {
      ctx.beginPath();
      ctx.arc(x + dx * taille, SOL - 4, r * taille, Math.PI, 0);
      ctx.fill();
    }
  } else if (genre === "cactus") {
    ctx.fillStyle = "#8a5a2a";
    ctx.strokeStyle = "#4a2f12";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(x, SOL - 5 * taille, 14 * taille, 8 * taille, 0, Math.PI, 0);
    ctx.fill();
    ctx.stroke();
  } else if (genre === "sapinNeige") {
    ctx.fillStyle = "#ffffff";
    ctx.strokeStyle = "#9db7d6";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(x, SOL - 2, 24 * taille, 10 * taille, 0, Math.PI, 0);
    ctx.fill();
    ctx.stroke();
  }
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
    // la musique change avec le paysage (tous les 100 mètres)
    if ((etat === "jeu" || etat === "finale") && musiquePaysage !== blocMusique()) demarrerMusique();
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
    etoiles.forEach((e, i) => {
      if (e.x > canvas.width) return;
      // les étoiles scintillent doucement
      ctx.fillStyle = "rgba(255, 255, 255, " + (0.45 + 0.4 * Math.sin(t / 400 + i * 1.7)) + ")";
      ctx.beginPath();
      ctx.arc(e.x, e.y, e.r, 0, Math.PI * 2);
      ctx.fill();
    });
    // de temps en temps, une étoile filante
    const cycle = t % 7000;
    if (cycle < 700) {
      const q = cycle / 700;
      const sx = canvas.width * 0.8 - q * 350;
      const sy = 20 + q * 130;
      const trainee = ctx.createLinearGradient(sx, sy, sx + 70, sy - 30);
      trainee.addColorStop(0, "rgba(255, 255, 255, " + (1 - q) + ")");
      trainee.addColorStop(1, "rgba(255, 255, 255, 0)");
      ctx.strokeStyle = trainee;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(sx + 70, sy - 30);
      ctx.stroke();
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

  // montgolfières qui flottent doucement dans le ciel (le jour)
  if (!paysage.etoiles) {
    const decalBallon = defilement * 0.06;
    const premierBallon = Math.floor(decalBallon / 900) - 1;
    const couleursBallon = ["#e0262a", "#ffb300", "#3fa0ff", "#8a3fe0", "#2fb34a"];
    for (let k = premierBallon; k < premierBallon + Math.ceil(canvas.width / 900) + 2; k++) {
      if (alea(k + 15000) < 0.45) continue;
      const bx = k * 900 - decalBallon + alea(k + 15100) * 500;
      const by = 50 + alea(k + 15200) * 90 + Math.sin(t / 900 + k) * 6;
      dessinerMontgolfiere(bx, by, 0.6 + alea(k + 15300) * 0.5, couleursBallon[Math.floor(alea(k + 15400) * couleursBallon.length)]);
    }
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
  ctx.globalAlpha *= 0.55;   // rangée très lointaine, un peu transparente
  vagues(paysage.collines, 0.02, 160, 22);
  ctx.globalAlpha /= 0.55;
  vagues(paysage.collines, 0.05, 125, 28);
  vagues(paysage.collines2, 0.1, 80, 20);

  silhouettesLointaines(paysage);

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
    // chaque élément a sa propre taille et peut être retourné : deux palmiers ne se ressemblent pas
    const taille = 0.75 + alea(k + 7300) * 0.5;
    const miroir = alea(k + 7600) < 0.5 ? -1 : 1;
    ctx.save();
    ctx.translate(x + 100, SOL);
    ctx.scale(taille * miroir, taille);
    ctx.translate(-(x + 100), -SOL);
    if (paysage.decor === "palmier") dessinerPalmier(x + 100);
    if (paysage.decor === "cactus") dessinerCactus(x + 100);
    if (paysage.decor === "sapin") dessinerSapin(x + 100, false);
    if (paysage.decor === "sapinNeige") dessinerSapin(x + 100, true);
    if (paysage.decor === "lampadaire") dessinerLampadaire(x + 100);
    ctx.restore();
  }
  // petits buissons, rochers ou tas de neige entre les grands éléments
  const espaceDetail = 110;
  const premierDetail = Math.floor(decalPalmier / espaceDetail) - 1;
  for (let k = premierDetail; k < premierDetail + Math.ceil(canvas.width / espaceDetail) + 2; k++) {
    if (alea(k + 11000) < 0.4) continue;
    const dx = k * espaceDetail - decalPalmier + alea(k + 11100) * 90;
    dessinerDetailSol(dx, paysage.decor, 0.7 + alea(k + 11200) * 0.8);
  }

  dessinerDetailsRoute(paysage);

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
  // texture de la route : petits cailloux et fissures qui défilent avec elle
  const decalRoute = defilement;
  const premierGrain = Math.floor(decalRoute / 40) - 1;
  for (let k = premierGrain; k < premierGrain + Math.ceil(canvas.width / 40) + 2; k++) {
    const gx = k * 40 - decalRoute + alea(k + 13000) * 40;
    const gy = SOL + 12 + alea(k + 13100) * (canvas.height - SOL - 20);
    ctx.fillStyle = alea(k + 13200) < 0.5 ? "rgba(255, 255, 255, 0.10)" : "rgba(0, 0, 0, 0.25)";
    ctx.beginPath();
    ctx.ellipse(gx, gy, 2 + alea(k + 13300) * 4, 1.5 + alea(k + 13400) * 2, 0, 0, Math.PI * 2);
    ctx.fill();
    if (alea(k + 13500) < 0.12) {   // une fissure de temps en temps
      ctx.strokeStyle = "rgba(0, 0, 0, 0.3)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(gx, gy);
      ctx.lineTo(gx + 12, gy + 4);
      ctx.lineTo(gx + 20, gy - 2);
      ctx.stroke();
    }
  }
  // bord de trottoir rayé qui défile
  ctx.fillStyle = "rgba(0, 0, 0, 0.22)";
  for (let x = -(defilement % 60); x < canvas.width; x += 60) {
    ctx.fillRect(x, SOL - 3, 30, 5);
  }
  ctx.fillStyle = paysage.lignes;
  const decalLigne = defilement % 90;
  for (let x = -decalLigne; x < canvas.width; x += 90) {
    ctx.fillRect(x, 372, 45, 5);
  }
  // reflet du soleil sur la route (un peu comme sur de l'asphalte mouillé)
  const reflet = ctx.createLinearGradient(0, SOL, 0, canvas.height);
  reflet.addColorStop(0, "rgba(" + paysage.halo + ", 0.28)");
  reflet.addColorStop(1, "rgba(" + paysage.halo + ", 0)");
  ctx.save();
  ctx.fillStyle = reflet;
  ctx.beginPath();
  ctx.moveTo(590, SOL);
  ctx.lineTo(650, SOL);
  ctx.lineTo(700, canvas.height);
  ctx.lineTo(540, canvas.height);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

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
}

function dessiner() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  dessinerFond();
  dessinerOiseaux();

  calculerDecalPolice();
  dessinerPolice();
  for (const obj of objets) dessinerObjet(obj);
  for (const p of pieces) {
    ombreSol(p.x, 12, 0.3 * Math.max(0.2, 1 - (SOL - p.y) / 160));   // plus la pièce est haute, plus son ombre est pâle
    dessinerPiece(p);
  }
  for (const e of etincelles) {
    ctx.globalAlpha = e.vie / 20;
    ctx.fillStyle = "#ffd23f";
    ctx.beginPath();
    ctx.arc(e.x, e.y, 3, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  for (const o of obstacles) {
    ombreSol(o.x + o.w / 2, o.w * 0.9 + 12, o.type === "haut" ? 0.25 : 0.5);
    dessinerObstacle(o);
  }
  dessinerVoitureFuite();
  dessinerPersonnage();
  dessinerEffetPouvoir();
  dessinerHelico();
  dessinerLumiere();
  dessinerArrestation();

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
  ctx.fillStyle = "#000";
  ctx.beginPath();
  ctx.arc(x + 5, y, 1.8, 0, Math.PI * 2);
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
    dessinerDecorVoiture();
  }
  ctx.restore();
}

// Petits détails des voitures de sport : arc-en-ciel, cornet de glace, fusée
// ----- Décors des 20 voitures connues (dessinés par-dessus la voiture de sport) -----
function polygone(points, couleur) {
  ctx.fillStyle = couleur;
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  points.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}

function rond(x, y, r, couleur, contour) {
  ctx.fillStyle = couleur;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  if (contour) {
    ctx.strokeStyle = contour;
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }
}

// texte qui reste à l'endroit même quand la voiture roule vers la gauche
function texteVoiture(texte, x, y, couleur, taille) {
  ctx.save();
  ctx.translate(x, y);
  if (voiture && voiture.vers < 0) ctx.scale(-1, 1);
  ctx.fillStyle = couleur;
  ctx.font = "bold " + taille + "px Impact, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(texte, 0, 0);
  ctx.restore();
}

function eclairVoiture(x, y, couleur) {
  polygone([[x + 6, y - 10], [x - 2, y + 1], [x + 3, y + 1], [x - 4, y + 12], [x + 9, y - 2], [x + 4, y - 2]], couleur);
}

function flammeArriere(couleur) {
  ctx.fillStyle = couleur;
  ctx.beginPath();
  ctx.moveTo(0, SOL - 26);
  ctx.lineTo(-22 - Math.random() * 14, SOL - 22);
  ctx.lineTo(0, SOL - 18);
  ctx.fill();
}

// Décors des 20 voitures originales (dessinés par-dessus la voiture de sport)
const DECORS_VOITURE = {
  v_foudre: () => {
    eclairVoiture(58, SOL - 29, "#ffd23f");
    eclairVoiture(88, SOL - 29, "#ffd23f");
  },
  v_ombre: () => {
    // croissant de lune et petites étoiles
    rond(60, SOL - 28, 9, "#fffbe8");
    rond(64, SOL - 30, 8, "#3a2a6a");
    [[24, SOL - 34], [40, SOL - 24], [90, SOL - 32], [104, SOL - 24]].forEach(([x, y]) => rond(x, y, 1.8, "#fffbe8"));
  },
  v_coccinelle: () => {
    // pois noirs et petites antennes
    [[22, SOL - 33], [46, SOL - 24], [70, SOL - 34], [94, SOL - 25]].forEach(([x, y]) => rond(x, y, 4.5, "#111"));
    ctx.strokeStyle = "#111";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(108, SOL - 38);
    ctx.lineTo(118, SOL - 52);
    ctx.moveTo(100, SOL - 38);
    ctx.lineTo(104, SOL - 54);
    ctx.stroke();
    rond(118, SOL - 53, 2.5, "#111");
    rond(104, SOL - 55, 2.5, "#111");
  },
  v_jardin: () => {
    // bande d'herbe, fleurs et papillon
    ctx.fillStyle = "#2fa84a";
    ctx.fillRect(4, SOL - 22, 114, 5);
    [20, 46, 72, 98].forEach((x, i) => {
      rond(x, SOL - 30, 4.5, ["#ffd23f", "#ffffff", "#ff6b6b", "#8a3fe0"][i], "#000");
      rond(x, SOL - 30, 1.6, "#ff9a00");
    });
    polygone([[58, SOL - 70], [50, SOL - 78], [58, SOL - 66]], "#ff9a3f");
    polygone([[58, SOL - 70], [66, SOL - 78], [58, SOL - 66]], "#ffd23f");
  },
  v_neon: () => {
    // bandes lumineuses et flamme bleue
    ctx.shadowColor = "#3fe0ff";
    ctx.shadowBlur = 10;
    ctx.fillStyle = "#3fe0ff";
    ctx.fillRect(4, SOL - 37, 114, 2.5);
    ctx.fillStyle = "#ff3fd8";
    ctx.fillRect(4, SOL - 18, 114, 2.5);
    ctx.shadowBlur = 0;
    flammeArriere("rgba(63, 224, 255, 0.9)");
  },
  v_pompier: () => {
    // échelle sur le toit et gyrophare qui clignote
    ctx.strokeStyle = "#ccc";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(34, SOL - 72);
    ctx.lineTo(84, SOL - 72);
    ctx.moveTo(34, SOL - 78);
    ctx.lineTo(84, SOL - 78);
    for (let x = 40; x < 84; x += 10) {
      ctx.moveTo(x, SOL - 72);
      ctx.lineTo(x, SOL - 78);
    }
    ctx.stroke();
    ctx.fillStyle = Math.floor(Date.now() / 200) % 2 ? "#ffd23f" : "#ff6a3a";
    ctx.fillRect(56, SOL - 74, 10, 8);
    ctx.fillStyle = "#fff";
    ctx.fillRect(4, SOL - 32, 114, 3);
  },
  v_abeille: () => {
    // rayures noires et petites ailes
    ctx.fillStyle = "#111";
    [26, 52, 78, 104].forEach((x) => ctx.fillRect(x, SOL - 39, 7, 25));
    ctx.fillStyle = "rgba(210, 240, 255, 0.7)";
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(48, SOL - 76, 14, 7, -0.4, 0, Math.PI * 2);
    ctx.ellipse(70, SOL - 76, 14, 7, 0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  },
  v_flammes: () => {
    // grandes flammes orange et jaune sur le capot
    for (let i = 0; i < 5; i++) {
      polygone([[60 + i * 11, SOL - 15], [66 + i * 11, SOL - 36 + (i % 2) * 6], [74 + i * 11, SOL - 15]], i % 2 ? "#ffd23f" : "#ff7a1a");
    }
  },
  v_radar: () => {
    // antenne radar qui tourne sur le toit
    ctx.strokeStyle = "#333";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(60, SOL - 66);
    ctx.lineTo(60, SOL - 76);
    ctx.stroke();
    const a = Date.now() / 150;
    ctx.strokeStyle = "#3fe06a";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(60 - Math.cos(a) * 16, SOL - 78);
    ctx.lineTo(60 + Math.cos(a) * 16, SOL - 78);
    ctx.stroke();
    rond(60, SOL - 78, 3, "#3fe06a");
  },
  v_rallye: () => {
    // bande bleue, numéro et éclaboussures de boue
    ctx.fillStyle = "#1a3fa5";
    ctx.fillRect(4, SOL - 38, 114, 3);
    rond(60, SOL - 27, 9, "#fff", "#000");
    texteVoiture("8", 60, SOL - 23, "#1a3fa5", 12);
    [[18, SOL - 20], [30, SOL - 18], [100, SOL - 20], [110, SOL - 18]].forEach(([x, y]) => rond(x, y, 3, "rgba(90, 60, 30, 0.8)"));
  },
  v_rouille: () => {
    // taches de rouille et rapiéçage
    [[24, SOL - 33], [76, SOL - 30], [104, SOL - 35]].forEach(([x, y]) => rond(x, y, 4, "rgba(90, 40, 10, 0.7)"));
    ctx.fillStyle = "#8a8f99";
    ctx.fillRect(40, SOL - 37, 16, 10);
    ctx.strokeStyle = "#333";
    ctx.lineWidth = 1;
    ctx.strokeRect(40, SOL - 37, 16, 10);
    ctx.strokeStyle = "#333";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(2, SOL - 30);
    ctx.lineTo(-12, SOL - 44);
    ctx.lineTo(-12, SOL - 32);
    ctx.stroke();
  },
  v_f1: () => {
    ctx.fillStyle = "#111";
    ctx.fillRect(-6, SOL - 62, 18, 4);
    ctx.fillRect(2, SOL - 58, 3, 18);
    ctx.fillRect(112, SOL - 19, 20, 3);
    rond(60, SOL - 28, 7, "#fff", "#000");
    texteVoiture("1", 60, SOL - 24, "#000", 10);
  },
  v_kartpois: () => {
    [[24, SOL - 33], [46, SOL - 27], [72, SOL - 34], [96, SOL - 28]].forEach(([x, y]) => rond(x, y, 4.5, "#fff", "#000"));
    ctx.fillStyle = "#ffd23f";
    ctx.fillRect(112, SOL - 40, 6, 24);
  },
  v_licorne: () => {
    polygone([[98, SOL - 40], [110, SOL - 64], [108, SOL - 38]], "#ffd23f");
    ["#ff3b3b", "#ffd23f", "#4ade50", "#3fa0ff"].forEach((c, i) => {
      ctx.fillStyle = c;
      ctx.fillRect(4, SOL - 38 + i * 3, 114, 3);
    });
  },
  v_lapin: () => {
    // grandes oreilles roses, queue en pompon, joues
    polygone([[44, SOL - 66], [40, SOL - 94], [54, SOL - 66]], "#f4f4f4");
    polygone([[62, SOL - 66], [72, SOL - 94], [76, SOL - 66]], "#f4f4f4");
    polygone([[46, SOL - 68], [43, SOL - 88], [52, SOL - 68]], "#ffb0d0");
    polygone([[64, SOL - 68], [70, SOL - 88], [74, SOL - 68]], "#ffb0d0");
    rond(104, SOL - 24, 4, "#ff6b9a");
    rond(-4, SOL - 32, 8, "#ffffff", "#000");
  },
  v_herisson: () => {
    // piquants turquoise sur le toit et à l'arrière, museau clair devant
    for (let i = 0; i < 4; i++) {
      polygone([[8 + i * 7, SOL - 38], [-12 + i * 9, SOL - 50 - i * 5], [14 + i * 7, SOL - 40]], "#2fd0c0");
    }
    ctx.fillStyle = "#ffb347";
    ctx.fillRect(96, SOL - 36, 20, 8);
    rond(118, SOL - 26, 3, "#ff6b9a");
  },
  v_hibou: () => {
    // deux grands yeux sur le capot et deux touffes sur le toit
    rond(90, SOL - 31, 8, "#fff", "#000");
    rond(106, SOL - 31, 8, "#fff", "#000");
    rond(91, SOL - 31, 3.5, "#ffb300");
    rond(105, SOL - 31, 3.5, "#ffb300");
    polygone([[34, SOL - 66], [30, SOL - 80], [44, SOL - 66]], "#5a3213");
    polygone([[68, SOL - 66], [76, SOL - 80], [80, SOL - 66]], "#5a3213");
  },
  v_pizza: () => {
    // grosse pizza sur la porte : morceaux et rondelles rouges
    rond(62, SOL - 28, 11, "#ffd23f", "#8a4a10");
    ctx.strokeStyle = "#8a4a10";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(62, SOL - 39);
    ctx.lineTo(62, SOL - 17);
    ctx.moveTo(51, SOL - 28);
    ctx.lineTo(73, SOL - 28);
    ctx.stroke();
    [[57, SOL - 32], [68, SOL - 31], [58, SOL - 23], [67, SOL - 24]].forEach(([x, y]) => rond(x, y, 2.4, "#d8322a"));
  },
  v_etoiles: () => {
    // étoiles dorées qui brillent
    [[24, SOL - 33, 5], [48, SOL - 25, 4], [72, SOL - 34, 5], [96, SOL - 26, 4], [108, SOL - 36, 3]].forEach(([x, y, r], i) => {
      ctx.fillStyle = Math.floor(Date.now() / 300 + i) % 2 ? "#ffd23f" : "#fff3a0";
      ctx.beginPath();
      for (let k = 0; k < 10; k++) {
        const rr = k % 2 ? r * 0.45 : r;
        const a = -Math.PI / 2 + (k * Math.PI) / 5;
        ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
      }
      ctx.closePath();
      ctx.fill();
    });
  },
  v_dino: () => {
    // plaques sur le toit, queue pointue et petites dents
    for (let i = 0; i < 4; i++) {
      polygone([[34 + i * 14, SOL - 66], [41 + i * 14, SOL - 80 + (i % 2) * 4], [48 + i * 14, SOL - 66]], "#ff9a3f");
    }
    polygone([[2, SOL - 30], [-18, SOL - 22], [2, SOL - 20]], "#4ac860");
    ctx.fillStyle = "#fff";
    for (let i = 0; i < 3; i++) ctx.fillRect(110 + i * 4, SOL - 21, 3, 5);
  },
};

function dessinerDecorVoiture() {
  if (DECORS_VOITURE[skinVoiture]) {
    DECORS_VOITURE[skinVoiture]();
  } else if (skinVoiture === "arcenciel") {
    ["#ff3b3b", "#ffd23f", "#4ade50", "#3fa0ff"].forEach((couleur, i) => {
      ctx.fillStyle = couleur;
      ctx.fillRect(4, SOL - 36 + i * 3, 114, 3);
    });
  } else if (skinVoiture === "glace") {
    ctx.fillStyle = "#e0a85a";   // cornet
    ctx.beginPath();
    ctx.moveTo(52, SOL - 82);
    ctx.lineTo(66, SOL - 82);
    ctx.lineTo(59, SOL - 66);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.fillStyle = "#fff";      // boules de glace
    ctx.beginPath();
    ctx.arc(59, SOL - 86, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#ff5a8a";
    ctx.beginPath();
    ctx.arc(59, SOL - 96, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  } else if (skinVoiture === "fusee") {
    ctx.fillStyle = "#ff3b3b";   // nez rouge de fusée
    ctx.beginPath();
    ctx.moveTo(100, SOL - 38);
    ctx.quadraticCurveTo(122, SOL - 34, 122, SOL - 20);
    ctx.lineTo(122, SOL - 14);
    ctx.lineTo(108, SOL - 14);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#ff3b3b";   // ailerons
    ctx.beginPath();
    ctx.moveTo(8, SOL - 38);
    ctx.lineTo(-8, SOL - 52);
    ctx.lineTo(24, SOL - 40);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.fillStyle = "#ff9a00";   // flamme à l'arrière
    ctx.beginPath();
    ctx.moveTo(0, SOL - 30);
    ctx.lineTo(-14 - Math.random() * 12, SOL - 24);
    ctx.lineTo(0, SOL - 18);
    ctx.fill();
  }
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

// Quand on a perdu : deux boutons, Rejouer et Quitter
function afficherBoutonsFin() {
  const zone = document.getElementById("finPartie");
  const fin = accueilEl.classList.contains("cache") && (deuxJoueurs ? finDeuxJoueurs : etat === "perdu");
  zone.hidden = !fin;
  if (!fin) return;
  const r = toiles[0].getBoundingClientRect();
  zone.style.top = (deuxJoueurs ? window.innerHeight / 2 - 30 : r.top + r.height * 0.62) + "px";
}

document.getElementById("btnRejouer").addEventListener("click", (e) => {
  e.currentTarget.blur();
  if (deuxJoueurs) lancerPartie2(); else recommencer();
});
document.getElementById("btnQuitter").addEventListener("click", (e) => {
  e.currentTarget.blur();
  ouvrirAccueil();
});

function boucle() {
  afficherBoutonsFin();
  if (enPause) { requestAnimationFrame(boucle); return; }
  mettreAJourOiseaux();
  if (deuxJoueurs) {
    boucleDeuxJoueurs();
  } else {
    mettreAJour();
    dessiner();
    document.getElementById("pouvoir").textContent = texteEtatPouvoir();
  }
  requestAnimationFrame(boucle);
}

charger();
// Cadeau : tous les skins (personnages et voitures) sont débloqués
for (const skin of [...SKINS_PERSO, ...SKINS_VOITURE]) {
  if (!skinsAchetes.includes(skin.id)) skinsAchetes.push(skin.id);
}
sauvegarder();
// Cadeau : 1 milliard de pièces, donné une seule fois
try {
  if (!localStorage.getItem("cadeauMilliard")) {
    nbPieces += 1000000000;
    localStorage.setItem("cadeauMilliard", "oui");
    sauvegarder();
  }
} catch (e) { /* pas grave : pas de cadeau */ }
// Cadeau géant : un nombre énorme de pièces (1e150 = 1 suivi de 150 zéros), donné une seule fois
try {
  if (!localStorage.getItem("cadeauGeant")) {
    nbPieces += 1e150;
    localStorage.setItem("cadeauGeant", "oui");
    sauvegarder();
  }
} catch (e) { /* pas grave : pas de cadeau */ }
afficherBoutiques();
joueur = { x: 200, y: SOL, vy: 0, glisse: false, tempsGlisse: 0 };
obstacles = [];
boucle();
