import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertTriangle,
  Check,
  Edit2,
  Info,
  Megaphone,
  Plus,
  Tag,
  Trash2,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import type { Announcement, AnnouncementType } from "../hooks/useAnnouncements";
import type { useAnnouncements } from "../hooks/useAnnouncements";

interface Props {
  open: boolean;
  onClose: () => void;
  announcements: Announcement[];
  onAdd: ReturnType<typeof useAnnouncements>["addAnnouncement"];
  onUpdate: ReturnType<typeof useAnnouncements>["updateAnnouncement"];
  onRemove: ReturnType<typeof useAnnouncements>["removeAnnouncement"];
  onToggle: ReturnType<typeof useAnnouncements>["toggleAnnouncement"];
}

const TYPE_BADGE: Record<AnnouncementType, { label: string; color: string }> = {
  info: { label: "Info", color: "oklch(0.45 0.12 250)" },
  alert: { label: "Alerta", color: "oklch(0.45 0.16 30)" },
  promo: { label: "Promo", color: "oklch(0.48 0.16 75)" },
};

const TYPE_ICONS: Record<AnnouncementType, React.ReactNode> = {
  info: <Info size={14} />,
  alert: <AlertTriangle size={14} />,
  promo: <Tag size={14} />,
};

const EMPTY_FORM = { title: "", message: "", type: "info" as AnnouncementType };

