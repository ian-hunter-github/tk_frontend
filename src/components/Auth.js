import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/auth';

function Auth({ onSignIn }) {
    const [email, setEmail] = useState('ian@tests.com');
    const [password, setPassword] = useState('test123');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSignUp = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { message } = await authService.signUp(email, password);
            alert(message);
            navigate('/'); // Navigate after successful sign-up
        } catch (error) {
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleLocalSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authService.signIn(email, password);
      onSignIn(); // Call the onSignIn callback from props
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

    return (
        <div>
            <h2>Sign Up / Sign In</h2>
            <form onSubmit={handleSignUp}>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                />
                <button type="submit" disabled={loading}>
                    Sign Up
                </button>
                <button onClick={handleLocalSignIn} disabled={loading}>
                    Sign In
                </button>
            </form>
        </div>
    );
}

export default Auth;
