"use client";

import { useState, useCallback, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { logoutAction } from "@/app/admin/actions";
import {
  LayoutDashboard,
  Building2,
  FileText,
  Image as ImageIcon,
  CalendarDays,
  LogOut,
  Users,
  Loader,
  Menu,
  X,
} from "lucide-react";

import ToastContainer from "./Toast";
import AboutEditor from "./AboutEditor";
import GalleryManager from "./GalleryManager";
import TeamManager from "./TeamManager";
import EventManager from "./EventManager";
import styles from "./dashboard.module.css";

const TABS = [
  { id: "about", label: "About", icon: FileText },
  { id: "gallery", label: "Gallery", icon: ImageIcon },
  { id: "team", label: "Team", icon: Users },
  { id: "events", label: "Events", icon: CalendarDays },
];

export default function AdminDashboard({ userEmail }) {
  const [institutes, setInstitutes] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [activeTab, setActiveTab] = useState("about");
  const [toasts, setToasts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const selectedInstitute = institutes.find((i) => i.id === selectedId) || null;

  const addToast = useCallback((message, type = "success") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    async function fetchInstitutes() {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("institutes")
        .select("*")
        .order("name");

      if (error) {
        setFetchError(error.message);
        setLoading(false);
        return;
      }

      setInstitutes(data || []);
      if (data && data.length > 0) {
        setSelectedId(data[0].id);
      }
      setLoading(false);
    }

    fetchInstitutes();
  }, []);

  // Callback for AboutEditor to update the local institute state after save
  const handleAboutUpdate = useCallback((instituteId, newAboutText) => {
    setInstitutes((prev) =>
      prev.map((inst) =>
        inst.id === instituteId
          ? { ...inst, about_text: newAboutText }
          : inst
      )
    );
  }, []);

  function renderTabContent() {
    if (!selectedInstitute) return null;

    switch (activeTab) {
      case "about":
        return (
          <AboutEditor
            key={selectedId}
            institute={selectedInstitute}
            addToast={addToast}
            onUpdate={handleAboutUpdate}
          />
        );
      case "gallery":
        return (
          <GalleryManager
            key={selectedId}
            institute={selectedInstitute}
            addToast={addToast}
          />
        );
      case "team":
        return (
          <TeamManager
            key={selectedId}
            institute={selectedInstitute}
            addToast={addToast}
          />
        );
      case "events":
        return (
          <EventManager
            key={selectedId}
            institute={selectedInstitute}
            addToast={addToast}
          />
        );
      default:
        return null;
    }
  }

  if (loading) {
    return (
      <div className={styles.dashboard}>
        <div className={styles.loadingState}>
          <div className={styles.spinner} />
          <span>Loading dashboard…</span>
        </div>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className={styles.dashboard}>
        <div className={styles.loadingState} style={{ flexDirection: "column", gap: "1rem" }}>
          <p style={{ color: "#fca5a5", fontWeight: 600 }}>Failed to connect to Supabase</p>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.875rem", maxWidth: 420, textAlign: "center", lineHeight: 1.7 }}>
            {fetchError}. Make sure you&apos;ve set your <code>.env.local</code> variables and run the database migrations.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.dashboard}>
      {/* Mobile Top Bar */}
      <div className={styles.mobileTopBar}>
        <button
          className={styles.mobileMenuBtn}
          onClick={() => setIsSidebarOpen(true)}
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>
        <span className={styles.mobileBrandTitle}>Think India Bihar</span>
        <div style={{ width: 20 }} /> {/* balance spacer */}
      </div>

      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className={styles.sidebarOverlay}
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${isSidebarOpen ? styles.sidebarOpen : ""}`}>
        <div className={styles.brand}>
          <div className={styles.brandIcon}>TI</div>
          <span className={styles.brandName}>Think India Bihar</span>
          <button
            className={styles.mobileCloseBtn}
            onClick={() => setIsSidebarOpen(false)}
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        <p className={styles.sidebarLabel}>Institutes</p>
        <div className={styles.instituteList}>
          {institutes.map((inst) => (
            <button
              key={inst.id}
              className={`${styles.instituteItem} ${
                inst.id === selectedId ? styles.instituteItemActive : ""
              }`}
              onClick={() => {
                setSelectedId(inst.id);
                setIsSidebarOpen(false); // Auto-close sidebar on mobile
              }}
            >
              <span className={styles.instituteDot} />
              {inst.name}
            </button>
          ))}
          {institutes.length === 0 && (
            <p className={styles.emptyState}>
              No institutes found. Run the seed migration.
            </p>
          )}
        </div>

        <div className={styles.userSection}>
          <p className={styles.userEmail}>{userEmail}</p>
          <form action={logoutAction}>
            <button type="submit" className={styles.logoutBtn}>
              <LogOut size={16} />
              <span>Sign Out</span>
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <div className={styles.main}>
        <div className={styles.mainHeader}>
          <h1 className={styles.mainTitle}>
            {selectedInstitute ? selectedInstitute.name : "Select an Institute"}
          </h1>
          <p className={styles.mainSubtitle}>
            Manage content for the selected institute chapter.
          </p>
        </div>

        {/* Tab Bar */}
        <div className={styles.tabBar}>
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              className={`${styles.tab} ${
                activeTab === id ? styles.tabActive : ""
              }`}
              onClick={() => setActiveTab(id)}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className={styles.contentArea}>{renderTabContent()}</div>
      </div>

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}
