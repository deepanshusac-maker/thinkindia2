"use client";

import Link from "next/link";
import Image from "next/image";
import { FaLinkedinIn, FaInstagram, FaWhatsapp } from "react-icons/fa6";
import { Mail, MapPin, ExternalLink } from "lucide-react";
import styles from "./Footer.module.css";

export default function Footer({ isInstitutePage = false, instituteName = "" }) {
  const currentYear = new Date().getFullYear();

  const brandName = isInstitutePage ? `Think India ${instituteName}` : "Think India Bihar";
  const brandDescription = isInstitutePage
    ? `Connecting students and researchers at ${instituteName} for policy advocacy, legal awareness, and grassroot nation-building.`
    : "A forum of thinkers, innovators, and leaders from premier institutes of Bihar dedicated to nation-building, policy research, and empowering youth.";

  // Context-aware navigation links
  const links = [
    { label: "Home", href: "/" },
    { label: "About Us", href: isInstitutePage ? "/#about" : "#about" },
    { label: "Institutes", href: isInstitutePage ? "/#institutes" : "#institutes" },
    { label: "Events", href: isInstitutePage ? "#events" : "#events" },
    { label: "Gallery", href: isInstitutePage ? "#gallery" : "#gallery" },
    { label: "Contact Us", href: "/contact" },
  ];

  return (
    <footer className={styles.footer} role="contentinfo" aria-label="Site Footer">
      {/* Top Tricolour accent bar */}
      <div className={styles.tricolourStripe} aria-hidden="true" />

      <div className={styles.footerContent}>
        <div className={styles.footerGrid}>
          {/* Column 1: Brand & Logo */}
          <div className={styles.footerBrandCol}>
            <div className={styles.brandContainer}>
              <Image
                src="/logo.jpg"
                alt="Think India Bihar Logo"
                width={48}
                height={48}
                className={styles.brandLogo}
              />
              <span className={styles.brandTitle}>{brandName}</span>
            </div>
            <p className={styles.brandDesc}>{brandDescription}</p>
          </div>

          {/* Column 2: Quick Links */}
          <div className={styles.footerLinksCol}>
            <h4 className={styles.footerColTitle}>Quick Links</h4>
            <nav className={styles.footerNav} aria-label="Footer Navigation">
              {links.map((link) => (
                <Link key={link.label} href={link.href} className={styles.footerLink}>
                  {link.label}
                </Link>
              ))}
              <Link href="/admin" className={styles.adminLink}>
                <span>Admin Portal</span>
                <ExternalLink size={12} className={styles.adminIcon} />
              </Link>
            </nav>
          </div>

          {/* Column 3: Contact & Connect */}
          <div className={styles.footerContactCol}>
            <h4 className={styles.footerColTitle}>Contact & Connect</h4>
            <address className={styles.contactDetails}>
              <div className={styles.contactItem}>
                <MapPin size={16} className={styles.contactIcon} />
                <span>Patna, Bihar, India</span>
              </div>
              <a href="mailto:thinkindia.01bihar@gmail.com" className={styles.contactItemLink}>
                <Mail size={16} className={styles.contactIcon} />
                <span>thinkindia.01bihar@gmail.com</span>
              </a>
            </address>

            <div className={styles.socialContainer}>
              <span className={styles.socialLabel}>Follow Us</span>
              <div className={styles.socialLinks}>
                <a
                  href="https://www.instagram.com/thinkindia_bihar01?utm_source=qr&igsh=MWE0bnJhZ2FoaGhkNw=="
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.socialLink}
                  aria-label="Instagram (Opens in a new tab)"
                >
                  <FaInstagram size={16} />
                </a>
                <a
                  href="https://www.linkedin.com/company/think-india-bihar/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.socialLink}
                  aria-label="LinkedIn (Opens in a new tab)"
                >
                  <FaLinkedinIn size={16} />
                </a>
                <a
                  href="https://whatsapp.com/channel/0029VbCRjefEgGfT4b11hK2H"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.socialLink}
                  aria-label="WhatsApp Channel (Opens in a new tab)"
                >
                  <FaWhatsapp size={16} />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright and meta */}
        <div className={styles.footerBottom}>
          <p className={styles.footerCopy}>
            &copy; {currentYear} Think India Bihar. All rights reserved.
            <span className={styles.creditSep}> • </span>
            <span className={styles.creditText}>
              Designed & Developed by{" "}
              <a
                href="https://github.com/deepanshusac-maker"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.creditLink}
              >
                Deepanshu Sharma
              </a>
              <span className={styles.creditSep}> • </span>
              <a
                href="/developer?easteregg=true"
                className={styles.easterEggLink}
                title="Unlock Creator's Sanctuary"
              >
                DS
              </a>
            </span>
          </p>
          <span className={styles.footerMotto}>जय हिन्द</span>
        </div>
      </div>
    </footer>
  );
}
