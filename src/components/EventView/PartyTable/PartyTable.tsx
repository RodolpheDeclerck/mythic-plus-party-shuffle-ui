import React from 'react';
import { Party } from '../../../types/Party';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faTimes, faShield, faHeart, faCrosshairs } from '@fortawesome/free-solid-svg-icons';
import './PartyTable.css'; // Import your CSS file for styles

interface PartyTableProps {
    parties: Party[];
    highlightedId?: number; // Add this prop to highlight specific rows
}

const PartyTable: React.FC<PartyTableProps> = ({ parties, highlightedId }) => {
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
                                <th>Blood Lust</th>
                                <th>Battle Rez</th>
                            </tr>
                        </thead>
                        <tbody>
                            {party.members.map((member) => (
                                <tr key={member.id} className={member.id === highlightedId ? 'highlight' : ''}>
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
