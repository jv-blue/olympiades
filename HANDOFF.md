# 🏆 Olympiades — Fiche de handoff

Outil pour gérer une compétition multisports d'un weekend (12 joueurs, équipes
qui changent à chaque sport, classement individuel). **Une seule page HTML
autonome**, sans serveur ni dépendances.

---

## 🔗 Liens essentiels
- **App en ligne :** https://jv-blue.github.io/olympiades/
- **Dépôt GitHub :** https://github.com/jv-blue/olympiades (public)
- **Fichier source :** `/Users/thomasklein/Documents/Projects/olympiades/index.html`
- **Hébergement :** GitHub Pages (branche `main`, racine `/`)
- **Compte GitHub :** `jv-blue` · `gh` CLI installé via Homebrew et authentifié.

---

## ⚠️ LE point crucial à comprendre (cause n°1 des soucis)
L'app **n'a pas de serveur**. Chaque appareil stocke **ses propres données**
dans le `localStorage` de son navigateur (clé `olympiades_v4`).
→ **Conséquences :**
- Ce qui est généré/saisi sur l'ordi **n'apparaît PAS** sur le téléphone, et vice-versa.
- **Il faut UN SEUL appareil "maître"** (le téléphone) pour tout le weekend.
- Pour transférer d'un appareil à l'autre : ⚙️ Réglages → **Exporter** (fichier JSON)
  puis **Importer** sur l'autre appareil.

### Si "il n'y a pas de programme sur le téléphone"
C'est normal si on n'a pas généré **sur le téléphone**. Solution :
1. Ouvrir l'app sur le téléphone.
2. Onglet **📅 Programme** → bouton **« 🎲 Générer les équipes & le programme »**
   (ce bouton n'apparaît que tant que rien n'a été généré).
3. Le programme s'affiche et reste enregistré **sur le téléphone**.
   (Une fois généré, la régénération se fait dans ⚙️ Réglages → ⚠️ Zone de danger.)

---

## 🎮 Modèle de jeu (état actuel)
- **12 joueurs**, équipes **tirées au sort à chaque sport** (en évitant de reformer les mêmes binômes).
- Chaque sport = une **ligue (round-robin)** : toutes les équipes s'affrontent.
- **Score : 1 victoire = 1 point** (réglable) pour chaque joueur de l'équipe gagnante. Pas de match nul.
- **Classement individuel** = total des points de victoire.
- **Sports & formats :** Foot 6v6, Pétanque 2v2, Ping Pong 2v2, Badminton 2v2,
  Tir à l'arc 2v2, Volley 6v6, Volley piscine 3v3.
- **Ordre de jeu :** Foot → (4 sports 2v2 en parallèle) → Volley → Volley piscine.
- **Parallélisme 2v2 :** panneau ⚡ qui propose des créneaux (1 sport par terrain,
  jamais un joueur sur 2 terrains). Avec 12 joueurs, ~2 sports tournent en même temps
  (≈30 créneaux pour les 60 matchs 2v2). 3 simultanés est mathématiquement quasi impossible.
- **Règles rapides par sport** dans l'onglet 📖 Règles (éditable) :
  Pétanque 4 pts · Ping Pong 6 pts · Badminton 6 pts · Tir à l'arc 3 flèches/joueur ·
  Volley piscine 12 pts (change de côté à 6, plafond interdit) · Volley 21 pts · Foot premier à 5.

---

## 🧭 Les onglets
- **📅 Programme** — génération (si rien généré) + panneau ⚡ 2v2 + une carte de ligue
  par sport (classement + saisie des vainqueurs). Les sports 2v2 sont repliés par défaut.
- **📊 Classement** — classement individuel cumulé (Pts + nb de victoires).
- **📖 Règles** — règles de chaque sport, modifiables (bouton ✏️).
- **⚙️ Réglages** — joueurs, points/victoire, sports (taille 1v1→6v6, ordre via ↑/↓),
  Données (Export/Import), et **⚠️ Zone de danger** (Générer/Regénérer, Tout réinitialiser).

---

## 🔧 Comment modifier et redéployer
```bash
cd /Users/thomasklein/Documents/Projects/olympiades
# 1. éditer index.html
# 2. vérifier la syntaxe JS (optionnel mais recommandé) :
node -e "const fs=require('fs');const h=fs.readFileSync('index.html','utf8');fs.writeFileSync('/tmp/app.js',h.match(/<script>([\s\S]*)<\/script>/)[1]);" && node --check /tmp/app.js
# 3. publier :
export PATH="/opt/homebrew/bin:$PATH"
git add -A && git commit -m "..." && git push origin main
```
→ GitHub Pages se reconstruit en ~30–60 s. Rafraîchir la page sur le téléphone.
Si l'ancienne version persiste : attendre ~1 min (cache CDN) puis hard refresh.

---

## 🧱 Architecture technique
- **1 fichier** `index.html` (~32 Ko), HTML + CSS + JS *vanilla*, aucune dépendance, aucun build.
- **État** : un objet JS sauvegardé en `localStorage['olympiades_v4']`
  `{ players[12], pointsPerWin, terrains, games[{name,size,rules,teams,matches}], schedule }`.
- **Fonctions clés** : `makeTeams` (tirage équipes + variété des binômes),
  `roundRobin` (méthode du cercle), `build2v2Schedule` (planning parallèle, greedy équilibré + restarts),
  `standings`, `computeRanking`, et les `render*` (Program / Ranking / Rules / Config).
- **Migrations** : bumper `LS_KEY` (`olympiades_vN`) repart sur un état neuf.
  Les règles par défaut absentes sont re-remplies au chargement (par nom de sport).

---

## 🆘 Problèmes courants
| Symptôme | Cause / Solution |
|---|---|
| Pas de programme sur le tél | Générer **sur le téléphone** (Programme → bouton Générer). Données par appareil. |
| Ancienne version après une mise à jour | Cache CDN/navigateur : attendre ~1 min, recharger (hard refresh). |
| Tout a disparu | localStorage effacé. Restaurer via **Importer** si un export JSON existe ; sinon régénérer. |
| Scores pas synchronisés entre 2 tél | Normal (pas de serveur). Un seul appareil maître + Export/Import. |
| Hors-ligne ne marche pas après vidage cache | Pas de service worker. Ouvrir une fois **avec réseau**. (Voir TODO PWA.) |

---

## 💡 Pistes non implémentées (si besoin un jour)
- **PWA hors-ligne garanti** (service worker + manifest) pour ne dépendre d'aucun réseau sur place.
- **Synchro multi-appareils en direct** (nécessiterait un petit backend — ex. Firebase).
- **Page imprimable** (règles + programme) en secours papier.
- **Match nul** (volley/pétanque peuvent finir à égalité).
- **Verrouiller l'ordre** (interdire de commencer un sport tant que le précédent n'est pas fini).

---

*Dernière mise à jour : 27/06/2026. App développée itérativement avec Claude Code.*