export function AnnouncementPanel({
  open,
  onClose,
  announcements,
  onAdd,
  onUpdate,
  onRemove,
  onToggle,
}: Props) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState(EMPTY_FORM);

  const handleAdd = () => {
    if (!form.title.trim()) return;
    onAdd(form);
    setForm(EMPTY_FORM);
  };

  const startEdit = (ann: Announcement) => {
    setEditingId(ann.id);
    setEditForm({ title: ann.title, message: ann.message, type: ann.type });
  };

  const saveEdit = (id: string) => {
    onUpdate(id, editForm);
    setEditingId(null);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-start justify-end"
          style={{ background: "rgba(0,0,0,0.7)" }}
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.aside
            data-ocid="announcements.panel"
            initial={{ x: 420, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 420, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="h-full w-full max-w-md flex flex-col overflow-hidden"
            style={{
              background: "oklch(0.14 0.025 50)",
              borderLeft: "1px solid oklch(0.28 0.04 55)",
            }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-6 py-4"
              style={{ borderBottom: "1px solid oklch(0.22 0.03 55)" }}
            >
              <div className="flex items-center gap-2">
                <Megaphone size={18} style={{ color: "#c9a97a" }} />
                <h2
                  className="font-display text-lg font-semibold"
                  style={{ color: "#c9a97a" }}
                >
                  Gestión de Anuncios
                </h2>
              </div>
              <button
                type="button"
                data-ocid="announcements.close_button"
                onClick={onClose}
                className="p-1.5 rounded-lg transition-colors hover:opacity-80"
                style={{ color: "#7a5c3a" }}
                aria-label="Cerrar panel"
              >
                <X size={18} />
              </button>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
              {/* Create form */}
              <section
                className="rounded-xl p-5 flex flex-col gap-4"
                style={{
                  background: "oklch(0.18 0.03 52)",
                  border: "1px solid oklch(0.28 0.04 55)",
                }}
              >
                <h3
                  className="text-sm font-semibold uppercase tracking-widest"
                  style={{ color: "#7a5c3a" }}
                >
                  Nuevo anuncio
                </h3>

                <div className="flex flex-col gap-1">
                  <Label className="text-xs" style={{ color: "#9a7a5a" }}>
                    Título
                  </Label>
                  <Input
                    data-ocid="announcements.title.input"
                    placeholder="Ej: ¡Torneo este sábado!"
                    value={form.title}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, title: e.target.value }))
                    }
                    className="text-sm"
                    style={{
                      background: "oklch(0.12 0.02 50)",
                      borderColor: "oklch(0.30 0.04 55)",
                      color: "oklch(0.85 0.06 60)",
                    }}
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <Label className="text-xs" style={{ color: "#9a7a5a" }}>
                    Mensaje
                  </Label>
                  <Textarea
                    data-ocid="announcements.message.textarea"
                    placeholder="Descripción del anuncio (opcional)"
                    value={form.message}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, message: e.target.value }))
                    }
                    rows={2}
                    className="text-sm resize-none"
                    style={{
                      background: "oklch(0.12 0.02 50)",
                      borderColor: "oklch(0.30 0.04 55)",
                      color: "oklch(0.85 0.06 60)",
                    }}
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <Label className="text-xs" style={{ color: "#9a7a5a" }}>
                    Tipo
                  </Label>
                  <Select
                    value={form.type}
                    onValueChange={(v) =>
                      setForm((f) => ({ ...f, type: v as AnnouncementType }))
                    }
                  >
                    <SelectTrigger
                      data-ocid="announcements.type.select"
                      className="text-sm"
                      style={{
                        background: "oklch(0.12 0.02 50)",
                        borderColor: "oklch(0.30 0.04 55)",
                        color: "oklch(0.85 0.06 60)",
                      }}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent
                      style={{
                        background: "oklch(0.16 0.025 50)",
                        borderColor: "oklch(0.28 0.04 55)",
                      }}
                    >
                      <SelectItem value="info">ℹ️ Info</SelectItem>
                      <SelectItem value="alert">⚠️ Alerta</SelectItem>
                      <SelectItem value="promo">🏷️ Promoción</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  data-ocid="announcements.add_button"
                  onClick={handleAdd}
                  disabled={!form.title.trim()}
                  className="w-full font-semibold"
                  style={{
                    background: form.title.trim()
                      ? "oklch(0.55 0.12 75)"
                      : "oklch(0.25 0.04 55)",
                    color: form.title.trim()
                      ? "oklch(0.10 0.02 50)"
                      : "oklch(0.45 0.04 55)",
                    border: "none",
                  }}
                >
                  <Plus size={16} className="mr-1.5" />
                  Agregar anuncio
                </Button>
              </section>

              {/* List */}
              <section className="flex flex-col gap-3">
                <h3
                  className="text-sm font-semibold uppercase tracking-widest"
                  style={{ color: "#7a5c3a" }}
                >
                  Anuncios ({announcements.length})
                </h3>

                {announcements.length === 0 && (
                  <div
                    data-ocid="announcements.empty_state"
                    className="text-center py-10 rounded-xl"
                    style={{
                      background: "oklch(0.16 0.02 52)",
                      border: "1px dashed oklch(0.28 0.03 55)",
                      color: "oklch(0.50 0.04 55)",
                    }}
                  >
                    <Megaphone size={28} className="mx-auto mb-2 opacity-40" />
                    <p className="text-sm">No hay anuncios creados</p>
                  </div>
                )}

                <AnimatePresence initial={false}>
                  {announcements.map((ann, idx) => {
                    const badge = TYPE_BADGE[ann.type];
                    const isEditing = editingId === ann.id;
                    const pos = idx + 1;

                    return (
                      <motion.div
                        key={ann.id}
                        data-ocid={`announcements.item.${pos}`}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="rounded-xl p-4 flex flex-col gap-3"
                        style={{
                          background: "oklch(0.18 0.03 52)",
                          border: `1px solid ${
                            ann.active
                              ? "oklch(0.32 0.06 55)"
                              : "oklch(0.22 0.03 55)"
                          }`,
                          opacity: ann.active ? 1 : 0.6,
                        }}
                      >
                        {isEditing ? (
                          <div className="flex flex-col gap-2">
                            <Input
                              value={editForm.title}
                              onChange={(e) =>
                                setEditForm((f) => ({
                                  ...f,
                                  title: e.target.value,
                                }))
                              }
                              className="text-sm"
                              style={{
                                background: "oklch(0.12 0.02 50)",
                                borderColor: "oklch(0.30 0.04 55)",
                                color: "oklch(0.85 0.06 60)",
                              }}
                            />
                            <Textarea
                              value={editForm.message}
                              onChange={(e) =>
                                setEditForm((f) => ({
                                  ...f,
                                  message: e.target.value,
                                }))
                              }
                              rows={2}
                              className="text-sm resize-none"
                              style={{
                                background: "oklch(0.12 0.02 50)",
                                borderColor: "oklch(0.30 0.04 55)",
                                color: "oklch(0.85 0.06 60)",
                              }}
                            />
                            <Select
                              value={editForm.type}
                              onValueChange={(v) =>
                                setEditForm((f) => ({
                                  ...f,
                                  type: v as AnnouncementType,
                                }))
                              }
                            >
                              <SelectTrigger
                                className="text-sm"
                                style={{
                                  background: "oklch(0.12 0.02 50)",
                                  borderColor: "oklch(0.30 0.04 55)",
                                  color: "oklch(0.85 0.06 60)",
                                }}
                              >
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent
                                style={{
                                  background: "oklch(0.16 0.025 50)",
                                  borderColor: "oklch(0.28 0.04 55)",
                                }}
                              >
                                <SelectItem value="info">ℹ️ Info</SelectItem>
                                <SelectItem value="alert">⚠️ Alerta</SelectItem>
                                <SelectItem value="promo">
                                  🏷️ Promoción
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => saveEdit(ann.id)}
                                className="flex-1 text-xs"
                                style={{
                                  background: "oklch(0.48 0.12 145)",
                                  border: "none",
                                  color: "white",
                                }}
                              >
                                <Check size={13} className="mr-1" /> Guardar
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setEditingId(null)}
                                className="flex-1 text-xs"
                                style={{ color: "#7a5c3a" }}
                              >
                                Cancelar
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-center gap-2 min-w-0">
                                <span
                                  className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full shrink-0"
                                  style={{
                                    background: badge.color,
                                    color: "white",
                                  }}
                                >
                                  {TYPE_ICONS[ann.type]}
                                  {badge.label}
                                </span>
                                <span
                                  className="text-sm font-semibold truncate"
                                  style={{ color: "#c9a97a" }}
                                >
                                  {ann.title}
                                </span>
                              </div>
                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  type="button"
                                  data-ocid={`announcements.edit_button.${pos}`}
                                  onClick={() => startEdit(ann)}
                                  className="p-1.5 rounded hover:opacity-80 transition-opacity"
                                  style={{ color: "#7a5c3a" }}
                                  aria-label="Editar"
                                >
                                  <Edit2 size={13} />
                                </button>
                                <button
                                  type="button"
                                  data-ocid={`announcements.delete_button.${pos}`}
                                  onClick={() => onRemove(ann.id)}
                                  className="p-1.5 rounded hover:opacity-80 transition-opacity"
                                  style={{ color: "oklch(0.60 0.14 30)" }}
                                  aria-label="Eliminar"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </div>

                            {ann.message && (
                              <p
                                className="text-xs leading-relaxed"
                                style={{ color: "#7a5c3a" }}
                              >
                                {ann.message}
                              </p>
                            )}

                            <div className="flex items-center gap-2">
                              <Switch
                                data-ocid={`announcements.toggle.${pos}`}
                                checked={ann.active}
                                onCheckedChange={() => onToggle(ann.id)}
                                id={`toggle-${ann.id}`}
                              />
                              <Label
                                htmlFor={`toggle-${ann.id}`}
                                className="text-xs cursor-pointer"
                                style={{
                                  color: ann.active
                                    ? "oklch(0.65 0.10 145)"
                                    : "#5a4030",
                                }}
                              >
                                {ann.active ? "Activo" : "Inactivo"}
                              </Label>
                            </div>
                          </>
                        )}
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </section>
            </div>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
