"use client";

import { useState } from "react";
import { Share2, Check } from "lucide-react";
import styles from "./ShareButton.module.css";

/**
 * ShareButton — uses the Web Share API on supported devices (mobile),
 * falls back to copying a link to clipboard on desktop.
 *
 * @param {string} title  - Event title
 * @param {string} text   - Short description text
 * @param {string} [url]  - URL to share (defaults to current page URL)
 * @param {string} [className] - Extra class on the button
 * @param {"icon"|"full"} [variant] - "icon" = icon only, "full" = icon + label
 */
export default function ShareButton({
  title,
  text,
  url,
  className = "",
  variant = "full",
}) {
  const [copied, setCopied] = useState(false);

  const shareUrl = url || (typeof window !== "undefined" ? window.location.href : "");

  const handleShare = async (e) => {
    e.stopPropagation(); // prevent triggering parent card click / modal open

    const shareData = { title, text, url: shareUrl };

    try {
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        // Native share sheet (mobile)
        await navigator.share(shareData);
      } else {
        // Clipboard fallback (desktop)
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2200);
      }
    } catch {
      // User cancelled or permission denied — silently ignore
    }
  };

  return (
    <button
      type="button"
      onClick={handleShare}
      className={`${styles.shareBtn} ${variant === "icon" ? styles.iconOnly : ""} ${className}`}
      aria-label={copied ? "Link copied!" : `Share "${title}"`}
      title={copied ? "Link copied!" : "Share this event"}
    >
      {copied ? (
        <Check size={14} className={styles.checkIcon} />
      ) : (
        <Share2 size={14} />
      )}
      {variant === "full" && (
        <span>{copied ? "Copied!" : "Share"}</span>
      )}
    </button>
  );
}
