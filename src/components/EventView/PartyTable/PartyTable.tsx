import React from 'react';
import { Party } from '../../../types/Party';
import DraggableCharacter from './DraggableCharacter';
import EmptySlot from './EmptySlot';
import './PartyTable.css';

interface PartyTableProps {
    parties: Party[];
    moveCharacter: (fromPartyIndex: number, toPartyIndex: number, fromIndex: number, toIndex: number) => void;
    swapCharacters: (fromPartyIndex: number, toPartyIndex: number, fromIndex: number, toIndex: number) => void;
    isAdmin: boolean;
}

const PartyTable: React.FC<PartyTableProps> = ({ parties, moveCharacter, swapCharacters, isAdmin }) => {
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
                                    <td>{member.specialization}</td>
                                    <td>{member.role}</td>
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
