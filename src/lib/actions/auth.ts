"use server";

import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function loginStaff(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { success: false, error: "Email y contraseña requeridos" };
  }

  const staff = await prisma.staff.findUnique({
    where: { email }
  });

  if (!staff || staff.password !== password) {
    return { success: false, error: "Credenciales incorrectas" };
  }

  // Set cookie for session
  const cookieStore = await cookies();
  cookieStore.set("staff_session", JSON.stringify({
    id: staff.id,
    role: staff.role,
    name: staff.name
  }), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7, // 1 week
    path: "/",
  });

  if (staff.role === "ADMIN") {
    redirect("/admin");
  } else {
    redirect("/rider");
  }
}

export async function logoutStaff() {
  const cookieStore = await cookies();
  cookieStore.delete("staff_session");
  redirect("/login");
}

export async function attemptStaffLogin(email: string, password: string) {
  const staff = await prisma.staff.findUnique({
    where: { email }
  });

  if (!staff || staff.password !== password) {
    return { success: false, error: "Credenciales incorrectas" };
  }

  // Set cookie for session
  const cookieStore = await cookies();
  cookieStore.set("staff_session", JSON.stringify({
    id: staff.id,
    role: staff.role,
    name: staff.name
  }), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7, // 1 week
    path: "/",
  });

  return { success: true, role: staff.role };
}
