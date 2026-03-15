import { AlertTriangle, Info, Tag, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import type { Announcement } from "../hooks/useAnnouncements";

interface Props {
  announcements: Announcement[];
}

const TYPE_CONFIG = {
  info: {
    icon: Info,
    bg: "oklch(0.22 0.06 250)",
    border: "oklch(0.40 0.10 250)",
    text: "oklch(0.80 0.08 250)",
    badge: "oklch(0.35 0.12 250)",
    label: "Info",
  },
  alert: {
    icon: AlertTriangle,
    bg: "oklch(0.22 0.06 30)",
    border: "oklch(0.45 0.14 30)",
    text: "oklch(0.82 0.10 30)",
    badge: "oklch(0.38 0.16 30)",
    label: "Alerta",
  },
  promo: {
    icon: Tag,
    bg: "oklch(0.22 0.06 75)",
    border: "oklch(0.50 0.14 75)",
    text: "oklch(0.85 0.12 75)",
    badge: "oklch(0.40 0.16 75)",
    label: "Promo",
  },
};

export function AnnouncementBanner({ announcements }: Props) {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const visible = announcements.filter((a) => !dismissed.has(a.id));

  if (visible.length === 0) return null;

  return (
    <div className="w-full flex flex-col gap-1 px-4 pt-2">
      <AnimatePresence initial={false}>
        {visible.map((ann) => {
          const cfg = TYPE_CONFIG[ann.type];
          const Icon = cfg.icon;
          return (
            <motion.div
              key={ann.id}
              initial={{ opacity: 0, y: -12, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -8, height: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div
                className="flex items-start gap-3 px-4 py-2.5 rounded-lg text-sm"
                style={{
                  background: cfg.bg,
                  border: `1px solid ${cfg.border}`,
                  color: cfg.text,
                }}
              >
                <Icon size={16} className="mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <span
                    className="inline-block text-xs font-bold mr-2 px-1.5 py-0.5 rounded"
                    style={{ background: cfg.badge, color: cfg.text }}
                  >
                    {cfg.label}
                  </span>
                  <span className="font-semibold">{ann.title}</span>
                  {ann.message && (
                    <span className="ml-2 opacity-80">{ann.message}</span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setDismissed((s) => new Set([...s, ann.id]))}
                  className="shrink-0 opacity-60 hover:opacity-100 transition-opacity"
                  aria-label="Cerrar"
                >
                  <X size={14} />
                </button>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
