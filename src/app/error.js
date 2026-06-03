"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, RotateCcw, Home } from "lucide-react";
import styles from "./error-page.module.css";

export default function Error({ error, unstable_retry }) {
  useEffect(() => {
    // Log the error to console or error tracking service
    console.error("Application error boundary caught:", error);
  }, [error]);

  return (
    <div className={styles.container}>
      {/* Visual background decorations */}
      <div className={styles.glowOrange} />
      <div className={styles.glowGreen} />

      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.iconWrapper}>
            <AlertCircle size={40} className={styles.icon} />
          </div>
          <h1 className={styles.title}>Something went wrong</h1>
          <p className={styles.subtitle}>
            An unexpected error occurred during page rendering.
          </p>
        </div>

        <div className={styles.errorDetails}>
          <code className={styles.digest}>
            {error?.digest ? `Error digest: ${error.digest}` : "Internal system error"}
          </code>
        </div>

        <div className={styles.actionRow}>
          <button
            onClick={() => unstable_retry()}
            className={styles.retryBtn}
            aria-label="Try rendering the page again"
          >
            <RotateCcw size={16} />
            Try Again
          </button>
          
          <Link href="/" className={styles.homeLink} aria-label="Return to home page">
            <Home size={16} />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
