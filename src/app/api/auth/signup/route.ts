import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { email, password, displayName } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 },
      );
    }

    const normalizedEmail = (email as string).toLowerCase().trim();

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 },
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 },
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        hashedPassword,
        name: displayName?.trim() || normalizedEmail.split("@")[0],
        displayName: displayName?.trim() || normalizedEmail.split("@")[0],
        emailVerified: new Date(), // skip email verification for MVP
      },
    });

    return NextResponse.json({
      id: user.id,
      email: user.email,
      displayName: user.displayName,
    });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Error creating account" },
      { status: 500 },
    );
  }
}
