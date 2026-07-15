import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  X, Plus, Edit2, Trash2, Tag, Check, Info,
  Briefcase, Home, ShoppingCart, Zap, Coins, Utensils, Coffee, TrendingUp,
  Car, HeartPulse, GraduationCap, Gift
} from "lucide-react";
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from "../api/queries";
import { useToast } from "./Toast";

interface CategoryManagementProps {
  isOpen: boolean;
  onClose: () => void;
}

const schema = z.object({
  name: z.string().min(1, "Category name is required"),
  color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Valid hex color required"),
  icon: z.string().min(1, "Icon is required"),
});

type FormValues = z.infer<typeof schema>;

const ICON_OPTIONS = [
  { name: "Briefcase", icon: Briefcase },
  { name: "Home", icon: Home },
  { name: "ShoppingCart", icon: ShoppingCart },
  { name: "Zap", icon: Zap },
  { name: "Coins", icon: Coins },
  { name: "Utensils", icon: Utensils },
  { name: "Coffee", icon: Coffee },
  { name: "TrendingUp", icon: TrendingUp },
  { name: "Car", icon: Car },
  { name: "HeartPulse", icon: HeartPulse },
  { name: "GraduationCap", icon: GraduationCap },
  { name: "Gift", icon: Gift },
];

const PRESET_COLORS = [
  "#10b981", "#ef4444", "#f59e0b", "#3b82f6", "#8b5cf6", "#ec4899", 
  "#f97316", "#06b6d4", "#a855f7", "#14b8a6", "#64748b", "#059669"
];

