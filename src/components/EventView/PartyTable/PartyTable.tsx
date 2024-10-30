import React from 'react';
import { Party } from '../../../types/Party';
import DraggableCharacter from './DraggableCharacter';
import EmptySlot from './EmptySlot/EmptySlot';
import './PartyTable.css';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faTimes, faShield, faHeart, faGavel, faHatWizard } from '@fortawesome/free-solid-svg-icons';

interface PartyTableProps {
    parties: Party[];
    moveCharacter: (fromPartyIndex: number, toPartyIndex: number, fromIndex: number, toIndex: number) => void;
    swapCharacters: (fromPartyIndex: number, toPartyIndex: number, fromIndex: number, toIndex: number) => void;
    isAdmin: boolean;
}

const PartyTable: React.FC<PartyTableProps> = ({ parties, moveCharacter, swapCharacters, isAdmin }) => {
    const { t } = useTranslation();

    // Fonction pour calculer l'iLevel moyen du groupe
    const calculateAverageIlevel = (party: Party) => {
        if (party.members.length === 0) return 0;
        const totalIlevel = party.members.reduce((sum, member) => sum + member.iLevel, 0);
        return (totalIlevel / party.members.length).toFixed(2); // Retourne l'ilevel moyen avec deux décimales
    };

    const findMinIlevel = (party: Party) => {
        if (party.members.length === 0) return 0;
        return Math.min(...party.members.map(member => member.iLevel));
    };

    const findMaxIlevel = (party: Party) => {
        if (party.members.length === 0) return 0;
        return Math.max(...party.members.map(member => member.iLevel));
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
                                <th>Items Level</th>
                                <th>Role</th>
                                <th>Blood Lust</th>
                                <th>Battle Rez</th>
                            </tr>
                        </thead>
                        <tbody>
                            {party.members.map((member, index) => (
                                <DraggableCharacter
                                    key={member.id}
                                    member={member}
                                    partyIndex={partyIndex}
                                    index={index}
                                    moveCharacter={moveCharacter}
                                    swapCharacters={swapCharacters}
                                    isAdmin={isAdmin}
                                >
                                    <td>{member.id}</td>
                                    <td><b>{member.name}</b></td>
                                    <td>{member.characterClass}</td>
                                    <td>{t(`specializations.${member.specialization}`)}</td>
                                    <td>{member.iLevel}</td>
                                    <td>
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
                                    <td>
                                        <FontAwesomeIcon
                                            icon={member.bloodLust ? faCheck : faTimes}
                                            style={{ color: member.bloodLust ? 'green' : 'red' }}
                                        />
                                    </td>
                                    <td>
                                        <FontAwesomeIcon
                                            icon={member.battleRez ? faCheck : faTimes}
                                            style={{ color: member.battleRez ? 'green' : 'red' }}
                                        />
                                    </td>
                                </DraggableCharacter>
                            ))}
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
                        {t('Average iLevel')}: {calculateAverageIlevel(party)}  ({findMinIlevel(party)} - {findMaxIlevel(party)})
                    </h3>
                </div>
            ))}
        </div>
    );
};

export default PartyTable;
