import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { getSessionFromRequest } from "@/lib/auth";

/**
 * POST /api/auth/change-password
 * Authenticated user changes their own password.
 * Body: { currentPassword, newPassword }
 */
export async function POST(request: NextRequest) {
  try {
    const session = getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { success: false, error: "Current and new passwords are required" },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { success: false, error: "New password must be at least 6 characters" },
        { status: 400 }
      );
    }

    if (currentPassword === newPassword) {
      return NextResponse.json(
        { success: false, error: "New password must be different from current password" },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await User.findById(session.userId);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Verify the current password against the stored bcrypt hash.
    const valid = await user.comparePassword(currentPassword);
    if (!valid) {
      return NextResponse.json(
        { success: false, error: "Current password is incorrect" },
        { status: 401 }
      );
    }

    // Setting `password` triggers the pre-save hook which re-hashes it.
    user.password = newPassword;
    await user.save();

    return NextResponse.json({ success: true, message: "Password updated" });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Server error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
