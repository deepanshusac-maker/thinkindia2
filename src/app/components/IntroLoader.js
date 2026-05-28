"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./IntroLoader.module.css";

const CHAKRA_COLOR = "#60A5FA"; // Glowing sapphire blue
const HUB_COLOR = "#3B82F6";

export default function IntroLoader({ onComplete }) {
  const [visible, setVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    // 1. Session Memory Bypass: Play only on the first visit of the browser session
    const hasPlayed = sessionStorage.getItem("thinkIndiaBiharIntroPlayed");
    if (hasPlayed === "true") {
      onComplete(); // Skip directly to home client rendering
    } else {
      setShouldRender(true);
      setVisible(true);
      
      // Prevent scrolling during loader animation
      document.body.style.overflow = "hidden";

      // 2. Set timeout to slide up and finish loader (2.8 seconds total duration)
      const timer = setTimeout(() => {
        setVisible(false);
        sessionStorage.setItem("thinkIndiaBiharIntroPlayed", "true");
        document.body.style.overflow = "";
        
        // Let slide-up transition finish before trigger callback
        setTimeout(() => {
          onComplete();
        }, 800);
      }, 2800);

      return () => clearTimeout(timer);
    }
  }, [onComplete]);

  if (!shouldRender) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className={styles.overlay}
          initial={{ y: 0 }}
          exit={{ 
            y: "-100vh",
            transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] } 
          }}
        >
          {/* Ambient Saffron & Green Auroras */}
          <motion.div
            className={styles.auroraSaffron}
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1.2, opacity: 0.14 }}
            transition={{ duration: 2.2, ease: "easeOut" }}
          />
          <motion.div
            className={styles.auroraGreen}
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1.2, opacity: 0.1 }}
            transition={{ duration: 2.2, ease: "easeOut" }}
          />

          <div className={styles.centerContainer}>
            {/* Ashoka Chakra Vector Constellation */}
            <div className={styles.chakraWrapper}>
              <svg
                width="160"
                height="160"
                viewBox="0 0 200 200"
                className={styles.chakraSvg}
              >
                {/* Outer Rim */}
                <motion.circle
                  cx="100"
                  cy="100"
                  r="78"
                  stroke={CHAKRA_COLOR}
                  strokeWidth="4"
                  fill="none"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1.8, ease: "easeInOut" }}
                />

                {/* Inner Hub Circle */}
                <motion.circle
                  cx="100"
                  cy="100"
                  r="18"
                  stroke={HUB_COLOR}
                  strokeWidth="3.5"
                  fill="none"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1.3, ease: "easeInOut" }}
                />

                {/* Center Hub Core */}
                <motion.circle
                  cx="100"
                  cy="100"
                  r="5"
                  fill={CHAKRA_COLOR}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 1.1, duration: 0.3 }}
                />

                {/* 24 Mathematical Spokes */}
                {Array.from({ length: 24 }).map((_, i) => {
                  const angle = i * 15;
                  return (
                    <motion.line
                      key={i}
                      x1="100"
                      y1="100"
                      x2="100"
                      y2="22"
                      stroke={CHAKRA_COLOR}
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      transform={`rotate(${angle}, 100, 100)`}
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{
                        duration: 1.4,
                        delay: 0.4,
                        ease: "easeInOut",
                      }}
                    />
                  );
                })}
              </svg>
            </div>

            {/* Sacred Sanskrit Quote Rise */}
            <motion.div
              className={styles.sanskritText}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.3, duration: 0.8, ease: "easeOut" }}
            >
              सत्यमेव जयते
            </motion.div>
            
            {/* Secondary branded label */}
            <motion.div
              className={styles.subText}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              transition={{ delay: 1.8, duration: 0.6 }}
            >
              THINK INDIA BIHAR
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
