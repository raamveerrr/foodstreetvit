import { createFileRoute } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { MerchantShell } from "@/components/merchant/MerchantShell";
import {
  Button,
  Card,
  ConfirmDialog,
  Field,
  MerchantEmpty,
  Modal,
  SectionHeading,
  Select,
  TextArea,
  TextInput,
} from "@/components/merchant/MerchantUI";
import { formatMoney, type MenuItem } from "@/lib/merchant-data";
import { useMerchant } from "@/lib/merchant-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/shop/menu")({
  head: () => ({
    meta: [
      { title: "Menu Management — DigitalFoodStreet Shop" },
      {
        name: "description",
        content:
          "Add, edit, price and organise the food items and categories on your DigitalFoodStreet shop menu.",
      },
      { property: "og:title", content: "Menu Management — DigitalFoodStreet Shop" },
      {
        property: "og:description",
        content: "Add, edit and organise the items and categories on your shop menu.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: MenuPage,
});

const emptyItem = (category: string): MenuItem => ({
  id: "",
  name: "",
  description: "",
  price: 0,
  category,
  image: "",
  available: true,
  veg: true,
  popular: false,
  ingredients: "",
  prepTime: "10–15 minutes",
});

function MenuPage() {
  const {
    activeShop,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
    addCategory,
    renameCategory,
    deleteCategory,
  } = useMerchant();

  const categories = activeShop?.categories ?? [];
  const menu = activeShop?.menu ?? [];

  const [filter, setFilter] = useState("All");
  const [editing, setEditing] = useState<MenuItem | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [deleting, setDeleting] = useState<MenuItem | null>(null);
  const [busy, setBusy] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const [newCat, setNewCat] = useState("");
  const [catToDelete, setCatToDelete] = useState<string | null>(null);

  const visible = useMemo(
    () => (filter === "All" ? menu : menu.filter((m) => m.category === filter)),
    [menu, filter],
  );

  const [uploading, setUploading] = useState(false);

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const asset = await uploadImage(
        file,
        cloudinaryFolders.menuItem(activeShop?.id ?? "pending", editing?.id || "new"),
      );
      setEditing((prev) =>
        prev ? { ...prev, image: asset.url, imagePublicId: asset.publicId } : prev,
      );
      toast.success("Photo uploaded");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const openNew = () => {
    setIsNew(true);
    setEditing(emptyItem(categories[0] ?? "Snacks"));
  };

  const save = () => {
    if (!editing) return;
    if (!editing.name.trim()) {
      toast.error("Food name is required");
      return;
    }
    setBusy(true);
    window.setTimeout(() => {
      if (isNew) {
        addMenuItem({ ...editing, id: `m_${Date.now().toString(36)}` });
        toast.success(`${editing.name} added`);
      } else {
        updateMenuItem(editing.id, editing);
        toast.success(`${editing.name} updated`);
      }
      setBusy(false);
      setEditing(null);
    }, 350);
  };

  const confirmDelete = () => {
    if (!deleting) return;
    setBusy(true);
    window.setTimeout(() => {
      deleteMenuItem(deleting.id);
      toast.success(`${deleting.name} deleted`);
      setBusy(false);
      setDeleting(null);
    }, 300);
  };

  const patch = <K extends keyof MenuItem>(k: K, v: MenuItem[K]) =>
    setEditing((e) => (e ? { ...e, [k]: v } : e));

  return (
    <MerchantShell
      title="Menu"
      subtitle={`${menu.length} items · ${categories.length} categories`}
      actions={
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setCatOpen(true)}>
            Categories
          </Button>
          <Button onClick={openNew}>
            <Plus size={16} /> Add food
          </Button>
        </div>
      }
    >
      <div className="no-scrollbar -mx-1 mb-4 flex gap-2 overflow-x-auto px-1 pb-1">
        {["All", ...categories].map((c) => (
          <button
            key={c}
            onClick={() => setFilter(c)}
            className={cn(
              "min-h-[40px] shrink-0 rounded-full px-4 text-[13px] font-semibold transition-colors",
              filter === c ? "bg-foreground text-background" : "bg-secondary text-muted-foreground",
            )}
          >
            {c}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <MerchantEmpty
          title="Your menu is empty."
          description="Add your first item so students can start ordering."
          actionLabel="Add your first item"
          onAction={openNew}
        />
      ) : (
        <div className="grid gap-3 lg:grid-cols-2">
          <AnimatePresence initial={false}>
            {visible.map((item, i) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.2, delay: i * 0.02 }}
              >
                <Card className="flex gap-3">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-20 w-20 shrink-0 rounded-xl object-cover"
                    />
                  ) : (
                    <div className="grid h-20 w-20 shrink-0 place-items-center rounded-xl bg-secondary text-xs text-muted-foreground">
                      No image
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">{item.name}</p>
                        <p className="line-clamp-2 text-xs text-muted-foreground">
                          {item.description}
                        </p>
                      </div>
                      <p className="shrink-0 text-sm font-bold">{formatMoney(item.price)}</p>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-secondary px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">
                        {item.category}
                      </span>
                      <button
                        onClick={() => {
                          updateMenuItem(item.id, { available: !item.available });
                          toast(`${item.name} ${item.available ? "unavailable" : "available"}`);
                        }}
                        className={cn(
                          "rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide transition-colors",
                          item.available
                            ? "bg-success-soft text-success"
                            : "bg-secondary text-muted-foreground",
                        )}
                      >
                        {item.available ? "Available" : "Unavailable"}
                      </button>
                      <div className="ml-auto flex gap-1">
                        <button
                          aria-label={`Edit ${item.name}`}
                          onClick={() => {
                            setIsNew(false);
                            setEditing(item);
                          }}
                          className="grid h-9 w-9 place-items-center rounded-lg border border-border text-muted-foreground hover:text-foreground"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          aria-label={`Delete ${item.name}`}
                          onClick={() => setDeleting(item)}
                          className="grid h-9 w-9 place-items-center rounded-lg border border-border text-destructive"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <Modal
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        title={isNew ? "Add food" : "Edit food"}
        footer={
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button className="flex-1" disabled={busy} onClick={save}>
              {busy ? (isNew ? "Adding…" : "Saving…") : isNew ? "Add item" : "Save changes"}
            </Button>
          </div>
        }
      >
        {editing && (
          <div className="space-y-4">
            <Field label="Food name">
              <TextInput value={editing.name} onChange={(e) => patch("name", e.target.value)} />
            </Field>
            <Field label="Description">
              <TextArea
                value={editing.description}
                onChange={(e) => patch("description", e.target.value)}
              />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Price (₹)">
                <TextInput
                  type="number"
                  min={0}
                  value={editing.price}
                  onChange={(e) => patch("price", Number(e.target.value))}
                />
              </Field>
              <Field label="Category">
                <Select
                  value={editing.category}
                  onChange={(e) => patch("category", e.target.value)}
                >
                  {(categories.length ? categories : ["Snacks"]).map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </Select>
              </Field>
            </div>
            <Field
              label="Item photo"
              hint="Uploaded to Cloudinary and delivered through their CDN. JPG or PNG, under 8 MB."
            >
              <div className="flex items-center gap-3">
                <div className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-xl bg-secondary text-[11px] text-muted-foreground">
                  {editing.image ? (
                    <img
                      src={editing.image}
                      alt={editing.name || "Menu item"}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    "No image"
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <input
                    id="menu-item-photo"
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      e.target.value = "";
                      if (file) void handleUpload(file);
                    }}
                  />
                  <label
                    htmlFor="menu-item-photo"
                    className={cn(
                      "inline-flex min-h-[44px] cursor-pointer items-center rounded-xl border border-border px-4 text-sm font-medium",
                      uploading && "pointer-events-none opacity-60",
                    )}
                  >
                    {uploading ? "Uploading…" : editing.image ? "Replace photo" : "Upload photo"}
                  </label>
                  {editing.image ? (
                    <button
                      type="button"
                      onClick={() => {
                        patch("image", "");
                        patch("imagePublicId", null);
                      }}
                      className="ml-2 text-sm font-medium text-muted-foreground underline"
                    >
                      Remove
                    </button>
                  ) : null}
                </div>
              </div>
            </Field>
            <Field label="Ingredients (optional)">
              <TextInput
                value={editing.ingredients ?? ""}
                onChange={(e) => patch("ingredients", e.target.value)}
              />
            </Field>
            <Field label="Preparation time (optional)">
              <TextInput
                value={editing.prepTime ?? ""}
                onChange={(e) => patch("prepTime", e.target.value)}
              />
            </Field>
            <div className="space-y-2">
              {[
                { key: "available" as const, label: "Available to order" },
                { key: "veg" as const, label: "Vegetarian" },
                { key: "popular" as const, label: "Popular item" },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => patch(key, !editing[key])}
                  className="flex w-full items-center justify-between rounded-xl border border-border px-3.5 py-3 text-sm font-medium"
                >
                  {label}
                  <span
                    className={cn(
                      "relative h-6 w-11 rounded-full transition-colors",
                      editing[key] ? "bg-primary" : "bg-secondary",
                    )}
                  >
                    <motion.span
                      layout
                      transition={{ type: "spring", stiffness: 500, damping: 34 }}
                      className={cn(
                        "absolute top-0.5 h-5 w-5 rounded-full bg-surface shadow-card",
                        editing[key] ? "right-0.5" : "left-0.5",
                      )}
                    />
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={Boolean(deleting)}
        title={`Delete "${deleting?.name ?? ""}"?`}
        description="This item will be removed from your menu."
        busy={busy}
        onCancel={() => setDeleting(null)}
        onConfirm={confirmDelete}
      />

      <Modal open={catOpen} onClose={() => setCatOpen(false)} title="Menu categories">
        <div className="space-y-4">
          <SectionHeading
            title="Categories"
            description="Deleting a category moves its items to Uncategorised — nothing is removed."
          />
          <div className="space-y-2">
            {categories.map((c) => (
              <div key={c} className="flex items-center gap-2">
                <TextInput
                  defaultValue={c}
                  aria-label={`Rename ${c}`}
                  onBlur={(e) => {
                    const v = e.target.value.trim();
                    if (v && v !== c) {
                      renameCategory(c, v);
                      toast.success(`Category renamed to ${v}`);
                    }
                  }}
                  className="mt-0"
                />
                <Button variant="outline" onClick={() => setCatToDelete(c)}>
                  <Trash2 size={15} />
                </Button>
              </div>
            ))}
            {categories.length === 0 && (
              <p className="text-sm text-muted-foreground">No categories yet.</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <TextInput
              value={newCat}
              placeholder="New category"
              onChange={(e) => setNewCat(e.target.value)}
              className="mt-0"
            />
            <Button
              onClick={() => {
                if (!newCat.trim()) return;
                addCategory(newCat.trim());
                toast.success(`${newCat.trim()} added`);
                setNewCat("");
              }}
            >
              Add
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={Boolean(catToDelete)}
        title={`Delete category "${catToDelete ?? ""}"?`}
        description="Items in this category will move to Uncategorised, not be deleted."
        confirmLabel="Delete category"
        onCancel={() => setCatToDelete(null)}
        onConfirm={() => {
          if (catToDelete) {
            deleteCategory(catToDelete);
            toast.success("Category deleted");
            if (filter === catToDelete) setFilter("All");
          }
          setCatToDelete(null);
        }}
      />
    </MerchantShell>
  );
}
