<!-- 7f565a4c-fbf1-4725-aa26-6ea46d9669ec 6b0601c1-720b-4420-9587-03f8290887ed -->
# Refactoring incrémental du composant EventView

## Problème actuel

Le composant EventView fait 442 lignes avec trop de responsabilités. On va le refactorer par **micro-étapes testables**.

## Stratégie : Une fonction à la fois

### Étape 1 : Extraire la logique d'événement (useEventData)

#### 1.1 - Créer le hook vide

**Fichier** : `src/hooks/useEventData.ts`

Créer juste la structure de base avec un seul état.

```typescript
export const useEventData = (eventCode: string) => {
    const [arePartiesVisible, setArePartiesVisible] = useState(false);
    return { arePartiesVisible, setArePartiesVisible };
};
```

**Test** : 
1. `npm run build` - Vérifier que ça compile
2. **STOP** - Tester l'application : vérifier que la visibilité des parties fonctionne

#### 1.2 - Migrer checkEventExistence

Déplacer uniquement la fonction `checkEventExistence` dans le hook.

**Test** : 
1. `npm run build` - Vérifier que ça compile
2. **STOP** - Tester l'application : vérifier que la vérification d'événement fonctionne (redirection si mauvais code)

#### 1.3 - Migrer fetchEvent

Déplacer la fonction `fetchEvent` dans le hook.

**Test** : 
1. `npm run build` - Vérifier que ça compile
2. **STOP** - Tester l'application : vérifier que les données d'événement se chargent correctement

#### 1.4 - Migrer togglePartiesVisibility

Déplacer la logique de `handleEyeButtonClick` dans le hook.

**Test** : 
1. `npm run build` - Vérifier que ça compile
2. **STOP** - Tester l'application : vérifier que le bouton œil (toggle visibility) fonctionne

#### 1.5 - Ajouter isVerifying

Ajouter l'état `isVerifying` dans le hook.

**Test** : 
1. `npm run build` - Vérifier que ça compile
2. **STOP** - Tester l'application : vérifier que le loading/verification fonctionne

### Étape 2 : Extraire la logique de personnages (useCharacterManagement)

#### 2.1 - Créer le hook vide

**Fichier** : `src/hooks/useCharacterManagement.ts`

Créer avec juste les états de base.

```typescript
export const useCharacterManagement = () => {
    const [createdCharacter, setCreatedCharacter] = useState<any | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    return { createdCharacter, setCreatedCharacter, isEditing, setIsEditing };
};
```

**Test** : 
1. `npm run build` - Vérifier que ça compile
2. **STOP** - Tester l'application : vérifier que les personnages s'affichent

#### 2.2 - Migrer handleSaveCharacter

Déplacer uniquement cette fonction dans le hook.

**Test** : 
1. `npm run build` - Vérifier que ça compile
2. **STOP** - Tester l'application : vérifier que la sauvegarde de personnage fonctionne

#### 2.3 - Migrer handleUpdate

Déplacer la fonction `handleUpdate` dans le hook.

**Test** : 
1. `npm run build` - Vérifier que ça compile
2. **STOP** - Tester l'application : vérifier que l'édition de personnage fonctionne

#### 2.4 - Migrer handleDelete

Déplacer la fonction `handleDelete` dans le hook.

**Test** : 
1. `npm run build` - Vérifier que ça compile
2. **STOP** - Tester l'application : vérifier que la suppression fonctionne

#### 2.5 - Migrer handleClear

Déplacer la fonction `handleClear` dans le hook.

**Test** : 
1. `npm run build` - Vérifier que ça compile
2. **STOP** - Tester l'application : vérifier que le clear fonctionne

#### 2.6 - Migrer handleCharacterDeletion

Déplacer la fonction `handleCharacterDeletion` dans le hook.

**Test** : 
1. `npm run build` - Vérifier que ça compile
2. **STOP** - Tester l'application : vérifier que la suppression via callback fonctionne

### Étape 3 : Extraire la logique de groupes (usePartyManagement)

#### 3.1 - Créer le hook vide

**Fichier** : `src/hooks/usePartyManagement.ts`

Créer avec juste l'état parties.

```typescript
export const usePartyManagement = (eventCode: string) => {
    const [parties, setParties] = useState<Party[]>([]);
    return { parties, setParties };
};
```

**Test** : 
1. `npm run build` - Vérifier que ça compile
2. **STOP** - Tester l'application : vérifier que les groupes s'affichent

#### 3.2 - Migrer fetchParties

Déplacer uniquement cette fonction dans le hook.

**Test** : 
1. `npm run build` - Vérifier que ça compile
2. **STOP** - Tester l'application : vérifier que les groupes se chargent

#### 3.3 - Migrer handleClearEvent

Déplacer la fonction `handleClearEvent` dans le hook.

**Test** : 
1. `npm run build` - Vérifier que ça compile
2. **STOP** - Tester l'application : vérifier que le clear des parties fonctionne

#### 3.4 - Migrer updatePartiesInBackend

Déplacer la fonction `updatePartiesInBackend` dans le hook.

**Test** : 
1. `npm run build` - Vérifier que ça compile
2. **STOP** - Tester l'application : vérifier que la mise à jour backend fonctionne

#### 3.5 - Migrer swapCharacters

Déplacer la fonction `swapCharacters` dans le hook.

**Test** : 
1. `npm run build` - Vérifier que ça compile
2. **STOP** - Tester l'application : vérifier que le swap fonctionne (drag & drop)

#### 3.6 - Migrer moveCharacter

Déplacer la fonction `moveCharacter` dans le hook.

**Test** : 
1. `npm run build` - Vérifier que ça compile
2. **STOP** - Tester l'application : vérifier que le move fonctionne (drag & drop)

#### 3.7 - Migrer handleShuffle

Déplacer la fonction `handleShuffle` dans le hook.

**Test** : 
1. `npm run build` - Vérifier que ça compile
2. **STOP** - Tester l'application : vérifier que le shuffle fonctionne

### Étape 4 : Nettoyer EventView.tsx

#### 4.1 - Supprimer les fonctions migrées

Supprimer toutes les fonctions qui ont été déplacées dans les hooks.

**Test** : 
1. `npm run build` - Vérifier que ça compile
2. **STOP** - Tester l'application complète : vérifier que tout fonctionne

#### 4.2 - Simplifier les imports

Nettoyer les imports inutiles.

**Test** : 
1. `npm run build` - Vérifier que ça compile
2. **STOP** - Tester l'application complète : vérifier que tout fonctionne

## Avantages de cette approche

- Chaque étape est **testable immédiatement**
- Si quelque chose casse, on sait exactement où
- On peut s'arrêter à tout moment
- Pas de "big bang" risqué
- Progression visible (EventView devient plus court à chaque étape)

## Ordre d'exécution

1. Faire les étapes 1.1 à 1.5 (useEventData)
2. Tester l'application complète
3. Faire les étapes 2.1 à 2.6 (useCharacterManagement)
4. Tester l'application complète
5. Faire les étapes 3.1 à 3.7 (usePartyManagement)
6. Tester l'application complète
7. Faire les étapes 4.1 à 4.2 (nettoyage)
8. Test final complet

**Note** : On ne touche PAS aux composants pour l'instant. On se concentre uniquement sur l'extraction de la logique dans les hooks.

### To-dos

- [ ] Créer le composant CharacterCell.tsx avec props characterClass et children
- [ ] Créer CharacterCell.css avec les classes pour chaque type de personnage
- [ ] Refactorer CharacterTable.tsx pour utiliser CharacterCell
- [ ] Refactorer PartyTable.tsx pour utiliser CharacterCell
