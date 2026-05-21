import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { signToken, COOKIE_NAME, COOKIE_OPTIONS } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { username, email, password } = body;

    if (!username?.trim() || !email?.trim() || !password) {
      return NextResponse.json(
        { success: false, error: "Username, email, and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    const existing = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { username: username.trim() }],
    });
    if (existing) {
      const field = existing.email === email.toLowerCase() ? "Email" : "Username";
      return NextResponse.json(
        { success: false, error: `${field} is already taken` },
        { status: 409 }
      );
    }

    const user = await User.create({ username: username.trim(), email, password });

    const token = signToken({
      userId: user._id.toString(),
      username: user.username,
      email: user.email,
      role: user.role,
    });

    const response = NextResponse.json(
      {
        success: true,
        data: { _id: user._id, username: user.username, email: user.email, role: user.role },
      },
      { status: 201 }
    );
    response.cookies.set(COOKIE_NAME, token, COOKIE_OPTIONS);
    return response;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Server error";
    if (message.includes("duplicate key") || message.includes("E11000")) {
      return NextResponse.json(
        { success: false, error: "Username or email already in use" },
        { status: 409 }
      );
    }
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
