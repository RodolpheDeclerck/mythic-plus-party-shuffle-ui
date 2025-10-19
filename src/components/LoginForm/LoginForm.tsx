import React from 'react';
import './LoginForm.css';
import { FaUser } from 'react-icons/fa';
import { FaLock } from 'react-icons/fa';
import axios from 'axios';
import apiUrl from '../../config/apiConfig';

interface LoginResponse {
    token: string; // Specifies that the response expects a token
}

const LoginForm = () => {
    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const email = (event.currentTarget as HTMLFormElement).username.value;
        const password = (event.currentTarget as HTMLFormElement).password.value;

        axios.post<LoginResponse>( // Specifies the expected type here
            `${apiUrl}/auth/login`,
            { email, password },
            {
                withCredentials: true, // Allows sending and receiving httpOnly cookies
            }
        )
            .then(response => {
                if (response.status === 200) {
                    console.log('Login successful, status:', response.status);

                    // TypeScript sait maintenant que response.data contient un token
                    localStorage.setItem('authToken', response.data.token);

                    // Check if redirect is defined in localStorage
                    let redirectUrl = localStorage.getItem('redirectAfterLogin') || '/dashboard';

                    // If redirectAfterLogin is set to `/` or absent, redirect to `/dashboard`
                    if (!redirectUrl || redirectUrl === '/' || redirectUrl === '/login') {
                        redirectUrl = '/dashboard';
                    }

                    console.log('Redirecting to:', redirectUrl);

                    // Remove redirectAfterLogin key from localStorage
                    localStorage.removeItem('redirectAfterLogin');

                    // Redirect user after a delay
                    setTimeout(() => {
                        window.location.replace(redirectUrl);
                    }, 500); // 500ms delay to ensure everything is properly taken into account
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
