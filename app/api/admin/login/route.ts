
import { NextResponse } from "next/server";
import { createAdminSession } from "../../../../lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const username = String(body.username ?? "");
    const password = String(body.password ?? "");

    const expectedUsername = process.env.ADMIN_USERNAME;
    const expectedPassword = process.env.ADMIN_PASSWORD;

    if (!expectedUsername || !expectedPassword) {
      return NextResponse.json(
        { error: "Admin login is not configured." },
        { status: 500 }
      );
    }

    if (
      username !== expectedUsername ||
      password !== expectedPassword
    ) {
      return NextResponse.json(
        { error: "Invalid username or password." },
        { status: 401 }
      );
    }

    await createAdminSession();

    return NextResponse.json({
      success: true,
      message: "Login successful.",
    });
  } catch {
    return NextResponse.json(
      { error: "Unable to process login." },
      { status: 400 }
    );
  }
}
