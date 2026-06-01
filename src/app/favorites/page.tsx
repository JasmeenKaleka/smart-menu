"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

type Item = {
  id: string;
  name: string;
  description: string;
  image_url: string;
  is_popular?: boolean;
};

type Variant = {
id: string;
item_id: string;
name: string;
price: number;
};

export default function FavoritesPage() {
const [items, setItems] =
useState<Item[]>([]);

const [variants, setVariants] =
useState<Variant[]>([]);

useEffect(() => {
loadFavorites();
}, []);

async function loadFavorites() {
const favoriteIds = JSON.parse(
localStorage.getItem(
"menu-favorites"
) || "[]"
);

 
if (
  favoriteIds.length === 0
)
  return;

const { data: itemsData } =
  await supabase
    .from("items")
    .select("*")
    .in("id", favoriteIds);

const {
  data: variantsData,
} = await supabase
  .from("variants")
  .select("*");

setItems(itemsData || []);
setVariants(
  variantsData || []
);
 

}

function getStartingPrice(
itemId: string
) {
const itemVariants =
variants.filter(
(v) =>
v.item_id === itemId
);

 
if (
  itemVariants.length === 0
)
  return 0;

return Math.min(
  ...itemVariants.map((v) =>
    Number(v.price)
  )
);
 

}
function removeFavorite(
  itemId: string
) {
  const favorites = JSON.parse(
    localStorage.getItem(
      "menu-favorites"
    ) || "[]"
  );

  const updated = favorites.filter(
    (id: string) =>
      id !== itemId
  );

  localStorage.setItem(
    "menu-favorites",
    JSON.stringify(updated)
  );

  setItems((prev) =>
    prev.filter(
      (item) =>
        item.id !== itemId
    )
  );
}

return ( <div className="min-h-screen bg-gray-50">

 
  {/* HEADER */}

  <div
    className="
      sticky
      top-0
      z-50
      bg-white
      border-b
      border-gray-100
    "
  >
    <div
      className="
        max-w-4xl
        mx-auto
        px-4
        py-4
        flex
        items-center
        justify-between
      "
    >
      <Link
        href="/"
        className="
          text-sm
          font-medium
          text-gray-600
        "
      >
        ← Menu
      </Link>

      <h1
        className="
          text-xl
          font-bold
        "
      >
        Saved Items
      </h1>

      <div className="w-12" />
    </div>
  </div>

  <div
    className="
      max-w-4xl
      mx-auto
      px-4
      py-6
    "
  >
    {items.length === 0 ? (
      <div
        className="
          flex
          flex-col
          items-center
          justify-center
          py-24
          text-center
        "
      >
        <div className="text-7xl">
          🍽️
        </div>

        <h2
          className="
            mt-6
            text-2xl
            font-bold
          "
        >
          Favorites Empty
        </h2>

        <p
          className="
            mt-3
            text-gray-500
            max-w-xs
          "
        >
          Save your favorite menu
          items and they will
          appear here.
        </p>
      </div>
    ) : (
      <>
        {/* SUMMARY */}

       {/* ITEMS */}

<div className="space-y-4">
  {items.map((item) => (
    <div
      key={item.id}
      className="
        bg-white
        rounded-3xl
        p-4
        border
        shadow-sm
        flex
        items-center
        gap-4
      "
    >
      {/* IMAGE */}

      <img
        src={item.image_url}
        alt={item.name}
        className="
          w-20
          h-20
          rounded-full
          object-cover
          flex-shrink-0
          border-2
          border-gray-100
          shadow-sm
        "
      />

      {/* CONTENT */}

      <div className="flex-1">
        <div
          className="
            flex
            items-center
            justify-between
            gap-2
          "
        >
          <div>
            <h3
              className="
                text-lg
                font-bold
                text-gray-900
              "
            >
              {item.name}
            </h3>

            <p
              className="
                text-sm
                text-gray-500
                mt-1
              "
            >
              Starting from ₹
              {getStartingPrice(
                item.id
              )}
            </p>
          </div>

          {item.is_popular && (
            <span
              className="
                px-3
                py-1
                rounded-full
                bg-yellow-100
                text-yellow-700
                text-xs
                font-semibold
                whitespace-nowrap
              "
            >
              Bestseller
            </span>
          )}
        </div>

        <button
          onClick={() =>
            removeFavorite(
              item.id
            )
          }
          className="
            mt-3
            px-4
            py-2
            rounded-xl
            bg-red-50
            text-red-500
            text-sm
            font-medium
            hover:bg-red-100
            transition
          "
        >
          Remove
        </button>
      </div>
    </div>
  ))}
</div>
        {/* ORDER NOTE */}

        <div
          className="
            mt-8
            bg-white
            rounded-3xl
            p-6
            border
            shadow-sm
            text-center
          "
        >
          <h3
            className="
              text-xl
              font-bold
            "
          >
            Ready to Order?
          </h3>

          <p
            className="
              mt-2
              text-gray-500
            "
          >
            Please show this list
            to the waiter or visit
            the counter to place
            your order.
          </p>

          <div
            className="
              mt-4
              inline-flex
              items-center
              px-5
              py-3
              rounded-full
              bg-orange-50
              text-orange-600
              font-semibold
            "
          >
            Give Order To Waiter /
            Counter
          </div>
        </div>
      </>
    )}
  </div>
</div>
 

);
}
