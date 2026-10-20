const bouton = document.getElementById("bouton");
const message = document.getElementById("message");
const play = document.getElementById("play");
const pageTitre = document.getElementById("page-titre");
const accueil = document.getElementById("accueil");
const start = document.getElementById("start");
const partie = document.getElementById("partie");

bouton.addEventListener("click", function () {
  message.textContent = "Bonjour !";
});

// Musique de piano faite avec le navigateur (aucun fichier à télécharger)
function jouerNote(audio, frequence, debut) {
  const son = audio.createOscillator();
  const volume = audio.createGain();
  son.type = "triangle";
  son.frequency.value = frequence;
  volume.gain.setValueAtTime(0.3, debut);
  volume.gain.exponentialRampToValueAtTime(0.001, debut + 1.2);
  son.connect(volume);
  volume.connect(audio.destination);
  son.start(debut);
  son.stop(debut + 1.2);
}

function lancerMusique() {
  const audio = new AudioContext();
  const melodie = [261.63, 329.63, 392.0, 523.25, 392.0, 329.63, 293.66, 349.23, 440.0, 349.23, 329.63, 293.66];
  let i = 0;
  setInterval(function () {
    jouerNote(audio, melodie[i % melodie.length], audio.currentTime);
    i = i + 1;
  }, 500);
}

play.addEventListener("click", function () {
  pageTitre.classList.add("cache");
  accueil.classList.remove("cache");
  lancerMusique();
});

start.addEventListener("click", function () {
  accueil.classList.add("cache");
  partie.classList.remove("cache");
  demarrerJeu();
});

// ----- Le jeu -----
const canvas = document.getElementById("jeu");
const dessin = canvas.getContext("2d");
const etat = document.getElementById("etat");
const boutonSauter = document.getElementById("sauter");
const boutonGlisser = document.getElementById("glisser");

const SOL = 250;
let joueur;
let obstacles;
let compteur;
let tombe;
let animation;
const boutonRejouer = document.getElementById("rejouer");

boutonRejouer.addEventListener("click", demarrerJeu);

function demarrerJeu() {
  cancelAnimationFrame(animation);
  joueur = { x: 100, y: SOL - 60, largeur: 40, hauteur: 60, vitesseY: 0, glisse: 0 };
  obstacles = [];
  compteur = 0;
  tombe = false;
  etat.textContent = "Évite les obstacles !";
  boucle();
}

function sauter() {
  if (!tombe && joueur.y + joueur.hauteur >= SOL && joueur.glisse === 0) {
    joueur.vitesseY = -13;
  }
}

function glisser() {
  if (!tombe && joueur.y + joueur.hauteur >= SOL) {
    joueur.glisse = 40;
  }
}

boutonSauter.addEventListener("click", sauter);
boutonGlisser.addEventListener("click", glisser);
document.addEventListener("keydown", function (evenement) {
  if (evenement.key === "ArrowUp") sauter();
  if (evenement.key === "ArrowDown") glisser();
});

function mettreAJour() {
  compteur = compteur + 1;

  // Le personnage saute ou glisse
  joueur.vitesseY = joueur.vitesseY + 0.7;
  joueur.y = joueur.y + joueur.vitesseY;
  if (joueur.glisse > 0) {
    joueur.glisse = joueur.glisse - 1;
    joueur.hauteur = 30;
  } else {
    joueur.hauteur = 60;
  }
  if (joueur.y + joueur.hauteur > SOL) {
    joueur.y = SOL - joueur.hauteur;
    joueur.vitesseY = 0;
  }

  // Un nouvel obstacle de temps en temps
  if (compteur % 90 === 0) {
    if (Math.random() < 0.5) {
      obstacles.push({ x: 800, y: SOL - 40, largeur: 30, hauteur: 40 });
    } else {
      obstacles.push({ x: 800, y: SOL - 65, largeur: 30, hauteur: 30 });
    }
  }

  // Les obstacles avancent vers le personnage
  for (const obstacle of obstacles) {
    obstacle.x = obstacle.x - 6;
    const touche =
      joueur.x < obstacle.x + obstacle.largeur &&
      joueur.x + joueur.largeur > obstacle.x &&
      joueur.y < obstacle.y + obstacle.hauteur &&
      joueur.y + joueur.hauteur > obstacle.y;
    if (touche) {
      tombe = true;
      etat.textContent = "Aïe ! Tu es tombé !";
    }
  }
  obstacles = obstacles.filter(function (obstacle) {
    return obstacle.x > -50;
  });
}

function dessiner() {
  dessin.clearRect(0, 0, 800, 300);

  // Le sol
  dessin.fillStyle = "gray";
  dessin.fillRect(0, SOL, 800, 50);

  // Les obstacles
  dessin.fillStyle = "saddlebrown";
  for (const obstacle of obstacles) {
    dessin.fillRect(obstacle.x, obstacle.y, obstacle.largeur, obstacle.hauteur);
  }

  // Le policier (il court derrière le personnage)
  const policierX = 30;
  const pas = Math.floor(compteur / 6) % 2 === 0 ? 0 : 6;
  dessin.fillStyle = "royalblue";
  dessin.fillRect(policierX, SOL - 60, 40, 45);
  dessin.fillStyle = "navy";
  dessin.fillRect(policierX + pas, SOL - 15, 15, 15);
  dessin.fillRect(policierX + 25 - pas, SOL - 15, 15, 15);
  dessin.fillStyle = "peachpuff";
  dessin.beginPath();
  dessin.arc(policierX + 20, SOL - 72, 12, 0, Math.PI * 2);
  dessin.fill();
  dessin.fillStyle = "navy";
  dessin.fillRect(policierX + 6, SOL - 90, 28, 8);

  // Le personnage
  dessin.fillStyle = "darkblue";
  if (tombe) {
    dessin.fillRect(joueur.x, SOL - 25, 60, 25);
    dessinerSixSeven();
  } else {
    dessin.fillRect(joueur.x, joueur.y, joueur.largeur, joueur.hauteur);
  }
}

// Un bonhomme apparaît et fait "six seven" avec ses mains
function dessinerSixSeven() {
  const x = 650;
  const mouvement = Math.floor(compteur / 8) % 2 === 0 ? 20 : -20;

  // Le corps et la tête
  dessin.fillStyle = "green";
  dessin.fillRect(x - 15, SOL - 60, 30, 50);
  dessin.fillStyle = "peachpuff";
  dessin.beginPath();
  dessin.arc(x, SOL - 75, 13, 0, Math.PI * 2);
  dessin.fill();

  // Les bras : un monte pendant que l'autre descend
  dessin.strokeStyle = "green";
  dessin.lineWidth = 8;
  dessin.beginPath();
  dessin.moveTo(x - 15, SOL - 50);
  dessin.lineTo(x - 35, SOL - 50 - mouvement);
  dessin.moveTo(x + 15, SOL - 50);
  dessin.lineTo(x + 35, SOL - 50 + mouvement);
  dessin.stroke();

  // Le texte
  dessin.fillStyle = "darkblue";
  dessin.font = "bold 28px Arial";
  dessin.textAlign = "center";
  dessin.fillText("SIX SEVEN !", x, SOL - 110);
}

function boucle() {
  if (!tombe) {
    mettreAJour();
  } else {
    compteur = compteur + 1;
  }
  dessiner();
  animation = requestAnimationFrame(boucle);
}
