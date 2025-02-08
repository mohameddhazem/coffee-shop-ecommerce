import React, { useState } from 'react';

const LoginForm = ({ navigate, onLogin }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');

    const loginUser = async () => {
        console.log('onLogin received in LoginForm:', onLogin);
        if (!onLogin || typeof onLogin !== 'function') {
            console.error('onLogin is not a function!');
            return;
        }

        if (!email || !password) {
            setMessage('Please fill in all fields.');
            return;
        }

        try {
            const response = await fetch('http://localhost:555/user/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
                credentials: 'include',
            });

            if (!response.ok) {
                throw new Error('Invalid credentials');
            }

            const userData = await response.json();
            console.log('Login successful, calling onLogin with:', userData);
            onLogin(userData); // Call parent onLogin function
        } catch (error) {
            setMessage(error.message);
        }
    };

    return (
        <div className="form-section">
            <h3>User Login</h3>
            <form>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <br />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <br />
                <button type="button" onClick={loginUser}>
                    Login
                </button>
            </form>
            {message && <p style={{ color: 'red' }}>{message}</p>}
        </div>
    );
};

export default LoginForm;
