import { NextResponse } from "next/server";
import { AuthError } from "@/lib/auth";

export function apiError(error: unknown) {
  if (error instanceof AuthError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }

  if (error instanceof Error) {
    console.error(error);
    return NextResponse.json({ error: error.message || "Something went wrong." }, { status: 400 });
  }

  console.error(error);
  return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
}
