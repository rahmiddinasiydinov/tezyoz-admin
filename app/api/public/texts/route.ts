import { NextRequest, NextResponse } from "next/server";

const API = process.env.NEXT_PUBLIC_API;

/**
 * Public API endpoint for fetching texts
 * This route is accessible without authentication for third-party apps
 * 
 * Query parameters:
 * - page: number (default: 1)
 * - limit: number (default: 20, max: 100)
 * - language: UZBEK | RUSSIAN | ENGLISH | KRILL (optional)
 */
export async function GET(request: NextRequest) {
  if (!API) {
    return NextResponse.json(
      { success: false, message: "API not configured" },
      { status: 500 }
    );
  }

  const searchParams = request.nextUrl.searchParams;
  const page = searchParams.get("page") || "1";
  const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100).toString();
  const language = searchParams.get("language");

  let url = `${API}/api/text/for-game?gameModeId=6799eda6dfe2b8ae9bb5e1d3`;
  
  if (language) {
    url += `&language=${language}`;
  } else {
    url += `&language=UZBEK`;
  }

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    // Add CORS headers for third-party access
    const res = NextResponse.json(data);
    res.headers.set("Access-Control-Allow-Origin", "*");
    res.headers.set("Access-Control-Allow-Methods", "GET");
    res.headers.set("Access-Control-Allow-Headers", "Content-Type");
    
    return res;
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to fetch texts" },
      { status: 500 }
    );
  }
}

// Handle CORS preflight
export async function OPTIONS() {
  const res = new NextResponse(null, { status: 204 });
  res.headers.set("Access-Control-Allow-Origin", "*");
  res.headers.set("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.headers.set("Access-Control-Allow-Headers", "Content-Type");
  return res;
}
