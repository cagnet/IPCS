# IPCS — Interactive Pinball Circuit Simulator

MVP d’un éditeur et simulateur de schémas électromécaniques, en HTML/CSS/JavaScript natif et SVG.

## Lancer

Double-cliquez sur `index.html`. L’application fonctionne directement dans le navigateur, entièrement côté client, sans serveur et sans installation.

Les tests de développement du moteur peuvent être lancés avec `npm test`, mais Node.js n’est pas nécessaire pour utiliser IPCS.

## Utilisation

- **Nouveau** demande uniquement le nom, la marque, l’année et permet de choisir un PDF optionnel.
- Lorsque rien n’est sélectionné, le panneau droit **Propriétés** permet de régler les pas des deux grilles ainsi que la position, les dimensions, la visibilité et l’opacité du PDF.
- **Projet** permet ensuite de modifier les informations générales ou de remplacer le PDF.
- Le PDF est un calque du schéma : il suit le zoom et le panoramique. Sa position, ses dimensions, sa visibilité et son opacité de 0 à 100 % sont configurables.
- La première page du PDF est rendue directement dans un canvas avec Mozilla PDF.js : aucune barre d’outils ni zone grisée du lecteur PDF du navigateur n’est affichée.
- **Sauver** écrit un fichier local `.ipcs` avec tout l’avancement et le PDF embarqué. Sur les navigateurs ne proposant pas l’accès direct aux fichiers, il est téléchargé dans le dossier Téléchargements.
- **Ouvrir** recharge un fichier `.ipcs` et restaure le schéma, les styles, les relations et le fond PDF.
- En **Édition**, choisissez un composant puis cliquez sur le plan. Faites glisser pour déplacer, `R` pour tourner, `Suppr` pour supprimer et `Ctrl+D` pour dupliquer.
- Pour un fil, choisissez **Fil**, puis cliquez sur deux bornes. Le trajet privilégie l’horizontal/vertical. Maintenez `Maj` lors du second clic pour un segment diagonal libre.
- Les croisements de fils ne créent jamais de connexion : utilisez une **Jonction** explicite.
- En **Simulation**, cliquez sur un contact manuel. Les états et surbrillances sont recalculés immédiatement.
- Le fichier `.ipcs` exporté est du JSON versionné (`formatVersion: 1`).

Le moteur de simulation (`src/simulation`) ne dépend pas du DOM ni du rendu SVG.
