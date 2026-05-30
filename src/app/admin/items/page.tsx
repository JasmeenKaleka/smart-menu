"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Category = {
  id: string;
  name: string;
};

type Variant = {
  name: string;
  price: string;
};

type Item = {
  id: string;
  name: string;
  description: string;
  image_url: string;
  is_available: boolean;
  category_id: string;
  categories?: {
    name: string;
  };
};

export default function ItemsPage() {
  const [categories, setCategories] =
    useState<Category[]>([]);

  const [items, setItems] =
    useState<Item[]>([]);

  const [editingId, setEditingId] =
    useState("");

  const [name, setName] = useState("");
  const [description, setDescription] =
    useState("");

  const [categoryId, setCategoryId] =
    useState("");

  const [imageUrl, setImageUrl] =
    useState("");

  const [isAvailable, setIsAvailable] =
    useState(true);

  const [variants, setVariants] =
    useState<Variant[]>([
      {
        name: "",
        price: "",
      },
    ]);

  async function loadCategories() {
    const { data, error } =
      await supabase
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

    if (data && data.length > 0) {
      setCategoryId(data[0].id);
    }
  }

  async function loadItems() {
    const { data, error } =
      await supabase
        .from("items")
        .select(`
          *,
          categories (
            name
          )
        `)
        .order("created_at", {
          ascending: false,
        });

    if (error) {
      alert(error.message);
      return;
    }

    setItems(data || []);
  }

  function addVariant() {
    setVariants([
      ...variants,
      {
        name: "",
        price: "",
      },
    ]);
  }

  function updateVariant(
    index: number,
    field: "name" | "price",
    value: string
  ) {
    const updated = [...variants];

    updated[index] = {
      ...updated[index],
      [field]: value,
    };

    setVariants(updated);
  }

  function removeVariant(
    index: number
  ) {
    if (variants.length === 1) {
      alert(
        "At least one variant is required"
      );
      return;
    }

    const updated =
      variants.filter(
        (_, i) => i !== index
      );

    setVariants(updated);
  }

  async function uploadImage(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file =
      event.target.files?.[0];

    if (!file) return;

    const formData =
      new FormData();

    formData.append(
      "file",
      file
    );

    const response =
      await fetch(
        "/api/upload/item",
        {
          method: "POST",
          body: formData,
        }
      );

    const result =
      await response.json();

    if (!response.ok) {
      alert(result.error);
      return;
    }

    setImageUrl(result.url);
  }

  function resetForm() {
    setEditingId("");

    setName("");
    setDescription("");

    setImageUrl("");

    setIsAvailable(true);

    setVariants([
      {
        name: "",
        price: "",
      },
    ]);
  }

  async function saveItem() {
    if (!name.trim()) {
      alert(
        "Enter item name"
      );
      return;
    }

    if (!imageUrl) {
      alert(
        "Upload image"
      );
      return;
    }

    const itemPayload = {
      category_id:
        categoryId,

      name,

      description,

      image_url:
        imageUrl,

      is_available:
        isAvailable,
    };

    let itemId =
      editingId;

    if (editingId) {
      const { error } =
        await supabase
          .from("items")
          .update(
            itemPayload
          )
          .eq(
            "id",
            editingId
          );

      if (error) {
        alert(
          error.message
        );
        return;
      }

      await supabase
        .from("variants")
        .delete()
        .eq(
          "item_id",
          editingId
        );
    } else {
      const {
        data,
        error,
      } =
        await supabase
          .from("items")
          .insert(
            itemPayload
          )
          .select()
          .single();

      if (error) {
        alert(
          error.message
        );
        return;
      }

      itemId =
        data.id;
    }
        const variantPayload =
      variants.map(
        (
          variant,
          index
        ) => ({
          item_id:
            itemId,

          name:
            variant.name,

          price:
            Number(
              variant.price
            ),

          sort_order:
            index + 1,
        })
      );

    const {
      error:
        variantError,
    } =
      await supabase
        .from(
          "variants"
        )
        .insert(
          variantPayload
        );

    if (
      variantError
    ) {
      alert(
        variantError.message
      );
      return;
    }

    resetForm();

    loadItems();

    alert(
      editingId
        ? "Item Updated"
        : "Item Created"
    );
  }

  async function editItem(
    item: Item
  ) {
    setEditingId(
      item.id
    );

    setName(
      item.name
    );

    setDescription(
      item.description ||
        ""
    );

    setCategoryId(
      item.category_id
    );

    setImageUrl(
      item.image_url
    );

    setIsAvailable(
      item.is_available
    );

    const {
      data,
      error,
    } =
      await supabase
        .from(
          "variants"
        )
        .select("*")
        .eq(
          "item_id",
          item.id
        )
        .order(
          "sort_order"
        );

    if (
      error
    ) {
      alert(
        error.message
      );
      return;
    }

    setVariants(
      data.map(
        (
          variant
        ) => ({
          name:
            variant.name,
          price:
            String(
              variant.price
            ),
        })
      )
    );

    window.scrollTo({
      top: 0,
      behavior:
        "smooth",
    });
  }

  async function deleteItem(
    id: string
  ) {
    const confirmed =
      window.confirm(
        "Delete this item?"
      );

    if (
      !confirmed
    )
      return;

    await supabase
      .from(
        "variants"
      )
      .delete()
      .eq(
        "item_id",
        id
      );

    const {
      error,
    } =
      await supabase
        .from(
          "items"
        )
        .delete()
        .eq(
          "id",
          id
        );

    if (
      error
    ) {
      alert(
        error.message
      );
      return;
    }

    loadItems();
  }

  useEffect(() => {
    loadCategories();
    loadItems();
  }, []);

  return (
    <div className="grid lg:grid-cols-3 gap-6">

      <div className="lg:col-span-2">

        <h1 className="text-3xl font-bold mb-6">
          Items Management
        </h1>

        <div className="border rounded-lg p-6 space-y-6">

          <div>
            <label className="block mb-2">
              Item Name
            </label>

            <input
              className="w-full border p-3 rounded"
              value={name}
              onChange={(e) =>
                setName(
                  e.target.value
                )
              }
              placeholder="Paneer Pizza"
            />
          </div>

          <div>
            <label className="block mb-2">
              Description
            </label>

            <textarea
              rows={4}
              className="w-full border p-3 rounded"
              value={
                description
              }
              onChange={(e) =>
                setDescription(
                  e.target.value
                )
              }
            />
          </div>

          <div>
            <label className="block mb-2">
              Category
            </label>

            <select
              className="w-full border p-3 rounded"
              value={
                categoryId
              }
              onChange={(e) =>
                setCategoryId(
                  e.target.value
                )
              }
            >
              {categories.map(
                (
                  category
                ) => (
                  <option
                    key={
                      category.id
                    }
                    value={
                      category.id
                    }
                  >
                    {
                      category.name
                    }
                  </option>
                )
              )}
            </select>
          </div>

          <div>
  <label className="block mb-3 font-medium">
    Item Image
  </label>

  <label
    htmlFor="item-image"
    className="
      border-2
      border-dashed
      rounded-xl
      p-8
      flex
      flex-col
      items-center
      justify-center
      cursor-pointer
      hover:bg-gray-50
      transition
    "
  >
    <div className="text-4xl mb-2">
      📷
    </div>

    <p className="font-medium">
      Click to Upload Image
    </p>

    <p className="text-sm text-gray-500">
      JPG • PNG • WEBP
    </p>
  </label>

  <input
    id="item-image"
    type="file"
    accept=".jpg,.jpeg,.png,.webp"
    onChange={uploadImage}
    className="hidden"
  />

  {imageUrl && (
    <div className="mt-4">
      <img
        src={imageUrl}
        alt="Item"
        className="
          w-48
          h-48
          object-cover
          rounded-xl
          border
        "
      />
    </div>
  )}
</div>

          <div>
            <label className="flex gap-3 items-center">
              <input
                type="checkbox"
                checked={
                  isAvailable
                }
                onChange={(
                  e
                ) =>
                  setIsAvailable(
                    e.target
                      .checked
                  )
                }
              />

              Available
            </label>
          </div>

          <div className="space-y-4">

            <div className="flex items-center justify-between">

              <h2 className="text-xl font-semibold">
                Variants
              </h2>

              <button
                type="button"
                onClick={
                  addVariant
                }
                className="bg-black text-white px-4 py-2 rounded"
              >
                Add Variant
              </button>

            </div>

            {variants.map(
              (
                variant,
                index
              ) => (
                <div
                  key={
                    index
                  }
                  className="grid md:grid-cols-3 gap-3"
                >

                  <input
                    className="border p-3 rounded"
                    placeholder="Regular"
                    value={
                      variant.name
                    }
                    onChange={(
                      e
                    ) =>
                      updateVariant(
                        index,
                        "name",
                        e
                          .target
                          .value
                      )
                    }
                  />

                  <input
                    type="number"
                    className="border p-3 rounded"
                    placeholder="199"
                    value={
                      variant.price
                    }
                    onChange={(
                      e
                    ) =>
                      updateVariant(
                        index,
                        "price",
                        e
                          .target
                          .value
                      )
                    }
                  />

                  <button
                    type="button"
                    onClick={() =>
                      removeVariant(
                        index
                      )
                    }
                    className="text-red-600 font-medium"
                  >
                    Delete Variant
                  </button>

                </div>
              )
            )}

          </div>

          <button
            onClick={
              saveItem
            }
            className="bg-black text-white px-6 py-3 rounded"
          >
            {editingId
              ? "Update Item"
              : "Create Item"}
          </button>

        </div>

      </div>

      <div className="border rounded-lg p-4 h-fit">

        <h2 className="text-xl font-bold mb-4">
          Existing Items
        </h2>

        <div className="space-y-3">

          {items.map(
            (
              item
            ) => (
              <div
                key={
                  item.id
                }
                className="border rounded-lg p-3"
              >

                <img
                  src={
                    item.image_url
                  }
                  alt={
                    item.name
                  }
                  className="w-full h-32 object-cover rounded mb-3"
                />

                <p className="font-semibold">
                  {
                    item.name
                  }
                </p>

                <p className="text-sm text-gray-500">
                  {
                    item
                      .categories
                      ?.name
                  }
                </p>

                <p className="text-sm mt-1">
                  {item.is_available
                    ? "🟢 Available"
                    : "🔴 Hidden"}
                </p>

                <div className="flex gap-4 mt-3">

                  <button
                    onClick={() =>
                      editItem(
                        item
                      )
                    }
                    className="text-blue-600"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() =>
                      deleteItem(
                        item.id
                      )
                    }
                    className="text-red-600"
                  >
                    Delete
                  </button>

                </div>

              </div>
            )
          )}

        </div>

      </div>

    </div>
  );
}