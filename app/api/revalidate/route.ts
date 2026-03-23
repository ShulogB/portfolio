import { NextRequest } from "next/server";
import { revalidatePath } from "next/cache";

const REVALIDATION_SECRET = process.env.REVALIDATION_SECRET;

export async function GET() {
  return Response.json({ error: "Method not allowed" }, { status: 405 });
}

export async function POST(request: NextRequest) {
  if (!REVALIDATION_SECRET) {
    return Response.json(
      { error: "Revalidation not configured" },
      { status: 503 }
    );
  }

  const authHeader = request.headers.get("authorization");
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.slice(7)
    : request.headers.get("x-revalidate-secret") ?? null;

  if (token !== REVALIDATION_SECRET) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const slug = typeof body?.slug === "string" ? body.slug.trim() : null;

  const revalidated: string[] = [];

  if (slug) {
    revalidatePath(`/projects/${slug}`);
    revalidated.push(`/projects/${slug}`);
  }

  revalidatePath("/");
  revalidated.push("/");

  return Response.json({ revalidated, now: Date.now() });
}
