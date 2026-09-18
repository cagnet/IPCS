Je souhaite créer un nouveau projet nommé provisoirement **IPCS — Interactive Pinball Circuit Simulator**.

L’objectif est de créer une application web permettant de **redessiner, éditer et simuler les schémas électriques de flippers électromécaniques**.

Le projet doit être indépendant de mes autres projets et avoir son propre dépôt Git.

## Stack technique

Pour le MVP :

- HTML
- CSS
- Vanilla JavaScript
- Modules ES6
- SVG pour tout le rendu du schéma
- Aucun framework front
- Aucun backend pour le moment
- Pas de React, Angular, Vue ou Blazor
- Pas de dépendance lourde

L’application doit pouvoir fonctionner localement comme une application web statique.

Le code doit être proprement découpé en modules et ne pas finir dans un unique gros fichier JavaScript.

Le moteur de simulation doit être totalement indépendant du rendu SVG.

---

# Objectif général

L’application doit permettre :

1. de créer un schéma électrique ;
2. de placer des composants sur une grille ;
3. de tracer des fils ;
4. d’associer des contacts à une bobine ;
5. de simuler l’état du circuit ;
6. de visualiser les fils et composants alimentés ;
7. de sauvegarder et recharger le schéma.

Le domaine ciblé est principalement celui des **flippers électromécaniques**, mais l’architecture ne doit pas empêcher une utilisation future pour d’autres machines électromécaniques.

---

# Interface générale

Créer une interface de type éditeur de schéma.

Organisation souhaitée :

```text
┌───────────────────────────────────────────────────────────────┐
│ Nouveau | Ouvrir | Sauver | Edition | Simulation | Zoom       │
├──────────────┬───────────────────────────────┬────────────────┤
│              │                               │                │
│ Bibliothèque │                               │ Propriétés     │
│ composants   │          SCHÉMA SVG           │                │
│              │                               │                │
│ Alimentation │                               │                │
│ Fil          │                               │                │
│ Bobine       │                               │                │
│ Contact NO   │                               │                │
│ Contact NC   │                               │                │
│              │                               │                │
├──────────────┴───────────────────────────────┴────────────────┤
│ Barre d'état : position, composant sélectionné, simulation    │
└───────────────────────────────────────────────────────────────┘
```

Le panneau central doit être un grand SVG interactif.

Prévoir :

- zoom ;
- déplacement du canvas ;
- sélection ;
- déplacement des composants ;
- rotation ;
- suppression ;
- undo/redo si raisonnablement simple ;
- affichage des propriétés du composant sélectionné.

---

# Architecture JavaScript

Je souhaite une structure proche de :

```text
src/
  model/
    Schematic.js
    Component.js
    PowerSource.js
    Coil.js
    Contact.js
    Wire.js
    WireStyle.js
    Junction.js

  simulation/
    CircuitSolver.js
    SimulationState.js

  editor/
    Editor.js
    SelectionManager.js
    DragManager.js
    WireDrawingManager.js
    ZoomManager.js
    GridManager.js

  rendering/
    SvgRenderer.js
    ComponentRenderer.js
    WireRenderer.js
    GridRenderer.js
    HighlightRenderer.js

  persistence/
    SchematicSerializer.js

  ui/
    PropertyPanel.js
    ComponentPalette.js

  app.js
```

Adapte cette structure si nécessaire, mais conserve clairement la séparation :

```text
Model
Simulation
Editor
Rendering
Persistence
UI
```

---

# Grilles

Il doit exister **deux niveaux de grille indépendants et paramétrables**.

## 1. Grille d’édition

Elle sert au snap des composants et des fils.

Paramètres minimum :

```js
snapGrid: {
    enabled: true,
    stepX: 10,
    stepY: 10,
    visible: true
}
```

Les valeurs doivent pouvoir être modifiées.

---

## 2. Grille de repérage

Elle correspond à ce que l’on retrouve sur les anciens plans de flippers.

Horizontalement :

```text
1 2 3 4 5 ... X
```

