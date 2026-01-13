import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const API = process.env.NEXT_PUBLIC_API;

export async function GET(request: NextRequest) {
  if (!API) {
    return NextResponse.json({ success: false, message: "API not configured" }, { status: 500 });
  }

  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  if (!accessToken) {
    return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const page = searchParams.get("page") || "1";
  const limit = searchParams.get("limit") || "20";
  const language = searchParams.get("language");

  let url = `${API}/api/text?page=${page}&limit=${limit}`;
  if (language) {
    url += `&language=${language}`;
  }

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  });

  const data = await response.json();

  if (!response.ok) {
    return NextResponse.json(data, { status: response.status });
  }

  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  if (!API) {
    return NextResponse.json({ success: false, message: "API not configured" }, { status: 500 });
  }

  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  if (!accessToken) {
    return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 });
  }

  const body = await request.json();

  const response = await fetch(`${API}/api/text`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();

  if (!response.ok) {
    return NextResponse.json(data, { status: response.status });
  }

  return NextResponse.json(data, { status: 201 });
}
