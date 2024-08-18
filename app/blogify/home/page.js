"use client";

import { useState } from 'react';
import { FaImage, FaTimes } from 'react-icons/fa'; // Import the image and close icons from react-icons
import styles from '../../styles/HomePage.module.css';

export default function Home() {
    const [isModalOpen, setModalOpen] = useState(false);
    const [postContent, setPostContent] = useState('');
    const [image, setImage] = useState(null); // State for storing image
    const maxCharacters = 600;

    const toggleModal = () => setModalOpen(!isModalOpen);

    const handleTextChange = (e) => {
        setPostContent(e.target.value);
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(URL.createObjectURL(file)); // Create a local URL for the uploaded image
        }
    };

    const removeImage = () => {
        setImage(null); // Clear the image state
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div className={styles.headerLeft}>
                    <img src="/blogify.png" alt="Logo" className={styles.logo} />
                    <h1 className={styles.title}>Blogify</h1>
                </div>
                <input 
                    type="text" 
                    className={styles.searchBar} 
                    placeholder="Search..." 
                />
                <div className={styles.headerRight}>
                    <span className={styles.notificationIcon} role="img" aria-label="Notifications">🔔</span>
                    <img src="/blogify.png" alt="Profile" className={styles.profilePicture} />
                </div>
            </header>
            <aside className={styles.sidebar}>
                <div className={styles.sidebarItem}>Home</div>
                <div className={styles.sidebarItem}>Explore</div>
                <div className={styles.sidebarItem}>Messages</div>
                <div className={styles.sidebarItem}>
                    <img src="/blogify.png" alt="Profile" className={styles.profilePictureSideBar} />
                    Profile
                </div>
                <button className={styles.postButton} onClick={toggleModal}>Post</button>
            </aside>
            <main className={styles.mainContent}>
                <div className={styles.postBox}></div>
            </main>

            {/* Post Modal */}
            <div 
                className={`${styles.modal} ${isModalOpen ? styles.modalOpen : ''}`} 
                onClick={toggleModal}
            >
                <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                    <div className={styles.modalHeader}>
                        <img src="/blogify.png" alt="Profile" className={styles.profilePicturePost} />
                        <h2 className={styles.modalTitle}>What's happening?</h2>
                    </div>
                    <div className={styles.modalBody}>
                        <textarea
                            className={styles.textarea}
                            placeholder="Write something..."
                            value={postContent}
                            onChange={handleTextChange}
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
                            <button className={styles.submitButton}>Post</button>
                        </div>
                        {image && (
                            <div className={styles.imagePreview}>
                                <img src={image} alt="Uploaded Preview" className={styles.previewImage} />
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
