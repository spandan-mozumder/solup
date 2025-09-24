import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prismaClient } from "db/client";
import { NextRequest } from "next/server";

async function resolveClientInfo(req: NextRequest) {

  const forwarded = req.headers.get('x-forwarded-for') || req.headers.get('forwarded');
  let ip = 'unknown';
  if (forwarded) {
    ip = forwarded.split(',')[0].trim();
  } else if (req.headers.get('x-real-ip')) {
    ip = req.headers.get('x-real-ip') as string;
  }

  if (ip === '::1' || ip.startsWith('127.') || ip === 'unknown') {
    ip = '127.0.0.1';
  }
  let location = 'unknown';
  try {

    const geoResp = await fetch(`https://ipapi.co/${ip === '127.0.0.1' ? '' : ip}/json/` , { next: { revalidate: 3600 } });
    if (geoResp.ok) {
      const g = await geoResp.json();
      if (g && g.city && g.country) {
        location = `${g.city}, ${g.country}`;
      } else if (g && g.country_name) {
        location = g.country_name;
      }
    }
  } catch {}
  return { ip, location };
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions as any);
    const userId: string | undefined = (session as any)?.user?.id;
    
    if (!userId) {
      console.log("Unauthorized validator registration attempt");
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    const body = await req.json();
    const publicKey = body.publicKey;
    
    if (!publicKey) {
      console.log("Missing publicKey in validator registration");
      return new Response(JSON.stringify({ error: "Missing publicKey" }), { status: 400 });
    }

    console.log("Registering validator for user:", userId, "publicKey:", publicKey);
    const { ip: detectedIp, location: detectedLocation } = await resolveClientInfo(req);
    console.log("Client info:", { ip: detectedIp, location: detectedLocation });

    try {

    const userRecord = await prismaClient.user.findUnique({ where: { id: userId } });
    if (!userRecord) {
      return new Response(JSON.stringify({ error: "User record not found" }), { status: 404 });
    }

    const byUser = await prismaClient.validator.findFirst({ where: { userId } });
    if (byUser) {

      if (byUser.publicKey !== publicKey) {
  const pkInUse = await prismaClient.validator.findFirst({ where: { publicKey } });
        if (pkInUse && pkInUse.id !== byUser.id) {
          return new Response(JSON.stringify({ error: "Public key already registered" }), { status: 409 });
        }
        const updated = await prismaClient.validator.update({
          where: { id: byUser.id },
          data: { publicKey, ip: detectedIp || byUser.ip, location: detectedLocation || byUser.location },
        });
        return new Response(JSON.stringify(updated), { status: 200 });
      }
      return new Response(JSON.stringify(byUser), { status: 200 });
    }


    const pkExisting = await prismaClient.validator.findFirst({ where: { publicKey } });
    if (pkExisting && pkExisting.userId && pkExisting.userId !== userId) {
      return new Response(JSON.stringify({ error: "Public key already registered" }), { status: 409 });
    }

    if (pkExisting && !pkExisting.userId) {

      const claimed = await prismaClient.validator.update({
        where: { id: pkExisting.id },
        data: { userId, ip: detectedIp || pkExisting.ip, location: detectedLocation || pkExisting.location },
      });
      return new Response(JSON.stringify(claimed), { status: 200 });
    }

    const created = await prismaClient.validator.create({
      data: {
        userId,
        publicKey,
        ip: detectedIp || "unknown",
        location: detectedLocation || "unknown",
      },
    });
    console.log("Validator created successfully:", created);
    return new Response(JSON.stringify(created), { status: 201 });
  } catch (e: any) {
    console.error('[Validator POST DB error]', e);
    return new Response(JSON.stringify({ error: "Database error occurred" }), { status: 500 });
  }
  } catch (e: any) {
    console.error('[Validator POST error]', e);
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
  }
}

export async function GET() {
  const session = await getServerSession(authOptions as any);
  const userId: string | undefined = (session as any)?.user?.id;
  if (!userId) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  const validator = await prismaClient.validator.findFirst({ where: { userId } });
  return new Response(JSON.stringify(validator), { status: 200 });
}
