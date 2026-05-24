import { NextResponse } from "next/server";

const GOOGLE_SCRIPT_URL =
  process.env.GOOGLE_SCRIPT_URL ??
  "https://script.google.com/macros/s/AKfycbxHbJfGtgg-nOlfmpBOArRREaUgOmCxE5H_OsQSmmKvW2i8Dh2DonNrVTs3iJ0Bx_55mg/exec";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  let email = "";

  try {
    const body = (await request.json()) as { email?: unknown };
    email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (!EMAIL_PATTERN.test(email)) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  const now = new Date();
  const date = new Intl.DateTimeFormat("en-GB", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "Asia/Oral",
  }).format(now);

  try {
    const scriptUrl = new URL(GOOGLE_SCRIPT_URL);
    scriptUrl.searchParams.set("email", email);
    scriptUrl.searchParams.set("date", date);

    const response = await fetch(scriptUrl, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
      body: JSON.stringify({ email, date }),
      redirect: "follow",
    });

    if (!response.ok) {
      const message = await response.text();
      console.error("Google Sheets submission failed", response.status, message);
      return NextResponse.json({ error: "Unable to save email" }, { status: 502 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Google Sheets submission failed", error);
    return NextResponse.json({ error: "Unable to save email" }, { status: 502 });
  }
}
