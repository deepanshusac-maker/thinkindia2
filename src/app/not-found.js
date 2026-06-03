import Link from "next/link";
import { Compass, Home, Mail } from "lucide-react";
import styles from "./not-found.module.css";

export default function NotFound() {
  return (
    <div className={styles.container}>
      {/* Visual background decorations */}
      <div className={styles.glowOrange} />
      <div className={styles.glowGreen} />

      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.iconWrapper}>
            <Compass size={40} className={styles.icon} />
          </div>
          <span className={styles.errorCode}>404 Error</span>
          <h1 className={styles.title}>Page Not Found</h1>
          <p className={styles.subtitle}>
            The page you are looking for does not exist or has been moved to a different address.
          </p>
        </div>

        <div className={styles.divider} />

        <div className={styles.suggestions}>
          <p className={styles.suggestTitle}>What can you do?</p>
          <ul className={styles.suggestList}>
            <li>Check the URL for syntax or spelling mistakes</li>
            <li>Use the navigation buttons below to find your way</li>
            <li>Get in touch with support if you believe this is a system bug</li>
          </ul>
        </div>

        <div className={styles.actionRow}>
          <Link href="/" className={styles.btnPrimary} aria-label="Navigate back to homepage">
            <Home size={16} />
            Back to Home
          </Link>
          
          <Link href="/contact" className={styles.btnSecondary} aria-label="Go to contact page">
            <Mail size={16} />
            Contact Support
          </Link>
        </div>
      </div>
    </div>
  );
}
