import React from 'react';
import { Character } from '../../../types/Character';
import DraggableCharacter from '../PartyTable/DraggableCharacter';
import './PendingPlayersTable.css';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faShield, faHeart, faGavel, faHatWizard } from '@fortawesome/free-solid-svg-icons';
import { getCharacterCellClass } from '../../../utils/classNameHelper';

interface PendingPlayersTableProps {
    pendingPlayers: Character[];
    moveFromPendingToParty: (fromPartyIndex: number, toPartyIndex: number, memberId: number, toIndex: number) => void;
    isAdmin: boolean;
}

const PendingPlayersTable: React.FC<PendingPlayersTableProps> = ({ 
    pendingPlayers, 
    moveFromPendingToParty, 
    isAdmin 
}) => {
    const { t } = useTranslation();

    // Sort members by role for display
    const getSortedPendingPlayers = () => {
        const rolePriority: Record<string, number> = { TANK: 1, HEAL: 2, CAC: 3, DIST: 4 };
        return [...pendingPlayers].sort((a, b) => {
            const priorityA = rolePriority[a.role] || 5;
            const priorityB = rolePriority[b.role] || 5;
            return priorityA - priorityB;
        });
    };

    if (pendingPlayers.length === 0) {
        return null;
    }

    return (
        <div className="pending-players-container">
            <div className="pending-players-header">
                <h2>Pending Players ({pendingPlayers.length})</h2>
                <p className="pending-players-subtitle">Players who joined after the last shuffle</p>
            </div>
            <div className="table-wrapper">
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
                        {getSortedPendingPlayers().map((member, index) => (
                            <DraggableCharacter
                                key={member.id}
                                member={member}
                                partyIndex={-1} // -1 indicates "from pending"
                                index={index}
                                moveCharacter={() => {}} // Not used for pending players
                                swapCharacters={() => {}} // No swap for pending players
                                isAdmin={isAdmin}
                                sourceType="pending"
                                moveFromPendingToParty={moveFromPendingToParty}
                            >
                                <td className={getCharacterCellClass(member.characterClass)}>
                                    <b>{index + 1}</b>
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
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PendingPlayersTable;

