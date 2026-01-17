import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
    const imageUrl = req.nextUrl.searchParams.get("url");

    if (!imageUrl) {
        return new Response("Missing url", { status: 400 });
    }

    let upstream;
    try {
        upstream = await fetch(imageUrl, {
            headers: {
                // Required by many manga CDNs
                "User-Agent": "Mozilla/5.0",
                "Referer": imageUrl,
            },
            cache: "force-cache",
        });
    } catch {
        return new Response("Fetch failed", { status: 502 });
    }

    if (!upstream.ok || !upstream.body) {
        return new Response("Upstream error", { status: 502 });
    }

    return new Response(upstream.body, {
        headers: {
            "Content-Type": upstream.headers.get("content-type") ?? "image/jpeg",
            "Access-Control-Allow-Origin": "*",
            "Cache-Control": "public, max-age=31536000, immutable",
        },
    });
}
