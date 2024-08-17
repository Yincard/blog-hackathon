'use client';

import { useState, useEffect } from 'react';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth, firestore, storage } from '../../../firebase';
import { collection, query, where, getDocs, setDoc, doc } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import styles from '../../styles/AuthPage.module.css';
import Image from 'next/image';
import { FaCamera, FaEye, FaEyeSlash, FaCheck } from 'react-icons/fa';
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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();

  useEffect(() => {
    validateField('username', username);
  }, [username]);

  useEffect(() => {
    validateField('email', email);
  }, [email]);

  useEffect(() => {
    validateField('password', password);
  }, [password]);

  useEffect(() => {
    validateField('confirmPassword', confirmPassword);
  }, [confirmPassword, password]);

  const validateField = (field, value) => {
    let error = null;
    let isValid = false;

    switch (field) {
      case 'username':
        if (!value) {
          error = 'Username is required';
        } else if (!/^[a-zA-Z0-9]{1,32}$/.test(value)) {
          error = 'Username must be alphanumeric and between 1 and 32 characters long';
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

  const handleSignup = async (e) => {
    e.preventDefault();
    if (Object.values(validFields).every(field => field)) {
      try {
        const usersRef = collection(firestore, 'users');
        const q = query(usersRef, where('username', '==', username));
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
          username,
          email,
          photoURL,
        });

        console.log('Updated Profile:', {
          displayName: user.displayName,
          photoURL: user.photoURL,
          email: user.email,
        });

        router.push('/');
      } catch (error) {
        setErrors(prev => ({ ...prev, general: 'Signup failed: ' + error.message }));
      }
    }
  };
  const handleFileClick = () => {
    document.getElementById('profile-pic').click();
  };

  const handleInputChange = (e, setter) => {
    const noSpaceValue = e.target.value.replace(/\s/g, '');
    setter(noSpaceValue);
  };

  return (
    <div className={styles.authContainer}>
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
        <h2 className={styles.title}>Sign Up</h2>
        <p className={styles.subtitle}>Create an account to blog today!</p>
        {errors.general && <div className={styles.error}>{errors.general}</div>}
        <form onSubmit={handleSignup} className={styles.form}>
          <div className={styles.inputContainer}>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => handleInputChange(e, setUsername)}
              className={`${styles.input} ${validFields.username ? styles.validInput : ''}`}
            />
            {validFields.username && <FaCheck className={styles.validIcon} />}
            {errors.username && <div className={styles.error}>{errors.username}</div>}
          </div>
          <div className={styles.inputContainer}>
            <input
              type="email"
              placeholder="Enter Email"
              value={email}
              onChange={(e) => handleInputChange(e, setEmail)}
              className={`${styles.input} ${validFields.email ? styles.validInput : ''}`}
            />
            {validFields.email && <FaCheck className={styles.validIcon} />}
            {errors.email && <div className={styles.error}>{errors.email}</div>}
          </div>
          <div className={styles.inputContainer}>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter Password"
              value={password}
              onChange={(e) => handleInputChange(e, setPassword)}
              className={`${styles.input} ${validFields.password ? styles.passwordInput : ''}`}
            />
            <div className={styles.eyeIcon} onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </div>
            {validFields.password && <FaCheck className={styles.validIcon} />}
            {errors.password && <div className={styles.error}>{errors.password}</div>}
          </div>
          <div className={styles.inputContainer}>
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => handleInputChange(e, setConfirmPassword)}
              className={`${styles.input} ${validFields.confirmPassword ? styles.passwordInput : ''}`}
            />
            <div className={styles.eyeIcon} onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
            </div>
            {validFields.confirmPassword && <FaCheck className={styles.validIcon} />}
            {errors.confirmPassword && <div className={styles.error}>{errors.confirmPassword}</div>}
          </div>
          <button type="submit" className={styles.btn}>
            Sign Up
          </button>
        </form>
        <div className={styles.loginLink}>
          <p>Already have an account? <a href="./auth/Login">Sign in</a></p>
        </div>
      </div>
    </div>
  );
}
