import React from "react";
import './RegisterForm.css';
import { FaUser } from "react-icons/fa";
import { FaLock } from "react-icons/fa";
import { FaEnvelope } from "react-icons/fa6";
import axios from 'axios';
import apiUrl from '../../config/apiConfig';

const RegisterForm = () => {
    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const email = (event.currentTarget as HTMLFormElement).email.value;
        const password = (event.currentTarget as HTMLFormElement).password.value;
        const username = (event.currentTarget as HTMLFormElement).username.value;

    
        axios.post(`${apiUrl}/auth/register`, { email, password, username })
          .then(response => {
            if (response.status === 201) {
              window.location.href = '/login';
            } else {
              console.error('Erreur d\'authentification');
            }
          })
          .catch(error => console.error(error));
      };

    return (
        <div className='wrapper'>
            <form onSubmit={handleSubmit}>
                <h1>Register</h1>
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
                    <p>Already have an account? <a href="/">Login</a></p>
                </div>
            </form>
        </div>
    );
};

export default RegisterForm;