export const CategoryManagement: React.FC<CategoryManagementProps> = ({ isOpen, onClose }) => {
  const { data: categories = [], isLoading } = useCategories();
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const deleteMutation = useDeleteCategory();
  const { showToast } = useToast();

  const [editingCategory, setEditingCategory] = useState<any | null>(null);
  const [selectedIcon, setSelectedIcon] = useState("Tag");
  const [selectedColor, setSelectedColor] = useState("#3b82f6");

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  if (!isOpen) return null;

  const handleOpenCreate = () => {
    setEditingCategory(null);
    setSelectedIcon("Tag");
    setSelectedColor("#3b82f6");
    reset({ name: "", color: "#3b82f6", icon: "Tag" });
  };

  const handleOpenEdit = (cat: any) => {
    setEditingCategory(cat);
    setSelectedIcon(cat.icon);
    setSelectedColor(cat.color);
    reset({ name: cat.name, color: cat.color, icon: cat.icon });
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete category "${name}"?`)) {
      deleteMutation.mutate(id, {
        onSuccess: () => showToast(`Deleted category "${name}"`, "success"),
        onError: () => showToast("Failed to delete category.", "error"),
      });
    }
  };

  const onSubmit = (values: FormValues) => {
    if (editingCategory) {
      updateMutation.mutate(
        { id: editingCategory.id, dto: values },
        {
          onSuccess: () => {
            showToast(`Category "${values.name}" updated!`, "success");
            setEditingCategory(null);
            reset({ name: "", color: "#3b82f6", icon: "Tag" });
          },
          onError: () => showToast("Failed to update category.", "error"),
        }
      );
    } else {
      createMutation.mutate(values, {
        onSuccess: () => {
          showToast(`Category "${values.name}" created!`, "success");
          reset({ name: "", color: "#3b82f6", icon: "Tag" });
        },
        onError: () => showToast("Failed to create category.", "error"),
      });
    }
  };

  const selectColorPreset = (color: string) => {
    setSelectedColor(color);
    setValue("color", color);
  };

  const selectIconPreset = (iconName: string) => {
    setSelectedIcon(iconName);
    setValue("icon", iconName);
  };

  const renderIcon = (name: string, color: string) => {
    const opt = ICON_OPTIONS.find(o => o.name === name);
    const IconComponent = opt ? opt.icon : Tag;
    return <IconComponent className="w-4 h-4" style={{ color }} />;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[85vh]">
        {/* Left pane: Form */}
        <div className="w-full md:w-1/2 p-6 border-b md:border-b-0 md:border-r border-slate-800 flex flex-col justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2 mb-4">
              <Tag className="w-4 h-4 text-indigo-400" />
              {editingCategory ? "Edit Category" : "Add Custom Category"}
            </h2>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Category Name</label>
                <input
                  type="text"
                  placeholder="e.g., Subscriptions, Pet Care"
                  {...register("name")}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                {errors.name && <p className="text-xs text-rose-400 mt-1">{errors.name.message}</p>}
              </div>

              {/* Color Preset */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2">Color Accent</label>
                <div className="grid grid-cols-6 gap-2">
                  {PRESET_COLORS.map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => selectColorPreset(color)}
                      className="w-8 h-8 rounded-full border border-slate-900 flex items-center justify-center transition-transform hover:scale-110 active:scale-95"
                      style={{ backgroundColor: color }}
                    >
                      {selectedColor === color && <Check className="w-4 h-4 text-slate-950 stroke-[3]" />}
                    </button>
                  ))}
                </div>
                <input type="hidden" {...register("color")} value={selectedColor} />
              </div>

              {/* Icon Picker */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2">Icon Symbol</label>
                <div className="grid grid-cols-4 gap-2">
                  {ICON_OPTIONS.map(opt => {
                    const Icon = opt.icon;
                    const isSelected = selectedIcon === opt.name;
                    return (
                      <button
                        key={opt.name}
                        type="button"
                        onClick={() => selectIconPreset(opt.name)}
                        className={`p-2.5 rounded-xl border flex items-center justify-center transition-all ${
                          isSelected 
                            ? "bg-slate-950 border-indigo-500 text-indigo-400" 
                            : "bg-slate-950/40 border-slate-900 hover:border-slate-800 text-slate-500 hover:text-slate-300"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </button>
                    );
                  })}
                </div>
                <input type="hidden" {...register("icon")} value={selectedIcon} />
              </div>

              {/* Submit */}
              <div className="flex items-center gap-2 pt-4">
                {editingCategory && (
                  <button
                    type="button"
                    onClick={handleOpenCreate}
                    className="flex-1 py-2 rounded-xl text-xs font-semibold border border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
                  >
                    Cancel Edit
                  </button>
                )}
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors shadow-lg hover:shadow-indigo-600/10"
                >
                  {editingCategory ? "Apply Changes" : "Save Category"}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right pane: List of existing categories */}
        <div className="w-full md:w-1/2 p-6 flex flex-col justify-between overflow-y-auto">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-200">Existing Categories</h3>
              <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-slate-100 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {isLoading ? (
              <div className="space-y-2 animate-pulse">
                {[1, 2, 3].map(n => <div key={n} className="h-10 bg-slate-950/20 rounded-xl"></div>)}
              </div>
            ) : (
              <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
                {categories.map((cat) => (
                  <div key={cat.id} className="group flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-900 hover:border-slate-800 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                        {renderIcon(cat.icon, cat.color)}
                      </div>
                      <span className="text-sm text-slate-300 font-medium">{cat.name}</span>
                    </div>

                    <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleOpenEdit(cat)}
                        className="p-1.5 rounded hover:bg-slate-900 text-slate-400 hover:text-slate-200 transition-colors"
                        title="Edit category"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(cat.id, cat.name)}
                        className="p-1.5 rounded hover:bg-slate-900 text-slate-400 hover:text-rose-400 transition-colors"
                        title="Delete category"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-900 mt-4 text-[10px] text-slate-500 leading-relaxed flex gap-2">
            <Info className="w-4 h-4 text-indigo-400 shrink-0" />
            <span>Deleting custom categories will clean them up, but existing transactions will remain labeled with that category.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
