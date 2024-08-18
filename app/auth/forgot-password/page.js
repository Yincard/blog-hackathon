'use client';

import { useState } from 'react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { auth } from '../../../firebase';
import styles from '../../styles/AuthPage.module.css';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const router = useRouter();

  const validateField = (field, value) => {
    let error = null;

    if (!value) {
      error = `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
    } else if (field === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      error = 'Invalid email address';
    }

    setErrors(prev => ({ ...prev, [field]: error }));
    return !error; // Return whether the field is valid
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();

    const isEmailValid = validateField('email', email);

    if (!isEmailValid) return;

    setIsLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setSuccessMessage('If the email is registered, a password reset email was sent successfully.');
      setEmail("");
    } catch (error) {
      setErrors(prev => ({ ...prev, general: 'Failed to send reset email: ' + error.message }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setEmail(e.target.value);
    validateField('email', e.target.value);
  };

  return (
    <div className={styles.authContainer}>
      {isLoading && <div>Loading...</div>}
      <div className={styles.signupFormContainer}>
        <h2 className={styles.title}>Forgot Password</h2>
        <p className={styles.subtitle}>Enter your email to reset your password</p>
        {errors.general && <div className={styles.error}>{errors.general}</div>}
        {successMessage && (
          <div className={styles.success}>
            {successMessage}
          </div>
        )}
        <form onSubmit={handleForgotPassword} className={styles.form}>
          <div className={styles.inputContainer}>
            <input
              type="email"
              placeholder="Enter Email"
              value={email}
              onChange={handleInputChange}
              onBlur={() => validateField('email', email)}
              className={`${styles.input} ${!errors.email ? styles.validInput : ''}`}
            />
            {errors.email && <div className={styles.error}>{errors.email}</div>}
          </div>
          <button type="submit" className={styles.resetPassBTN} disabled={isLoading}>
            {isLoading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>
        <div className={styles.backToLoginLink}>
          <p>Remembered your password? <a href="/auth/Login">Login</a></p>
        </div>
      </div>
    </div>
  );
}
