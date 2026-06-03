"use client";

import { useState, useEffect, useRef } from "react";
import { Upload, Trash2, ImageIcon, Pencil, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { sanitizeInput } from "@/lib/sanitize";
import styles from "./dashboard.module.css";

const supabase = createClient();

export default function GalleryManager({ institute, addToast }) {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  // Pending uploads state
  const [pendingUploads, setPendingUploads] = useState([]);

  // Editing state for existing images
  const [editingImage, setEditingImage] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [savingDetails, setSavingDetails] = useState(false);

  const fetchImages = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("content")
        .select("*")
        .eq("type", "gallery")
        .eq("institute_id", institute.id)
        .order("sort_order", { ascending: true });

      if (error) throw error;
      setImages(data || []);
    } catch (err) {
      addToast(err.message || "Failed to load gallery", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
    // Clean up pending urls on unmount
    return () => {
      pendingUploads.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    };
  }, [institute.id]);

  const handleSelectFiles = (files) => {
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

    if (validFiles.length === 0) return;

    const newPending = validFiles.map((file) => ({
      file,
      title: file.name.split(".").slice(0, -1).join("."), // Default title to filename without ext
      description: "",
      previewUrl: URL.createObjectURL(file),
      id: Math.random().toString(36).slice(2, 9),
    }));
    setPendingUploads((prev) => [...prev, ...newPending]);
  };

  const handleUpdatePending = (id, field, value) => {
    setPendingUploads((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const handleRemovePending = (id) => {
    setPendingUploads((prev) => {
      const item = prev.find((x) => x.id === id);
      if (item) URL.revokeObjectURL(item.previewUrl);
      return prev.filter((x) => x.id !== id);
    });
  };

  const handleClearAllPending = () => {
    pendingUploads.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    setPendingUploads([]);
  };

  const handleUploadAll = async () => {
    if (pendingUploads.length === 0) return;
    setUploading(true);
    try {
      for (const item of pendingUploads) {
        const ext = item.file.name.split(".").pop();
        const path = `${institute.slug}/gallery/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from("institute-assets")
          .upload(path, item.file, { cacheControl: "3600" });

        if (uploadError) throw uploadError;

        const cleanTitle = sanitizeInput(item.title.trim() || item.file.name);
        const cleanDesc = sanitizeInput(item.description.trim());

        const { error: insertError } = await supabase.from("content").insert({
          institute_id: institute.id,
          type: "gallery",
          title: cleanTitle,
          description: cleanDesc,
          image_url: path,
        });

        if (insertError) throw insertError;
        URL.revokeObjectURL(item.previewUrl);
      }

      setPendingUploads([]);
      await fetchImages();
      addToast("All images uploaded successfully with custom titles!", "success");
    } catch (err) {
      addToast(err.message || "Failed to upload images", "error");
    } finally {
      setUploading(false);
    }
  };

  const startEditing = (image) => {
    setEditingImage(image);
    setEditTitle(image.title || "");
    setEditDescription(image.description || "");
  };

  const handleSaveDetails = async () => {
    if (!editTitle.trim()) {
      addToast("Image title is required", "error");
      return;
    }
    const cleanEditTitle = sanitizeInput(editTitle.trim());
    const cleanEditDesc = sanitizeInput(editDescription.trim());

    setSavingDetails(true);
    try {
      const { error } = await supabase
        .from("content")
        .update({
          title: cleanEditTitle,
          description: cleanEditDesc,
        })
        .eq("id", editingImage.id);

      if (error) throw error;

      setImages((prev) =>
        prev.map((img) =>
          img.id === editingImage.id
            ? { ...img, title: cleanEditTitle, description: cleanEditDesc }
            : img
        )
      );

      addToast("Image details updated successfully", "success");
      setEditingImage(null);
    } catch (err) {
      addToast(err.message || "Failed to update details", "error");
    } finally {
      setSavingDetails(false);
    }
  };

  const handleDelete = async (record) => {
    try {
      const { error: storageError } = await supabase.storage
        .from("institute-assets")
        .remove([record.image_url]);

      if (storageError) throw storageError;

      const { error: deleteError } = await supabase
        .from("content")
        .delete()
        .eq("id", record.id);

      if (deleteError) throw deleteError;

      setImages((prev) => prev.filter((img) => img.id !== record.id));
      addToast("Image deleted", "success");
    } catch (err) {
      addToast(err.message || "Failed to delete image", "error");
    }
  };

  const onDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const onDragLeave = () => {
    setDragOver(false);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    handleSelectFiles(files);
  };

  const onFileChange = (e) => {
    const files = Array.from(e.target.files);
    handleSelectFiles(files);
    e.target.value = "";
  };

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <h2>Gallery</h2>
        {images.length > 0 && (
          <span className={styles.badge}>{images.length}</span>
        )}
      </div>

      <div
        className={`${styles.dropZone} ${dragOver ? styles.dropZoneActive : ""}`}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
        style={{ marginBottom: "1.5rem" }}
      >
        <div className={styles.dropZoneContent}>
          <Upload size={24} />
          <p>Drop images here or click to select</p>
          <span>Write custom names/details before uploading them</span>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={onFileChange}
          style={{ display: "none" }}
        />
      </div>

      {/* Pending Uploads Section */}
      {pendingUploads.length > 0 && (
        <div className={styles.pendingSection}>
          <h3 className={styles.pendingTitle}>Images to Upload ({pendingUploads.length})</h3>
          <div className={styles.pendingList}>
            {pendingUploads.map((item) => (
              <div key={item.id} className={styles.pendingCard}>
                <img src={item.previewUrl} alt="Preview" className={styles.pendingPreview} />
                <div className={styles.pendingFields}>
                  <input
                    type="text"
                    className={styles.input}
                    value={item.title}
                    onChange={(e) => handleUpdatePending(item.id, "title", e.target.value)}
                    placeholder="Image Name/Title"
                  />
                  <input
                    type="text"
                    className={styles.input}
                    value={item.description}
                    onChange={(e) => handleUpdatePending(item.id, "description", e.target.value)}
                    placeholder="Description/Caption (Optional)"
                  />
                </div>
                <button
                  type="button"
                  className={styles.pendingRemoveBtn}
                  onClick={() => handleRemovePending(item.id)}
                  title="Remove from upload queue"
                >
                  <X size={18} />
                </button>
              </div>
            ))}
          </div>

          <div className={styles.btnRow}>
            <button
              className={styles.btnSecondary}
              onClick={handleClearAllPending}
              disabled={uploading}
            >
              Clear All
            </button>
            <button
              className={styles.btnPrimary}
              onClick={handleUploadAll}
              disabled={uploading}
            >
              {uploading ? <span className={styles.spinner} /> : null}
              {uploading ? "Uploading..." : `Upload ${pendingUploads.length} Image(s)`}
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className={styles.loadingState}>
          <span className={styles.spinner} />
        </div>
      ) : images.length === 0 ? (
        <div className={styles.emptyState}>
          <ImageIcon size={32} />
          <p>No gallery images yet</p>
        </div>
      ) : (
        <div className={styles.imageGrid}>
          {images.map((image) => {
            const { data } = supabase.storage
              .from("institute-assets")
              .getPublicUrl(image.image_url);
            return (
              <div key={image.id} className={styles.imageCard}>
                <img src={data.publicUrl} alt={image.title} className={styles.imageCardImg} />
                <div className={styles.imageCardOverlay}>
                  <button
                    className={styles.imageEditBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      startEditing(image);
                    }}
                    title="Edit details"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    className={styles.imageDeleteBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(image);
                    }}
                    title="Delete image"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Image Details Modal */}
      {editingImage && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3>Edit Image Details</h3>
              <button className={styles.modalCloseBtn} onClick={() => setEditingImage(null)}>✕</button>
            </div>
            
            <div className={styles.modalBody}>
              <div className={styles.field}>
                <label className={styles.label}>Title</label>
                <input
                  type="text"
                  className={styles.input}
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="Image Title"
                />
              </div>
              <div className={styles.field} style={{ marginTop: "1rem" }}>
                <label className={styles.label}>Description</label>
                <textarea
                  className={styles.input}
                  style={{ minHeight: "80px", resize: "vertical" }}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="Image Description / Caption"
                />
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button className={styles.btnSecondary} onClick={() => setEditingImage(null)}>
                Cancel
              </button>
              <button className={styles.btnPrimary} onClick={handleSaveDetails} disabled={savingDetails}>
                {savingDetails ? "Saving..." : "Save Details"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
