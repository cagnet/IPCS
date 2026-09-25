# Migration IPCS vers IPCSX

## Sécurité et retour arrière

La dernière version SVG historique est conservée sur la branche Git distante
`backup/svg-v1-2026-09-25` au commit `54c22d3`.

La nouvelle version travaille sur la branche `codex/canvas-ipcsx-v2`. Un fichier
`.ipcs` ouvert n'est jamais écrasé : il est converti en mémoire et la commande
de sauvegarde propose un nouveau fichier `.ipcsx`.

## Format IPCSX version 2

Un fichier `.ipcsx` est un conteneur ZIP non compressé comprenant :

- `project.json`, qui contient les composants, styles, grilles et réseaux ;
- `background.bin`, lorsque le projet possède un PDF ou une image de fond.

Le PDF n'est donc plus encodé en Base64 dans le JSON du projet. L'historique
d'annulation ne duplique plus cette ressource.

## Conversion des fils

Les anciennes portions de fils sont regroupées en réseaux électriques. Chaque
réseau conserve ses segments, identifiants, coordonnées, styles, descriptions et
ordre historique. Les connecteurs distants deviennent des liaisons virtuelles du
réseau. Aucun tracé n'est recalculé pendant la migration.

L'éditeur reconstruit encore une vue compatible des segments afin de conserver
toutes les commandes d'édition et le moteur de simulation actuel. La simulation
sera repensée séparément dans une phase ultérieure.