de gauche à droite.

Verticalement :

```text
A B C ... Z
```

mais **A doit être en bas du schéma** et les lettres doivent monter vers le haut.

Exemple :

```text
          1       2       3       4
      ┌───────┬───────┬───────┬───────┐
 D    │       │       │       │       │
      ├───────┼───────┼───────┼───────┤
 C    │       │       │       │       │
      ├───────┼───────┼───────┼───────┤
 B    │       │       │       │       │
      ├───────┼───────┼───────┼───────┤
 A    │       │       │       │       │
      └───────┴───────┴───────┴───────┘
```

Paramètres :

```js
referenceGrid: {
    enabled: true,
    visible: true,
    cellWidth: 200,
    cellHeight: 150
}
```

La position logique d’un composant doit être calculée automatiquement depuis sa position physique.

Exemple :

```text
R10.2 : H-17
```

Ne pas stocker `H-17` comme donnée principale : le calculer depuis les coordonnées SVG.

---

# Fils électriques

Un fil doit être une entité électrique indépendante.

Exemple :

```js
{
    id: "W42",
    styleId: "RED-WHITE",
    points: [
        { x: 100, y: 100 },
        { x: 250, y: 100 },
        { x: 320, y: 170 },
        { x: 500, y: 170 }
    ]
}
```

Les fils seront **majoritairement horizontaux et verticaux**, mais le modèle doit autoriser également les segments diagonaux.

Ne pas limiter le modèle à des segments orthogonaux.

Dans l’éditeur, privilégier néanmoins le tracé horizontal/vertical.

Prévoir par exemple :

```text
mode normal : horizontal/vertical privilégié
Shift : segment libre
```

ou l’inverse si cela simplifie l’ergonomie.

Le choix final doit être clairement documenté.

---

# Couleurs des fils

Un fil peut avoir :

- une couleur ;
- deux couleurs ;
- trois couleurs.

Les anciens flippers utilisent souvent des codes couleur avec des hachures.

Les combinaisons de couleurs sont réutilisables et leur nombre reste relativement limité.

Il faut donc distinguer :

```text
WireStyle
```

et :

```text
Wire
```

Exemple :

```js
wireStyles: [
    {
        id: "RED",
        colors: ["red"]
    },
    {
        id: "RED-WHITE",
        colors: ["red", "white"]
    },
    {
        id: "RED-WHITE-BLUE",
        colors: ["red", "white", "blue"]
    }
]
```

Deux fils utilisant `RED-WHITE` ne sont PAS nécessairement électriquement connectés.

Le style définit uniquement leur apparence.

Utiliser si possible des `SVG pattern` pour obtenir un rendu hachuré proche des schémas d’origine.

---

# Composants du MVP

Commencer uniquement avec :

```text
PowerSource
Coil
Contact NO
Contact NC
Wire
Junction
```

---

# PowerSource

Le composant PowerSource représente l’origine de l’alimentation électrique.

Il doit pouvoir posséder plusieurs sorties afin de permettre ultérieurement par exemple :

```text
6 VAC
24 VAC
115 VAC
```

Exemple :

```js
{
    id: "PS1",
    type: "powerSource",
    label: "Transformer",

    outputs: [
        {
            id: "24VAC",
            label: "24 VAC",
            voltage: 24,
            enabled: true
        }
    ],

    returnTerminal: {
        id: "RETURN"
    }
}
```

Pour le MVP, il n’est pas nécessaire de faire une simulation analogique précise.

On simule principalement :

```text
alimenté / non alimenté
circuit passant / circuit ouvert
```

---

# Bobines

Créer un composant Coil.

Exemple :

```js
{
    id: "R10",
    type: "coil",
    label: "10 POINT RELAY"
}
```

Une bobine peut commander plusieurs contacts.

---

# Contacts

Créer deux types :

```text
Normally Open
Normally Closed
```

Ils peuvent être contrôlés de deux façons :

```text
Manual
Coil
```

Exemple d’un contact manuel :

