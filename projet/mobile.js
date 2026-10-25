// Version mobile : réduit la page pour qu'elle tienne dans l'écran et ajoute les commandes
// tactiles du mode 2 joueurs. Sur un ordinateur (pas d'écran tactile), ce fichier ne fait rien.
(() => {
  const tactile = window.matchMedia("(pointer: coarse)");
  const racine = document.documentElement;
  const accueil = document.getElementById("accueil");
  const toilesJeu = [document.getElementById("jeu"), document.getElementById("jeu2")];
  const boutonHelico = document.getElementById("btnHelico");

  // Place réservée aux commandes (en pixels de l'écran), selon l'écran et le sens du téléphone
  const MARGES = {
    menu: { portrait: [0, 0, 0, 0], paysage: [0, 0, 0, 0] },
    jeu1: { portrait: [0, 0, 210, 0], paysage: [0, 150, 0, 150] },
    jeu2: { portrait: [120, 0, 170, 0], paysage: [0, 130, 0, 130] },
  };   // [haut, droite, bas, gauche]

  // Mode 2 joueurs : les mêmes touches que le clavier (le jeu lit e.key)
  const TOUCHES_DEUX = [
    { joueur: 1, nom: "Sauter", key: "z", code: "KeyW" },
    { joueur: 1, nom: "Roulade", key: "s", code: "KeyS" },
    { joueur: 1, nom: "Pouvoir", key: "a", code: "KeyQ" },
    { joueur: 1, nom: "Hélico", key: "c", code: "KeyC", helico: true },
    { joueur: 2, nom: "Sauter", key: "ArrowUp", code: "ArrowUp" },
    { joueur: 2, nom: "Roulade", key: "ArrowDown", code: "ArrowDown" },
    { joueur: 2, nom: "Pouvoir", key: "m", code: "Semicolon" },
    { joueur: 2, nom: "Hélico", key: "n", code: "KeyN", helico: true },
  ];

  let commandes = null;
  const boutons = [];

  function envoyerTouche(type, t) {
    document.dispatchEvent(new KeyboardEvent(type, { key: t.key, code: t.code, bubbles: true, cancelable: true }));
  }

  function relacher(b, doigt) {
    if (!b.doigts.delete(doigt) || b.doigts.size > 0) return;
    b.el.classList.remove("appuye");
    envoyerTouche("keyup", b.touche);
  }

  function relacherTout() {
    for (const b of boutons) for (const doigt of [...b.doigts]) relacher(b, doigt);
  }

  function creerCommandes() {
    commandes = document.createElement("div");
    commandes.id = "mobileCommandes";
    for (const joueur of [1, 2]) {
      const groupe = document.createElement("div");
      groupe.className = "mobile-groupe";
      groupe.dataset.joueur = joueur;
      const titre = document.createElement("span");
      titre.className = "mobile-titre";
      titre.textContent = "Joueur " + joueur;
      groupe.appendChild(titre);
      const rangee = document.createElement("div");
      rangee.className = "mobile-rangee";
      groupe.appendChild(rangee);
      for (const touche of TOUCHES_DEUX.filter((t) => t.joueur === joueur)) {
        const el = document.createElement("button");
        el.type = "button";
        el.tabIndex = -1;
        el.textContent = touche.nom;
        const b = { el, touche, doigts: new Set() };
        boutons.push(b);
        // un appui = une seule action ; chaque doigt est suivi à part pour pouvoir appuyer à deux
        el.addEventListener("pointerdown", (e) => {
          e.preventDefault();
          try { el.releasePointerCapture(e.pointerId); } catch (erreur) { /* déjà libéré */ }
          if (b.doigts.has(e.pointerId)) return;
          b.doigts.add(e.pointerId);
          if (b.doigts.size === 1) {
            el.classList.add("appuye");
            envoyerTouche("keydown", touche);
          }
        });
        for (const type of ["pointerup", "pointercancel", "pointerleave"]) {
          el.addEventListener(type, (e) => relacher(b, e.pointerId));
        }
        rangee.appendChild(el);
      }
      commandes.appendChild(groupe);
    }
    commandes.addEventListener("contextmenu", (e) => e.preventDefault());
    racine.appendChild(commandes);   // hors du <body> réduit : les commandes gardent leur vraie taille
  }

  // filets de sécurité : la touche est relâchée quoi qu'il arrive
  for (const type of ["pointerup", "pointercancel"]) {
    window.addEventListener(type, (e) => { for (const b of boutons) relacher(b, e.pointerId); });
  }
  window.addEventListener("blur", relacherTout);
  window.addEventListener("pagehide", relacherTout);
  document.addEventListener("visibilitychange", () => { if (document.hidden) relacherTout(); });

  function poserEchelle(s, marges, W, H) {
    const [haut, droite, bas, gauche] = marges;
    const variables = {
      "--s": s, "--u": 1 / s + "px",
      "--largeur": W / s + "px", "--hauteur": H / s + "px",
      "--marge-haut": haut / s + "px", "--marge-droite": droite / s + "px",
      "--marge-bas": bas / s + "px", "--marge-gauche": gauche / s + "px",
    };
    for (const nom in variables) racine.style.setProperty(nom, variables[nom]);
  }

  function mettreEnPage() {
    if (!tactile.matches) {
      relacherTout();
      racine.classList.remove("tactile", "mesure");
      return;
    }
    if (!commandes) creerCommandes();
    // taille de l'écran (et pas innerWidth, qui grandit si la page a dépassé avant d'être réduite)
    const W = racine.clientWidth;
    const H = racine.clientHeight;
    const sens = H >= W ? "portrait" : "paysage";
    const ecran = !accueil.classList.contains("cache") ? "menu" : document.body.classList.contains("deux") ? "jeu2" : "jeu1";
    if (ecran !== "jeu2") relacherTout();
    racine.classList.add("tactile");
    racine.dataset.ecran = ecran;
    racine.dataset.sens = sens;
    for (const b of boutons) {
      if (!b.touche.helico) continue;
      b.el.hidden = boutonHelico.hidden;   // comme le bouton Hélico des jeunes : seulement s'il est acheté
      if (b.el.hidden) for (const doigt of [...b.doigts]) relacher(b, doigt);
    }
    const marges = MARGES[ecran][sens];
    const zoneL = W - marges[1] - marges[3];
    const zoneH = H - marges[0] - marges[2];
    let s = 1;
    if (ecran === "menu") {
      // le menu défile en hauteur : on le réduit seulement s'il est trop large
      // (en portrait, au moins 440 px de large pour que le grand titre penché ne soit pas coupé)
      if (sens === "portrait") s = Math.min(1, W / 440);
      for (let i = 0; i < 4; i++) {
        poserEchelle(s, marges, W, H);
        const trop = accueil.scrollWidth / accueil.clientWidth;
        if (trop <= 1.001) break;
        s = s / trop;
      }
    } else {
      // on mesure la page à sa taille d'ordinateur, puis on la réduit pour qu'elle tienne dans la zone libre
      const largeurToile = Math.max(...toilesJeu.filter((t) => !t.hidden).map((t) => t.width + 8));
      const largeur = largeurToile + 24;
      racine.style.setProperty("--largeur-mesure", largeur + "px");
      racine.classList.add("mesure");
      const hauteur = document.body.scrollHeight;
      racine.classList.remove("mesure");
      s = Math.min(1, zoneL / largeur, zoneH / hauteur);
      poserEchelle(s, marges, W, H);
    }
    // les boutons Rejouer / Quitter : même place que dans le jeu, mais dans la page réduite
    const visibles = toilesJeu.filter((t) => !t.hidden).map((t) => t.getBoundingClientRect());
    let haut = visibles[0].top + visibles[0].height * 0.62;
    if (visibles.length === 2) haut = (visibles[0].bottom + visibles[1].top) / 2 - 30 * s;
    racine.style.setProperty("--fin-haut", haut / s + "px");
  }

  let prevu = false;
  function planifier() {
    if (prevu) return;
    prevu = true;
    requestAnimationFrame(() => { prevu = false; mettreEnPage(); });
  }

  const observateur = new MutationObserver(planifier);
  observateur.observe(accueil, { attributes: true, attributeFilter: ["class"] });
  observateur.observe(document.body, { attributes: true, attributeFilter: ["class"] });
  observateur.observe(boutonHelico, { attributes: true, attributeFilter: ["hidden"] });
  for (const t of toilesJeu) observateur.observe(t, { attributes: true, attributeFilter: ["width", "hidden"] });
  window.addEventListener("resize", planifier);
  window.addEventListener("orientationchange", planifier);
  document.addEventListener("fullscreenchange", planifier);
  if (window.visualViewport) window.visualViewport.addEventListener("resize", planifier);
  tactile.addEventListener("change", planifier);
  mettreEnPage();
})();
