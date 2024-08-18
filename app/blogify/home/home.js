'use client';

import { useState, useEffect } from 'react';
import { FaImage, FaTimes } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import { firestore, storage, auth } from '../../../firebase';
import styles from '../../styles/HomePage.module.css';
import { doc, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useAuth } from '../../context/AuthContext';
import { getAuth, signOut } from 'firebase/auth'
import LoadingScreen from './components/LoadingScreen';
import { v4 as uuidv4 } from 'uuid';

export default function Home() {
    const { user, loading } = useAuth();
    const [isModalOpen, setModalOpen] = useState(false);
    const [postContent, setPostContent] = useState('');
    const [image, setImage] = useState(null);
    const [category, setCategory] = useState('general');
    const [userData, setUserData] = useState(null);
    const [isDropdownOpen, setDropdownOpen] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [posts, setPosts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const router = useRouter();
    const maxCharacters = 600;

    useEffect(() => {
        const checkAuthStatus = async () => {
            if (loading) return;

            if (!user) {
                router.push('/auth/Login');
                return;
            }

            try {
                const userDocRef = doc(firestore, `users/${user.uid}`);
                const userDoc = await getDoc(userDocRef);

                if (userDoc.exists()) {
                    setUserData(userDoc.data());
                } else {
                    console.error('No user data found');
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        };

        const fetchPosts = async () => {
            try {
                const response = await fetch('/api/getPosts');
                if (response.ok) {
                    const data = await response.json();
                    const postsWithProfilePics = await Promise.all(data.map(async (post) => {
                        const userProfilePic = await getUserProfilePic(post.userId);
                        return { ...post, userProfilePic };
                    }));
                    setPosts(postsWithProfilePics);
                } else {
                    console.error('Failed to fetch posts');
                }
            } catch (error) {
                console.error('Error fetching posts:', error);
            }
        };
        fetchPosts();
        checkAuthStatus();
    }, [user, loading, router]);

    useEffect(() => {
        if (userData) {
            console.log('User data loaded:', userData);
        }
    }, [userData]);

    const getUserProfilePic = async (userId) => {
        try {
            const userDocRef = doc(firestore, `users/${userId}`);
            const userDoc = await getDoc(userDocRef);

            if (userDoc.exists()) {
                const userData = userDoc.data();
                return userData.photoURL || '/defpfp.jpg'; // Adjust the field name if necessary
            } else {
                console.error('User document not found');
                return '/defpfp.jpg';
            }
        } catch (error) {
            console.error('Error fetching user profile pic:', error);
            return '/defpfp.jpg';
        }
    };

    const formatTimestamp = (timestamp) => {
        const now = new Date();
        const postDate = new Date(timestamp);
        const diffTime = Math.abs(now - postDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return ` ${postDate.toLocaleDateString()} - ${postDate.toLocaleTimeString().slice(0, 4)} PM`;
    };

    const toggleModal = () => setModalOpen(!isModalOpen);

    const handleTextChange = (e) => {
        setPostContent(e.target.value);
    };

    const handleImageUpload = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setImage(file);
        }
    };

    const removeImage = () => {
        setImage(null);
    };

    const handleSubmit = async () => {
        if (postContent.trim() === '') {
            return;
        }

        setIsSubmitting(true);

        let imageUrl = null;
        if (image) {
            const uniqueId = uuidv4();
            try {
                const imageRef = ref(storage, `images/${uniqueId}_${image.name}`);
                await uploadBytes(imageRef, image);
                imageUrl = await getDownloadURL(imageRef);
                const baseUrl = "https://firebasestorage.googleapis.com/v0/b/inventory-management-48f3e.appspot.com/o/";
                imageUrl = imageUrl.slice(baseUrl.length);
            } catch (error) {
                console.error('Error uploading image:', error);
                alert('Failed to upload image.');
                setIsSubmitting(false);
                return;
            }
        }

        console.log(user)

        const postData = {
            username: user?.displayName,
            imageUrl: imageUrl,
            content: postContent,
            likes: 0,
            category: category,
            userId: user?.uid
        };

        try {
            const response = await fetch('/api/post', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(postData),
            });
            console.log('Post Data:', JSON.stringify(postData));

            if (response.ok) {
                setSuccessMessage('Post has been posted!');
                setPostContent('');
                setImage(null);
                setCategory('general');
                toggleModal();
                setTimeout(() => setSuccessMessage(''), 3000);
            } else {
                const errorData = await response.json();
                console.error('API Response Error:', errorData);
                throw new Error(errorData.error || 'Failed to create post');
            }
        } catch (error) {
            console.error('Error creating post:', error);
            alert('Failed to create post. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleLogout = async () => {
        try {
            await signOut(auth);
            router.push('/auth/Login');
        } catch (error) {
            console.error('Error signing out:', error);
            alert('Failed to sign out. Please try again.');
        }
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const filteredPosts = posts.filter(post =>
        post.username.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (user) {
        return (
            <div className={styles.container}>
                {loading && <LoadingScreen />}
                {isSubmitting && (
                    <div className={styles.spinnerContainer}>
                        <div className={styles.spinner}></div>
                    </div>
                )}
                {successMessage && (
                    <div className={styles.successMessage}>{successMessage}</div>
                )}
                <header className={styles.header}>
                    <div className={styles.headerLeft}>
                        <img src="/blogify.png" alt="Logo" className={styles.logo} />
                        <h1 className={styles.title}>Blogify</h1>
                    </div>
                    <input
                        type="text"
                        className={styles.searchBar}
                        placeholder="Search by username..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                    />
                    <div className={styles.headerRight}>
                        <span className={styles.notificationIcon} role="img" aria-label="Notifications">🔔</span>
                        {user && (
                            <div className={styles.profileDropdown}>
                                <img
                                    src={user.photoURL || '/defpfp.jpg'}
                                    alt="Profile"
                                    className={styles.profilePicture}
                                    onClick={() => setDropdownOpen(!isDropdownOpen)}
                                    onError={(e) => e.target.src = '/defpfp.jpg'}
                                />
                                {isDropdownOpen && (
                                    <div className={styles.dropdownMenu}>
                                        <button className={styles.dropdownItem} onClick={handleLogout}>Logout</button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </header>
                <aside className={styles.sidebar}>
                    <div
                        onClick={() => {
                            window.location.href = "/blogify/home";
                            window.location.reload();
                        }}
                        className={styles.sidebarItem}
                    >
                        Home
                    </div>
                    <div className={styles.sidebarItem}>Explore</div>
                    <div className={styles.sidebarItem}>
                        {user && <img src={user.photoURL || '/defpfp.jpg'} alt="Profile" className={styles.profilePictureSideBar} onError={(e) => e.target.src = '/defpfp.jpg'} />}
                        Profile
                    </div>
                    <button className={styles.postButton} onClick={toggleModal}>Post</button>
                </aside>
                <main className={styles.mainContent}>
                    <div className={styles.postsFeed}>
                        {filteredPosts.length > 0 ? (
                            filteredPosts.map((post) => (
                                console.log(post),
                                <div key={post.id} className={styles.post}>
                                    <div className={styles.postHeader}>
                                        <img
                                            src={post.userProfilePic}
                                            alt={post.username}
                                            className={styles.postUserImage}
                                        />
                                        <div className={styles.postUserInfo}>
                                            <span className={styles.postUsername}>{post.username}</span>
                                            <span className={styles.postTimestamp}>{formatTimestamp(post.createdAt)}</span>
                                        </div>
                                    </div>
                                    <p className={styles.postContent}>{post.content}</p>
                                    {post.imageUrl && (
                                        <img
                                            src={`https://firebasestorage.googleapis.com/v0/b/inventory-management-48f3e.appspot.com/o/${post.imageUrl}`}
                                            alt="Post image"
                                            className={styles.postImage}
                                        />
                                    )}
                                </div>
                            ))
                        ) : (
                            <p>No posts found matching your search.</p>
                        )}
                    </div>
                </main>

                <div
                    className={`${styles.modal} ${isModalOpen ? styles.modalOpen : ''}`}
                    onClick={toggleModal}
                >
                    <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            {user && <img src={user.photoURL || '/defpfp.jpg'} alt="Profile" className={styles.profilePicturePost} onError={(e) => e.target.src = '/defpfp.jpg'} />}
                            <h2 className={styles.modalTitle}>What's happening?</h2>
                        </div>
                        <div className={styles.modalBody}>
                            <textarea
                                className={styles.textarea}
                                placeholder="Write something..."
                                value={postContent}
                                onChange={handleTextChange}
                                minLength={1}
                                maxLength={maxCharacters}
                            />
                            <div className={styles.modalFooter}>
                                <label className={styles.imageUpload}>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        hidden
                                    />
                                    <FaImage className={styles.imageIcon} />
                                </label>
                                <span className={styles.characterCounter}>
                                    {postContent.length} / {maxCharacters}
                                </span>
                                <button className={styles.submitButton} onClick={handleSubmit}>Post</button>
                            </div>
                            {image && (
                                <div className={styles.imagePreview}>
                                    <img src={URL.createObjectURL(image)} alt="Uploaded Preview" className={styles.previewImage} />
                                    <button className={styles.removeImageButton} onClick={removeImage}>
                                        <FaTimes />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}