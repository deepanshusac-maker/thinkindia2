"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

// Register ScrollTrigger for client-side rendering
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * Client-side animations provider. Integrates Lenis smooth scroll,
 * page slide transitions with loading indicators, and first-render flash protection.
 */
export default function ClientAnimationsProvider({ children }) {
  const overlayRef = useRef(null);
  const isFirstRender = useRef(true);
  const pathname = usePathname();
  const router = useRouter();

  // 1. Initialize Lenis Smooth Scroll (respects prefers-reduced-motion)
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) {
      // Skip smooth scroll entirely for accessibility
      return;
    }

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Custom exponential easing
      smoothWheel: true,
      wheelMultiplier: 1.0,
    });

    lenis.on("scroll", ScrollTrigger.update);

    const gsapUpdate = (time) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(gsapUpdate);
    gsap.ticker.lagSmoothing(0);

    window.lenis = lenis;

    return () => {
      lenis.destroy();
      gsap.ticker.remove(gsapUpdate);
      if (window.lenis) {
        delete window.lenis;
      }
    };
  }, []);

  // 2. Navigation slide transitions & Link intercepting
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (isFirstRender.current) {
      isFirstRender.current = false;
    } else if (!prefersReducedMotion) {
      // When pathname changes (new route has mounted), slide the overlay OUT to the right (100vw)
      gsap.fromTo(
        overlayRef.current,
        { left: "0vw" },
        {
          left: "100vw",
          duration: 0.65,
          ease: "power2.inOut",
        }
      );
    }

    // Intercept clicks on links going between Landing and Institute pages
    const handleTransitionNavigation = (e) => {
      const anchor = e.target.closest("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href) return;

      // Skip external links, anchors, and dashboard paths
      if (href.startsWith("http") && !href.startsWith(window.location.origin)) return;
      if (href.startsWith("#")) return;
      if (href.startsWith("/admin") || href.includes("/admin/")) return;

      const targetPath = href.startsWith("/") ? href : new URL(href).pathname;

      // Transition conditions: between Home ("/") and Institute pages ("/institute/[slug]")
      const isCurrentHome = pathname === "/";
      const isCurrentInst = pathname.startsWith("/institute/");
      const isTargetHome = targetPath === "/";
      const isTargetInst = targetPath.startsWith("/institute/");

      const shouldAnimate = (isCurrentHome && isTargetInst) || (isCurrentInst && isTargetHome);

      if (shouldAnimate) {
        e.preventDefault();

        // Slide the overlay IN from the left (covers the viewport)
        gsap.fromTo(
          overlayRef.current,
          { left: "-100vw" },
          {
            left: "0vw",
            duration: 0.65,
            ease: "power2.inOut",
            onComplete: () => {
              // Proceed to next page in background
              router.push(targetPath);
            },
          }
        );
      }
    };

    document.addEventListener("click", handleTransitionNavigation);

    return () => {
      document.removeEventListener("click", handleTransitionNavigation);
    };
  }, [pathname, router]);

  return (
    <>
      {/* Navy Blue transition panel with loading spinner */}
      <div
        ref={overlayRef}
        className="transition-overlay"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "1.25rem",
        }}
      >
        <div
          className="loading-spinner"
          style={{
            width: "45px",
            height: "45px",
            borderRadius: "50%",
            border: "3px solid rgba(255, 255, 255, 0.15)",
            borderTopColor: "var(--color-saffron)",
            animation: "spin 1.0s linear infinite",
          }}
        />
        <span
          style={{
            color: "#FFFFFF",
            fontFamily: "var(--font-sans)",
            fontSize: "0.8125rem",
            fontWeight: 500,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
          }}
        >
          Loading...
        </span>
      </div>
      {children}
    </>
  );
}
