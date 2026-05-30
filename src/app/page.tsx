"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

type Settings = {
  cafe_name: string;
  logo_url: string;
  primary_color: string;
  secondary_color: string;
};

type Banner = {
  id: string;
  image_url: string;
  sort_order: number;
};

type Category = {
  id: string;
  name: string;
  sort_order: number;
};

type Variant = {
  id: string;
  item_id: string;
  name: string;
  price: number;
};

type Item = {
  id: string;
  category_id: string;
  name: string;
  description: string;
  image_url: string;
  is_available: boolean;
};

export default function MenuPage() {
  const [loading, setLoading] = useState(true);

  const [settings, setSettings] =
    useState<Settings | null>(null);

  const [banners, setBanners] =
    useState<Banner[]>([]);

  const [categories, setCategories] =
    useState<Category[]>([]);

  const [items, setItems] =
    useState<Item[]>([]);

  const [variants, setVariants] =
    useState<Variant[]>([]);

  const [selectedCategory, setSelectedCategory] =
    useState("all");

  const [search, setSearch] =
    useState("");

  const [currentBanner, setCurrentBanner] =
    useState(0);

  const [selectedItem, setSelectedItem] =
    useState<Item | null>(null);

  const [favorites, setFavorites] =
    useState<string[]>([]);

  async function loadData() {
    try {
      const [
        settingsRes,
        bannersRes,
        categoriesRes,
        itemsRes,
        variantsRes,
      ] = await Promise.all([
        supabase
          .from("settings")
          .select("*")
          .limit(1),

        supabase
          .from("banners")
          .select("*")
          .order("sort_order", {
            ascending: true,
          }),

        supabase
          .from("categories")
          .select("*")
          .order("sort_order", {
            ascending: true,
          }),

        supabase
          .from("items")
          .select("*")
          .eq("is_available", true),

        supabase
          .from("variants")
          .select("*")
          .order("sort_order", {
            ascending: true,
          }),
      ]);

      if (
        settingsRes.data &&
        settingsRes.data.length > 0
      ) {
        setSettings(settingsRes.data[0]);
      }

      setBanners(
        bannersRes.data || []
      );

      setCategories(
        categoriesRes.data || []
      );

      setItems(
        itemsRes.data || []
      );

      setVariants(
        variantsRes.data || []
      );
    } catch (error) {
      console.error(error);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadData();

    const storedFavorites =
      localStorage.getItem(
        "menu-favorites"
      );

    if (storedFavorites) {
      setFavorites(
        JSON.parse(storedFavorites)
      );
    }
  }, []);

  useEffect(() => {
    if (banners.length === 0) return;

    const interval =
      setInterval(() => {
        setCurrentBanner((prev) =>
          prev === banners.length - 1
            ? 0
            : prev + 1
        );
      }, 4000);

    return () =>
      clearInterval(interval);
  }, [banners]);

  function toggleFavorite(
    itemId: string
  ) {
    let updated: string[] = [];

    if (
      favorites.includes(itemId)
    ) {
      updated = favorites.filter(
        (id) => id !== itemId
      );
    } else {
      updated = [
        ...favorites,
        itemId,
      ];
    }

    setFavorites(updated);

    localStorage.setItem(
      "menu-favorites",
      JSON.stringify(updated)
    );
  }

  function getItemVariants(
    itemId: string
  ) {
    return variants.filter(
      (variant) =>
        variant.item_id === itemId
    );
  }

  function getStartingPrice(
    itemId: string
  ) {
    const itemVariants =
      getItemVariants(itemId);

    if (
      itemVariants.length === 0
    ) {
      return 0;
    }

    const prices =
      itemVariants.map(
        (v) => Number(v.price)
      );

    return Math.min(...prices);
  }

  const filteredItems =
    useMemo(() => {
      let filtered = [...items];

      if (
        selectedCategory !== "all"
      ) {
        filtered = filtered.filter(
          (item) =>
            item.category_id ===
            selectedCategory
        );
      }

      if (search.trim()) {
        filtered = filtered.filter(
          (item) =>
            item.name
              .toLowerCase()
              .includes(
                search.toLowerCase()
              ) ||
            item.description
              .toLowerCase()
              .includes(
                search.toLowerCase()
              )
        );
      }

      return filtered;
    }, [
      items,
      selectedCategory,
      search,
    ]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading Menu...
      </div>
    );
  }

  return (
    <div
      className="min-h-screen"
      style={{
        background: "#fafafa",
      }}
    >
      {/* HEADER */}

      <div
        className="
          sticky
          top-0
          z-50
          bg-white
          border-b
        "
      >
        <div
          className="
            max-w-7xl
            mx-auto
            px-4
            py-3
            flex
            items-center
            gap-3
          "
        >
          {settings?.logo_url && (
            <img
              src={settings.logo_url}
              alt="Logo"
              className="
                w-12
                h-12
                rounded-full
                object-cover
                border
              "
            />
          )}

          <div>
            <h1
              className="
                text-xl
                font-bold
              "
            >
              {settings?.cafe_name}
            </h1>

            <p
              className="
                text-sm
                text-gray-500
              "
            >
              Digital Menu
            </p>
          </div>
        </div>
      </div>

      {/* BANNER */}
            <div
        className="
          max-w-7xl
          mx-auto
          px-4
          pt-4
        "
      >
        {banners.length > 0 && (
          <div
            className="
              overflow-hidden
              rounded-3xl
              shadow-lg
            "
          >
            <img
              src={
                banners[currentBanner]
                  ?.image_url
              }
              alt="Banner"
              className="
                w-full
                h-52
                md:h-96
                object-cover
              "
            />
          </div>
        )}
      </div>

      {/* SEARCH */}

      <div
        className="
          max-w-7xl
          mx-auto
          px-4
          mt-6
        "
      >
        <input
          type="text"
          placeholder="Search pizza, burger, coffee..."
          value={search}
          onChange={(e) =>
            setSearch(
              e.target.value
            )
          }
          className="
            w-full
            p-4
            rounded-2xl
            border
            bg-white
            outline-none
          "
        />
      </div>

      {/* CATEGORY BAR */}

      <div
        className="
          sticky
          top-[73px]
          z-40
          bg-[#fafafa]
          mt-6
        "
      >
        <div
          className="
            max-w-7xl
            mx-auto
            px-4
            py-3
            flex
            gap-3
            overflow-x-auto
          "
        >
          <button
            onClick={() =>
              setSelectedCategory(
                "all"
              )
            }
            className={`
              px-5 py-2 rounded-full whitespace-nowrap
              ${
                selectedCategory ===
                "all"
                  ? "text-white"
                  : "bg-white border"
              }
            `}
            style={{
              background:
                selectedCategory ===
                "all"
                  ? settings?.primary_color
                  : undefined,
            }}
          >
            All
          </button>

          {categories.map(
            (category) => (
              <button
                key={category.id}
                onClick={() =>
                  setSelectedCategory(
                    category.id
                  )
                }
                className={`
                  px-5 py-2 rounded-full whitespace-nowrap
                  ${
                    selectedCategory ===
                    category.id
                      ? "text-white"
                      : "bg-white border"
                  }
                `}
                style={{
                  background:
                    selectedCategory ===
                    category.id
                      ? settings?.primary_color
                      : undefined,
                }}
              >
                {category.name}
              </button>
            )
          )}
        </div>
      </div>

      {/* ITEMS GRID */}

      <div
        className="
          max-w-7xl
          mx-auto
          px-4
          pb-32
        "
      >
        <div
          className="
            grid
            grid-cols-2
            md:grid-cols-3
            lg:grid-cols-4
            gap-4
          "
        >
          {filteredItems.map((item) => {

  const variantCount =
    getItemVariants(item.id).length;

  return (
              <div
                key={item.id}
                onClick={() =>
                  setSelectedItem(
                    item
                  )
                }
                className="
                  bg-white
                  rounded-3xl
                  overflow-hidden
                  shadow-sm
                  cursor-pointer
                  transition
                  hover:shadow-xl
                "
              >
                <img
                  src={
                    item.image_url ||
                    "https://images.unsplash.com/photo-1546069901-ba9599a7e63c"
                  }
                  alt={item.name}
                  className="
                    w-full
                    aspect-square
                    object-cover
                  "
                />

                <div className="p-3">
                  <h3
                    className="
                      font-semibold
                      text-sm
                      md:text-base
                    "
                  >
                    {item.name}
                  </h3>

                  <p
                    className="
                      text-xs
                      text-gray-500
                      mt-1
                      line-clamp-2
                    "
                  >
                    {item.description}
                    {variantCount > 0 && (
  <div
    className="
      inline-block
      mt-2
      px-2
      py-1
      text-xs
      rounded-full
      bg-gray-100
      text-gray-700
    "
  >
    {variantCount} Sizes Available
  </div>
)}
                  </p>

                  <div
                    className="
                      mt-3
                      flex
                      items-center
                      justify-between
                    "
                  >
                    <span
                      className="
                        font-bold
                      "
                    >
                      ₹
                      {getStartingPrice(
                        item.id
                      )}
                    </span>
                    <div className="mt-3">



  <div
    className="
      text-sm
      text-blue-600
      font-medium
      mt-1
    "
  >
    View Options →
  </div>

</div>

                    <button
                      onClick={(
                        e
                      ) => {
                        e.stopPropagation();
                        toggleFavorite(
                          item.id
                        );
                      }}
                      className="
                        text-xl
                      "
                    >
                      {favorites.includes(
                        item.id
                      )
                        ? "❤️"
                        : "🤍"}
                    </button>
                  </div>
                </div>
              </div>
            )
})}
        </div>
      </div>

      {/* FAVORITES BUTTON */}

      <button
        className="
          fixed
          bottom-6
          right-6
          z-50
          text-white
          rounded-full
          px-5
          py-3
          shadow-xl
        "
        style={{
          background:
            settings?.primary_color,
        }}
      >
        ❤️ {favorites.length}
      </button>

      {/* ITEM MODAL */}

      {selectedItem && (
        <div
          className="
            fixed
            inset-0
            bg-black/50
            z-[100]
            flex
            items-end
            md:items-center
            justify-center
          "
          onClick={() =>
            setSelectedItem(
              null
            )
          }
        >
          <div
            onClick={(e) =>
              e.stopPropagation()
            }
            className="
              bg-white
              w-full
              md:max-w-lg
              rounded-t-3xl
              md:rounded-3xl
              p-6
            "
          >
            
            <img
              src={
                selectedItem.image_url ||
                "https://images.unsplash.com/photo-1546069901-ba9599a7e63c"
              }
              alt={
                selectedItem.name
              }
              className="
                w-full
                h-60
                object-cover
                rounded-2xl
              "
            />
            <button
  onClick={() => setSelectedItem(null)}
  className="
    absolute
    top-4
    right-4
    z-50
    w-10
    h-10
    rounded-full
    bg-white
    shadow-lg
    text-xl
    font-bold
    flex
    items-center
    justify-center
  "
>
  ✕
</button>

            <h2
              className="
                text-2xl
                font-bold
                mt-4
              "
            >
              {selectedItem.name}
            </h2>

            <p
              className="
                text-gray-600
                mt-2
              "
            >
              {
                selectedItem.description
              }
              
            </p>
            

            <div
              className="
                mt-5
                space-y-2
              "
            >
              {getItemVariants(
                selectedItem.id
              ).map(
                
                (variant) => (
                  
                  <div
                    key={
                      variant.id
                    }
                    className="
                      flex
                      justify-between
                      border-b
                      pb-2
                    "
                  >
                    <span>
                      {
                        variant.name
                      }
                    </span>

                    <span
                      className="
                        font-semibold
                      "
                    >
                      ₹
                      {variant.price}
                    </span>
                  </div>
                )
              )}
            </div>

            <button
              className="
                mt-6
                w-full
                py-3
                rounded-2xl
                text-white
                font-semibold
              "
              style={{
                background:
                  settings?.primary_color,
              }}
              onClick={() =>
                toggleFavorite(
                  selectedItem.id
                )
              }
            >
              {favorites.includes(
                selectedItem.id
              )
                ? "Remove Favorite"
                : "Add To Favorites"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}