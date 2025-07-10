import { NextResponse } from "next/server";
import { createClient, Errors } from "@farcaster/quick-auth";

const client = createClient();

export async function GET(request) {
  const authHeader = request.headers.get("authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Missing token" }, { status: 401 });
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = await client.verifyJwt({
      token,
      domain: process.env.NEXT_PUBLIC_API_DOMAIN, // e.g. 'bit-refill-hackathon1.vercel.app'
    });

    const fid = payload.sub;

    // You could also fetch additional info, like Ethereum address from Neynar
    return NextResponse.json({ fid });
  } catch (err) {
    if (err instanceof Errors.InvalidTokenError) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
