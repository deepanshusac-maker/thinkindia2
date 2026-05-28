"use client";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import styles from "./contact.module.css";

const CONTACT_ITEMS = [
  {
    id: "email",
    icon: "✉️",
    label: "Email Us",
    value: "thinkindia.01bihar@gmail.com",
    href: "mailto:thinkindia.01bihar@gmail.com",
    cta: "Send an Email",
    color: "saffron",
    description:
      "Reach out to us directly for inquiries, collaborations, or any queries.",
  },
  {
    id: "instagram",
    icon: "📸",
    label: "Instagram",
    value: "@thinkindia_bihar01",
    href: "https://www.instagram.com/thinkindia_bihar01?utm_source=qr&igsh=MWE0bnJhZ2FoaGhkNw==",
    cta: "Follow on Instagram",
    color: "pink",
    description:
      "Follow our Instagram for campus updates, event highlights, and behind-the-scenes moments.",
  },
  {
    id: "linkedin",
    icon: "💼",
    label: "LinkedIn",
    value: "Think India Bihar",
    href: "https://www.linkedin.com/company/think-india-bihar/",
    cta: "Connect on LinkedIn",
    color: "blue",
    description:
      "Connect with us professionally for partnerships, internship opportunities, and policy discussions.",
  },
  {
    id: "whatsapp",
    icon: "💬",
    label: "WhatsApp Channel",
    value: "Think India Bihar Channel",
    href: "https://whatsapp.com/channel/0029VbCRjefEgGfT4b11hK2H",
    cta: "Follow on WhatsApp",
    color: "green",
    description:
      "Join our WhatsApp channel for real-time updates, event alerts, and exclusive announcements.",
  },
];

export default function ContactClient() {
  return (
    <div className={`modern-heritage ${styles.page}`}>
      <Navbar />

      <main className={styles.main}>
        {/* ── Hero Banner ── */}
        <section className={styles.hero}>
          <div className={styles.heroInner}>
            <span className={styles.heroPill}>Get In Touch</span>
            <h1 className={styles.heroTitle}>
              Connect With{" "}
              <span className={styles.heroAccent}>Think India Bihar</span>
            </h1>
            <p className={styles.heroSub}>
              Whether you&rsquo;re a student eager to join, a researcher
              looking to collaborate, or a partner with a shared vision — we
              would love to hear from you.
            </p>
          </div>
          {/* Decorative tricolour rule */}
          <div className={styles.triRule} aria-hidden="true" />
        </section>

        {/* ── Contact Cards Grid ── */}
        <section className={styles.cardsSection}>
          <div className={styles.cardsGrid}>
            {CONTACT_ITEMS.map((item) => (
              <a
                key={item.id}
                href={item.href}
                target={item.id === "email" ? "_self" : "_blank"}
                rel="noopener noreferrer"
                className={`${styles.card} ${styles[`card--${item.color}`]}`}
                aria-label={`${item.label} — ${item.value}`}
              >
                {/* Icon bubble */}
                <div className={styles.cardIconWrap}>
                  <span className={styles.cardIcon} aria-hidden="true">
                    {item.icon}
                  </span>
                </div>

                <div className={styles.cardBody}>
                  <span className={styles.cardLabel}>{item.label}</span>
                  <span className={styles.cardValue}>{item.value}</span>
                  <p className={styles.cardDesc}>{item.description}</p>
                </div>

                {/* CTA footer */}
                <div className={styles.cardFooter}>
                  <span className={styles.cardCta}>{item.cta}</span>
                  <svg
                    className={styles.cardArrow}
                    viewBox="0 0 20 20"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M4 10h12M10 4l6 6-6 6"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </a>
            ))}
          </div>
        </section>

        {/* ── Motto Banner ── */}
        <section className={styles.motto}>
          <p className={styles.mottoText}>
            <span aria-hidden="true">🇮🇳</span> Nation First, Always{" "}
            <span aria-hidden="true">🇮🇳</span>
          </p>
        </section>
      </main>

      <Footer />
    </div>
  );
}
