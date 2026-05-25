import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { getSessionFromRequest, signToken, COOKIE_NAME, COOKIE_OPTIONS } from "@/lib/auth";

export async function PATCH(request: NextRequest) {
  try {
    const session = getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const body = await request.json();
    const { email, currentPassword, newPassword } = body;

    const user = await User.findById(session.userId);
    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    if (email && email.toLowerCase().trim() !== user.email) {
      const existing = await User.findOne({ email: email.toLowerCase().trim() });
      if (existing) {
        return NextResponse.json({ success: false, error: "Email already in use" }, { status: 400 });
      }
      user.email = email.toLowerCase().trim();
    }

    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json(
          { success: false, error: "Current password is required" },
          { status: 400 }
        );
      }
      const valid = await user.comparePassword(currentPassword);
      if (!valid) {
        return NextResponse.json(
          { success: false, error: "Current password is incorrect" },
          { status: 400 }
        );
      }
      if (newPassword.length < 6) {
        return NextResponse.json(
          { success: false, error: "New password must be at least 6 characters" },
          { status: 400 }
        );
      }
      user.password = newPassword;
    }

    await user.save();

    const token = signToken({
      userId: user._id.toString(),
      username: user.username,
      email: user.email,
      role: user.role,
    });

    const data = { _id: user._id, username: user.username, email: user.email, role: user.role };
    const response = NextResponse.json({ success: true, data });
    response.cookies.set(COOKIE_NAME, token, COOKIE_OPTIONS);
    return response;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Server error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
