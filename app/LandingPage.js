import Link from 'next/link';
import styles from './styles/LandingPage.module.css';

export default function LandingPage() {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>
        <span className={styles.blogify}>Blogify</span>
        <p className={styles.slogan}>Blogging made easier</p>
      </h1>
      <Link href="./auth/Signup">
        <button className={styles.btn}>Start Blogging Now</button>
      </Link>
    </div>
  );
}
