"use client";

import { useState, useEffect } from "react";
import { UserPlus, Trash2, Upload } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import styles from "./dashboard.module.css";

const supabase = createClient();

export default function TeamManager({ institute, addToast }) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [photoFile, setPhotoFile] = useState(null);

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("content")
        .select("*")
        .eq("type", "team")
        .eq("institute_id", institute.id);

      if (error) throw error;
      setMembers(data || []);
    } catch (err) {
      addToast(err.message || "Failed to load team members", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [institute.id]);

  const handleAdd = async () => {
    if (!name.trim()) {
      addToast("Name is required", "error");
      return;
    }

    setSaving(true);
    try {
      let photoPath = null;

      if (photoFile) {
        const ext = photoFile.name.split(".").pop();
        photoPath = `${institute.slug}/team/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from("institute-assets")
          .upload(photoPath, photoFile, { cacheControl: "3600" });

        if (uploadError) throw uploadError;
      }

      const { error: insertError } = await supabase.from("content").insert({
        institute_id: institute.id,
        type: "team",
        title: name,
        description: role,
        image_url: photoPath || null,
      });

      if (insertError) throw insertError;

      await fetchMembers();
      setName("");
      setRole("");
      setPhotoFile(null);
      addToast("Team member added", "success");
    } catch (err) {
      addToast(err.message || "Failed to add team member", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (member) => {
    try {
      if (member.image_url) {
        const { error: storageError } = await supabase.storage
          .from("institute-assets")
          .remove([member.image_url]);

        if (storageError) throw storageError;
      }

      const { error: deleteError } = await supabase
        .from("content")
        .delete()
        .eq("id", member.id);

      if (deleteError) throw deleteError;

      setMembers((prev) => prev.filter((m) => m.id !== member.id));
      addToast("Team member removed", "success");
    } catch (err) {
      addToast(err.message || "Failed to delete team member", "error");
    }
  };

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <h2>Team Members</h2>
      </div>

      <div className={styles.formRow}>
        <div className={styles.field}>
          <label className={styles.label}>Name</label>
          <input
            className={styles.input}
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Member name"
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Role</label>
          <input
            className={styles.input}
            type="text"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            placeholder="e.g. President, Secretary"
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Photo</label>
          <div className={styles.fileInputWrap}>
            <label className={styles.fileInputLabel}>
              <Upload size={14} />
              {photoFile ? photoFile.name : "Choose photo"}
              <input
                type="file"
                accept="image/*"
                className={styles.fileInputHidden}
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  if (file && file.size > 1.5 * 1024 * 1024) {
                    addToast("Photo file size exceeds 1.5MB limit", "error");
                    e.target.value = "";
                    setPhotoFile(null);
                  } else {
                    setPhotoFile(file);
                  }
                }}
              />
            </label>
          </div>
        </div>
      </div>

      <div className={styles.btnRow}>
        <button
          className={styles.btnPrimary}
          onClick={handleAdd}
          disabled={saving}
        >
          {saving ? <span className={styles.spinner} /> : <UserPlus size={16} />}
          {saving ? "Adding..." : "Add Member"}
        </button>
      </div>

      {loading ? (
        <div className={styles.loadingState}>
          <span className={styles.spinner} />
        </div>
      ) : members.length === 0 ? (
        <div className={styles.emptyState}>
          <p>No team members yet</p>
        </div>
      ) : (
        <div className={styles.memberList}>
          {members.map((member) => {
            const photoUrl = member.image_url
              ? supabase.storage
                  .from("institute-assets")
                  .getPublicUrl(member.image_url).data.publicUrl
              : null;

            return (
              <div key={member.id} className={styles.memberCard}>
                {photoUrl ? (
                  <img
                    src={photoUrl}
                    alt={member.title}
                    className={styles.memberPhoto}
                  />
                ) : (
                  <div className={styles.memberPhotoPlaceholder}>
                    {member.title?.charAt(0)?.toUpperCase() || "?"}
                  </div>
                )}
                <div className={styles.memberInfo}>
                  <span className={styles.memberName}>{member.title}</span>
                  <span className={styles.memberRole}>{member.description}</span>
                </div>
                <button
                  className={styles.btnIcon}
                  onClick={() => handleDelete(member)}
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
