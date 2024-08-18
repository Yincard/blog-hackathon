// Login/page.js
'use client';

import { useState, useEffect } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { auth } from '../../../firebase';
import styles from '../../styles/AuthPage.module.css';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

export default function Login() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      router.push('/blogify/home');
    }
  }, [user, loading, router]);

  const validateField = (field, value) => {
    let error = null;

    switch (field) {
      case 'email':
        if (!value) {
          error = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          error = 'Invalid email address';
        }
        break;
      case 'password':
        if (!value) {
          error = 'Password is required';
        }
        break;
    }

    setErrors(prev => ({ ...prev, [field]: error }));
    return !error; // Return whether the field is valid
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    const isEmailValid = validateField('email', email);
    const isPasswordValid = validateField('password', password);

    if (!isEmailValid || !isPasswordValid) return;

    setIsLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const token = await userCredential.user.getIdToken();

      // Set the token in a cookie
      document.cookie = `token=${token}; path=/; max-age=3600; SameSite=Strict; Secure`;

      router.push('/blogify/home');
    } catch (error) {
      if (error.code === 'auth/invalid-credential') {
        setErrors(prev => ({ ...prev, general: 'Login failed: incorrect password or email!' }));
      } else {
        setErrors(prev => ({ ...prev, general: 'Login failed: ' + error.message }));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e, setter, field) => {
    setter(e.target.value);
    validateField(field, e.target.value);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (user) {
    router.push('/blogify/home');
    return null; // Avoid rendering the login form if the user is already logged in
  }

  return (
    <div className={styles.authContainer}>
      {isLoading && <div>Loading...</div>}
      <div className={styles.signupFormContainer}>
        <h2 className={styles.title}>Login</h2>
        <p className={styles.subtitle}>Welcome back! Please log in.</p>
        {errors.general && <div className={styles.error}>{errors.general}</div>}
        <form onSubmit={handleLogin} className={styles.form}>
          <div className={styles.inputContainer}>
            <input
              type="email"
              placeholder="Enter Email"
              value={email}
              onChange={(e) => handleInputChange(e, setEmail, 'email')}
              onBlur={() => validateField('email', email)}
              className={`${styles.input} ${!errors.email ? styles.validInput : ''}`}
            />
            {errors.email && <div className={styles.error}>{errors.email}</div>}
          </div>
          <div className={styles.inputContainer}>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter Password"
              value={password}
              onChange={(e) => handleInputChange(e, setPassword, 'password')}
              onBlur={() => validateField('password', password)}
              className={`${styles.input} ${!errors.password ? styles.passwordInput : ''}`}
            />
            <div className={styles.eyeIcon} onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </div>
            {errors.password && <div className={styles.error}>{errors.password}</div>}
          </div>
          <button type="submit" className={styles.btn} disabled={isLoading}>
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <div className={styles.forgotPasswordLink}>
          <a href="/auth/forgot-password">Forgot your password?</a>
        </div>
        <div className={styles.signupLink}>
          <p>Don't have an account? <a href="/auth/Signup">Sign up</a></p>
        </div>
      </div>
    </div>
  );
}
