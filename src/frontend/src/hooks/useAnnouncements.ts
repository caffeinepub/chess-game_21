import { useCallback, useState } from "react";

export type AnnouncementType = "info" | "alert" | "promo";

export interface Announcement {
  id: string;
  title: string;
  message: string;
  type: AnnouncementType;
  active: boolean;
  createdAt: number;
}

const STORAGE_KEY = "chess_announcements";

function load(): Announcement[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function save(items: Announcement[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function useAnnouncements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>(load);

  const mutate = useCallback(
    (updater: (prev: Announcement[]) => Announcement[]) => {
      setAnnouncements((prev) => {
        const next = updater(prev);
        save(next);
        return next;
      });
    },
    [],
  );

  const addAnnouncement = useCallback(
    (data: Omit<Announcement, "id" | "createdAt" | "active">) => {
      mutate((prev) => [
        ...prev,
        {
          ...data,
          id: crypto.randomUUID(),
          active: true,
          createdAt: Date.now(),
        },
      ]);
    },
    [mutate],
  );

  const updateAnnouncement = useCallback(
    (id: string, data: Partial<Omit<Announcement, "id" | "createdAt">>) => {
      mutate((prev) => prev.map((a) => (a.id === id ? { ...a, ...data } : a)));
    },
    [mutate],
  );

  const removeAnnouncement = useCallback(
    (id: string) => {
      mutate((prev) => prev.filter((a) => a.id !== id));
    },
    [mutate],
  );

  const toggleAnnouncement = useCallback(
    (id: string) => {
      mutate((prev) =>
        prev.map((a) => (a.id === id ? { ...a, active: !a.active } : a)),
      );
    },
    [mutate],
  );

  const activeAnnouncements = announcements.filter((a) => a.active);

  return {
    announcements,
    activeAnnouncements,
    addAnnouncement,
    updateAnnouncement,
    removeAnnouncement,
    toggleAnnouncement,
  };
}