```js
{
    id: "START",
    type: "contact",
    contactType: "NO",
    controlType: "manual",
    label: "START SWITCH"
}
```

Exemple d’un contact commandé par une bobine :

```js
{
    id: "R10.2",
    type: "contact",
    contactType: "NC",
    controlType: "coil",
    controllerId: "R10",
    label: "10 POINT RELAY"
}
```

---

# État d’un contact

L’état ouvert/fermé doit être calculé.

Ne pas stocker directement l’état fermé comme donnée permanente.

Logique :

```text
NO non activé = ouvert
NO activé = fermé

NC non activé = fermé
NC activé = ouvert
```

Pour un contact manuel :

```text
activated = état manuel
```

Pour un contact contrôlé par une bobine :

```text
activated = bobine alimentée
```

---

# Association Bobine → Contacts

Une bobine peut posséder plusieurs contacts dispersés dans le schéma.

Exemple :

```text
R10
 ├── R10.1
 ├── R10.2
 ├── R10.3
 └── R10.4
```

L’association est logique et indépendante du câblage électrique.

Ne surtout pas considérer cette relation comme une connexion électrique.

Créer donc clairement deux notions :

```text
ElectricalConnection
LogicalRelation
```

ou une architecture équivalente.

Lorsque l’utilisateur sélectionne une bobine ou un de ses contacts :

- mettre en surbrillance la bobine ;
- mettre en surbrillance tous les contacts associés ;
- le composant sélectionné doit avoir une mise en évidence plus forte.

Optionnellement afficher des traits temporaires reliant la bobine aux contacts associés.

Ces traits ne doivent apparaître que pour l’aide visuelle et ne font pas partie du circuit.

---

# Composants SVG

Chaque composant doit avoir :

```text
id
type
label
position
rotation
terminals
```

Le label doit être affiché dans le sens du fil.

Horizontal :

```text
──────[ NO ]──────
       START
```

Vertical :

```text
       │
      [NO]
     START
       │
```

Le texte doit donc être orienté automatiquement selon l’orientation du composant.

---

# Connexions électriques

Le circuit doit être représenté comme un graphe.

Ne jamais déterminer la connectivité uniquement depuis les coordonnées SVG.

Deux fils peuvent se croiser sans être connectés.

Exemple :

```text
────────────
      │
      │
```

ne signifie pas automatiquement qu’il existe une connexion.

Une jonction doit être explicite.

Créer donc un composant ou nœud :

```text
Junction
```

avec une représentation SVG claire.

---

# Moteur de simulation

Le moteur doit être indépendant du SVG.

Principe :

1. partir d’une sortie active d’un PowerSource ;
2. parcourir les connexions électriques ;
3. traverser :
   - fils ;
   - jonctions ;
   - contacts fermés ;
   - composants conducteurs ;
4. arrêter la propagation sur un contact ouvert ;
5. déterminer les bobines alimentées ;
6. modifier l’état logique des contacts liés à ces bobines ;
7. recalculer le circuit ;
8. répéter jusqu’à stabilisation.

Il faut donc gérer les cascades :

```text
switch manuel
   ↓
relay A
   ↓
contact A
   ↓
relay B
   ↓
contact B
```

Prévoir une limite d’itérations pour éviter une boucle infinie.

Exemple :

```text
maxIterations = 100
```

Si le circuit ne converge pas, produire un message de diagnostic.

---

# Visualisation de la simulation

Le schéma doit rester lisible et conserver les couleurs originales des fils.

Ne pas remplacer simplement la couleur du fil par du rouge.

Lorsqu’un élément est alimenté, ajouter une surbrillance.

Par exemple :

```text
fil normal
────────────

fil alimenté
════════════
```

Le SVG peut utiliser un deuxième path plus large derrière le fil.

Prévoir au minimum :

```text
normal
powered
```

Mais préparer l’architecture pour éventuellement distinguer plus tard :

```text
HasVoltage
CurrentFlow
```

Ainsi on pourra différencier :

```text
fil sous tension avant un contact ouvert
```

