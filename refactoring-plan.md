# Plan de Refactoring EventView - Version Réelle

## État actuel
Le composant EventView a été refactoré avec succès en utilisant des hooks personnalisés et des sous-composants.

## ✅ Phases terminées

### Phase 1 : Refactoring des hooks (TERMINÉE)
- **Phase 1.1** : Refactor useCharacterManagement to be self-contained ✅
- **Phase 1.2** : Refactor usePartyManagement to be self-contained ✅  
- **Phase 1.3** : Optimize useEventData comments (translate to English, remove duplicates) ✅

### Phase 2 : Création des composants (TERMINÉE)
- **Phase 2.1** : Create RoleSection component ✅
- **Phase 2.2** : Create EventHeader component ✅

## 🎯 Prochaines phases disponibles

### Phase 2.3 : Créer WaitingRoomHeader
**Objectif** : Créer un composant pour la section "Waiting Room" avec le titre et le bouton Clear

**Fichiers à créer** :
- `src/components/EventView/WaitingRoomHeader/WaitingRoomHeader.tsx`
- `src/components/EventView/WaitingRoomHeader/WaitingRoomHeader.css`

**Props nécessaires** :
- `characters: Character[]`
- `isAuthenticated: boolean`
- `onClear: (characters: Character[]) => void`

### Phase 2.4 : Créer WaitingRoom
**Objectif** : Créer un composant qui utilise RoleSection pour afficher les 4 tables de rôles

**Fichiers à créer** :
- `src/components/EventView/WaitingRoom/WaitingRoom.tsx`
- `src/components/EventView/WaitingRoom/WaitingRoom.css`

**Props nécessaires** :
- `tanks: Character[]`
- `heals: Character[]`
- `melees: Character[]`
- `dist: Character[]`
- `isAuthenticated: boolean`
- `onDelete: (id: number) => Promise<void>`
- `onUpdate: (character: any) => void`
- `highlightedId: number | undefined`

### Phase 2.5 : Refactorer EventView final
**Objectif** : Utiliser tous les nouveaux composants dans EventView.tsx

**Changements** :
- Remplacer la section "Waiting Room" par `<WaitingRoomHeader />`
- Remplacer les 4 tables de rôles par `<WaitingRoom />`
- Simplifier EventView.tsx

## 🔧 To-dos techniques

### CharacterCell (Optionnel)
- Créer le composant CharacterCell.tsx avec props characterClass et children
- Créer CharacterCell.css avec les classes pour chaque type de personnage
- Refactorer CharacterTable.tsx pour utiliser CharacterCell
- Refactorer PartyTable.tsx pour utiliser CharacterCell

### Optimisations TypeScript
- Replace all 'any' types with proper TypeScript interfaces
- Add JSDoc comments and comprehensive documentation

### Optimisations performance
- Extract character filtering to useCharactersByRole hook with memoization
- Add refetch function to useFetchCharacters hook
- Move verification logic to useEventData hook

## 📊 État actuel du code

### EventView.tsx (208 lignes)
- ✅ Utilise useEventData, useCharacterManagement, usePartyManagement
- ✅ Utilise EventHeader pour la section "Event running"
- ✅ Utilise RoleSection pour les 4 tables de rôles
- ❌ Section "Waiting Room" encore en dur
- ❌ Tables de rôles répétitives

### Hooks créés
- ✅ `useEventData` - Gestion des données d'événement
- ✅ `useCharacterManagement` - Gestion des personnages
- ✅ `usePartyManagement` - Gestion des groupes

### Composants créés
- ✅ `EventHeader` - Section "Event running" avec boutons admin
- ✅ `RoleSection` - Table de personnages par rôle
- ❌ `WaitingRoomHeader` - À créer
- ❌ `WaitingRoom` - À créer

## 🎯 Objectif final
EventView.tsx devrait faire moins de 100 lignes et être ultra-lisible avec :
- EventHeader (Event running)
- WaitingRoomHeader (Waiting Room)
- WaitingRoom (4 tables de rôles)
- ShuffleButton
- CreatedCharacter
