"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Great_Vibes } from "next/font/google";
import { useRouter } from "next/navigation";

const greatVibes = Great_Vibes({
  subsets: ["latin"],
  weight: "400",
});


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
  is_popular?: boolean;
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

const [showTopButton, setShowTopButton] =
  useState(false);


const router = useRouter();  

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
  const handleScroll = () => {
    setShowTopButton(
      window.scrollY > 500
    );
  };

  window.addEventListener(
    "scroll",
    handleScroll
  );

  return () =>
    window.removeEventListener(
      "scroll",
      handleScroll
    );
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

function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
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
return ( <div className="min-h-screen flex items-center justify-center text-lg font-semibold">
Loading Menu... </div>
);
}

return ( <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">


{/* HEADER */}

<div
  className="
    sticky
    top-0
    z-50
    bg-white/90
    backdrop-blur-md
    border-b
    border-gray-100
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
      gap-4
    "
  >
    {settings?.logo_url && (
      <img
        src={settings.logo_url}
        alt="Logo"
        className="
          w-14
          h-14
          rounded-full
          object-cover
          shadow-lg
        "
      />
    )}

    <div>
      <h1
        className="
          text-2xl
          font-bold
          text-gray-900
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
        Fresh • Delicious • Made Daily
      </p>
    </div>

    {/* FAVORITES */}

    <div className="ml-auto">
      <button
  onClick={() =>
    router.push("/favorites")
  }
  className="
    relative
    w-12
    h-12
    rounded-full
    bg-white
    shadow-lg
    flex
    items-center
    justify-center
    text-xl
  "
>
    ❤️

        {favorites.length > 0 && (
          <span
            className="
              absolute
              -top-1
              -right-1
              min-w-[20px]
              h-5
              px-1
              rounded-full
              bg-red-500
              text-white
              text-[10px]
              flex
              items-center
              justify-center
              font-bold
            "
          >
            {favorites.length}
          </span>
        )}
      </button>
    </div>
  </div>
</div>

  {/* HERO BANNER */}

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
          relative
          overflow-hidden
          rounded-[32px]
          shadow-2xl
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
            h-60
            md:h-[420px]
            object-cover
          "
        />

        <div
          className="
            absolute
            inset-0
            bg-gradient-to-r
            from-black/50
            via-black/10
            to-transparent
          "
        />

        <div
          className="
            absolute
            bottom-6
            left-6
            text-white
          "
        >
          <h2
            className="
              text-3xl
              md:text-5xl
              font-bold
            "
          >
            Today's Specials
          </h2>

          <p className="mt-2">
            Explore our most loved dishes
          </p>
        </div>
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
      placeholder="Search food, drinks, desserts..."
      value={search}
      onChange={(e) =>
        setSearch(
          e.target.value
        )
      }
      className="
        w-full
        h-14
        px-5
        rounded-2xl
        bg-white
        shadow-lg
        border-0
        outline-none
      "
    />
  </div>

  {/* CATEGORY BAR */}

  <div
    className="
      sticky
      top-[82px]
      z-40
      mt-5
    "
  >
    <div
      className="
        max-w-7xl
        mx-auto
        px-4
        flex
        gap-3
        overflow-x-auto
        pb-2
      "
    >
      <button
        onClick={() =>
          setSelectedCategory(
            "all"
          )
        }
        className={`
          px-5 py-3 rounded-full whitespace-nowrap font-medium
          ${
            selectedCategory === "all"
              ? "text-white shadow-lg"
              : "bg-white border"
          }
        `}
        style={{
          background:
            selectedCategory === "all"
              ? settings?.primary_color
              : undefined,
        }}
      >
        All Items
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
              px-5 py-3 rounded-full whitespace-nowrap font-medium
              ${
                selectedCategory ===
                category.id
                  ? "text-white shadow-lg"
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
    mt-6
  "
>
  
    {categories.map((category) => {
const categoryItems = filteredItems.filter(
(item) => item.category_id === category.id
);

if (categoryItems.length === 0) return null;

return ( <div
   key={category.id}
   className="mb-12"
 >
{/* CATEGORY HEADING */}

 
  <div className="mb-6">
    <h2
  className={`
    ${greatVibes.className}
    text-5xl
    md:text-6xl
    text-gray-900
  `}
>
  {category.name}
</h2>

    <div
      className="
        mt-2
        h-1
        w-20
        rounded-full
      "
      style={{
        background:
          settings?.primary_color,
      }}
    />
  </div>

  {/* CATEGORY ITEMS */}

  <div
    className="
      grid
      grid-cols-2
      md:grid-cols-3
      lg:grid-cols-4
      gap-5
    "
  >
    {categoryItems.map((item) => {
      const variantCount =
        getItemVariants(item.id).length;

      const startingPrice =
        getStartingPrice(item.id);

      return (
        <div
          key={item.id}
          onClick={() =>
            setSelectedItem(item)
          }
          className="
            group
            bg-white
            rounded-[28px]
            overflow-hidden
            shadow-md
            hover:shadow-2xl
            transition-all
            duration-500
            cursor-pointer
            hover:-translate-y-2
          "
        >
          {/* IMAGE */}

          <div className="relative">
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
                group-hover:scale-110
                transition-transform
                duration-700
              "
            />

            <div
              className="
                absolute
                top-3
                left-3
                bg-white
                px-3
                py-1.5
                rounded-full
                shadow-lg
                text-sm
                font-bold
              "
            >
              ₹{startingPrice}
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleFavorite(item.id);
              }}
              className="
                absolute
                top-3
                right-3
                w-11
                h-11
                rounded-full
                bg-white/80
                backdrop-blur-md
                shadow-lg
                flex
                items-center
                justify-center
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

          {/* CONTENT */}

          <div className="p-4">
            <h3
              className="
                text-lg
                font-bold
                text-gray-900
                line-clamp-1
              "
            >
              {item.name}
            </h3>

            {item.is_popular && (
              <div
                className="
                  mt-2
                  inline-flex
                  items-center
                  px-2
                  py-1
                  rounded-full
                  bg-yellow-100
                  text-yellow-700
                  text-xs
                  font-semibold
                "
              >
                ⭐ Bestseller
              </div>
            )}

            {variantCount > 0 && (
              <div
                className="
                  mt-2
                  inline-flex
                  items-center
                  px-3
                  py-1.5
                  rounded-full
                  bg-orange-100
                  text-orange-700
                  text-xs
                  font-semibold
                "
              >
                {variantCount} Sizes Available
              </div>
            )}

            <div
              className="
                mt-6
                flex
                justify-center
              "
            >
              <button
                className="
                  w-48
                  py-3
                  rounded-full
                  font-bold
                  text-white
                  text-sm
                  tracking-wide
                  uppercase
                  bg-gradient-to-r
                  from-amber-400
                  via-orange-500
                  to-orange-600
                  shadow-[0_8px_20px_rgba(249,115,22,0.35)]
                  hover:scale-[1.03]
                  hover:shadow-[0_12px_28px_rgba(249,115,22,0.45)]
                  transition-all
                  duration-300
                "
              >
                View Details
              </button>
            </div>
          </div>
        </div>
      );
    })}
  </div>
</div>
 
);
})}
{selectedItem && (

  <div
    className="
      fixed
      inset-0
      bg-black/60
      backdrop-blur-sm
      z-[100]
      flex
      items-end
      md:items-center
      justify-center
      p-0
      md:p-6
    "
    onClick={() =>
      setSelectedItem(null)
    }
  >
    <div
      onClick={(e) =>
        e.stopPropagation()
      }
      className="
        bg-white
        w-full
        md:max-w-2xl
        max-h-[95vh]
        overflow-y-auto
        rounded-t-[32px]
        md:rounded-[32px]
        shadow-2xl
      "
    >
      <div className="relative">

 
    <img
      src={
        selectedItem.image_url ||
        "https://images.unsplash.com/photo-1546069901-ba9599a7e63c"
      }
      alt={selectedItem.name}
      className="
        w-full
        h-72
        md:h-96
        object-cover
      "
    />

    <div
      className="
        absolute
        inset-0
        bg-gradient-to-t
        from-black/70
        via-black/20
        to-transparent
      "
    />

    <button
      onClick={() =>
        setSelectedItem(null)
      }
      className="
        absolute
        top-4
        right-4
        w-12
        h-12
        rounded-full
        bg-white
        shadow-xl
        text-xl
        font-bold
      "
    >
      ✕
    </button>

    <div
      className="
        absolute
        bottom-5
        left-5
        text-white
      "
    >
      <h2
        className="
          text-3xl
          md:text-4xl
          font-bold
        "
      >
        {selectedItem.name}
      </h2>

      {selectedItem.is_popular && (
        <div
          className="
            mt-2
            inline-flex
            items-center
            px-3
            py-1
            rounded-full
            bg-yellow-400
            text-yellow-900
            text-xs
            font-bold
          "
        >
          ⭐ Bestseller
        </div>
      )}
    </div>
  </div>
</div>
  <div className="p-6">

    <p
      className="
        text-gray-600
        leading-relaxed
      "
    >
      {selectedItem.description}
    </p>

    <div
      className="
        mt-6
        p-4
        rounded-2xl
        bg-orange-50
      "
    >
      <p
        className="
          text-xs
          uppercase
          text-orange-500
        "
      >
        Starting From
      </p>

      <p
        className="
          text-3xl
          font-bold
          text-orange-600
        "
      >
        ₹{getStartingPrice(selectedItem.id)}
      </p>
    </div>

    <h3
      className="
        mt-8
        mb-4
        text-xl
        font-bold
      "
    >
      Available Sizes
    </h3>

    <div className="space-y-3">
      {getItemVariants(
        selectedItem.id
      ).map((variant) => (
        <div
          key={variant.id}
          className="
            flex
            justify-between
            items-center
            p-4
            rounded-2xl
            border
            hover:shadow-md
            transition
          "
        >
          <div>
            <p className="font-semibold">
              {variant.name}
            </p>

            <p
              className="
                text-xs
                text-gray-500
              "
            >
              Available
            </p>
          </div>

          <p
            className="
              text-xl
              font-bold
            "
          >
            ₹{variant.price}
          </p>
        </div>
      ))}
    </div>

    <button
      className="
        mt-8
        w-full
        py-4
        rounded-full
        text-white
        font-bold
        bg-gradient-to-r
        from-amber-400
        via-orange-500
        to-orange-600
        shadow-[0_8px_20px_rgba(249,115,22,0.35)]
      "
      onClick={() =>
        toggleFavorite(
          selectedItem.id
        )
      }
    >
      {favorites.includes(
        selectedItem.id
      )
        ? "❤️ Remove Favorite"
        : "❤️ Add To Favorites"}
    </button>
  </div>
</div>
 

  
)}
</div>
{showTopButton && (
  <button
    onClick={scrollToTop}
    className="
      fixed
      bottom-6
      right-6
      z-50
      w-14
      h-14
      rounded-full
      text-white
      shadow-2xl
      flex
      items-center
      justify-center
      text-2xl
      transition-all
      hover:scale-110
    "
    style={{
      background:
        settings?.primary_color,
    }}
  >
    ↑
  </button>
)}
<footer
  className="
    mt-20
    py-16
    bg-black
    text-white
  "
>
  <div
    className="
      max-w-7xl
      mx-auto
      px-4
      text-center
    "
  >
    <h3
      className="
        text-4xl
        font-bold
      "
    >
      {settings?.cafe_name}
    </h3>

    <p
      className="
        mt-3
        text-gray-300
      "
    >
      Fresh Food • Great Taste • Memorable Moments
    </p>

    <div
      className="
        mt-8
        flex
        justify-center
        gap-8
        flex-wrap
      "
    >
      <span>📍 Patiala</span>
      <span>📞 +91 98765 43210</span>
      <span>📧 hello@cafe.com</span>
    </div>

    <div
      className="
        mt-10
        text-sm
        text-gray-500
      "
    >
      Designed with ❤️ for food lovers
    </div>
  </div>
</footer>
</div>
);
}