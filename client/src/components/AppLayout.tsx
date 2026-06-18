import { useState } from "react";
import type { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  LayoutDashboard,
  FileText,
  Mic2,
  BookOpen,
  CheckSquare,
  Briefcase,
  LogOut,
  Menu,
  X,
} from "lucide-react";

export function AppLayout({
  title,
  children,
}: {
  title?: string;
  children: ReactNode;
}) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Resume Enhancer", path: "/resume-enhancer", icon: FileText },
    { name: "Mock Interview", path: "/mock-interview", icon: Mic2 },
    { name: "Prep Sessions", path: "/prep-sessions", icon: BookOpen },
    { name: "Tasks", path: "/tasks", icon: CheckSquare },
  ];

  const renderNavLinks = () => (
    <>
      <div className="space-y-1">
        {navLinks.map((link) => {
          const isActive = location.pathname === link.path;
          return (
            <Link
              key={link.name}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className={`focus-ring flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-brand-soft text-brand"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <link.icon className="h-5 w-5 shrink-0" />
              {link.name}
            </Link>
          );
        })}

        {/* Applications (soon) */}
        <div className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium text-slate-400 cursor-not-allowed">
          <div className="flex items-center gap-3">
            <Briefcase className="h-5 w-5 shrink-0" />
            Applications
          </div>
          <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Soon
          </span>
        </div>
      </div>
    </>
  );

  const renderUserFooter = () => (
    <div className="border-t border-slate-200 p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand text-sm font-bold text-white uppercase">
          {user?.name?.[0] ?? user?.email?.[0] ?? "U"}
        </div>
        <div className="flex-1 min-w-0">
          <p className="truncate text-sm font-medium text-slate-900">
            {user?.name ?? "Workspace"}
          </p>
          <p className="truncate text-xs text-slate-500">
            {user?.email ?? "No email"}
          </p>
        </div>
        <button
          onClick={logout}
          className="focus-ring rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-600"
          title="Log out"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50/70 pb-20 md:pb-0 md:pl-56">
      {/* Desktop Sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-56 flex-col border-r border-slate-200 bg-white md:flex">
        <div className="flex h-16 shrink-0 items-center px-6 border-b border-slate-200/80">
          <Link
            to="/dashboard"
            className="flex items-center gap-3 outline-none ring-brand/30 focus-visible:ring-2 rounded-lg"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-soft text-sm font-bold text-brand">
              CF
            </div>
            <span className="font-semibold text-slate-900">CareerFlow</span>
          </Link>
        </div>
        <div className="flex-1 overflow-y-auto p-4">{renderNavLinks()}</div>
        {renderUserFooter()}
      </aside>

      {/* Mobile Header */}
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200/80 bg-white/80 px-4 backdrop-blur md:hidden">
        <Link
          to="/dashboard"
          className="flex items-center gap-3 outline-none ring-brand/30 focus-visible:ring-2 rounded-lg"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-soft text-sm font-bold text-brand">
            CF
          </div>
          <span className="font-semibold text-slate-900">CareerFlow</span>
        </Link>
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="focus-ring -mr-2 rounded-lg p-2 text-slate-600 hover:bg-slate-100"
          aria-label="Open navigation"
        >
          <Menu className="h-6 w-6" />
        </button>
      </header>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative flex w-full max-w-xs flex-1 flex-col bg-white">
            <div className="flex h-16 shrink-0 items-center justify-between px-4 border-b border-slate-200">
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 outline-none ring-brand/30 focus-visible:ring-2 rounded-lg"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-soft text-sm font-bold text-brand">
                  CF
                </div>
                <span className="font-semibold text-slate-900">CareerFlow</span>
              </Link>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="focus-ring -mr-2 rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                aria-label="Close navigation"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">{renderNavLinks()}</div>
            {renderUserFooter()}
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        {title && (
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              {title}
            </h1>
          </div>
        )}
        {children}
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 px-2 py-2 shadow-[0_-8px_24px_rgb(15_23_42_/_0.08)] backdrop-blur md:hidden">
        <div className="mx-auto grid max-w-md grid-cols-5 gap-1">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.name}
                to={link.path}
                className={`focus-ring flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl px-1 text-[11px] font-semibold ${
                  isActive
                    ? "bg-brand-soft text-brand"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                }`}
              >
                <link.icon className="h-4 w-4" />
                <span className="w-full truncate text-center">{link.name.split(" ")[0]}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
