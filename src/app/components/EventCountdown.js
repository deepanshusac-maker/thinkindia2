"use client";

import { useEffect, useState } from "react";
import styles from "./EventCountdown.module.css";

/**
 * Calculates time remaining until a target date.
 * @param {string} targetDateStr - ISO date string e.g. "2026-08-20"
 * @returns {{ days, hours, minutes, seconds, expired }} 
 */
function getTimeRemaining(targetDateStr) {
  const target = new Date(targetDateStr);
  // Treat the date as end-of-day in IST so it counts down to midnight
  target.setHours(23, 59, 59, 999);
  const now = new Date();
  const diff = target - now;

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  return { days, hours, minutes, seconds, expired: false };
}

function Digit({ value, label }) {
  const padded = String(value).padStart(2, "0");
  return (
    <div className={styles.digitGroup}>
      <span className={styles.digitValue} aria-label={`${value} ${label}`}>
        {padded}
      </span>
      <span className={styles.digitLabel}>{label}</span>
    </div>
  );
}

/**
 * EventCountdown — shows a live D:H:M:S countdown for an upcoming event date.
 * Renders nothing if the event has no date, an invalid date, or is in the past.
 *
 * @param {string} dateStr - Event date string (YYYY-MM-DD)
 * @param {string} [className] - Optional extra class on the wrapper
 */
export default function EventCountdown({ dateStr, className = "" }) {
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    if (!dateStr) return;

    // Compute immediately so there's no flicker on first render
    const initial = getTimeRemaining(dateStr);
    setTimeLeft(initial);
    if (initial.expired) return;

    const interval = setInterval(() => {
      const next = getTimeRemaining(dateStr);
      setTimeLeft(next);
      if (next.expired) clearInterval(interval);
    }, 1000);

    return () => clearInterval(interval);
  }, [dateStr]);

  // Don't render on SSR, invalid date, or past events
  if (!timeLeft || timeLeft.expired) return null;

  return (
    <div className={`${styles.countdown} ${className}`} aria-live="polite">
      <span className={styles.countdownLabel}>Starts in</span>
      <div className={styles.digitRow}>
        <Digit value={timeLeft.days} label="d" />
        <span className={styles.separator} aria-hidden="true">:</span>
        <Digit value={timeLeft.hours} label="h" />
        <span className={styles.separator} aria-hidden="true">:</span>
        <Digit value={timeLeft.minutes} label="m" />
        <span className={styles.separator} aria-hidden="true">:</span>
        <Digit value={timeLeft.seconds} label="s" />
      </div>
    </div>
  );
}
