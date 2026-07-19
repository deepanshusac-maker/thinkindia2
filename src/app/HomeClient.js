"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Building2, AlertTriangle, ExternalLink, Calendar, Image as ImageIcon, Shield, Users, HeartHandshake, X, MapPin, Clock, Phone } from "lucide-react";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import SkeletonImage from "@/app/components/SkeletonImage";
import { getAssetUrl } from "@/lib/supabase/client";
import styles from "./HomeClient.module.css";
import { motion } from "framer-motion";
import IntroLoader from "@/app/components/IntroLoader";
import EventCountdown from "@/app/components/EventCountdown";
import ShareButton from "@/app/components/ShareButton";

const INSTITUTE_IMAGES = {
  "nit-patna": "/images/nit-patna.jpeg",
  "iit-patna": "/images/iit-patna.jpeg",
  "iim-bodhgaya": "/images/iim-bodhgaya.jpeg",
  "cnlu-patna": "/images/cnlu-patna.jpeg",
  "iiit-bhagalpur": "/images/iiit-bhagalpur.jpeg",
  "nift-patna": "/images/nift-patna.jpeg",
};

const LEADERSHIP_MEMBERS = [
  {
    name: "Shubhranshu Kumar",
    roles: ["State Convenor", "State Incharge"],
    phone: "7762058576",
    institute: "National Institute of Technology Patna",
    initials: "SK",
    color: "saffron"
  },
  {
    name: "Harsh Raj",
    roles: ["State Co-Convenor"],
    phone: "9508394367",
    institute: "National Institute of Technology Patna",
    initials: "HR",
    color: "navy"
  },
  {
    name: "Hardik Ji",
    roles: ["State Co-Convenor"],
    phone: "8423648309",
    institute: "Chanakya National Law University Patna",
    initials: "H",
    color: "green"
  },
  {
    name: "Uday Ji",
    roles: ["State Co-Convenor"],
    phone: "9536689087",
    institute: "Indian Institute of Technology Patna",
    initials: "U",
    color: "saffron"
  }
];

function AnimatedNumber({ value, suffix = "", duration = 1800, trigger = false }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!trigger) return;
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // ease-out cubic: f(t) = 1 - (1 - t)^3
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(easeProgress * value));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setCount(value);
      }
    };
    window.requestAnimationFrame(step);
  }, [value, duration, trigger]);

  return <span>{count}{suffix}</span>;
}

