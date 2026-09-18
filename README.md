# IPCS — Interactive Pinball Circuit Simulator

MVP d’un éditeur et simulateur de schémas électromécaniques, en HTML/CSS/JavaScript natif et SVG.

## Lancer

Le projet est entièrement statique. Servez le dossier avec n’importe quel serveur HTTP local :

```powershell
npx serve .
```

Puis ouvrez l’adresse indiquée. Les tests du moteur se lancent avec `npm test`.

## Utilisation

- En **Édition**, choisissez un composant puis cliquez sur le plan. Faites glisser pour déplacer, `R` pour tourner, `Suppr` pour supprimer et `Ctrl+D` pour dupliquer.
- Pour un fil, choisissez **Fil**, puis cliquez sur deux bornes. Le trajet privilégie l’horizontal/vertical. Maintenez `Maj` lors du second clic pour un segment diagonal libre.
- Les croisements de fils ne créent jamais de connexion : utilisez une **Jonction** explicite.
- En **Simulation**, cliquez sur un contact manuel. Les états et surbrillances sont recalculés immédiatement.
- Le fichier `.ipcs` exporté est du JSON versionné (`formatVersion: 1`).

Le moteur de simulation (`src/simulation`) ne dépend pas du DOM ni du rendu SVG.
