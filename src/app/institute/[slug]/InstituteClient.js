"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, ChevronLeft, ChevronRight, Calendar, AlertTriangle } from "lucide-react";
import { FaXTwitter, FaLinkedinIn, FaInstagram } from 'react-icons/fa6';
import Navbar from "@/app/components/Navbar";
import SkeletonImage from "@/app/components/SkeletonImage";
import { getAssetUrl } from "@/lib/supabase/client";
import styles from "./InstituteClient.module.css";

export default function InstituteClient({ institute, team, events, gallery, usingMockData }) {
  const carouselTrackRef = useRef(null);
  const aboutSectionRef = useRef(null);
  const teamSectionRef = useRef(null);
  const eventsSectionRef = useRef(null);
  const gallerySectionRef = useRef(null);

  // Group events by status
  const upcomingEvents = events.filter((e) => e.metadata?.isUpcoming || e.metadata?.status === "upcoming" || new Date(e.metadata?.date || "") > new Date());
  const pastEvents = events.filter((e) => !upcomingEvents.some((ue) => ue.id === e.id));

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

  // Carousel controls
  const scrollCarousel = (direction) => {
    if (carouselTrackRef.current) {
      const cardWidth = 280;
      const gap = 32;
      const scrollOffset = direction === "left" ? -(cardWidth + gap) : (cardWidth + gap);
      carouselTrackRef.current.scrollBy({ left: scrollOffset, behavior: "smooth" });
    }
  };

  // ScrollTrigger reveals
  useEffect(() => {
    let gsapInstance;
    let ScrollTriggerInstance;

    async function initScrollTrigger() {
      const gsapModule = await import("gsap");
      const scrollTriggerModule = await import("gsap/ScrollTrigger");

      gsapInstance = gsapModule.gsap;
      ScrollTriggerInstance = scrollTriggerModule.ScrollTrigger;

      gsapInstance.registerPlugin(ScrollTriggerInstance);

      // Animate sections into view as the user scrolls down
      const sections = [
        teamSectionRef.current,
        eventsSectionRef.current,
        gallerySectionRef.current
      ];

      sections.forEach((sec) => {
        if (!sec) return;
        gsapInstance.fromTo(
          sec,
          { opacity: 0, y: 60 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power2.out",
            scrollTrigger: {
              trigger: sec,
              start: "top 80%",
              toggleActions: "play none none none",
            }
          }
        );
      });
    }

    initScrollTrigger();

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

      {/* Fallback alert banner */}
      {usingMockData && (
        <div className={styles.fallbackBanner}>
          <AlertTriangle size={14} />
          <span>Preview Mode (Database Unconfigured or Empty)</span>
        </div>
      )}

      {/* Hero Header */}
      <header className={styles.hero}>
        <div className={styles.heroContainer}>
          <Link href="/" className={styles.backBtn}>
            <ArrowLeft size={16} />
            <span>Back to Institutes</span>
          </Link>
          
          <div ref={aboutSectionRef} className={styles.heroContent}>
            <span className={styles.chapterLabel}>Think India Institute</span>
            <h1 className={styles.title}>{institute.name}</h1>
            <p className={styles.aboutText}>{institute.about_text}</p>
          </div>
        </div>
      </header>

      {/* Team Carousel Section */}
      <section ref={teamSectionRef} className={styles.section} style={{ opacity: 1 /* Base value overridden by GSAP */ }}>
        <div className={styles.sectionContainer}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Meet the Team</h2>
            
            {team.length > 0 && (
              <div className={styles.carouselNav}>
                <button 
                  onClick={() => scrollCarousel("left")} 
                  className={styles.navBtn} 
                  aria-label="Slide Left"
                >
                  <ChevronLeft size={20} />
                </button>
                <button 
                  onClick={() => scrollCarousel("right")} 
                  className={styles.navBtn} 
                  aria-label="Slide Right"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </div>

          {team.length === 0 ? (
            <p className={styles.emptyState}>No team members registered yet.</p>
          ) : (
            <div className={styles.carouselContainer}>
              <div ref={carouselTrackRef} className={styles.carouselTrack}>
                {team.map((member) => (
                  <div key={member.id} className={styles.teamCard}>
                    <div className={styles.imageFrame}>
                      <SkeletonImage 
                        src={getAssetUrl(member.image_url)} 
                        alt={member.title} 
                        style={{ height: "100%", width: "100%" }}
                      />
                    </div>
                    <div className={styles.cardBody}>
                      <h3 className={styles.memberName}>{member.title}</h3>
                      <p className={styles.memberRole}>{member.description || "Core Coordinator"}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Events Section */}
      <section ref={eventsSectionRef} className={styles.section} style={{ opacity: 1 /* GSAP animated */ }}>
        <div className={styles.sectionContainer}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Institute Events</h2>
          </div>

          <div className={styles.eventsGrid}>
            {/* Upcoming Events */}
            <div>
              <h3 className={styles.eventsSubTitle}>
                <Calendar size={18} style={{ color: "var(--color-saffron)" }} />
                <span>Upcoming Events</span>
              </h3>
              {upcomingEvents.length === 0 ? (
                <p className={styles.emptyState}>No upcoming events scheduled.</p>
              ) : (
                <div className={styles.eventCardList}>
                  {upcomingEvents.map((evt) => {
                    const eventImages = evt.metadata?.images || (evt.image_url ? [evt.image_url] : []);
                    const hasMultipleImages = eventImages.length > 1;

                    return (
                      <div
                        key={evt.id}
                        className={styles.eventCard}
                        style={{ padding: eventImages.length > 0 ? "0" : "1.5rem", overflow: "hidden" }}
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
                          className={styles.eventCardContent}
                          style={{ padding: eventImages.length > 0 ? "1.25rem 1.5rem 1.5rem" : "0" }}
                        >
                          <span className={styles.eventDate}>
                            {formatDate(evt.metadata?.date)}
                          </span>
                          <h4 className={styles.eventTitle}>{evt.title}</h4>
                          {evt.metadata?.description && (
                            <p className={styles.eventDesc}>{evt.metadata.description}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Past Events */}
            <div>
              <h3 className={styles.eventsSubTitle}>
                <Calendar size={18} style={{ color: "var(--color-navy)" }} />
                <span>Recent Highlights</span>
              </h3>
              {pastEvents.length === 0 ? (
                <p className={styles.emptyState}>No past events recorded.</p>
              ) : (
                <div className={styles.eventCardList}>
                  {pastEvents.map((evt) => {
                    const eventImages = evt.metadata?.images || (evt.image_url ? [evt.image_url] : []);
                    const hasMultipleImages = eventImages.length > 1;

                    return (
                      <div
                        key={evt.id}
                        className={styles.eventCard}
                        style={{ padding: eventImages.length > 0 ? "0" : "1.5rem", overflow: "hidden" }}
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
                          className={styles.eventCardContent}
                          style={{ padding: eventImages.length > 0 ? "1.25rem 1.5rem 1.5rem" : "0" }}
                        >
                          <span className={styles.eventDate} style={{ color: "var(--color-text-muted)" }}>
                            {formatDate(evt.metadata?.date)}
                          </span>
                          <h4 className={styles.eventTitle}>{evt.title}</h4>
                          {evt.metadata?.description && (
                            <p className={styles.eventDesc}>{evt.metadata.description}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section ref={gallerySectionRef} className={styles.section} style={{ opacity: 1 /* GSAP animated */ }}>
        <div className={styles.sectionContainer}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Gallery Highlights</h2>
          </div>

          {gallery.length === 0 ? (
            <p className={styles.emptyState}>No gallery photos uploaded yet.</p>
          ) : (
            <div className={styles.galleryGrid}>
              {gallery.map((photo, index) => {
                // Varying height for dynamic masonry display
                const aspectRatios = ["300px", "220px", "400px", "280px"];
                const frameHeight = aspectRatios[index % aspectRatios.length];
                
                return (
                  <div key={photo.id} className={styles.galleryCard}>
                    <div className={styles.galleryImageFrame} style={{ height: frameHeight }}>
                      <SkeletonImage 
                        src={getAssetUrl(photo.image_url)} 
                        alt={photo.title}
                        style={{ height: "100%", width: "100%" }}
                      />
                    </div>
                    <div className={styles.galleryImageTitle} style={{ padding: "1rem", textAlign: "left" }}>
                      <strong style={{ display: "block", color: "var(--color-navy)", fontSize: "0.875rem" }}>
                        {photo.title}
                      </strong>
                      {photo.description && (
                        <p style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginTop: "0.25rem", fontWeight: "normal", lineHeight: "1.4" }}>
                          {photo.description}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.footerGrid}>
            {/* Column 1: Brand */}
            <div className={styles.footerBrandCol}>
              <div className={styles.footerBrand}>Think India {institute.name}</div>
              <p className={styles.footerAbout}>
                Think India chapter at {institute.name}, connecting students and researchers for policy advocacy and grassroots nation-building.
              </p>
            </div>
            {/* Column 2: Quick Links */}
            <div className={styles.footerLinksCol}>
              <h4 className={styles.footerColTitle}>Quick Links</h4>
              <Link href="/" className={styles.footerLink}>Home</Link>
              <a href="#about" className={styles.footerLink}>About</a>
              <a href="#events" className={styles.footerLink}>Events</a>
              <a href="#gallery" className={styles.footerLink}>Gallery</a>
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
            <div className={styles.footerCopy}>
              &copy; {new Date().getFullYear()} Think India Bihar. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
