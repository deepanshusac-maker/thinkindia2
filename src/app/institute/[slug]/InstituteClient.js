"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ChevronLeft, ChevronRight, Calendar, AlertTriangle, Image as ImageIcon, ArrowRight, X, MapPin, Clock } from "lucide-react";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import SkeletonImage from "@/app/components/SkeletonImage";
import { getAssetUrl } from "@/lib/supabase/client";
import styles from "./InstituteClient.module.css";
const INSTITUTE_IMAGES = {
  "nit-patna": "/images/nit-patna.jpeg",
  "iit-patna": "/images/iit-patna.jpeg",
  "iim-bodhgaya": "/images/iim-bodhgaya.jpeg",
  "cnlu-patna": "/images/cnlu-patna.jpeg",
  "iiit-bhagalpur": "/images/iiit-bhagalpur.jpeg",
  "nift-patna": "/images/nift-patna.jpeg",
};

const INSTITUTE_LOGOS = {
  "nit-patna": "/logo.jpg",
  "iit-patna": "/logos/iitp.jpeg",
  "iim-bodhgaya": "/logo.jpg",
  "cnlu-patna": "/logos/cnlu.png",
  "iiit-bhagalpur": "/logos/iiitbhagalpur.png",
  "nift-patna": "/logos/nift.png",
};

