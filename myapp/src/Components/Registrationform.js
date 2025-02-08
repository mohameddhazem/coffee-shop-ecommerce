import React, { useState } from 'react';

const RegistrationForm = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isAdmin] = useState(false);
  const [message, setMessage] = useState('');

  const registerUser = async () => {
    if (!name || !email || !password) {
      setMessage('Please fill in all fields.');
      return;
    }

    try {
      const response = await fetch('http://localhost:555/user/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, isAdmin }),
      });

      if (!response.ok) {
        throw new Error('Registration failed');
      }

      setMessage('Registration successful');
    } catch (error) {
      setMessage(error.message);
    }
  };

  return (
    <div className="form-section">
      <h3>User Registration</h3>
      <form>
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <br />
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
        <br />
        <button type="button" onClick={registerUser}>
          Register
        </button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default RegistrationForm;
