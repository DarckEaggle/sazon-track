import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  if (pathname.startsWith("/admin") || pathname.startsWith("/rider")) {
    const sessionStr = request.cookies.get("staff_session")?.value;
    
    if (!sessionStr) {
      return NextResponse.redirect(new URL("/staff/login", request.url));
    }
    
    try {
      const session = JSON.parse(sessionStr);
      
      // Basic role protection
      if (pathname.startsWith("/admin") && session.role !== "ADMIN") {
        return NextResponse.redirect(new URL("/rider", request.url));
      }
      if (pathname.startsWith("/rider") && session.role !== "RIDER" && session.role !== "ADMIN") {
        return NextResponse.redirect(new URL("/staff/login", request.url));
      }
    } catch (e) {
      return NextResponse.redirect(new URL("/staff/login", request.url));
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/rider/:path*"],
};
