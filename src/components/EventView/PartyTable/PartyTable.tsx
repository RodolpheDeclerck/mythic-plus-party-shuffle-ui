import React from 'react';
import { Party } from '../../../types/Party';
import { useTranslation } from 'react-i18next';

interface PartyTableProps {
    parties: Party[];
}

const PartyTable: React.FC<PartyTableProps> = ({ parties }) => {
    const { t } = useTranslation();

    return (
        <div className="party-table-container">
            {parties.map((party, index) => (
                <div key={index} className="table-wrapper">
                    <h2>Party {index + 1}</h2>
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
                                    <td>{t(`specializations.${member.specialization}`)}</td>
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
