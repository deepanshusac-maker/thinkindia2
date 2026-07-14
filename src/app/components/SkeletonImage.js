"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";

/**
 * A wrapper around the standard HTML img tag that displays a pulsing skeleton loader
 * while the image is loading from Supabase (or any URL) or if there's a slow connection.
 */
export default function SkeletonImage({ src, alt, className = "", style = {}, fetchPriority, priority, ...props }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const imgRef = useRef(null);

  useEffect(() => {
    if (!src) {
      setLoading(false);
      setError(true);
    } else {
      if (imgRef.current && imgRef.current.complete) {
        setLoading(false);
      } else {
        setLoading(true);
      }
      setError(false);
    }
  }, [src]);

  return (
    <div
      className={`skeleton-image-wrapper ${className}`}
      style={{
        position: "relative",
        overflow: "hidden",
        width: "100%",
        height: "100%",
        display: "block",
        ...style
      }}
    >
      {/* Pulsing skeleton loader overlay */}
      {loading && (
        <div
          className="skeleton-pulse"
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 2,
            borderRadius: "inherit",
            width: "100%",
            height: "100%",
          }}
        />
      )}

      {/* Error state display */}
      {error ? (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
            minHeight: style.height || style.minHeight || "150px",
            width: "100%",
            backgroundColor: "rgba(10, 25, 49, 0.04)",
            color: "var(--color-text-muted)",
            fontSize: "0.8125rem",
            padding: "1rem",
            textAlign: "center",
            borderRadius: "inherit",
            border: "1px dashed var(--color-border)",
          }}
        >
          <span>Image Not Available</span>
        </div>
      ) : (
        src && (
          <Image
            ref={imgRef}
            src={src}
            alt={alt || "Think India Asset"}
            fill
            priority={priority || fetchPriority === "high"}
            sizes={props.sizes || "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"}
            onLoad={() => setLoading(false)}
            onError={() => {
              setLoading(false);
              setError(true);
            }}
            style={{
              objectFit: style.objectFit || "cover",
              opacity: loading ? 0 : 1,
              transition: "opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
              borderRadius: style.borderRadius || "inherit",
            }}
            {...props}
          />
        )
      )}
    </div>
  );
}
