import React from 'react';
import { Party } from '../../../types/Party';
import DraggableCharacter from './DraggableCharacter';
import EmptySlot from './EmptySlot/EmptySlot';
import './PartyTable.css';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faTimes, faShield, faHeart, faGavel, faHatWizard } from '@fortawesome/free-solid-svg-icons';
import { getCharacterCellClass } from '../../../utils/classNameHelper';

interface PartyTableProps {
    parties: Party[];
    moveCharacter: (fromPartyIndex: number, toPartyIndex: number, memberId: number, toIndex: number) => void;
    swapCharacters: (fromPartyIndex: number, toPartyIndex: number, sourceId: number, targetId: number) => void;
    isAdmin: boolean;
}

const PartyTable: React.FC<PartyTableProps> = ({ parties, moveCharacter, swapCharacters, isAdmin }) => {
    const { t } = useTranslation();

    // Function to calculate average iLevel of the group
    const calculateAverageIlevel = (party: Party) => {
        if (party.members.length === 0) return 0;
        const totalIlevel = party.members.reduce((sum, member) => sum + member.iLevel, 0);
        return (totalIlevel / party.members.length).toFixed(2);
    };

    const findMinIlevel = (party: Party) => {
        if (party.members.length === 0) return 0;
        return Math.min(...party.members.map(member => member.iLevel));
    };

    const findMinKeystoneLevel = (party: Party) => {
        if (party.members.length === 0) return 0;
        return Math.min(...party.members.map(member => member.keystoneMinLevel));
    };

    const findMaxIlevel = (party: Party) => {
        if (party.members.length === 0) return 0;
        return Math.max(...party.members.map(member => member.iLevel));
    };

    const findMaxKeystoneLevel = (party: Party) => {
        if (party.members.length === 0) return 0;
        return Math.min(...party.members.map(member => member.keystoneMaxLevel));
    };

    // Sort members only for display
    const getSortedMembers = (party: Party) => {
        const rolePriority: Record<string, number> = { TANK: 1, HEAL: 2, CAC: 3, DIST: 4 };
        return [...party.members].sort((a, b) => {
            const priorityA = rolePriority[a.role] || 5;
            const priorityB = rolePriority[b.role] || 5;
            return priorityA - priorityB;
        });
    };

    return (
        <div className="party-table-container">
            {parties.map((party, partyIndex) => (
                <div key={partyIndex} className="table-wrapper">
                    <h2>
                        Party {partyIndex + 1} ({party.members.length})
                    </h2>
                    <table>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Name</th>
                                <th>Class</th>
                                <th>Specialization</th>
                                <th style={{ width: '15%' }}>
                                    Items Level <br /> (Key min-max)
                                </th>
                                <th>Role</th>
                                <th>Blood Lust</th>
                                <th>Battle Rez</th>
                            </tr>
                        </thead>
                        <tbody>
                            {getSortedMembers(party).map((member, sortedIndex) => {
                                const originalIndex = party.members.findIndex(m => m.id === member.id);
                                return (
                                    <DraggableCharacter
                                        key={member.id}
                                        member={member}
                                        partyIndex={partyIndex}
                                        index={originalIndex}
                                        moveCharacter={moveCharacter}
                                        swapCharacters={swapCharacters}
                                        isAdmin={isAdmin}
                                    >
                                        <td className={getCharacterCellClass(member.characterClass)}>
                                            <b>{originalIndex + 1}</b>
                                        </td>
                                        <td className={getCharacterCellClass(member.characterClass)}>
                                            <b>{member.name}</b>
                                        </td>
                                        <td className={getCharacterCellClass(member.characterClass)}>
                                            <b>{member.characterClass}</b>
                                        </td>
                                        <td className={getCharacterCellClass(member.characterClass)}>
                                            <b>{t(`specializations.${member.specialization}`)}</b>
                                        </td>
                                        <td className={getCharacterCellClass(member.characterClass)}>
                                            <b>{member.iLevel}</b> <br />
                                            ({member.keystoneMinLevel}-{member.keystoneMaxLevel})
                                        </td>
                                        <td className={getCharacterCellClass(member.characterClass)}>
                                            {member.role === 'TANK' ? (
                                                <FontAwesomeIcon icon={faShield} style={{ color: 'black' }} />
                                            ) : member.role === 'HEAL' ? (
                                                <FontAwesomeIcon icon={faHeart} style={{ color: 'green' }} />
                                            ) : member.role === 'CAC' ? (
                                                <FontAwesomeIcon icon={faGavel} style={{ color: 'red' }} />
                                            ) : member.role === 'DIST' ? (
                                                <FontAwesomeIcon icon={faHatWizard} style={{ color: 'blue' }} />
                                            ) : (
                                                member.role
                                            )}
                                        </td>
                                        <td className={getCharacterCellClass(member.characterClass)}>
                                            {member.bloodLust && (
                                                <FontAwesomeIcon
                                                    icon={faCheck}
                                                    style={{ color: 'black' }}
                                                />
                                            )}
                                        </td>
                                        <td className={getCharacterCellClass(member.characterClass)}>
                                            {member.battleRez && (
                                                <FontAwesomeIcon
                                                    icon={faCheck}
                                                    style={{ color: 'black' }}
                                                />
                                            )}
                                        </td>
                                    </DraggableCharacter>
                                );
                            })}
                            {party.members.length < 5 && (
                                <EmptySlot
                                    partyIndex={partyIndex}
                                    moveCharacter={moveCharacter}
                                    currentMembersCount={party.members.length}
                                    isAdmin={isAdmin}
                                />
                            )}
                        </tbody>
                    </table>
                    <h3>
                        {t('Average iLevel')}: {calculateAverageIlevel(party)} ({findMinIlevel(party)} - {findMaxIlevel(party)})
                    </h3>
                    <h3>
                        {findMinKeystoneLevel(party)} - {findMaxKeystoneLevel(party)}
                    </h3>
                </div>
            ))}
        </div>
    );
};

export default PartyTable;