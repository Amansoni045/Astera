"use client";

import { useState, useRef, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { LogOut, User as UserIcon, LogIn, ChevronUp, Settings as SettingsIcon, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TabType } from "@/components/settings/SettingsModal";

interface UserMenuProps {
  onOpenAuthModal: () => void;
  onOpenSettings?: (tab?: TabType) => void;
}

export function UserMenu({ onOpenAuthModal, onOpenSettings }: UserMenuProps) {
  const { data: session, status } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (status === "unauthenticated" || !session?.user) {
    return (
      <div className="relative w-full flex flex-col gap-2">
        <button
          onClick={() => onOpenSettings?.("general")}
          className={cn(
            "flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2 text-xs font-medium transition-all duration-150",
            "border border-zinc-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/60",
            "text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800/80",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500",
          )}
        >
          <div className="flex items-center gap-2">
            <SettingsIcon className="h-3.5 w-3.5 text-zinc-500" />
            <span>Settings</span>
          </div>
        </button>

        <button
          onClick={onOpenAuthModal}
          className={cn(
            "flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-xs font-medium transition-all duration-150",
            "border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900",
            "text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100",
            "hover:border-zinc-300 dark:hover:border-zinc-700 shadow-sm",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500",
          )}
        >
          <LogIn className="h-3.5 w-3.5 text-indigo-500" />
          <span>Sign in to save history</span>
        </button>
      </div>
    );
  }

  const user = session.user;
  const initial = (user.name || user.email || "U").charAt(0).toUpperCase();

  return (
    <div className="relative w-full" ref={menuRef}>
      {/* Dropup Popup Menu */}
      {isOpen && (
        <div
          className={cn(
            "absolute bottom-full left-0 right-0 mb-2 overflow-hidden rounded-xl border p-1.5 shadow-xl z-50 flex flex-col gap-0.5",
            "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100",
          )}
        >
          <div className="px-3 py-2 border-b border-zinc-100 dark:border-zinc-800/60 mb-1">
            <p className="text-xs font-semibold truncate">{user.name || "User"}</p>
            <p className="text-[11px] text-zinc-400 dark:text-zinc-500 truncate">{user.email}</p>
          </div>

          <button
            onClick={() => {
              setIsOpen(false);
              onOpenSettings?.("account");
            }}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <UserIcon className="h-3.5 w-3.5 text-zinc-400" />
            <span>Profile</span>
          </button>

          <button
            onClick={() => {
              setIsOpen(false);
              onOpenSettings?.("general");
            }}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <SettingsIcon className="h-3.5 w-3.5 text-zinc-400" />
            <span>Settings</span>
          </button>

          <a
            href="https://github.com/amansoni/Astera"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setIsOpen(false)}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <ExternalLink className="h-3.5 w-3.5 text-zinc-400" />
            <span>GitHub</span>
          </a>

          <div className="my-1 border-t border-zinc-100 dark:border-zinc-800/60" />

          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Sign out</span>
          </button>
        </div>
      )}

      {/* Main Avatar Trigger Button */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className={cn(
          "flex w-full items-center justify-between gap-2.5 rounded-xl px-2.5 py-2 text-left transition-colors duration-150",
          "border border-zinc-200/80 dark:border-zinc-800/80 bg-white/60 dark:bg-zinc-900/60",
          "hover:bg-zinc-100 dark:hover:bg-zinc-800/80",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500",
        )}
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          {user.image ? (
            <img
              src={user.image}
              alt={user.name || "User avatar"}
              className="h-7 w-7 rounded-full object-cover border border-zinc-200 dark:border-zinc-700"
            />
          ) : (
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-600 text-white font-semibold text-xs flex-shrink-0">
              {initial}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-zinc-900 dark:text-zinc-100 truncate">
              {user.name || user.email}
            </p>
            <p className="text-[10px] text-zinc-400 dark:text-zinc-500 truncate">
              Authenticated User
            </p>
          </div>
        </div>
        <ChevronUp className={cn("h-3.5 w-3.5 text-zinc-400 transition-transform duration-200", isOpen && "rotate-180")} />
      </button>
    </div>
  );
}
