"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function SettingsPage() {
  const [id, setId] = useState("");
  const [cafeName, setCafeName] = useState("");
  const [logoUrl, setLogoUrl] = useState("");

  const [primaryColor, setPrimaryColor] = useState("#0f172a");
  const [secondaryColor, setSecondaryColor] = useState("#f59e0b");

  const [banners, setBanners] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadSettings() {
    const { data, error } = await supabase
      .from("settings")
      .select("*")
      .limit(1);

    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }

    if (!data || data.length === 0) {
      alert("No settings record found.");
      setLoading(false);
      return;
    }

    const setting = data[0];

    setId(setting.id);
    setCafeName(setting.cafe_name || "");
    setLogoUrl(setting.logo_url || "");
    setPrimaryColor(setting.primary_color || "#0f172a");
    setSecondaryColor(setting.secondary_color || "#f59e0b");

    const { data: bannerData } = await supabase
      .from("banners")
      .select("*")
      .order("sort_order", {
        ascending: true,
      });

    if (bannerData) {
      setBanners(
        bannerData.map((banner) => banner.image_url)
      );
    }

    setLoading(false);
  }

  async function uploadLogo(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(
      "/api/upload/logo",
      {
        method: "POST",
        body: formData,
      }
    );

    const result = await response.json();

    if (!response.ok) {
      alert(result.error);
      return;
    }

    setLogoUrl(result.url);
  }

  async function uploadBanner(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) return;

    if (banners.length >= 4) {
      alert("Maximum 4 banners allowed");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(
      "/api/upload/banner",
      {
        method: "POST",
        body: formData,
      }
    );

    const result = await response.json();

    if (!response.ok) {
      alert(result.error);
      return;
    }

    const nextOrder = banners.length + 1;

    const { error } = await supabase
      .from("banners")
      .insert({
        image_url: result.url,
        sort_order: nextOrder,
      });

    if (error) {
      alert(error.message);
      return;
    }

    setBanners((prev) => [
      ...prev,
      result.url,
    ]);
  }

  async function saveSettings() {
    const { error } = await supabase
      .from("settings")
      .update({
        cafe_name: cafeName,
        logo_url: logoUrl,
        primary_color: primaryColor,
        secondary_color: secondaryColor,
      })
      .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Settings Saved");
  }

  useEffect(() => {
    loadSettings();
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        Loading Settings...
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-8">
      <h1 className="text-3xl font-bold">
        Brand Settings
      </h1>

      <div>
        <label className="block mb-2">
          Cafe Name
        </label>

        <input
          className="w-full border p-3 rounded"
          value={cafeName}
          onChange={(e) =>
            setCafeName(e.target.value)
          }
        />
      </div>

      <div>
        <label className="block mb-2">
          Logo
        </label>

        <div className="space-y-3">
  <label
    htmlFor="logo-upload"
    className="
      inline-block
      bg-black
      text-white
      px-4
      py-2
      rounded
      cursor-pointer
      hover:opacity-90
    "
  >
    Upload Logo
  </label>

  <input
    id="logo-upload"
    type="file"
    accept=".jpg,.jpeg,.png,.webp"
    onChange={uploadLogo}
    className="hidden"
  />
</div>

        {logoUrl && (
          <img
            src={logoUrl}
            alt="Logo"
            className="h-24 mt-4 border rounded p-2 bg-white"
          />
        )}
      </div>

      <div>
        <label className="block mb-2">
          Banners (Maximum 4)
        </label>

        <div className="space-y-3">
  <label
    htmlFor="banner-upload"
    className="
      inline-block
      bg-black
      text-white
      px-4
      py-2
      rounded
      cursor-pointer
      hover:opacity-90
    "
  >
    Upload Banner
  </label>

  <input
    id="banner-upload"
    type="file"
    accept=".jpg,.jpeg,.png,.webp"
    onChange={uploadBanner}
    className="hidden"
  />
</div>

        <div className="grid grid-cols-2 gap-4 mt-4">
          {banners.map((banner, index) => (
            <img
              key={index}
              src={banner}
              alt={`Banner ${index + 1}`}
              className="rounded border"
            />
          ))}
        </div>
      </div>

      <div>
        <label className="block mb-2">
          Primary Color
        </label>

        <input
          type="color"
          value={primaryColor}
          onChange={(e) =>
            setPrimaryColor(e.target.value)
          }
        />
      </div>

      <div>
        <label className="block mb-2">
          Secondary Color
        </label>

        <input
          type="color"
          value={secondaryColor}
          onChange={(e) =>
            setSecondaryColor(e.target.value)
          }
        />
      </div>

      <button
        onClick={saveSettings}
        className="bg-black text-white px-6 py-3 rounded"
      >
        Save Settings
      </button>
    </div>
  );
}