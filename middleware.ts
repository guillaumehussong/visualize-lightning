import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  // Skip api routes, internals, and files (og-image.png, audio, ...)
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
