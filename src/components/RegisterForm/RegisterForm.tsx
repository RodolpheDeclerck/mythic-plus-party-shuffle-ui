import React, { useState } from "react";
import './RegisterForm.css';
import { FaUser } from "react-icons/fa";
import { FaLock } from "react-icons/fa";
import { FaEnvelope } from "react-icons/fa6";
import axios from 'axios';
import apiUrl from '../../config/apiConfig';
import { useNavigate, Link } from 'react-router-dom';

const RegisterForm = () => {
    const navigate = useNavigate();
    const [error, setError] = useState<string>('');

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError('');
        const email = (event.currentTarget as HTMLFormElement).email.value;
        const password = (event.currentTarget as HTMLFormElement).password.value;
        const username = (event.currentTarget as HTMLFormElement).username.value;

        try {
            console.log('Tentative d\'enregistrement...');
            const response = await axios.post(`${apiUrl}/auth/register`, { email, password, username });
            console.log('Réponse reçue:', response);
            
            if (response.status === 200 || response.status === 201) {
                console.log('Enregistrement réussi, redirection vers /login');
                navigate('/login', { replace: true });
            }
        } catch (error: any) {
            console.error('Erreur lors de l\'enregistrement:', error);
            setError(error.response?.data?.message || 'Une erreur est survenue lors de l\'enregistrement');
        }
    };

    return (
        <div className='wrapper'>
            <form onSubmit={handleSubmit}>
                <h1>Register</h1>
                {error && <div className="error-message">{error}</div>}
                <div className="input-box">
                    <input type="text" placeholder="Email" name="email" required />
                    <FaEnvelope className='icon'/>
                </div>
                <div className="input-box">
                    <input type="password" placeholder="Password" name="password" required />
                    <FaLock className='icon'/>
                </div>
                <div className="input-box">
                    <input type="text" placeholder="Username" name="username" required />
                    <FaUser className='icon'/>
                </div>

                <button type="submit">Register</button>
             
                <div className="register-link">
                    <p>Already have an account? <Link to="/login">Login</Link></p>
                </div>
            </form>
        </div>
    );
};

export default RegisterForm;