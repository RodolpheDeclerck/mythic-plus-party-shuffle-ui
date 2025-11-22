export const getCharacterCellClass = (characterClass: string): string => {
    const normalized = characterClass.toLowerCase().replace(' ', '');
    return `character-cell character-cell-${normalized}`;
};
