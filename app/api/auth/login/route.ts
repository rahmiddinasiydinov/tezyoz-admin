import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const API = process.env.NEXT_PUBLIC_API;

interface LoginBody {
  email: string;
  password: string;
}

export async function POST(request: NextRequest) {
  if (!API) {
    return NextResponse.json({ success: false, message: "API not configured" }, { status: 500 });
  }

  const body: LoginBody = await request.json();

  if (!body.email || !body.password) {
    return NextResponse.json({ success: false, message: "Email and password are required" }, { status: 400 });
  }

  const response = await fetch(`${API}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email: body.email, password: body.password }),
    cache: "no-store",
  });

  const data = await response.json();

  if (!response.ok) {
    return NextResponse.json({ success: false, message: data?.message || "Login failed" }, { status: response.status });
  }

  // Check if user has admin role
  if (data.data?.user?.role !== "ADMIN") {
    return NextResponse.json({ success: false, message: "Access denied. Admin role required." }, { status: 403 });
  }

  if (data.data?.accessToken) {
    const cookieStore = await cookies();
    
    cookieStore.set("access_token", data.data.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24, // 1 day
      path: "/",
    });
    
    cookieStore.set("refresh_token", data.data.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return NextResponse.json({ 
      success: true, 
      user: {
        email: data.data.user?.email,
        role: data.data.user?.role,
      }
    });
  }

  return NextResponse.json({ success: false, message: "Authentication failed" }, { status: 401 });
}
