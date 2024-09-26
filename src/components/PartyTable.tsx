import React from 'react';
import { Party } from '../types/Party';

interface PartyTableProps {
    parties: Party[];
}

const PartyTable: React.FC<PartyTableProps> = ({ parties }) => {
    return (
        <div>
            {parties.map((party, index) => (
                <div key={index}>
                    <h3>Group {index + 1}</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Name</th>
                                <th>Class</th>
                                <th>Specialization</th>
                                <th>Role</th>
                                <th>BloodLust</th>
                                <th>BattleRez</th>
                            </tr>
                        </thead>
                        <tbody>
                            {party.members.map((member) => (
                                <tr key={member.id}>
                                    <td>{member.id}</td>
                                    <td>{member.name}</td>
                                    <td>{member.characterClass}</td>
                                    <td>{member.specialization}</td>
                                    <td>{member.role}</td>
                                    <td>{member.bloodLust ? 'Yes' : 'No'}</td>
                                    <td>{member.battleRez ? 'Yes' : 'No'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ))}
        </div>
    );
};

export default PartyTable;
