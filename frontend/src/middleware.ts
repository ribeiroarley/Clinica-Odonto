import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("odonto_session_token")?.value;
  const role = request.cookies.get("odonto_user_role")?.value;

  const isLoginPage = pathname === "/login";
  const isProtectedPath =
    pathname === "/" ||
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/agenda") ||
    pathname.startsWith("/pacientes") ||
    pathname.startsWith("/odontograma") ||
    pathname.startsWith("/financeiro");

  // 1. Bloqueio para usuarios nao autenticados
  if (isProtectedPath && !token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 2. Redirecionamento de usuario ja autenticado na pagina de login
  if (isLoginPage && token) {
    if (role === "RECEPCAO") {
      return NextResponse.redirect(new URL("/agenda", request.url));
    }
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // 3. Regra RBAC e LGPD: RECEPCAO nao acessa prontuarios clinicos e odontograma
  if (pathname.startsWith("/odontograma") && role === "RECEPCAO") {
    return NextResponse.redirect(new URL("/agenda", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Aplica o middleware em todas as rotas exceto arquivos estaticos e imagens
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
