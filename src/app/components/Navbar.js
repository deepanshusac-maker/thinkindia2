"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Menu, X } from "lucide-react";
import styles from "./Navbar.module.css";

/** Section IDs observed for active-link detection. */
const SECTION_IDS = ["about", "institutes", "events", "gallery"];

/** Nav link definitions. */
const NAV_LINKS = [
  { label: "Home", href: "/", section: null },
  { label: "About", href: "/#about", section: "about" },
  { label: "Institutes", href: "/#institutes", section: "institutes" },
  { label: "Events", href: "/#events", section: "events" },
  { label: "Gallery", href: "/#gallery", section: "gallery" },
];

/**
 * Premium sticky navigation bar for public-facing pages,
 * implementing the 'Modern Heritage' design aesthetic.
 *
 * Features:
 *  - Smart sticky (hides on scroll-down, shows on scroll-up)
 *  - Scroll progress bar
 *  - Active section highlighting via IntersectionObserver
 *  - Responsive mobile drawer with animated hamburger
 */
export default function Navbar() {
  const pathname = usePathname();
  const lastScrollY = useRef(0);

  const [mobileOpen, setMobileOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeSection, setActiveSection] = useState(null);

  // ──────────────────────────────────────────────
  //  Smart sticky + scroll progress
  // ──────────────────────────────────────────────
  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      const docHeight = document.body.scrollHeight - window.innerHeight;

      // Progress
      const progress = docHeight > 0 ? (currentY / docHeight) * 100 : 0;
      setScrollProgress(Math.min(progress, 100));

      // Smart sticky — hide when scrolling down past 100px, show on scroll-up
      if (currentY > 100 && currentY > lastScrollY.current) {
        setHidden(true);
      } else {
        setHidden(false);
      }

      lastScrollY.current = currentY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // ──────────────────────────────────────────────
  //  Active section detection (IntersectionObserver)
  // ──────────────────────────────────────────────
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        }
      },
      { rootMargin: "-30% 0px -60% 0px", threshold: 0 }
    );

    const elements = SECTION_IDS.map((id) => document.getElementById(id)).filter(Boolean);
    elements.forEach((el) => observer.observe(el));

    return () => {
      elements.forEach((el) => observer.unobserve(el));
      observer.disconnect();
    };
  }, []);

  // ──────────────────────────────────────────────
  //  Close mobile menu on route change
  // ──────────────────────────────────────────────
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // ──────────────────────────────────────────────
  //  Helpers
  // ──────────────────────────────────────────────
  const closeMobile = useCallback(() => setMobileOpen(false), []);

  const isActive = (link) => {
    if (link.section) return activeSection === link.section;
    // "Home" is active when at top with no section in view
    return link.href === "/" && !activeSection && pathname === "/";
  };

  const linkClassName = (link) =>
    `${styles.navLink} ${isActive(link) ? styles.navLinkActive : ""}`;

  const mobileLinkClassName = (link) =>
    `${styles.mobileNavLink} ${isActive(link) ? styles.mobileNavLinkActive : ""}`;

  // ──────────────────────────────────────────────
  //  Render
  // ──────────────────────────────────────────────
  return (
    <nav
      className={`${styles.navbar} ${hidden ? styles.navHidden : ""}`}
      role="navigation"
      aria-label="Main navigation"
    >
      {/* Scroll progress bar */}
      <div
        className={styles.progressBar}
        style={{ width: scrollProgress + "%" }}
        aria-hidden="true"
      />

      {/* Header row */}
      <div className={styles.header}>
        {/* Brand */}
        <Link href="/" className={styles.brand} onClick={closeMobile}>
          <Image 
            src="/logo.jpg" 
            alt="Think India Bihar Logo" 
            width={50} 
            height={50} 
            className={styles.brandLogo} 
            priority
          />
        </Link>

        {/* Desktop links */}
        <div className={styles.desktopNav}>
          {NAV_LINKS.map((link) =>
            link.href.startsWith("/#") ? (
              <a key={link.label} href={link.href} className={linkClassName(link)}>
                {link.label}
              </a>
            ) : (
              <Link key={link.label} href={link.href} className={linkClassName(link)}>
                {link.label}
              </Link>
            )
          )}

          <Link href="/admin" className={styles.adminBtn}>
            <LayoutDashboard size={15} />
            <span>Admin Portal</span>
          </Link>
        </div>

        {/* Hamburger (mobile) */}
        <button
          className={`${styles.hamburger} ${mobileOpen ? styles.hamburgerOpen : ""}`}
          onClick={() => setMobileOpen((prev) => !prev)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
        >
          <span className={styles.hamburgerBar} />
          <span className={styles.hamburgerBar} />
          <span className={styles.hamburgerBar} />
        </button>
      </div>

      {/* Mobile drawer */}
      <div
        className={`${styles.mobileMenu} ${mobileOpen ? styles.mobileMenuOpen : ""}`}
        aria-hidden={!mobileOpen}
      >
        {NAV_LINKS.map((link) =>
          link.href.startsWith("/#") ? (
            <a
              key={link.label}
              href={link.href}
              className={mobileLinkClassName(link)}
              onClick={closeMobile}
            >
              {link.label}
            </a>
          ) : (
            <Link
              key={link.label}
              href={link.href}
              className={mobileLinkClassName(link)}
              onClick={closeMobile}
            >
              {link.label}
            </Link>
          )
        )}

        <Link href="/admin" className={styles.mobileAdminBtn} onClick={closeMobile}>
          <LayoutDashboard size={16} />
          <span>Admin Portal</span>
        </Link>
      </div>
    </nav>
  );
}
