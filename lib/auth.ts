
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const COOKIE_NAME = "placement_admin_session";
const SESSION_DURATION = 60 * 60 * 8; // 8 hours

function getSecretKey(): Uint8Array {
  const secret = process.env.SESSION_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error(
      "SESSION_SECRET must contain at least 32 characters."
    );
  }

  return new TextEncoder().encode(secret);
}

export async function createAdminSession(): Promise<void> {
  const token = await new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(Math.floor(Date.now() / 1000) + SESSION_DURATION)
    .sign(getSecretKey());

  const cookieStore = await cookies();

  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DURATION,
  });
}

export async function verifyAdminSession(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;

    if (!token) {
      return false;
    }

    const { payload } = await jwtVerify(token, getSecretKey(), {
      algorithms: ["HS256"],
    });

    return payload.role === "admin";
  } catch (error) {
    console.error("Admin session verification failed:", error);

    if (error instanceof Error) {
      console.error("Error name:", error.name);
      console.error("Error message:", error.message);
    }

    return false;
  }
}

export async function clearAdminSession(): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export function unauthorizedResponse() {
  return NextResponse.json(
    {
      error: "Unauthorized. Please log in as an administrator.",
    },
    { status: 401 }
  );
}
