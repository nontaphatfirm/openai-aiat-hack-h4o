"use client";

import { Building2, Compass, Heart, MessageSquare, Sparkles } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { label: "Passport", href: "/passport", icon: Heart },
  { label: "Healing", href: "/healing", icon: Sparkles },
  { label: "Journey", href: "/journey", icon: Compass },
  { label: "Providers", href: "/providers", icon: Building2 },
  { label: "Q&A", href: "/ask", icon: MessageSquare },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="shrink-0 border-t border-slate-200 bg-white/95 backdrop-blur-md">
      <div className="flex">
        {tabs.map(({ label, href, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-1 flex-col items-center gap-0.5 py-2.5 transition-all ${
                isActive ? "text-teal-700" : "text-slate-400 hover:text-slate-600"
              }`}
            >
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-xl transition-all ${
                  isActive ? "bg-teal-50" : ""
                }`}
              >
                <Icon
                  className={`h-5 w-5 transition-all ${isActive ? "stroke-[2.5]" : "stroke-[1.5]"}`}
                />
              </div>
              <span
                className={`text-[10px] font-bold tracking-wide ${
                  isActive ? "text-teal-700" : "text-slate-400"
                }`}
              >
                {label}
              </span>
              {isActive && (
                <div className="h-0.5 w-5 rounded-full bg-teal-500" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
