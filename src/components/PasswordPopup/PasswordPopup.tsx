import React, { useState } from 'react';
import './PasswordPopup.css'; // Importer le fichier CSS pour la pop-up

interface PasswordPopupProps {
    onConfirm: (password: string) => void;
    onCancel: () => void;
}

const PasswordPopup: React.FC<PasswordPopupProps> = ({ onConfirm, onCancel }) => {
    const [password, setPassword] = useState('');

    const handleConfirm = () => {
        onConfirm(password);
    };

    return (
        <div className="popup-overlay">
            <div className="popup-content">
                <h2>Enter Admin Password</h2>
                <input 
                    type="password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    placeholder="Password"
                />
                <div className="popup-buttons">
                    <button onClick={handleConfirm}>Confirm</button>
                    <button onClick={onCancel}>Cancel</button>
                </div>
            </div>
        </div>
    );
};

export default PasswordPopup;
