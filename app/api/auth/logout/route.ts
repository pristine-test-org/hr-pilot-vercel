import { NextResponse } from "next/server";
import { destroySession } from "@/lib/auth";
import { apiError } from "@/lib/api-utils";

export async function POST() {
  try {
    await destroySession();
    return NextResponse.json({ ok: true });
  } catch (error) {
    return apiError(error);
  }
}
