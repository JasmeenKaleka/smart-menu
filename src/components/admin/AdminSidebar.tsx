"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  {
    name: "Dashboard",
    href: "/admin/dashboard",
  },
  {
    name: "Brand Settings",
    href: "/admin/settings",
  },
  {
    name: "Categories",
    href: "/admin/categories",
  },
  {
    name: "Items",
    href: "/admin/items",
  },
  {
    name: "QR Code",
    href: "/admin/qr",
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r bg-white min-h-screen">
      <div className="p-6 border-b">
        <h2 className="font-bold text-xl">
          Demo Cafe
        </h2>
      </div>

      <nav className="p-4 space-y-2">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`block rounded-lg p-3 ${
              pathname === link.href
                ? "bg-black text-white"
                : "hover:bg-gray-100"
            }`}
          >
            {link.name}
          </Link>
        ))}
      </nav>
    </aside>
  );
}