export default function HomeClient({ institutes, events, gallery, usingMockData }) {
  const heroRef = useRef(null);
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const ctaRef = useRef(null);
  const aboutSectionRef = useRef(null);
  const leadershipSectionRef = useRef(null);
  const gridRef = useRef(null);
  const eventsSectionRef = useRef(null);
  const gallerySectionRef = useRef(null);

  // Modal Dialog states and refs
  const [selectedEvent, setSelectedEvent] = useState(null);
  const dialogRef = useRef(null);
  const [introCompleted, setIntroCompleted] = useState(false);

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

  // Filter events into upcoming and past
  const upcomingEvents = events
    .filter((e) => e.metadata?.isUpcoming || e.metadata?.status === "upcoming" || (e.metadata?.date && new Date(e.metadata.date) > new Date()))
    .sort((a, b) => new Date(a.metadata?.date || 0) - new Date(b.metadata?.date || 0))
    .slice(0, 3);

  const pastEvents = events
    .filter((e) => !upcomingEvents.some((ue) => ue.id === e.id))
    .sort((a, b) => new Date(b.metadata?.date || 0) - new Date(a.metadata?.date || 0))
    .slice(0, 3);

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
              {evt.institutes?.name || "State Council"}
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
          <div className={styles.cardActionRow}>
            <div className={styles.cardActionLeft}>
              {!isPast && (
                <EventCountdown dateStr={evt.metadata?.date} />
              )}
              <button
                onClick={() => openEventModal(evt)}
                className={styles.knowMoreBtn}
                aria-label={`Know more about ${evt.title}`}
              >
                Know More <ArrowRight size={14} />
              </button>
            </div>
            <ShareButton
              title={evt.title}
              text={evt.metadata?.description || `Check out this event by Think India Bihar: ${evt.title}`}
              variant="full"
            />
          </div>
        </div>
      </div>
    );
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
    if (!introCompleted) return; // Wait until intro loader is fully completed!

    let ctx; // gsap context — handles full cleanup on unmount

    async function initAnimations() {
      const gsapModule = await import("gsap");
      const scrollTriggerModule = await import("gsap/ScrollTrigger");

      const gsapInstance = gsapModule.gsap;
      const ScrollTriggerInstance = scrollTriggerModule.ScrollTrigger;

      gsapInstance.registerPlugin(ScrollTriggerInstance);

      // Scope all animations to the wrapper div to ensure safe cleanup
      ctx = gsapInstance.context(() => {
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

        if (subtitleRef.current) {
          tl.fromTo(
            subtitleRef.current,
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" },
            "-=0.4"
          );
        }

        if (ctaRef.current) {
          tl.fromTo(
            ctaRef.current,
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" },
            "-=0.3"
          );
        }

        // 2. Scroll Trigger reveals for homepage sections
        const sections = [
          { el: aboutSectionRef.current, triggerEl: aboutSectionRef.current, className: ".pillar-card" },
          { el: leadershipSectionRef.current, triggerEl: leadershipSectionRef.current, className: ".leader-card" },
          { el: gridRef.current, triggerEl: gridRef.current, className: ".institute-card" },
          { el: eventsSectionRef.current, triggerEl: eventsSectionRef.current, className: ".event-card" },
          { el: gallerySectionRef.current, triggerEl: gallerySectionRef.current, className: ".gallery-card" }
        ];

        sections.forEach(({ el, triggerEl, className }) => {
          if (!el || !triggerEl) return;
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
      }); // end gsap.context()
    }

    initAnimations();

    return () => {
      // ctx.revert() kills all tweens, timelines, and ScrollTriggers created
      // inside the context — safe even if initAnimations() hasn't resolved yet
      if (ctx) ctx.revert();
    };
  }, [introCompleted]);


  return (
    <div className={styles.wrapper}>
      {/* Cinematic Intro Loader */}
      <IntroLoader onComplete={() => setIntroCompleted(true)} />

      {/* Navigation */}
      <Navbar />

      {/* Hero Section */}
      <section ref={heroRef} className={styles.hero}>
        <div className={styles.tricolourStripe} />
        
        <div className={styles.heroContainer}>
          <div className={styles.heroContent}>
            {usingMockData && (
              <div className={styles.fallbackBanner}>
                <AlertTriangle size={14} />
                <span>Preview Mode (Database Unconfigured or Empty)</span>
              </div>
            )}

            <div className={styles.heroBadge}>भारत माता की जय</div>

            <div className={styles.logoRevealContainer}>
              <h1 ref={titleRef} className={styles.heroTitle}>
                <span className={styles.titleLineSaffron}>{renderLetters("Empowering")}</span><br />
                <span className={styles.titleLineWhite}>{renderLetters("Youth")}</span>{" "}
                <span className={styles.titleLineWhite}>{renderLetters("to")}</span>{" "}
                <span className={styles.titleLineWhite}>{renderLetters("Build")}</span><br />
                <span className={styles.titleLineWhite}>{renderLetters("a")}</span>{" "}
                <span className={styles.titleLineSaffron}>{renderLetters("Stronger")}</span><br />
                <span className={styles.titleLineGreen}>{renderLetters("India.")}</span>
              </h1>
            </div>

            <p ref={subtitleRef} className={styles.heroSubtitle}>
              Think India Bihar — A forum of thinkers, innovators, and leaders who believe that India&apos;s best chapter is yet to be written, and that we will write it.
            </p>

            <div ref={ctaRef} className={styles.heroCta}>
              <a href="#institutes" className={styles.btnPrimary}>
                Explore Institutes <ArrowRight size={18} />
              </a>
              <a href="#gallery" className={styles.btnSecondary}>
                View Gallery
              </a>
            </div>

            {/* Stats Row */}
            <motion.div
              className={styles.statsRow}
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.65, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className={styles.statItem}>
                <span className={styles.statNumber}>
                  <AnimatedNumber value={50} suffix="+" trigger={introCompleted} />
                </span>
                <span className={styles.statLabel}>Partner Institutes</span>
              </div>
              <div className={styles.statDivider} />
              <div className={styles.statItem}>
                <span className={styles.statNumber}>
                  <AnimatedNumber value={10} suffix="K+" trigger={introCompleted} />
                </span>
                <span className={styles.statLabel}>Youth Empowered</span>
              </div>
              <div className={styles.statDivider} />
              <div className={styles.statItem}>
                <span className={styles.statNumber}>
                  <AnimatedNumber value={38} trigger={introCompleted} />
                </span>
                <span className={styles.statLabel}>Districts Reached</span>
              </div>
              <div className={styles.statDivider} />
              <div className={styles.statItem}>
                <span className={styles.statNumber}>
                  <AnimatedNumber value={200} suffix="+" trigger={introCompleted} />
                </span>
                <span className={styles.statLabel}>Events Hosted</span>
              </div>
            </motion.div>
          </div>
        </div>


        <div className={styles.heroBackground}>
          <Image
            src="/hero_bg_new.jpg"
            alt=""
            fill
            priority
            style={{ objectFit: "cover" }}
            sizes="100vw"
          />
          <div className={styles.heroOverlay} />
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
                Think India is a vibrant forum of students, researchers, and young professionals from premier institutes of national importance (IITs, IIMs, NITs, NLUs, and others). We believe that India&apos;s greatest chapter is yet to be written. We are dedicated to creating a generation of nationalist leaders, policy thinkers, and social innovators who work collectively towards national development, social harmony, and the realization of India&apos;s potential.
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

      {/* Flagship Initiatives Section */}
      <section id="initiatives" className={styles.initiativesSection}>
        <div className={styles.initiativesContainer}>
          <div className={styles.initiativesHeader}>
            <div className={styles.initiativesLabelWrapper}>
              <span className={styles.initiativesLabelLine} />
              <span className={styles.initiativesLabel}>Long-term Work</span>
            </div>
            <h2 className={styles.initiativesTitle}>
              Flagship <span className={styles.initiativesTitleHighlight}>Initiatives</span>
            </h2>
          </div>

          <div className={styles.initiativesGrid}>
            {/* Card 1: Policy Research Cell */}
            <div className={`${styles.initiativeCard} ${styles.initiativeSaffron}`}>
              <div className={styles.initiativeNumber}>01</div>
              <h3 className={styles.initiativeCardTitle}>Policy Research Cell</h3>
              <p className={styles.initiativeCardDesc}>
                A dedicated cell producing policy briefs on education, agriculture, infrastructure, and digital governance — submitted to Think India&apos;s national convention and made available as open public research.
              </p>
            </div>

            {/* Card 2: Rural Development Ideas */}
            <div className={`${styles.initiativeCard} ${styles.initiativeWhite}`}>
              <div className={styles.initiativeNumber}>02</div>
              <h3 className={styles.initiativeCardTitle}>Rural Development Ideas</h3>
              <p className={styles.initiativeCardDesc}>
                Collaborative programs connecting Bihar&apos;s engineers and students with nearby rural communities to co-design practical, technology-enabled solutions to ground-level challenges in Bihar and beyond.
              </p>
            </div>

            {/* Card 3: Cultural Awareness Campaigns */}
            <div className={`${styles.initiativeCard} ${styles.initiativeGreen}`}>
              <div className={styles.initiativeNumber}>03</div>
              <h3 className={styles.initiativeCardTitle}>Cultural Awareness Campaigns</h3>
              <p className={styles.initiativeCardDesc}>
                Celebrating India&apos;s pluralism — our cultural campaigns explore regional heritage, art forms, and histories, fostering a sense of unified national identity rooted in respect for every tradition.
              </p>
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
          {[...institutes].sort((a, b) => {
            if (a.name === "NIT Patna") return -1;
            if (b.name === "NIT Patna") return 1;
            return 0;
          }).map((inst) => {
            const imageUrl = inst.image_url || INSTITUTE_IMAGES[inst.slug] || "/hero_bg_new.jpg";
            return (
              <Link key={inst.id} href={`/institute/${inst.slug}`}>
                <div className={`${styles.card} institute-card`}>
                  <div className={styles.cardImageContainer}>
                    <SkeletonImage
                      src={imageUrl}
                      alt={`${inst.name} Campus`}
                      style={{ height: "100%", width: "100%" }}
                    />
                  </div>
                  <div className={styles.cardInfo}>
                    <div className={styles.cardIcon}>
                      <Building2 size={20} />
                    </div>
                    <h3 className={styles.cardTitle}>{inst.name}</h3>
                    <p className={styles.cardText}>
                      {inst.about_text
                        ? inst.about_text.substring(0, 110) + (inst.about_text.length > 110 ? "..." : "")
                        : "Learn about the student leadership, research publications, and dynamic national events run by this institute."}
                    </p>
                  </div>
                  <div className={styles.cardFooter}>
                    <span>Explore Institute</span>
                    <ExternalLink size={14} />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>      {/* Consolidated Events Section */}
      <section id="events" ref={eventsSectionRef} className={styles.eventsSection} style={{ opacity: 1 /* GSAP animated */ }}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>
            Events Forum<span className={styles.sectionTitleDot}>.</span>
          </h2>
          <p className={styles.sectionSubtitle}>
            Explore our scheduled activities, policy conclaves, and past milestones conducted across premium chapters.
          </p>
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
                    {selectedEvent.institutes?.name || "State Council"}
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

                <div className={styles.modalShareRow}>
                  <ShareButton
                    title={selectedEvent.title}
                    text={selectedEvent.metadata?.description || `Check out this event: ${selectedEvent.title}`}
                    variant="full"
                  />
                </div>
              </div>
            </div>
          )}
        </dialog>
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

      {/* State Leadership Section */}
      <section id="leadership" ref={leadershipSectionRef} className={styles.leadershipSection} style={{ opacity: 1 }}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>
            State Leadership<span className={styles.sectionTitleDot}>.</span>
          </h2>
          <p className={styles.sectionSubtitle}>
            The leadership team guiding organizational vision, student collaborations, and policy initiatives across Bihar.
          </p>
        </div>

        <div className={styles.leadershipGrid}>
          {LEADERSHIP_MEMBERS.map((leader, index) => (
            <div key={index} className={`${styles.leaderCard} leader-card`}>
              <div className={styles.leaderAvatarFrame}>
                <span className={styles.leaderAvatarInner}>{leader.initials}</span>
              </div>
              <h3 className={styles.leaderName}>{leader.name}</h3>
              <div className={styles.leaderRoles}>
                {leader.roles.map((role, rIndex) => (
                  <span key={rIndex} className={styles.leaderRoleBadge}>{role}</span>
                ))}
              </div>
              <p className={styles.leaderAffiliation}>
                <Building2 size={13} style={{ marginRight: "5px", flexShrink: 0, marginTop: "1px" }} />
                <span>{leader.institute}</span>
              </p>
              <a href={`tel:${leader.phone}`} className={styles.leaderPhoneLink} aria-label={`Call ${leader.name}`}>
                <Phone size={13} style={{ marginRight: "6px" }} />
                <span>+91 {leader.phone}</span>
              </a>
            </div>
          ))}
        </div>
      </section>


      {/* Footer */}
      <Footer />
    </div>
  );
}
