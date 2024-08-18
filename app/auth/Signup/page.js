'use client';

import { useState, useEffect } from 'react';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth, firestore, storage } from '../../../firebase';
import { collection, query, where, getDocs, setDoc, doc } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import styles from '../../styles/AuthPage.module.css';
import LoadingSpinner from './Components/LoadingSpinner';

import Image from 'next/image';
import { FaCamera, FaEye, FaEyeSlash, FaCheck, FaTimes } from 'react-icons/fa';
import { useRouter } from 'next/navigation';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [profilePic, setProfilePic] = useState(null);
  const [errors, setErrors] = useState({});
  const [validFields, setValidFields] = useState({
    username: false,
    email: false,
    password: false,
    confirmPassword: false,
  });
  const [touchedFields, setTouchedFields] = useState({
    username: false,
    email: false,
    password: false,
    confirmPassword: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [usernameAvailable, setUsernameAvailable] = useState(null);

  const router = useRouter();

  const normalizeUsername = (username) => username.toLowerCase().trim();

  const validateField = (field, value) => {
    let error = null;
    let isValid = false;

    switch (field) {
      case 'username':
        const normalizedUsername = normalizeUsername(value);
        if (!value || !value.length) {
          error = 'Username is required';
        } else if (value.length > 32) {
          error = 'Username cannot exceed 32 characters';
        } else if (!/^[a-zA-Z0-9]{1,32}$/.test(value)) {
          error = 'Username must be alphanumeric and between 1 and 32 characters long';
        } else if (usernameAvailable === false) {
          error = 'Username is already taken';
        } else {
          isValid = true;
        }
        break;

      case 'email':
        if (!value) {
          error = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          error = 'Invalid email address';
        } else {
          isValid = true;
        }
        break;
      case 'password':
        if (!value) {
          error = 'Password is required';
        } else if (value.length < 8) {
          error = 'Password must be at least 8 characters long';
        } else if (!/[A-Z]/.test(value)) {
          error = 'Password must contain at least one uppercase letter';
        } else if (!/[a-z]/.test(value)) {
          error = 'Password must contain at least one lowercase letter';
        } else if (!/[0-9]/.test(value)) {
          error = 'Password must contain at least one number';
        } else {
          isValid = true;
        }
        break;
      case 'confirmPassword':
        if (!value) {
          error = 'Confirm password is required';
        } else if (value !== password) {
          error = 'Passwords do not match';
        } else {
          isValid = true;
        }
        break;
    }

    setErrors(prev => ({ ...prev, [field]: error }));
    setValidFields(prev => ({ ...prev, [field]: isValid }));
  };

  const handleBlur = (field) => {
    setTouchedFields(prev => ({ ...prev, [field]: true }));
    validateField(field, field === 'username' ? username : field === 'email' ? email : field === 'password' ? password : confirmPassword);
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    if (Object.values(touchedFields).some(field => !field)) {
      Object.keys(validFields).forEach(field => {
        validateField(field, field === 'username' ? username : field === 'email' ? email : field === 'password' ? password : confirmPassword);
        setTouchedFields(prev => ({ ...prev, [field]: true }));
      });
    }

    if (Object.values(validFields).every(field => field)) {
      setIsLoading(true);
      try {
        const normalizedUsername = normalizeUsername(username);
        const usersRef = collection(firestore, 'users');
        const q = query(usersRef, where('username', '==', normalizedUsername));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          setErrors(prev => ({ ...prev, username: 'Username is already taken' }));
          return;
        }

        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Default profile picture URL
        let photoURL = 'https://cdn.discordapp.com/attachments/975148879056097391/1274493730811936869/default-avatar-icon-of-social-media-user-vector.jpg?ex=66c27448&is=66c122c8&hm=52c12b26b51b3b14d03d6ab4d3f189afcfaa79448d91be2f8b65593a6582039f&';
        if (profilePic) {
          // Upload profile picture
          const photoRef = ref(storage, `profile-pics/${user.uid}/${profilePic.name}`);
          await uploadBytes(photoRef, profilePic);
          photoURL = await getDownloadURL(photoRef); // Get the download URL
        }

        await updateProfile(user, {
          displayName: username,
          photoURL,
        });

        await setDoc(doc(firestore, 'users', user.uid), {
          username: normalizedUsername,
          email,
          photoURL,
        });

        console.log('Updated Profile:', {
          displayName: user.displayName,
          photoURL: user.photoURL,
          email: user.email,
        });

        router.push('/blogify/page');
      } catch (error) {
        if (error.code === 'auth/email-already-in-use') {
          setErrors(prev => ({ ...prev, general: 'Signup failed! ' + 'This email already exists.' }));
        } else {
          setErrors(prev => ({ ...prev, general: 'Signup failed: ' + error.message }));
        }
      } finally {
        setIsLoading(false);
      }
    } else if (usernameAvailable === false && usernameAvailable !== null) {
      setErrors(prev => ({ ...prev, username: 'Username is already taken' }));
    }
  };

  const handleFileClick = () => {
    document.getElementById('profile-pic').click();
  };

  const handleInputChange = (e, setter, field) => {
    const noSpaceValue = e.target.value.replace(/\s/g, '');
    setter(noSpaceValue);
    validateField(field, noSpaceValue); // Validate the specific field
  };

  const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  };

  const checkUsernameAvailability = async (username) => {
    if (username.length < 1) {
      setUsernameAvailable(null);
      return;
    }

    const normalizedUsername = normalizeUsername(username);
    const usersRef = collection(firestore, 'users');
    const q = query(usersRef, where('username', '==', normalizedUsername));
    const querySnapshot = await getDocs(q);

    setUsernameAvailable(querySnapshot.empty);
  };

  const debouncedCheckUsername = debounce(async (username) => {
    await checkUsernameAvailability(username);
    validateField('username', username);
  }, 300);

  const handleUsernameChange = (e) => {
    const noSpaceValue = e.target.value.replace(/\s/g, '');
    setUsername(noSpaceValue);
    setUsernameAvailable(null); // Reset availability while checking
    debouncedCheckUsername(noSpaceValue);
    validateField('username', noSpaceValue); // Validate username as it changes
  };

  const handleEmailChange = (e) => {
    handleInputChange(e, setEmail, 'email'); // Validate email as it changes
  };

  const handlePasswordChange = (e) => {
    handleInputChange(e, setPassword, 'password'); // Validate password as it changes
  };

  const handleConfirmPasswordChange = (e) => {
    handleInputChange(e, setConfirmPassword, 'confirmPassword'); // Validate confirmPassword as it changes
  };


  return (
    <div className={styles.authContainer}>
      {isLoading && <LoadingSpinner />}
      <div className={styles.signupFormContainer}>
        <div className={styles.pfpContainer}>
          <div className={styles.pfp} onClick={handleFileClick}>
            <Image
              src={profilePic ? URL.createObjectURL(profilePic) : '/defpfp.jpg'}
              alt="Profile Picture"
              width={128}
              height={128}
              className={styles.pfpImage}
            />
            <div className={styles.pfpOverlay}>
              <FaCamera className={styles.cameraIcon} />
            </div>
          </div>
          <input
            type="file"
            id="profile-pic"
            accept="image/*"
            onChange={(e) => setProfilePic(e.target.files[0])}
            className={styles.pfpInput}
          />
        </div>
        <h2 className={styles.title}>Blogify</h2>
        <p className={styles.subtitle}>Join and see what others are up to!</p>
        {errors.general && <div className={styles.error}>{errors.general}</div>}
        <form onSubmit={handleSignup} className={styles.form}>
          <div className={styles.inputContainer}>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={handleUsernameChange}
              onBlur={() => handleBlur('username')}
              className={`${styles.input} ${validFields.username ? styles.validInput : ''}`}
              maxLength="32"
            />

            {username.length > 0 && (
              (usernameAvailable === true && !errors.username) ? (
                <FaCheck className={styles.validIcon} style={{ color: 'green' }} />
              ) : (usernameAvailable === false || (errors.username)) ? (
                <FaTimes className={styles.invalidIcon} style={{ color: 'red' }} />
              ) : (
                <div className={styles.spinner}></div>
              )
            )}
            {touchedFields.username && errors.username && <div className={styles.error}>{errors.username}</div>}

          </div>
          <div className={styles.inputContainer}>
            <label htmlFor="email"></label>
            <input
              id="email"
              type="email"
              placeholder="Enter Email"
              value={email}
              onChange={handleEmailChange}
              onBlur={() => handleBlur('email')}
              className={`${styles.input} ${validFields.email && !errors.email ? styles.validInput : ''}`}
            />
            {validFields.email && !errors.email && <FaCheck className={styles.validIcon} style={{ color: 'green' }} />}
            {errors.email && <div className={styles.error}>{errors.email}</div>}
          </div>
          <div className={styles.inputContainer}>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter Password"
              value={password}
              onChange={handlePasswordChange}
              onBlur={() => handleBlur('password')}
              className={`${styles.input} ${validFields.password ? styles.passwordInput : ''}`}
            />
            <div className={styles.eyeIcon} onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </div>
            {validFields.password && <FaCheck className={styles.validIcon} />}
            {touchedFields.password && errors.password && <div className={styles.error}>{errors.password}</div>}
          </div>
          <div className={styles.inputContainer}>
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={handleConfirmPasswordChange}
              onBlur={() => handleBlur('confirmPassword')}
              className={`${styles.input} ${validFields.confirmPassword ? styles.passwordInput : ''}`}
            />
            <div className={styles.eyeIcon} onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
            </div>
            {validFields.confirmPassword && <FaCheck className={styles.validIcon} />}
            {touchedFields.confirmPassword && errors.confirmPassword && <div className={styles.error}>{errors.confirmPassword}</div>}
          </div>
          <button type="submit" className={styles.btn} disabled={isLoading}>
            {isLoading ? 'Signing Up...' : 'Sign Up'}
          </button>
        </form>
        <div className={styles.loginLink}>
          <p>Already have an account? <a href="/auth/Login">Sign in</a></p>
        </div>
      </div>
    </div>
  );
}