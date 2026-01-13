import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const API = process.env.NEXT_PUBLIC_API;

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!API) {
    return NextResponse.json({ success: false, message: "API not configured" }, { status: 500 });
  }

  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  if (!accessToken) {
    return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 });
  }

  const { id } = await params;

  const response = await fetch(`${API}/api/text/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    return NextResponse.json(data, { status: response.status });
  }

  return NextResponse.json(data);
}
