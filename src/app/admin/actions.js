"use server";

import { signIn, signOut } from "@/lib/auth";
import { redirect } from "next/navigation";

/**
 * Server Action: Handle admin login form submission.
 */
export async function loginAction(prevState, formData) {
  const email = formData.get("email");
  const password = formData.get("password");

  try {
    await signIn(email, password);
  } catch (error) {
    return { error: error.message || "Invalid credentials. Please try again." };
  }

  redirect("/admin");
}

/**
 * Server Action: Handle admin logout.
 */
export async function logoutAction() {
  await signOut();
}
