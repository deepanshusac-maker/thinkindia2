"use client";

import { useEffect } from "react";
import { CheckCircle, AlertCircle, X } from "lucide-react";
import styles from "./Toast.module.css";

export default function ToastContainer({ toasts, removeToast }) {
  if (!toasts.length) return null;
  return (
    <div className={styles.container}>
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={removeToast} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onDismiss }) {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(toast.id), 3500);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  return (
    <div className={`${styles.toast} ${styles[toast.type]}`}>
      {toast.type === "success" ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
      <span className={styles.message}>{toast.message}</span>
      <button onClick={() => onDismiss(toast.id)} className={styles.dismiss}>
        <X size={14} />
      </button>
    </div>
  );
}
