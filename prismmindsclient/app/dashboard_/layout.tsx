"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bars3Icon,
  XMarkIcon,
  Cog6ToothIcon,
  UserCircleIcon,
  HomeIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "@/lib/auth-context";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const navLinks = [
    { href: "/dashboard", label: "Dashboard", icon: HomeIcon },
    { href: "/dashboard/userprofileview", label: "Profile", icon: UserCircleIcon },
    { href: "/dashboard/settings", label: "Settings", icon: Cog6ToothIcon },
  ];

  return (
    <div className="h-screen flex overflow-hidden bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 text-slate-900 dark:text-slate-100">
      {/* Sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-full w-64 flex-col bg-white/70 dark:bg-slate-800/70 backdrop-blur-lg border-r border-border shadow-sm">
        <div className="p-6 text-2xl font-bold tracking-tight">PrismMinds</div>
        <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
          {navLinks.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              <Icon className="w-5 h-5" />
              <span>{label}</span>
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-border">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700"
          >
            <ArrowRightOnRectangleIcon className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.3 }}
              className="fixed inset-y-0 left-0 z-40 w-64 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-r border-border flex flex-col shadow-lg"
            >
              <div className="p-5 flex justify-between items-center border-b border-border">
                <div className="text-lg font-semibold">PrismMinds</div>
                <button onClick={() => setSidebarOpen(false)}>
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
              <nav className="flex-1 px-4 py-3 space-y-2">
                {navLinks.map(({ href, label, icon: Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setSidebarOpen(false)}
                    className="flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                  >
                    <Icon className="w-5 h-5" />
                    {label}
                  </Link>
                ))}
              </nav>
              <div className="p-4 border-t border-border">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700"
                >
                  <ArrowRightOnRectangleIcon className="w-5 h-5" />
                  Logout
                </button>
              </div>
            </motion.div>

            {/* Dimmed background overlay */}
            <motion.div
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-30"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
            />
          </>
        )}
      </AnimatePresence>

      {/* Main content area */}
      <div className="flex-1 flex flex-col h-full lg:ml-64">
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 bg-white/70 dark:bg-slate-800/70 backdrop-blur-lg border-b border-border px-4 py-3 flex items-center justify-between lg:hidden">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700">
              <Bars3Icon className="w-6 h-6" />
            </button>
            <div className="text-lg font-semibold">PrismMinds</div>
          </div>
          <button onClick={handleLogout}>
            <ArrowRightOnRectangleIcon className="w-6 h-6" />
          </button>
        </header>

        {/* Scrollable dashboard page */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
