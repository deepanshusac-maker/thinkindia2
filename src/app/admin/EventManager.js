"use client";

import { useState, useEffect } from "react";
import { CalendarPlus, Trash2, ImageIcon, X, MapPin } from "lucide-react";
import { createClient, getAssetUrl } from "@/lib/supabase/client";
import { sanitizeInput } from "@/lib/sanitize";
import styles from "./dashboard.module.css";

const supabase = createClient();

export default function EventManager({ institute, addToast }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [eventType, setEventType] = useState("upcoming");
  const [description, setDescription] = useState("");
  const [venue, setVenue] = useState("");
  
  // Multiple images state
  const [imageFiles, setImageFiles] = useState([]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("content")
        .select("*")
        .eq("type", "event")
        .eq("institute_id", institute.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setEvents(data || []);
    } catch (err) {
      addToast(err.message || "Failed to load events", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
    // Cleanup preview URLs on unmount
    return () => {
      imageFiles.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    };
  }, [institute.id]);

  const handleSelectImages = (e) => {
    const files = Array.from(e.target.files || []);
    const MAX_SIZE = 1.5 * 1024 * 1024; // 1.5 MB in bytes
    const validFiles = [];
    const rejectedFiles = [];

    files.forEach((file) => {
      if (file.size > MAX_SIZE) {
        rejectedFiles.push(file.name);
      } else {
        validFiles.push(file);
      }
    });

    if (rejectedFiles.length > 0) {
      addToast(
        `Rejected files exceeding 1.5MB limit: ${rejectedFiles.join(", ")}`,
        "error"
      );
    }

    if (validFiles.length === 0) {
      e.target.value = "";
      return;
    }

    const newImages = validFiles.map((file) => ({
      id: Math.random().toString(36).slice(2, 9),
      file,
      previewUrl: URL.createObjectURL(file),
    }));
    setImageFiles((prev) => [...prev, ...newImages]);
    e.target.value = "";
  };

  const handleRemoveImage = (id) => {
    setImageFiles((prev) => {
      const item = prev.find((x) => x.id === id);
      if (item) URL.revokeObjectURL(item.previewUrl);
      return prev.filter((x) => x.id !== id);
    });
  };

  const handleAdd = async () => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      addToast("Event title is required", "error");
      return;
    }

    setSaving(true);
    try {
      const uploadedPaths = [];

      // Handle multiple image uploads if selected
      if (imageFiles.length > 0) {
        for (const item of imageFiles) {
          const ext = item.file.name.split(".").pop();
          const path = `${institute.slug}/events/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

          const { error: uploadError } = await supabase.storage
            .from("institute-assets")
            .upload(path, item.file, { cacheControl: "3600" });

          if (uploadError) throw uploadError;
          uploadedPaths.push(path);
        }
      }

      const primaryImageUrl = uploadedPaths.length > 0 ? uploadedPaths[0] : null;

      const cleanTitle = sanitizeInput(trimmedTitle);
      const cleanDesc = sanitizeInput(description.trim());
      const cleanVenue = sanitizeInput(venue.trim());

      const { error } = await supabase.from("content").insert({
        institute_id: institute.id,
        type: "event",
        title: cleanTitle,
        description: cleanDesc,
        image_url: primaryImageUrl,
        metadata: { 
          date, 
          event_type: eventType,
          description: cleanDesc,
          venue: cleanVenue || null,
          images: uploadedPaths // Store array of all event image paths
        },
      });

      if (error) throw error;

      await fetchEvents();
      setTitle("");
      setDate("");
      setEventType("upcoming");
      setDescription("");
      setVenue("");
      imageFiles.forEach((item) => URL.revokeObjectURL(item.previewUrl));
      setImageFiles([]);
      addToast("Event added successfully", "success");
    } catch (err) {
      addToast(err.message || "Failed to add event", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (event) => {
    try {
      // 1. Delete all images from Storage if they exist
      const imagesToDelete = event.metadata?.images || [];
      if (event.image_url && !imagesToDelete.includes(event.image_url)) {
        imagesToDelete.push(event.image_url);
      }

      if (imagesToDelete.length > 0) {
        await supabase.storage
          .from("institute-assets")
          .remove(imagesToDelete);
      }

      // 2. Delete database record
      const { error } = await supabase
        .from("content")
        .delete()
        .eq("id", event.id);

      if (error) throw error;

      setEvents((prev) => prev.filter((e) => e.id !== event.id));
      addToast("Event deleted", "success");
    } catch (err) {
      addToast(err.message || "Failed to delete event", "error");
    }
  };

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <h2>Events</h2>
      </div>

      <div className={styles.formRow}>
        <div className={styles.field}>
          <label className={styles.label}>Title</label>
          <input
            className={styles.input}
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Event title"
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Date</label>
          <input
            className={styles.input}
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Type</label>
          <select
            className={styles.input}
            value={eventType}
            onChange={(e) => setEventType(e.target.value)}
          >
            <option value="upcoming">Upcoming</option>
            <option value="past">Past</option>
          </select>
        </div>
      </div>

      <div className={styles.formRow} style={{ marginTop: "1rem" }}>
        <div className={styles.field} style={{ gridColumn: "span 3" }}>
          <label className={styles.label}>Description</label>
          <textarea
            className={styles.input}
            style={{ minHeight: "80px", resize: "vertical" }}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Event details or summary"
          />
        </div>
      </div>

      <div className={styles.formRow} style={{ marginTop: "1rem" }}>
        <div className={styles.field} style={{ gridColumn: "span 3" }}>
          <label className={styles.label}>Venue / Location</label>
          <div style={{ position: "relative" }}>
            <MapPin
              size={15}
              style={{
                position: "absolute",
                left: "0.75rem",
                top: "50%",
                transform: "translateY(-50%)",
                color: "rgba(255,255,255,0.35)",
                pointerEvents: "none",
              }}
            />
            <input
              className={styles.input}
              type="text"
              value={venue}
              onChange={(e) => setVenue(e.target.value)}
              placeholder="e.g. Seminar Hall, NIT Patna"
              style={{ paddingLeft: "2.25rem" }}
            />
          </div>
        </div>
      </div>

      <div className={styles.formRow} style={{ marginTop: "1rem" }}>
        <div className={styles.field} style={{ gridColumn: "span 3" }}>
          <label className={styles.label}>Event Banner Images (Optional - Choose Multiple)</label>
          <input
            className={styles.input}
            type="file"
            multiple
            accept="image/*"
            onChange={handleSelectImages}
          />
          {imageFiles.length > 0 && (
            <div style={{ marginTop: "0.75rem", display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
              {imageFiles.map((item) => (
                <div key={item.id} style={{ position: "relative", width: "120px", height: "80px" }}>
                  <img
                    src={item.previewUrl}
                    alt="Preview"
                    style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "6px", border: "1px solid rgba(255,255,255,0.1)" }}
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(item.id)}
                    style={{
                      position: "absolute",
                      top: "2px",
                      right: "2px",
                      background: "rgba(239, 68, 68, 0.9)",
                      border: "none",
                      color: "white",
                      width: "18px",
                      height: "18px",
                      borderRadius: "50%",
                      fontSize: "0.625rem",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: 0
                    }}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className={styles.btnRow} style={{ marginTop: "1rem" }}>
        <button
          className={styles.btnPrimary}
          onClick={handleAdd}
          disabled={saving}
        >
          {saving ? <span className={styles.spinner} /> : <CalendarPlus size={16} />}
          {saving ? "Adding..." : "Add Event"}
        </button>
      </div>

      {loading ? (
        <div className={styles.loadingState}>
          <span className={styles.spinner} />
        </div>
      ) : events.length === 0 ? (
        <div className={styles.emptyState}>
          <p>No events yet</p>
        </div>
      ) : (
        <div className={styles.eventList}>
          {events.map((event) => {
            const meta = event.metadata || {};
            const isUpcoming = meta.event_type === "upcoming";
            const additionalImagesCount = (meta.images?.length || 0) - 1;
            return (
              <div key={event.id} className={styles.eventCard}>
                {event.image_url && (
                  <div style={{ width: "80px", height: "60px", flexShrink: 0, overflow: "hidden", borderRadius: "6px", position: "relative" }}>
                    <img
                      src={getAssetUrl(event.image_url)}
                      alt={event.title}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                    {additionalImagesCount > 0 && (
                      <div
                        style={{
                          position: "absolute",
                          inset: 0,
                          background: "rgba(0, 0, 0, 0.6)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "white",
                          fontSize: "0.75rem",
                          fontWeight: 700
                        }}
                      >
                        +{additionalImagesCount}
                      </div>
                    )}
                  </div>
                )}
                <div className={styles.eventInfo}>
                  <span className={styles.eventTitle}>{event.title}</span>
                  <span className={styles.eventMeta}>
                    {meta.date || "No date"}
                    <span
                      className={`${styles.eventBadge} ${
                        isUpcoming
                          ? styles.eventBadgeUpcoming
                          : styles.eventBadgePast
                      }`}
                    >
                      {isUpcoming ? "Upcoming" : "Past"}
                    </span>
                  </span>
                  {event.description && (
                    <p style={{ margin: "0.25rem 0 0", fontSize: "0.8rem", color: "rgba(255,255,255,0.4)", overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                      {event.description}
                    </p>
                  )}
                  {meta.venue && (
                    <p style={{ margin: "0.25rem 0 0", fontSize: "0.75rem", color: "rgba(255,255,255,0.3)", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                      <MapPin size={11} style={{ flexShrink: 0 }} />
                      {meta.venue}
                    </p>
                  )}
                </div>
                <button
                  className={styles.btnIcon}
                  onClick={() => handleDelete(event)}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
