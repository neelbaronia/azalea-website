import { NextResponse } from "next/server";

const LIBRARY_URL = "https://pub-ee342152cf1149298fc3cb54a286f268.r2.dev/library.json";

export async function GET() {
  const res = await fetch(LIBRARY_URL, { next: { revalidate: 3600 } });
  if (!res.ok) return NextResponse.json([], { status: 502 });
  const books = await res.json();
  return NextResponse.json(books);
}
