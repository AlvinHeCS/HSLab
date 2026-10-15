import { NextResponse, type NextRequest } from "next/server";

import { env } from "~/env";
import { LOCK_COOKIE, lockToken } from "~/server/site-lock";

export async function middleware(request: NextRequest) {
  const key = request.cookies.get(LOCK_COOKIE)?.value;
  if (key === (await lockToken(env.SITE_PASSPHRASE))) {
    return NextResponse.next();
  }

  if (request.nextUrl.pathname.startsWith("/api/")) {
    return new NextResponse("Locked", { status: 401 });
  }

  const unlock = new URL("/unlock", request.url);
  unlock.searchParams.set(
    "next",
    request.nextUrl.pathname + request.nextUrl.search,
  );
  return NextResponse.redirect(unlock);
}

export const config = {
  matcher: [
    "/((?!unlock|_next/static|_next/image|icon.png|apple-icon.png|favicon.ico).*)",
  ],
};
