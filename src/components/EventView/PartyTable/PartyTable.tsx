import React from 'react';
import { Party } from '../../../types/Party';
import DraggableCharacter from './DraggableCharacter';
import EmptySlot from './EmptySlot';
import './PartyTable.css';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faTimes, faShield, faHeart, faCrosshairs } from '@fortawesome/free-solid-svg-icons';

interface PartyTableProps {
    parties: Party[];
    moveCharacter: (fromPartyIndex: number, toPartyIndex: number, fromIndex: number, toIndex: number) => void;
    swapCharacters: (fromPartyIndex: number, toPartyIndex: number, fromIndex: number, toIndex: number) => void;
    isAdmin: boolean;
}

const PartyTable: React.FC<PartyTableProps> = ({ parties, moveCharacter, swapCharacters, isAdmin }) => {
    const { t } = useTranslation();

    return (
        <div className="party-table-container">
            {parties.map((party, partyIndex) => (
                <div key={partyIndex} className="table-wrapper">
                    <h2>Party {partyIndex + 1}</h2>
                    <table>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Name</th>
                                <th>Class</th>
                                <th>Specialization</th>
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
                                    <td>
                                        {member.role === 'TANK' ? (
                                            <FontAwesomeIcon icon={faShield} style={{ color: 'blue' }} />
                                        ) : member.role === 'HEAL' ? (
                                            <FontAwesomeIcon icon={faHeart} style={{ color: 'green' }} />
                                        ) : member.role === 'DIST' || member.role === 'CAC' ? (
                                            <FontAwesomeIcon icon={faCrosshairs} style={{ color: 'red' }} />
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
                </div>
            ))}
        </div>
    );
};

export default PartyTable;
