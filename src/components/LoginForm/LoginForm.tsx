import React from 'react';
import './LoginForm.css';
import { FaUser } from 'react-icons/fa';
import { FaLock } from 'react-icons/fa';
import axios from 'axios';
import apiUrl from '../../config/apiConfig';

interface LoginResponse {
    token: string; // Spécifie que la réponse attend un token
}

const LoginForm = () => {
    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const email = (event.currentTarget as HTMLFormElement).username.value;
        const password = (event.currentTarget as HTMLFormElement).password.value;

        axios.post<LoginResponse>( // Spécifie ici le type attendu
            `${apiUrl}/auth/login`,
            { email, password },
            {
                withCredentials: true, // Permet l'envoi et la réception des cookies httpOnly
            }
        )
            .then(response => {
                if (response.status === 200) {
                    console.log('Login successful, status:', response.status);

                    // TypeScript sait maintenant que response.data contient un token
                    localStorage.setItem('authToken', response.data.token);

                    // Vérifie si la redirection est définie dans localStorage
                    let redirectUrl = localStorage.getItem('redirectAfterLogin') || '/dashboard';

                    // Si redirectAfterLogin est défini sur `/` ou absent, rediriger vers `/dashboard`
                    if (!redirectUrl || redirectUrl === '/') {
                        redirectUrl = '/dashboard';
                    }

                    console.log('Redirecting to:', redirectUrl);

                    // Supprime la clé redirectAfterLogin du localStorage
                    localStorage.removeItem('redirectAfterLogin');

                    // Redirige l'utilisateur après un délai
                    setTimeout(() => {
                        window.location.replace(redirectUrl);
                    }, 500); // Délai de 500ms pour s'assurer que tout est bien pris en compte
                } else {
                    console.error('Erreur d\'authentification');
                }
            })
            .catch(error => {
                console.error('Login error:', error);
                alert('Erreur de connexion. Veuillez vérifier vos identifiants.');
            });
    };

    return (
        <div className='wrapper'>
            <form onSubmit={handleSubmit}>
                <h1>Login</h1>
                <div className="input-box">
                    <input type="text" placeholder="Username" name="username" required />
                    <FaUser className='icon' />
                </div>
                <div className="input-box">
                    <input type="password" placeholder="Password" name="password" required />
                    <FaLock className='icon' />
                </div>
                <div className="remember-forgot">
                    <label><input type="checkbox" />Remember me</label>
                    <a href="#">Forgot password?</a>
                </div>

                <button type="submit">Login</button>

                <div className="register-link">
                    <p>Don't have an account? <a href="/register">Register</a></p>
                </div>
            </form>
        </div>
    );
};

export default LoginForm;
