"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Category = {
  id: string;
  name: string;
  sort_order: number;
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategory, setNewCategory] = useState("");

  const [editingId, setEditingId] = useState("");
  const [editingName, setEditingName] = useState("");

  async function loadCategories() {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("sort_order", {
        ascending: true,
      });

    if (error) {
      alert(error.message);
      return;
    }

    setCategories(data || []);
  }

  async function addCategory() {
    if (!newCategory.trim()) {
      alert("Enter category name");
      return;
    }

    const maxOrder =
  categories.length > 0
    ? Math.max(
        ...categories.map(
          (c) => c.sort_order
        )
      )
    : 0;

const nextOrder = maxOrder + 1;

    const { error } = await supabase
      .from("categories")
      .insert({
        name: newCategory,
        sort_order: nextOrder,
      });

    if (error) {
      alert(error.message);
      return;
    }

    setNewCategory("");
    loadCategories();
  }

  async function updateCategory() {
    if (!editingName.trim()) {
      alert("Enter category name");
      return;
    }

    const { error } = await supabase
      .from("categories")
      .update({
        name: editingName,
      })
      .eq("id", editingId);

    if (error) {
      alert(error.message);
      return;
    }

    setEditingId("");
    setEditingName("");

    loadCategories();
  }

  async function deleteCategory(id: string) {
    const confirmed = window.confirm(
      "Delete this category?"
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("categories")
      .delete()
      .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    loadCategories();
  }

  useEffect(() => {
    loadCategories();
  }, []);

  return (
    <div className="max-w-3xl space-y-6">
      <h1 className="text-3xl font-bold">
        Categories
      </h1>

      <div className="flex gap-3">
        <input
          className="flex-1 border p-3 rounded"
          placeholder="Category Name"
          value={newCategory}
          onChange={(e) =>
            setNewCategory(e.target.value)
          }
        />

        <button
          onClick={addCategory}
          className="
            bg-black
            text-white
            px-5
            rounded
          "
        >
          Add Category
        </button>
      </div>

      <div className="border rounded-lg overflow-hidden">
        {categories.map((category) => (
          <div
            key={category.id}
            className="
              flex
              items-center
              justify-between
              p-4
              border-b
            "
          >
            <div className="font-medium">
              {category.name}
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => {
                  setEditingId(category.id);
                  setEditingName(category.name);
                }}
                className="
                  text-blue-600
                  font-medium
                "
              >
                Edit
              </button>

              <button
                onClick={() =>
                  deleteCategory(category.id)
                }
                className="
                  text-red-600
                  font-medium
                "
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {editingId && (
        <div className="border rounded-lg p-5 space-y-4">
          <h2 className="text-xl font-semibold">
            Edit Category
          </h2>

          <input
            className="w-full border p-3 rounded"
            value={editingName}
            onChange={(e) =>
              setEditingName(e.target.value)
            }
          />

          <div className="flex gap-3">
            <button
              onClick={updateCategory}
              className="
                bg-black
                text-white
                px-5
                py-2
                rounded
              "
            >
              Save
            </button>

            <button
              onClick={() => {
                setEditingId("");
                setEditingName("");
              }}
              className="
                border
                px-5
                py-2
                rounded
              "
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}