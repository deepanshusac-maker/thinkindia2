"use client";

import { useActionState } from "react";
import { loginAction } from "@/app/admin/actions";
import { LogIn } from "lucide-react";
import styles from "./login.module.css";

export default function AdminLoginPage() {
  const [state, formAction, isPending] = useActionState(loginAction, {
    error: null,
  });

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.iconWrap}>
            <LogIn size={28} />
          </div>
          <h1 className={styles.title}>Admin Login</h1>
          <p className={styles.subtitle}>Think India Bihar — Dashboard</p>
        </div>

        <form action={formAction} className={styles.form}>
          {state?.error && (
            <div className={styles.error}>{state.error}</div>
          )}

          <div className={styles.field}>
            <label htmlFor="email" className={styles.label}>
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className={styles.input}
              placeholder="admin@thinkindia.org"
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="password" className={styles.label}>
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className={styles.input}
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className={styles.button}
          >
            {isPending ? "Signing in…" : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
