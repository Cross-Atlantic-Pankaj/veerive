import { useState, useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import '../html/css/Login.css'; // Import the CSS file for styling

export default function Login() {
    const { handleLogin, loading } = useContext(AuthContext);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [remember, setRemember] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const savedEmail = localStorage.getItem('rememberedEmail');
        const savedPassword = localStorage.getItem('rememberedPassword');
        if (savedEmail && savedPassword) {
            setEmail(savedEmail);
            setPassword(savedPassword);
            setRemember(true);
        }
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Prevent multiple submissions
        if (isSubmitting || loading) return;
        
        setIsSubmitting(true);
        setError('');
        
        const formData = {
            email,
            password,
        };

        try {
            await handleLogin(formData);
            if (remember) {
                localStorage.setItem('rememberedEmail', email);
                localStorage.setItem('rememberedPassword', password);
            } else {
                localStorage.removeItem('rememberedEmail');
                localStorage.removeItem('rememberedPassword');
            }
        } catch (err) {
            if (err.response && err.response.data && err.response.data.error) {
                setError(err.response.data.error);
            } else {
                setError('Something went wrong. Please try again.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <h2 className="login-title">Veerive CMS Login</h2>
                <form onSubmit={handleSubmit}>
                    <input name="enteremail" id="enteremail" type="text"
                        placeholder="Enter email"
                        className="login-input"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <div style={{ position: 'relative' }}>
                    <input
                            type={showPassword ? 'text' : 'password'}
                        placeholder="Enter password"
                        className="login-input"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                            style={{ paddingRight: '2.5em' }}
                    />
                        <span
                            onClick={() => setShowPassword((prev) => !prev)}
                            style={{
                                position: 'absolute',
                                right: '10px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                cursor: 'pointer',
                                fontSize: '1.2em',
                                userSelect: 'none',
                            }}
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                            tabIndex={0}
                        >
                            {showPassword ? '🙈' : '👁️'}
                        </span>
                    </div>
                    <div className="remember-me-container">
                        <input name="checkboxField" type="checkbox"
                            id="rememberMe"
                            checked={remember}
                            onChange={e => setRemember(e.target.checked)}
                        />
                        <label htmlFor="rememberMe">Remember Me</label>
                    </div>
                    {error && <p className="login-error">{error}</p>} {/* Display error message */}
                    <button 
                        type="submit" 
                        className="login-button" 
                        disabled={isSubmitting || loading}
                    >
                        {isSubmitting || loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>
                <div className="login-links">
                    <Link to="/forgot-password" className="forgot-password-link">Forgot Password?</Link>
                    
                </div>
            </div>
        </div>
    );
}
