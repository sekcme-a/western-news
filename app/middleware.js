import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

export const applyMiddlewareSupabaseClient = async (request) => {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          const all = request.cookies.getAll();
          return all.map(({ name, value }) => ({ name, value }));
        },
        setAll(cookiesToSet) {
          for (const cookie of cookiesToSet) {
            request.cookies.set(cookie);
            response = NextResponse.next({
              request: {
                headers: request.headers,
              },
            });
            response.cookies.set(cookie);
          }
        },
      },
    }
  );

  await supabase.auth.getUser();

  return response;
};

export async function middleware(request) {
  return await applyMiddlewareSupabaseClient(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
