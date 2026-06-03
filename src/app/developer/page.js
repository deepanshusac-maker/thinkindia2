"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { FaGithub, FaEnvelope, FaArrowLeft, FaCode, FaHeart, FaFire } from "react-icons/fa";
import styles from "./Developer.module.css";

export default function DeveloperPage() {
  const [isIntro, setIsIntro] = useState(true);
  const [isEasterEgg, setIsEasterEgg] = useState(false);
  const canvasRef = useRef(null);

  // 1. Detect secret Easter egg parameters & run tricolour binary code canvas rain
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("easteregg") === "true") {
        setIsEasterEgg(true);
      }
    }
  }, []);

  useEffect(() => {
    if (!isIntro || !isEasterEgg) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    let animationFrameId;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Character set: Binary code
    const alphabet = "0101010101010101";
    const fontSize = 16;
    const columns = Math.ceil(canvas.width / fontSize);
    const rainDrops = Array(columns).fill(0).map(() => Math.random() * -100);

    const draw = () => {
      // Semi-transparent black to create trails
      ctx.fillStyle = "rgba(3, 7, 18, 0.08)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < rainDrops.length; i++) {
        const text = alphabet.charAt(Math.floor(Math.random() * alphabet.length));
        
        // Staggered Tricolour gradient for drops (Saffron, White, Emerald Green)
        let color = "#FFFFFF";
        if (i % 3 === 0) {
          color = "#F97316"; // Saffron
        } else if (i % 3 === 2) {
          color = "#10B981"; // Emerald Green
        }
        
        ctx.fillStyle = color;
        ctx.font = `bold ${fontSize}px monospace`;
        ctx.fillText(text, i * fontSize, rainDrops[i] * fontSize);

        // Reset drop to top with slight randomness
        if (rainDrops[i] * fontSize > canvas.height && Math.random() > 0.985) {
          rainDrops[i] = 0;
        }
        rainDrops[i]++;
      }
      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", resizeCanvas);
    };
  }, [isIntro, isEasterEgg]);

  // Disable loader after 3.8s
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsIntro(false);
    }, 3800);
    return () => clearTimeout(timer);
  }, []);

  // Split name for letters animation
  const nameString = "DEEPANSHU SHARMA";
  const letters = Array.from(nameString);

  // Mouse tracking neon glow border helper
  const handleMouseMove = (e) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    card.style.setProperty("--mouse-x", `${x}px`);
    card.style.setProperty("--mouse-y", `${y}px`);
  };

  return (
    <div className={styles.devContainer}>
      <AnimatePresence>
        {isIntro && (
          <motion.div
            key="intro"
            className={styles.introOverlay}
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
          >
            {/* Dynamic code canvas if easter egg is active */}
            {isEasterEgg && <canvas ref={canvasRef} className={styles.matrixCanvas} />}

            {/* Slicing horizontal laser lines */}
            <div className={`${styles.laserLine} ${styles.laserSaffron}`} />
            <div className={`${styles.laserLine} ${styles.laserGreen}`} />

            <div className={styles.introTextContainer}>
              <motion.div
                className={styles.introChakra}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
              />

              <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", marginBottom: "1rem" }}>
                {letters.map((char, index) => (
                  <motion.span
                    key={index}
                    className={styles.introTitle}
                    initial={{ opacity: 0, y: 50, rotateX: -90 }}
                    animate={{ opacity: 1, y: 0, rotateX: 0 }}
                    transition={{
                      duration: 0.6,
                      delay: 0.3 + index * 0.08,
                      ease: "easeOut",
                    }}
                    style={{ whiteSpace: char === " " ? "pre" : "normal" }}
                  >
                    {char}
                  </motion.span>
                ))}
              </div>

              <motion.p
                className={styles.introSubtitle}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 0.85, y: 0 }}
                transition={{ duration: 0.8, delay: 1.8, ease: "easeOut" }}
              >
                Lead Architect & Full-Stack Developer
              </motion.p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!isIntro && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.0 }}
          style={{ flex: 1, display: "flex", flexDirection: "column" }}
        >
          {/* Header navigation bar */}
          <header className={styles.navHeader}>
            <div className={styles.navLogo}>DS // Sanctuary</div>
            <Link href="/" className={styles.navLink}>
              <FaArrowLeft style={{ marginRight: "0.5rem", verticalAlign: "middle" }} />
              Return to Site
            </Link>
          </header>

          <main className={styles.mainContent}>
            {/* Hero Showcase Title */}
            <section className={styles.heroSection}>
              <div className={styles.badge}>
                <FaCode style={{ marginRight: "0.4rem", verticalAlign: "middle" }} />
                Creator Space
              </div>
              <h1 className={styles.title}>
                A Vision Built with <span>Determination</span>
              </h1>
              <p className={styles.subtitle}>
                An immersive portal dedicated to celebrating high-fidelity craftsmanship, late-night grit, and the relentless pursuit of coding excellence.
              </p>
            </section>

            {/* Content Command Grid */}
            <div className={styles.grid}>
              {/* Main bio panel */}
              <div
                className={styles.glassCard}
                onMouseMove={handleMouseMove}
                style={{
                  "--mouse-x": "0px",
                  "--mouse-y": "0px",
                }}
              >
                <h2 className={styles.cardTitle}>
                  <FaFire style={{ color: "#F97316" }} />
                  The Chronicle of Grit
                </h2>
                
                <p className={styles.cardText}>
                  Building <strong>Think India Bihar</strong> was not merely an exercise in writing script files—it was a journey of focused creation. As the sole architect, I set out to forge a modern digital sanctuary that seamlessly merges aesthetic patriotism with top-tier technical functionality. 
                </p>

                <p className={styles.cardText}>
                  From designing custom, fluid layouts to establishing secure database pathways via Supabase, every segment was crafted from the ground up. Hours were dedicated to solving responsive reordering bottlenecks, creating glassmorphic visual components, and integrating high-fidelity animations that make the application feel truly alive.
                </p>

                <h3 className={styles.cardTitle} style={{ fontSize: "1.5rem", marginTop: "2.5rem" }}>
                  <FaHeart style={{ color: "#E11D48" }} />
                  Core Engineering Milestones
                </h3>

                <div className={styles.timeline}>
                  <div className={styles.timelineItem} style={{ "--dot-color": "#F97316" }}>
                    <div className={styles.timelineDot} />
                    <div className={styles.timelineHeader}>
                      <span className={styles.timelineTitle}>1. The Blueprint & Architectural Design</span>
                      <span className={styles.timelineTime}>Phase I</span>
                    </div>
                    <p className={styles.timelineDesc}>
                      Laid the foundations of the Next.js single-page flow, structuring clear administrative database pipelines and formulating visual standards in global CSS configurations.
                    </p>
                  </div>

                  <div className={styles.timelineItem} style={{ "--dot-color": "#FFFFFF" }}>
                    <div className={styles.timelineDot} />
                    <div className={styles.timelineHeader}>
                      <span className={styles.timelineTitle}>2. The Supabase & API Crucible</span>
                      <span className={styles.timelineTime}>Phase II</span>
                    </div>
                    <p className={styles.timelineDesc}>
                      Configured the database tables, dynamic triggers, and file storage bucket endpoints to drive live dynamic event schedules, chapters, and the responsive grid gallery.
                    </p>
                  </div>

                  <div className={styles.timelineItem} style={{ "--dot-color": "#10B981" }}>
                    <div className={styles.timelineDot} />
                    <div className={styles.timelineHeader}>
                      <span className={styles.timelineTitle}>3. Micro-Animations & Visual Triumph</span>
                      <span className={styles.timelineTime}>Phase III</span>
                    </div>
                    <p className={styles.timelineDesc}>
                      Injected GSAP-powered reveals, responsive logo frames, and the majestic Ashoka Chakra SVG vector drawing sequence to create a staggering, premium first impression.
                    </p>
                  </div>
                </div>
              </div>

              {/* Sidebar dashboard card */}
              <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
                <div className={`${styles.glassCard} ${styles.profileWidget}`}>
                  <div className={styles.avatarFrame}>
                    <div className={styles.avatarInner}>DS</div>
                  </div>
                  <h2 className={styles.devName}>Deepanshu Sharma</h2>
                  <div className={styles.devRole}>Full Stack Craftsman</div>
                  
                  <p className={styles.cardText} style={{ fontSize: "0.85rem", opacity: 0.8 }}>
                    &quot;Code is the medium through which we shape reality. True engineering requires both mathematical precision and artistic determination.&quot;
                  </p>

                  <div className={styles.statsGrid}>
                    <div className={styles.statItem}>
                      <div className={styles.statValue}>100%</div>
                      <div className={styles.statLabel}>Responsive</div>
                    </div>
                    <div className={styles.statItem}>
                      <div className={styles.statValue}>Clean</div>
                      <div className={styles.statLabel}>Architecture</div>
                    </div>
                  </div>
                </div>

                <div className={styles.glassCard}>
                  <h3 className={styles.cardTitle} style={{ fontSize: "1.4rem" }}>
                    Technology Stack
                  </h3>
                  <p className={styles.cardText} style={{ fontSize: "0.85rem", marginBottom: "1rem" }}>
                    The advanced stack backing this project:
                  </p>
                  <div className={styles.techGrid}>
                    <span className={styles.techTag}>Next.js 16</span>
                    <span className={styles.techTag}>React 19</span>
                    <span className={styles.techTag}>Supabase SSR</span>
                    <span className={styles.techTag}>PostgreSQL</span>
                    <span className={styles.techTag}>GSAP 3</span>
                    <span className={styles.techTag}>Framer Motion</span>
                    <span className={styles.techTag}>Vanilla CSS Modules</span>
                    <span className={styles.techTag}>Git / CI-CD</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom high-fidelity CTAs */}
            <div className={styles.actionsRow}>
              <Link href="/" className={styles.secondaryBtn}>
                <FaArrowLeft />
                Return to Homepage
              </Link>
              <a
                href="https://github.com/deepanshusac-maker"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.primaryBtn}
              >
                <FaGithub />
                Explore my GitHub
              </a>
              <a
                href="mailto:deepanshu.sharma.sac@gmail.com"
                className={styles.secondaryBtn}
              >
                <FaEnvelope />
                Get in Touch
              </a>
            </div>
          </main>
        </motion.div>
      )}
    </div>
  );
}
