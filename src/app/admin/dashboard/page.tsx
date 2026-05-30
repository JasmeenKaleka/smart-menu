"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function DashboardPage() {
  const [categoryCount, setCategoryCount] = useState(0);
  const [itemCount, setItemCount] = useState(0);
  const [variantCount, setVariantCount] = useState(0);
  const [bannerCount, setBannerCount] = useState(0);

  const [cafeName, setCafeName] = useState("");
  const [logoUrl, setLogoUrl] = useState("");

  const [primaryColor, setPrimaryColor] =
    useState("#000000");

  const [secondaryColor, setSecondaryColor] =
    useState("#000000");

  const [recentItems, setRecentItems] =
    useState<any[]>([]);

  async function loadDashboard() {
    const [
      categoriesRes,
      itemsRes,
      variantsRes,
      bannersRes,
      settingsRes,
      recentItemsRes,
    ] = await Promise.all([
      supabase
        .from("categories")
        .select("*", {
          count: "exact",
          head: true,
        }),

      supabase
        .from("items")
        .select("*", {
          count: "exact",
          head: true,
        }),

      supabase
        .from("variants")
        .select("*", {
          count: "exact",
          head: true,
        }),

      supabase
        .from("banners")
        .select("*", {
          count: "exact",
          head: true,
        }),

      supabase
        .from("settings")
        .select("*")
        .limit(1),

      supabase
        .from("items")
        .select("*")
        .order("created_at", {
          ascending: false,
        })
        .limit(5),
    ]);

    setCategoryCount(
      categoriesRes.count || 0
    );

    setItemCount(
      itemsRes.count || 0
    );

    setVariantCount(
      variantsRes.count || 0
    );

    setBannerCount(
      bannersRes.count || 0
    );

    if (
      settingsRes.data &&
      settingsRes.data.length > 0
    ) {
      const settings =
        settingsRes.data[0];

      setCafeName(
        settings.cafe_name || ""
      );

      setLogoUrl(
        settings.logo_url || ""
      );

      setPrimaryColor(
        settings.primary_color ||
          "#000000"
      );

      setSecondaryColor(
        settings.secondary_color ||
          "#000000"
      );
    }

    setRecentItems(
      recentItemsRes.data || []
    );
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  const healthChecks = [
    {
      label: "Categories",
      status:
        categoryCount > 0,
    },
    {
      label: "Items",
      status:
        itemCount > 0,
    },
    {
      label: "Variants",
      status:
        variantCount > 0,
    },
    {
      label: "Logo",
      status:
        !!logoUrl,
    },
    {
      label: "Banner",
      status:
        bannerCount > 0,
    },
  ];

  return (
    <div className="space-y-8">

      <div>
        <h1 className="text-3xl font-bold">
          Dashboard
        </h1>

        <p className="text-gray-500">
          Overview of your digital menu
        </p>
      </div>

      <div className="grid md:grid-cols-4 gap-4">

        <div className="border rounded-xl p-5">
          <p className="text-gray-500">
            Categories
          </p>

          <h2 className="text-3xl font-bold mt-2">
            {categoryCount}
          </h2>
        </div>

        <div className="border rounded-xl p-5">
          <p className="text-gray-500">
            Items
          </p>

          <h2 className="text-3xl font-bold mt-2">
            {itemCount}
          </h2>
        </div>

        <div className="border rounded-xl p-5">
          <p className="text-gray-500">
            Variants
          </p>

          <h2 className="text-3xl font-bold mt-2">
            {variantCount}
          </h2>
        </div>

        <div className="border rounded-xl p-5">
          <p className="text-gray-500">
            Banners
          </p>

          <h2 className="text-3xl font-bold mt-2">
            {bannerCount}
          </h2>
        </div>

      </div>

      <div className="grid lg:grid-cols-2 gap-6">

        <div className="border rounded-xl p-6">

          <h2 className="text-xl font-bold mb-5">
            Brand Summary
          </h2>

          {logoUrl ? (
            <img
              src={logoUrl}
              alt="Logo"
              className="
                w-24
                h-24
                object-cover
                rounded-xl
                border
                mb-4
              "
            />
          ) : (
            <div className="mb-4">
              No Logo Uploaded
            </div>
          )}

          <p>
            <strong>Cafe:</strong>{" "}
            {cafeName}
          </p>

          <div className="flex gap-4 mt-4">

            <div>
              <p className="text-sm">
                Primary
              </p>

              <div
                className="
                  w-10
                  h-10
                  rounded
                  border
                "
                style={{
                  background:
                    primaryColor,
                }}
              />
            </div>

            <div>
              <p className="text-sm">
                Secondary
              </p>

              <div
                className="
                  w-10
                  h-10
                  rounded
                  border
                "
                style={{
                  background:
                    secondaryColor,
                }}
              />
            </div>

          </div>

        </div>

        <div className="border rounded-xl p-6">

          <h2 className="text-xl font-bold mb-5">
            Menu Health
          </h2>

          <div className="space-y-3">

            {healthChecks.map(
              (item) => (
                <div
                  key={
                    item.label
                  }
                  className="
                    flex
                    justify-between
                  "
                >
                  <span>
                    {item.label}
                  </span>

                  <span>
                    {item.status
                      ? "✅"
                      : "❌"}
                  </span>
                </div>
              )
            )}

          </div>

        </div>

      </div>

      <div className="border rounded-xl p-6">

        <h2 className="text-xl font-bold mb-5">
          Recent Items
        </h2>

        <div className="space-y-3">

          {recentItems.map(
            (item) => (
              <div
                key={item.id}
                className="
                  border
                  rounded-lg
                  p-3
                "
              >
                {item.name}
              </div>
            )
          )}

          {recentItems.length === 0 && (
            <p>
              No items added yet
            </p>
          )}

        </div>

      </div>

    </div>
  );
}