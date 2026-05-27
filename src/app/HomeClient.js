"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowRight, Building2, AlertTriangle, ExternalLink, Calendar, Image as ImageIcon, Shield, Users, HeartHandshake } from "lucide-react";
import { FaXTwitter, FaLinkedinIn, FaInstagram } from 'react-icons/fa6';
import Navbar from "@/app/components/Navbar";
import SkeletonImage from "@/app/components/SkeletonImage";
import { getAssetUrl } from "@/lib/supabase/client";
import styles from "./HomeClient.module.css";

export default function HomeClient({ institutes, events, gallery, usingMockData }) {
  const heroRef = useRef(null);
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const ctaRef = useRef(null);
  const aboutSectionRef = useRef(null);
  const gridRef = useRef(null);
  const eventsSectionRef = useRef(null);
  const gallerySectionRef = useRef(null);

  // Filter events to only show upcoming ones, capped at 4 for a clean homepage grid
  const upcomingEvents = events
    .filter((e) => e.metadata?.isUpcoming || e.metadata?.status === "upcoming" || new Date(e.metadata?.date || "") > new Date())
    .slice(0, 4);

  // Date formatter
  const formatDate = (dateStr) => {
    if (!dateStr) return "TBD";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  // Split word helper for GSAP staggered animation
  const renderLetters = (word) => {
    return (
      <span className={styles.brandWord}>
        {word.split("").map((letter, idx) => (
          <span
            key={idx}
            className={`${styles.brandLetter} letter-item`}
            style={{ display: "inline-block" }}
          >
            {letter}
          </span>
        ))}
      </span>
    );
  };

  useEffect(() => {
    let gsapInstance;
    let ScrollTriggerInstance;

    async function initAnimations() {
      const gsapModule = await import("gsap");
      const scrollTriggerModule = await import("gsap/ScrollTrigger");

      gsapInstance = gsapModule.gsap;
      ScrollTriggerInstance = scrollTriggerModule.ScrollTrigger;
      
      gsapInstance.registerPlugin(ScrollTriggerInstance);

      // 1. Initial Hero Stagger Animation
      const tl = gsapInstance.timeline();

      tl.fromTo(
        ".letter-item",
        { opacity: 0, y: 40, rotateX: -40 },
        {
          opacity: 1,
          y: 0,
          rotateX: 0,
          duration: 0.7,
          stagger: 0.04,
          ease: "back.out(1.5)",
        }
      );

      tl.fromTo(
        subtitleRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" },
        "-=0.4"
      );

      tl.fromTo(
        ctaRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" },
        "-=0.3"
      );


      // 2. Scroll Trigger reveals for homepage sections
      const sections = [
        { el: aboutSectionRef.current, triggerEl: aboutSectionRef.current, className: ".pillar-card" },
        { el: gridRef.current, triggerEl: gridRef.current, className: ".institute-card" },
        { el: eventsSectionRef.current, triggerEl: eventsSectionRef.current, className: ".event-card" },
        { el: gallerySectionRef.current, triggerEl: gallerySectionRef.current, className: ".gallery-card" }
      ];

      sections.forEach(({ el, triggerEl, className }) => {
        if (!el) return;
        gsapInstance.fromTo(
          el,
          { opacity: 0, y: 50 },
          {
            opacity: 1,
            y: 0,
            duration: 0.75,
            ease: "power2.out",
            scrollTrigger: {
              trigger: triggerEl,
              start: "top 80%",
              toggleActions: "play none none none",
            },
            onStart: () => {
              // Stagger reveal the children cards inside the section
              gsapInstance.fromTo(
                className,
                { opacity: 0, y: 30 },
                { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: "power2.out" }
              );
            }
          }
        );
      });
    }

    initAnimations();

    return () => {
      if (ScrollTriggerInstance) {
        ScrollTriggerInstance.getAll().forEach((t) => t.kill());
      }
    };
  }, []);

  return (
    <div className={styles.wrapper}>
      {/* Navigation */}
      <Navbar />

      {/* Hero Section */}
      <section ref={heroRef} className={styles.hero}>
        <div className={styles.heroContent}>
          {usingMockData && (
            <div className={styles.fallbackBanner}>
              <AlertTriangle size={14} />
              <span>Preview Mode (Database Unconfigured or Empty)</span>
            </div>
          )}

          <div className={styles.logoRevealContainer}>
            <h1 ref={titleRef} className={styles.heroTitle}>
              {renderLetters("Think")} {renderLetters("India")} {renderLetters("Bihar")}
            </h1>
          </div>

          <p ref={subtitleRef} className={styles.heroSubtitle}>
            A forum of thinkers and leaders from Bihar&apos;s premier institutes — dedicated to building India&apos;s next great chapter through policy research, legal awareness, and civic action.
          </p>

          <div ref={ctaRef} className={styles.heroCta}>
            <a href="#institutes" className={styles.btnPrimary}>
              Explore Institutes <ArrowRight size={18} />
            </a>
            <a href="#gallery" className={styles.btnSecondary}>
              View Gallery
            </a>
          </div>
        </div>

        <div className={styles.heroVisual}>
          <img
            src="/hero_bg.png"
            alt="Think India Bihar"
            style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "inherit" }}
          />
        </div>
      </section>

      {/* About Think India Section */}
      <section id="about" ref={aboutSectionRef} className={styles.aboutSection} style={{ opacity: 1 }}>
        <div className={styles.aboutContainer}>
          <div className={styles.aboutLayout}>
            {/* Left Content */}
            <div className={styles.aboutContent}>
              <span className={styles.aboutLabel}>Nation First, Always</span>
              <h2 className={styles.aboutTitle}>
                Fostering Nationalist Youth Leadership<span className={styles.sectionTitleDot}>.</span>
              </h2>
              <p className={styles.aboutText}>
                Think India is a vibrant forum of students, researchers, and young professionals from premier institutes of national importance (IITs, IIMs, NITs, NLUs, and others). We believe that India's greatest chapter is yet to be written. We are dedicated to creating a generation of nationalist leaders, policy thinkers, and social innovators who work collectively towards national development, social harmony, and the realization of India's potential.
              </p>
              
              <div className={styles.pillarsGrid}>
                {/* Pillar 1: Saffron */}
                <div className={`${styles.pillarCard} pillar-card ${styles.pillarSaffron}`}>
                  <div className={styles.pillarIcon}><Shield size={22} /></div>
                  <h4 className={styles.pillarTitle}>Nation First</h4>
                  <p className={styles.pillarDesc}>
                    Instilling constitutional values, civic responsibility, and deep-rooted patriotism to create positive national impact.
                  </p>
                </div>
                
                {/* Pillar 2: Navy */}
                <div className={`${styles.pillarCard} pillar-card ${styles.pillarNavy}`}>
                  <div className={styles.pillarIcon}><Users size={22} /></div>
                  <h4 className={styles.pillarTitle}>Premier Network</h4>
                  <p className={styles.pillarDesc}>
                    Uniting brilliant minds across elite technical, management, and legal institutions under a single visionary banner.
                  </p>
                </div>
                
                {/* Pillar 3: Green */}
                <div className={`${styles.pillarCard} pillar-card ${styles.pillarGreen}`}>
                  <div className={styles.pillarIcon}><HeartHandshake size={22} /></div>
                  <h4 className={styles.pillarTitle}>Social Impact</h4>
                  <p className={styles.pillarDesc}>
                    Bridging elite academic research with grassroots community service, rural development, and policy solutions.
                  </p>
                </div>
              </div>
            </div>

            {/* Right Visual Panel representing nationalism */}
            <div className={styles.aboutVisual}>
              <div className={styles.visualFrame}>
                <SkeletonImage
                  src="/about_graphic.png"
                  alt="Think India Nationalism and Youth Empowerment Graphic"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Institutes Grid Section */}
      <section id="institutes" className={styles.chaptersSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>
            Our Institutes<span className={styles.sectionTitleDot}>.</span>
          </h2>
          <p className={styles.sectionSubtitle}>
            Connecting premier institutions of Bihar under a unified banner for civic awareness and policy research.
          </p>
        </div>

        <div ref={gridRef} className={styles.grid}>
          {institutes.map((inst) => (
            <Link key={inst.id} href={`/institute/${inst.slug}`}>
              <div className={`${styles.card} institute-card`}>
                <div className={styles.cardContent}>
                  <div className={styles.cardIcon}>
                    <Building2 size={24} />
                  </div>
                  <h3 className={styles.cardTitle}>{inst.name}</h3>
                  <p className={styles.cardText}>
                    {inst.about_text
                      ? inst.about_text.substring(0, 140) + (inst.about_text.length > 140 ? "..." : "")
                      : "Learn about the student leadership, research publications, and dynamic national events run by this institute."}
                  </p>
                </div>
                <div className={styles.cardFooter}>
                  <span>Explore Institute</span>
                  <ExternalLink size={14} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Upcoming Events Section (Consolidated from all institutes) */}
      <section id="events" ref={eventsSectionRef} className={styles.eventsSection} style={{ opacity: 1 /* Animates via GSAP */ }}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>
            Upcoming Events<span className={styles.sectionTitleDot}>.</span>
          </h2>
          <p className={styles.sectionSubtitle}>
            Join our forum activities, policy workshops, and legal awareness campaigns scheduled across various institutes.
          </p>
        </div>

        {upcomingEvents.length === 0 ? (
          <p className={styles.emptyState} style={{ maxWidth: "600px", margin: "0 auto" }}>
            No upcoming events scheduled at the moment. Check back soon!
          </p>
        ) : (
          <div className={styles.eventsGrid}>
            {upcomingEvents.map((evt) => {
              const eventImages = evt.metadata?.images || (evt.image_url ? [evt.image_url] : []);
              const hasMultipleImages = eventImages.length > 1;

              return (
                <div
                  key={evt.id}
                  className={`${styles.eventCard} event-card`}
                  style={{ padding: eventImages.length > 0 ? "0" : "2rem", overflow: "hidden" }}
                >
                  {hasMultipleImages ? (
                    <div className={styles.eventImageTrack}>
                      {eventImages.map((imgUrl, i) => (
                        <div key={i} className={styles.eventTrackImageFrame}>
                          <SkeletonImage
                            src={getAssetUrl(imgUrl)}
                            alt={evt.title}
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          />
                        </div>
                      ))}
                    </div>
                  ) : eventImages.length === 1 ? (
                    <div className={styles.eventImageFrame}>
                      <SkeletonImage
                        src={getAssetUrl(eventImages[0])}
                        alt={evt.title}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    </div>
                  ) : null}
                  <div
                    className={styles.eventCardBody}
                    style={{ padding: eventImages.length > 0 ? "1.5rem 2rem 2rem" : "0" }}
                  >
                    <div className={styles.eventHeader}>
                      <span className={styles.instituteTag}>
                        {evt.institutes?.name || "State Council"}
                      </span>
                      <span className={styles.eventTag}>
                        <Calendar size={12} style={{ marginRight: "4px", verticalAlign: "middle" }} />
                        {formatDate(evt.metadata?.date)}
                      </span>
                    </div>
                    <h3 className={styles.eventTitle}>{evt.title}</h3>
                    {evt.metadata?.description && (
                      <p className={styles.eventDesc}>{evt.metadata.description}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Gallery Highlights Section (Consolidated from all institutes) */}
      <section id="gallery" ref={gallerySectionRef} className={styles.gallerySection} style={{ opacity: 1 /* Animates via GSAP */ }}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>
            Gallery Highlights<span className={styles.sectionTitleDot}>.</span>
          </h2>
          <p className={styles.sectionSubtitle}>
            A visual showcase of activities, workshops, seminars, and initiatives conducted by chapters.
          </p>
        </div>

        {gallery.length === 0 ? (
          <p className={styles.emptyState} style={{ maxWidth: "600px", margin: "0 auto" }}>
            No photos uploaded to the gallery highlights yet.
          </p>
        ) : (
          <div className={styles.galleryGrid}>
            {gallery.slice(0, 6).map((photo, index) => {
              // Varying heights for dynamic masonry highlights
              const heights = ["280px", "360px", "240px", "320px"];
              const frameHeight = heights[index % heights.length];

              return (
                <div key={photo.id} className={`${styles.galleryCard} gallery-card`}>
                  <div className={styles.galleryImageFrame} style={{ height: frameHeight }}>
                    <SkeletonImage
                      src={getAssetUrl(photo.image_url)}
                      alt={photo.title}
                      style={{ height: "100%", width: "100%" }}
                    />
                  </div>
                  <div className={styles.galleryCardBody}>
                    <h3 className={styles.galleryTitle}>{photo.title}</h3>
                    {photo.description && (
                      <p style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", margin: "0.15rem 0 0.4rem" }}>
                        {photo.description}
                      </p>
                    )}
                    <span className={styles.galleryInstituteName}>
                      {photo.institutes?.name || "Think India Bihar"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.footerGrid}>
            {/* Column 1: Brand */}
            <div className={styles.footerBrandCol}>
              <div className={styles.footerBrand}>Think India Bihar</div>
              <p className={styles.footerAbout}>A forum of students, researchers, and young professionals from premier institutes dedicated to nation-building.</p>
            </div>
            {/* Column 2: Quick Links */}
            <div className={styles.footerLinksCol}>
              <h4 className={styles.footerColTitle}>Quick Links</h4>
              <Link href="/" className={styles.footerLink}>Home</Link>
              <a href="#about" className={styles.footerLink}>About</a>
              <a href="#institutes" className={styles.footerLink}>Institutes</a>
              <Link href="/admin" className={styles.footerLink}>Admin Portal</Link>
            </div>
            {/* Column 3: Connect */}
            <div className={styles.footerSocialCol}>
              <h4 className={styles.footerColTitle}>Connect</h4>
              <div className={styles.socialLinks}>
                <a href="#" className={styles.socialLink} aria-label="Twitter"><FaXTwitter size={18} /></a>
                <a href="#" className={styles.socialLink} aria-label="LinkedIn"><FaLinkedinIn size={18} /></a>
                <a href="#" className={styles.socialLink} aria-label="Instagram"><FaInstagram size={18} /></a>
              </div>
            </div>
          </div>
          <div className={styles.footerBottom}>
            <div className={styles.footerCopy}>&copy; {new Date().getFullYear()} Think India Bihar. All rights reserved.</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