export default function InstituteClient({ institute, team, events, gallery, usingMockData }) {
  const carouselTrackRef = useRef(null);
  const aboutSectionRef = useRef(null);
  const imageUrl = institute.image_url || INSTITUTE_IMAGES[institute.slug] || "/hero_bg_new.jpg";
  const logoUrl = INSTITUTE_LOGOS[institute.slug] || "/logo.jpg";
  const teamSectionRef = useRef(null);
  const eventsSectionRef = useRef(null);
  const gallerySectionRef = useRef(null);

  // Modal Dialog states and refs
  const [selectedEvent, setSelectedEvent] = useState(null);
  const dialogRef = useRef(null);

  const openEventModal = (event) => {
    setSelectedEvent(event);
  };

  const closeEventModal = () => {
    setSelectedEvent(null);
  };

  // Safe fallback click listener to trigger modal close when clicking backdrop (Safari fallback)
  const handleDialogClick = (event) => {
    const dialogElem = dialogRef.current;
    if (!dialogElem || event.target !== dialogElem) return;

    const rect = dialogElem.getBoundingClientRect();
    const isDialogContent = (
      rect.top <= event.clientY &&
      event.clientY <= rect.top + rect.height &&
      rect.left <= event.clientX &&
      event.clientX <= rect.left + rect.width
    );

    if (!isDialogContent) {
      setSelectedEvent(null);
    }
  };

  // Double trigger native dialog showModal/close
  useEffect(() => {
    const dialogElem = dialogRef.current;
    if (!dialogElem) return;

    if (selectedEvent) {
      if (!dialogElem.open) {
        dialogElem.showModal();
        document.body.style.overflow = "hidden";
      }
    } else {
      if (dialogElem.open) {
        dialogElem.close();
        document.body.style.overflow = "";
      }
    }
  }, [selectedEvent]);

  // Synchronize canceling dialog (native Esc press)
  useEffect(() => {
    const dialogElem = dialogRef.current;
    if (!dialogElem) return;

    const handleCancel = (e) => {
      setSelectedEvent(null);
    };

    dialogElem.addEventListener("cancel", handleCancel);
    return () => {
      dialogElem.removeEventListener("cancel", handleCancel);
    };
  }, []);

  // Group and sort events by status
  const upcomingEvents = events
    .filter((e) => e.metadata?.isUpcoming || e.metadata?.status === "upcoming" || (e.metadata?.date && new Date(e.metadata.date) > new Date()))
    .sort((a, b) => new Date(a.metadata?.date || 0) - new Date(b.metadata?.date || 0));

  const pastEvents = events
    .filter((e) => !upcomingEvents.some((ue) => ue.id === e.id))
    .sort((a, b) => new Date(b.metadata?.date || 0) - new Date(a.metadata?.date || 0));

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

  // Shared responsive horizontal event card component
  const renderEventCard = (evt, isPast = false) => {
    const eventImages = evt.metadata?.images || (evt.image_url ? [evt.image_url] : []);
    const coverImage = eventImages[0];

    return (
      <div key={evt.id} className={`${styles.eventCard} event-card`}>
        {coverImage ? (
          <div className={styles.eventImageContainer}>
            <SkeletonImage
              src={getAssetUrl(coverImage)}
              alt={evt.title}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
            {isPast ? (
              <span className={`${styles.statusBadge} ${styles.pastBadge}`}>Completed</span>
            ) : (
              <span className={`${styles.statusBadge} ${styles.upcomingBadge}`}>Upcoming</span>
            )}
          </div>
        ) : (
          <div className={`${styles.eventImageContainer} ${styles.noImage}`}>
            <ImageIcon size={32} style={{ opacity: 0.3, color: "var(--color-navy)" }} />
            {isPast ? (
              <span className={`${styles.statusBadge} ${styles.pastBadge}`}>Completed</span>
            ) : (
              <span className={`${styles.statusBadge} ${styles.upcomingBadge}`}>Upcoming</span>
            )}
          </div>
        )}
        <div className={styles.eventTextContainer}>
          <div className={styles.eventCardHeader}>
            <span className={styles.instituteTag}>
              {institute.name}
            </span>
            <span className={styles.eventDateTag}>
              <Calendar size={13} style={{ marginRight: "4px", verticalAlign: "middle" }} />
              {formatDate(evt.metadata?.date)}
            </span>
          </div>
          <h3 className={styles.eventCardTitle}>{evt.title}</h3>
          {evt.metadata?.description && (
            <p className={styles.eventCardDesc}>
              {evt.metadata.description.length > 140
                ? evt.metadata.description.substring(0, 140) + "..."
                : evt.metadata.description}
            </p>
          )}
          <button
            onClick={() => openEventModal(evt)}
            className={styles.knowMoreBtn}
            aria-label={`Know more about ${evt.title}`}
          >
            Know More <ArrowRight size={14} />
          </button>
        </div>
      </div>
    );
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
          
          <div className={styles.heroSplit}>
            <div ref={aboutSectionRef} className={styles.heroContent}>
              {logoUrl && (
                <div className={styles.instituteLogo}>
                  <SkeletonImage
                    src={logoUrl}
                    alt={`${institute.name} Logo`}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </div>
              )}
              <span className={styles.chapterLabel}>Think India Institute</span>
              <h1 className={styles.title}>{institute.name}</h1>
              
              <div className={styles.mobileHeroVisual}>
                <div className={styles.visualFrame}>
                  <SkeletonImage
                    src={imageUrl}
                    alt={`${institute.name} Campus`}
                    style={{ width: "100%", height: "100%" }}
                    priority
                  />
                </div>
              </div>

              <p className={styles.aboutText}>{institute.about_text}</p>
            </div>
            
            <div className={styles.heroVisual}>
              <div className={styles.visualFrame}>
                <SkeletonImage
                  src={imageUrl}
                  alt={`${institute.name} Campus`}
                  style={{ width: "100%", height: "100%" }}
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Team Section */}
      <section id="team" ref={teamSectionRef} className={styles.section} style={{ opacity: 1 /* Base value overridden by GSAP */ }}>
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
      <section id="events" ref={eventsSectionRef} className={styles.section} style={{ opacity: 1 /* GSAP animated */ }}>
        <div className={styles.sectionContainer}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Institute Events</h2>
          </div>

          <div className={styles.eventsContainer}>
            {/* Upcoming Events Column / Stack */}
            <div className={styles.eventsGroup}>
              <h3 className={styles.groupHeading}>
                <span className={styles.groupIndicatorSaffron} />
                Upcoming Events
              </h3>
              {upcomingEvents.length === 0 ? (
                <p className={styles.emptyState}>
                  No upcoming events scheduled. Check back soon!
                </p>
              ) : (
                <div className={styles.eventsStackList}>
                  {upcomingEvents.map((evt) => renderEventCard(evt, false))}
                </div>
              )}
            </div>

            {/* Past Events Column / Stack */}
            <div className={styles.eventsGroup} style={{ marginTop: "3.5rem" }}>
              <h3 className={styles.groupHeading}>
                <span className={styles.groupIndicatorNavy} />
                Recent Highlights
              </h3>
              {pastEvents.length === 0 ? (
                <p className={styles.emptyState}>
                  No past highlights recorded.
                </p>
              ) : (
                <div className={styles.eventsStackList}>
                  {pastEvents.map((evt) => renderEventCard(evt, true))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Premium Detail Modal Dialog */}
        <dialog
          ref={dialogRef}
          className={styles.dialog}
          closedby="any"
          aria-labelledby="dialog-title"
          onClose={closeEventModal}
          onClick={handleDialogClick}
        >
          {selectedEvent && (
            <div className={styles.modalContent}>
              <button
                onClick={closeEventModal}
                className={styles.dialogCloseBtn}
                aria-label="Close details"
              >
                <X size={18} />
              </button>

              {/* Modal Image Header */}
              {selectedEvent.metadata?.images && selectedEvent.metadata.images.length > 0 ? (
                <div className={styles.modalGallery}>
                  <div className={styles.modalGalleryTrack}>
                    {selectedEvent.metadata.images.map((imgUrl, i) => (
                      <div key={i} className={styles.modalGalleryImageFrame}>
                        <SkeletonImage
                          src={getAssetUrl(imgUrl)}
                          alt={selectedEvent.title}
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ) : selectedEvent.image_url ? (
                <div className={styles.modalHeroImage}>
                  <SkeletonImage
                    src={getAssetUrl(selectedEvent.image_url)}
                    alt={selectedEvent.title}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </div>
              ) : (
                <div className={styles.modalNoImage}>
                  <ImageIcon size={48} style={{ opacity: 0.2, color: "var(--color-navy)" }} />
                </div>
              )}

              {/* Modal Body */}
              <div className={styles.modalBody}>
                <div className={styles.modalHeaderRow}>
                  <span className={styles.modalInstituteTag}>
                    {institute.name}
                  </span>
                  <span className={`${styles.statusBadge} ${
                    selectedEvent.metadata?.isUpcoming || selectedEvent.metadata?.status === "upcoming" || (selectedEvent.metadata?.date && new Date(selectedEvent.metadata.date) > new Date())
                      ? styles.upcomingBadge
                      : styles.pastBadge
                  }`}>
                    {selectedEvent.metadata?.isUpcoming || selectedEvent.metadata?.status === "upcoming" || (selectedEvent.metadata?.date && new Date(selectedEvent.metadata.date) > new Date())
                      ? "Upcoming"
                      : "Completed"}
                  </span>
                </div>

                <h2 id="dialog-title" className={styles.modalTitle}>
                  {selectedEvent.title}
                </h2>

                {/* Meta information: Date, Time, Venue */}
                <div className={styles.modalMetaGrid}>
                  <div className={styles.modalMetaItem}>
                    <Calendar size={16} className={styles.metaIconSaffron} />
                    <div>
                      <strong>Date</strong>
                      <span>{formatDate(selectedEvent.metadata?.date)}</span>
                    </div>
                  </div>

                  {selectedEvent.metadata?.time && (
                    <div className={styles.modalMetaItem}>
                      <Clock size={16} className={styles.metaIconSaffron} />
                      <div>
                        <strong>Time</strong>
                        <span>{selectedEvent.metadata.time}</span>
                      </div>
                    </div>
                  )}

                  <div className={styles.modalMetaItem}>
                    <MapPin size={16} className={styles.metaIconGreen} />
                    <div>
                      <strong>Venue / Location</strong>
                      <span>{selectedEvent.metadata?.venue || selectedEvent.metadata?.location || "TBD"}</span>
                    </div>
                  </div>
                </div>

                <hr className={styles.modalDivider} />

                <div className={styles.modalDescription}>
                  <h3>About this Event</h3>
                  <p>{selectedEvent.metadata?.description || "No description provided for this event."}</p>
                </div>
              </div>
            </div>
          )}
        </dialog>
      </section>

      {/* Gallery Section */}
      <section id="gallery" ref={gallerySectionRef} className={styles.section} style={{ opacity: 1 /* GSAP animated */ }}>
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
      <Footer isInstitutePage={true} instituteName={institute.name} />
    </div>
  );
}
