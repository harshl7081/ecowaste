import { currentUser } from "@clerk/nextjs/server";
import { isAdmin } from "./sync-user";
import { redirect } from "next/navigation";

// Check if the current user is an admin
export async function checkAdmin() {
  const user = await currentUser();
  
  if (!user) {
    return false;
  }
  
  return isAdmin(user.id);
}

// Require admin role for a component, redirects otherwise
export async function requireAdmin(redirectTo = '/dashboard') {
  const user = await currentUser();
  
  if (!user) {
    redirect('/sign-in');
  }
  
  const adminStatus = await isAdmin(user.id);
  
  if (!adminStatus) {
    redirect(redirectTo);
  }
  
  return true;
}

// Get role for current user
export async function getUserRole() {
  const user = await currentUser();
  
  if (!user) {
    return null;
  }
  
  const adminStatus = await isAdmin(user.id);
  return adminStatus ? 'admin' : 'user';
} 