"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "./ThemeProvider";
import { cn } from "@/lib/utils";

export default function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggle } = useTheme();

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
      className={cn(
        "inline-flex h-9 w-9 items-center justify-center rounded-lg border",
        "border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors",
        "[data-theme=dark]:border-slate-700 [data-theme=dark]:hover:bg-slate-800 [data-theme=dark]:text-slate-200",
        className
      )}
    >
      <Sun className={cn("h-5 w-5", theme === "dark" ? "hidden" : "block")} />
      <Moon className={cn("h-5 w-5", theme === "dark" ? "block" : "hidden")} />
    </button>
  );
}
