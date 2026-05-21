import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import ViewHistory from "@/models/ViewHistory";
import { getSessionFromRequest } from "@/lib/auth";

/**
 * GET /api/admin/users
 * Admin only: returns all users with their learning history summary.
 */
export async function GET(request: NextRequest) {
  try {
    const session = getSessionFromRequest(request);
    if (!session || session.role !== "admin") {
      return NextResponse.json({ success: false, error: "Admin access required" }, { status: 403 });
    }

    await connectDB();

    const users = await User.find().select("-password").sort({ createdAt: -1 }).lean();

    // Aggregate history stats per user
    const stats = await ViewHistory.aggregate([
      {
        $group: {
          _id: "$userId",
          totalActions: { $sum: 1 },
          views: { $sum: { $cond: [{ $eq: ["$action", "view"] }, 1, 0] } },
          studied: { $sum: { $cond: [{ $eq: ["$action", "study"] }, 1, 0] } },
          discussed: { $sum: { $cond: [{ $eq: ["$action", "discuss"] }, 1, 0] } },
          lastActive: { $max: "$createdAt" },
        },
      },
    ]);

    const statsMap = new Map(stats.map((s) => [s._id.toString(), s]));

    const result = users.map((u) => ({
      ...u,
      stats: statsMap.get(u._id.toString()) || {
        totalActions: 0,
        views: 0,
        studied: 0,
        discussed: 0,
        lastActive: null,
      },
    }));

    return NextResponse.json({ success: true, data: result });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Server error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/users?id=<userId>
 * Admin only: delete a user account.
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = getSessionFromRequest(request);
    if (!session || session.role !== "admin") {
      return NextResponse.json({ success: false, error: "Admin access required" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ success: false, error: "User ID is required" }, { status: 400 });
    }

    if (id === session.userId) {
      return NextResponse.json({ success: false, error: "Cannot delete your own account" }, { status: 400 });
    }

    await connectDB();
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    await ViewHistory.deleteMany({ userId: id });

    return NextResponse.json({ success: true, message: "User deleted" });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Server error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
