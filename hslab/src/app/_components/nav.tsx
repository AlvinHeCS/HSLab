"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "🏠 Home" },
  { href: "/dates", label: "💌 Dates" },
  { href: "/wishlist", label: "⭐ Wishlist" },
];

export function Nav() {
  const pathname = usePathname();
  if (pathname === "/unlock") return null;

  return (
    <nav className="mx-auto flex max-w-md justify-center gap-1 px-4 pt-4">
      {LINKS.map(({ href, label }) => {
        const active =
          href === "/" ? pathname === "/" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold ${
              active ? "bg-white shadow-sm" : "hover:bg-white/60"
            }`}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
