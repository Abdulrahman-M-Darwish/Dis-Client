import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
	// const { pathname } = request.nextUrl;

	// // 1. Grab the auth token from cookies
	// const token = request.cookies.get("refreshToken")?.value;

	// const authPages = [
	// 	"/login",
	// 	"/signup",
	// 	"/forgot-password",
	// 	"/verify-otp",
	// 	"/verify-forgot-password",
	// ];

	// // 2. Define your public routes
	// const isAuthPage = authPages.some((pageUrl) => pathname.startsWith(pageUrl));

	// // Scenario A: No token + trying to access a protected page -> Redirect to login
	// if (!isAuthPage && !token) {
	// 	const loginUrl = new URL("/login", request.url);
	// 	loginUrl.searchParams.set("callbackUrl", pathname);
	// 	return NextResponse.redirect(loginUrl);
	// }

	// // Scenario B: Has token + trying to access login/register -> Redirect to homepage
	// if (isAuthPage && token) {
	// 	return NextResponse.redirect(new URL("/", request.url));
	// }

	// Let all other requests pass through smoothly
	return NextResponse.next();
}

// Optimize proxy execution to only target your app pages (skip static assets/images)
export const config = {
	matcher: ["/((?!_next/static|_next/image|favicon.ico|api).*)"],
};
