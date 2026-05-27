"use client";

import { useState, useEffect } from "react";
import { Save } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import styles from "./dashboard.module.css";

const supabase = createClient();

export default function AboutEditor({ institute, addToast, onUpdate }) {
  const [text, setText] = useState(institute.about_text || "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setText(institute.about_text || "");
  }, [institute.id, institute.about_text]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("institutes")
        .update({ about_text: text })
        .eq("id", institute.id);

      if (error) throw error;

      // Sync parent state so switching tabs preserves the change
      if (onUpdate) onUpdate(institute.id, text);
      addToast("About section updated successfully", "success");
    } catch (err) {
      addToast(err.message || "Failed to update about section", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <h2 className={styles.cardTitle}>About Section</h2>
      </div>
      <div className={styles.field}>
        <label className={styles.label}>Institute Description</label>
        <textarea
          className={styles.textarea}
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={8}
          placeholder="Write about this institute chapter…"
        />
      </div>
      <div className={styles.btnRow} style={{ marginTop: "1rem" }}>
        <button
          className={styles.btnPrimary}
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? <span className={styles.spinner} /> : <Save size={16} />}
          {saving ? "Saving…" : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