et :

```text
courant circulant réellement dans une boucle fermée
```

Ce niveau avancé peut ne pas être complètement implémenté dans le premier MVP.

---

# Interaction en mode simulation

En mode Simulation :

- l’utilisateur peut cliquer sur un contact manuel ;
- son état change ;
- le moteur recalcule immédiatement tout le circuit ;
- les bobines alimentées sont mises en évidence ;
- leurs contacts changent d’état ;
- les fils alimentés sont mis en évidence ;
- les composants alimentés sont mis en évidence.

Les composants ne doivent pas être déplacés en mode simulation.

---

# Modes

Prévoir au minimum :

```text
EDIT
SIMULATION
```

Architecture extensible pour ajouter plus tard :

```text
DIAGNOSTIC
TRACE
```

---

# Trace / diagnostic futur

Ne pas obligatoirement implémenter maintenant, mais préparer le modèle pour qu’on puisse plus tard expliquer :

```text
START SWITCH
    ↓
10 POINT RELAY
    ↓
R10.2
    ↓
SCORE MOTOR
    ↓
SCORE REEL
```

Le moteur devra idéalement pouvoir conserver la provenance d’une activation.

---

# Sauvegarde

Le schéma doit pouvoir être exporté/importé sous forme JSON.

Utiliser éventuellement l’extension :

```text
.ipcs
```

mais le contenu reste du JSON.

Exemple :

```json
{
  "formatVersion": 1,
  "name": "Williams Jackpot 1971",
  "grid": {},
  "wireStyles": [],
  "components": [],
  "wires": [],
  "junctions": [],
  "relations": []
}
```

Ajouter obligatoirement :

```text
formatVersion
```

pour permettre l’évolution du format.

---

# Ergonomie

Le but est de reconstruire de grands schémas électriques.

L’éditeur doit donc être agréable pour une utilisation longue.

Priorités :

- snap rapide ;
- déplacement précis ;
- zoom fluide ;
- pan fluide ;
- création rapide des fils ;
- duplication ;
- rotation ;
- raccourcis clavier raisonnables ;
- palette simple ;
- panneau de propriétés ;
- conservation du contexte lors du zoom.

Le visuel doit être sobre et technique.

Le schéma lui-même doit ressembler autant que possible aux plans électriques d’origine.

---

# Important

Ne pas sur-concevoir le projet.

Je souhaite d’abord un MVP fonctionnel avec :

1. affichage de la double grille ;
2. ajout d’une alimentation ;
3. ajout d’une bobine ;
4. ajout d’un contact NO ;
5. ajout d’un contact NC ;
6. déplacement et rotation ;
7. création de fils avec 1/2/3 couleurs ;
8. jonctions explicites ;
9. association d’un contact à une bobine ;
10. surbrillance des relations bobine/contact ;
11. simulation simple ;
12. mise en évidence des fils/composants alimentés ;
13. sauvegarde/import JSON.

Le code doit être suffisamment propre pour faire évoluer progressivement l’application.

---

# Première étape demandée

Commence par :

1. créer la structure du projet ;
2. implémenter le modèle métier ;
3. créer l’éditeur SVG avec les deux grilles ;
4. créer les symboles SVG du MVP ;
5. permettre leur placement/déplacement ;
6. permettre le dessin des fils ;
7. implémenter les WireStyles ;
8. implémenter l’association Coil → Contact ;
9. implémenter ensuite le moteur de simulation ;
10. ajouter enfin import/export JSON.

Ajoute quelques exemples automatiques au démarrage, notamment un circuit simple :

```text
PowerSource
    ↓
Contact NO manuel
    ↓
Coil R1
    ↓
Return
```

et un second chemin utilisant un contact commandé par `R1`.

Cela permettra de valider immédiatement que :

```text
clic sur switch
→ R1 alimenté
→ contact R1 change d’état
→ second circuit activé
→ fils concernés mis en évidence
```

Je souhaite que tu produises directement les fichiers nécessaires et une première version fonctionnelle du projet.