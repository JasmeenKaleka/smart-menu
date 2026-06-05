"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function SettingsPage() {
  const [id, setId] = useState("");
  const [cafeName, setCafeName] = useState("");
  const [logoUrl, setLogoUrl] = useState("");

  const [primaryColor, setPrimaryColor] = useState("#0f172a");
  const [secondaryColor, setSecondaryColor] = useState("#f59e0b");
  const [backgroundColor, setBackgroundColor] =
  useState("#fafafa");
  

const [backgroundImage, setBackgroundImage] =
  useState("");

const [cardColor, setCardColor] =
  useState("#ffffff");

const [cardTextColor, setCardTextColor] =
  useState("#111827");

const [buttonGradientFrom, setButtonGradientFrom] =
  useState("#fbbf24");

const [buttonGradientTo, setButtonGradientTo] =
  useState("#ea580c");

const [headerColor, setHeaderColor] =
  useState("#ffffff");

const [footerColor, setFooterColor] =
  useState("#111827");

const [location, setLocation] =
  useState("");

const [phone, setPhone] =
  useState("");

const [email, setEmail] =
  useState("");  

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
    setBackgroundColor(
  setting.background_color || "#fafafa"
);

setBackgroundImage(
  setting.background_image || ""
);

setCardColor(
  setting.card_color || "#ffffff"
);

setCardTextColor(
  setting.card_text_color || "#111827"
);

setButtonGradientFrom(
  setting.button_gradient_from || "#fbbf24"
);

setButtonGradientTo(
  setting.button_gradient_to || "#ea580c"
);

setHeaderColor(
  setting.header_color || "#ffffff"
);

setFooterColor(
  setting.footer_color || "#111827"
);

setLocation(
  setting.location || ""
);

setPhone(
  setting.phone || ""
);

setEmail(
  setting.email || ""
);

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

    const { count } = await supabase
  .from("banners")
  .select("*", {
    count: "exact",
    head: true,
  });

const nextOrder =
  (count || 0) + 1;

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
  async function uploadBackground(
  event: React.ChangeEvent<HTMLInputElement>
) {
  const file = event.target.files?.[0];

  if (!file) return;

  const formData = new FormData();

  formData.append("file", file);

  const response = await fetch(
    "/api/upload/background",
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

  setBackgroundImage(
    result.url
  );
}

async function deleteBanner(
  bannerUrl: string
) {
  const { error } =
    await supabase
      .from("banners")
      .delete()
      .eq(
        "image_url",
        bannerUrl
      );

  if (error) {
    alert(error.message);
    return;
  }

  await loadSettings();
}

  async function saveSettings() {
    const { error } = await supabase
      .from("settings")
      .update({
  cafe_name: cafeName,
  logo_url: logoUrl,

  primary_color: primaryColor,
  secondary_color: secondaryColor,

  location: location,
phone: phone,
email: email,

  background_color: backgroundColor,
  background_image: backgroundImage,

  card_color: cardColor,
  card_text_color: cardTextColor,

  button_gradient_from: buttonGradientFrom,
  button_gradient_to: buttonGradientTo,

  header_color: headerColor,
  footer_color: footerColor,
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
  <div
    key={index}
    className="space-y-2"
  >
    <img
      src={banner}
      alt={`Banner ${index + 1}`}
      className="
        rounded
        border
      "
    />

    <button
      type="button"
      onClick={() =>
        deleteBanner(
          banner
        )
      }
      className="
        w-full
        py-2
        rounded-lg
        bg-black
        text-white
      "
    >
      Delete Banner
    </button>
  </div>
))}
        </div>
      </div>

      <div>
  <label className="block mb-2">
    Menu Background Image
  </label>

  <div className="space-y-3">
    <label
      htmlFor="background-upload"
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
      Upload Background
    </label>

    <input
      id="background-upload"
      type="file"
      accept=".jpg,.jpeg,.png,.webp"
      onChange={
        uploadBackground
      }
      className="hidden"
    />
  </div>

  {backgroundImage && (
  <div className="mt-4">
    <img
      src={backgroundImage}
      alt="Background"
      className="
        rounded-xl
        border
        h-40
        object-cover
      "
    />

    <button
      type="button"
      onClick={() =>
        setBackgroundImage("")
      }
      className="
        mt-3
        px-4
        py-2
        rounded-lg
        bg-black
        text-white
      "
    >
      Delete Background
    </button>
  </div>
)}
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
      <div>
  <label className="block mb-2">
    Background Color
  </label>

  <input
    type="color"
    value={backgroundColor}
    onChange={(e) =>
      setBackgroundColor(
        e.target.value
      )
    }
  />
</div>
<div>
  <label className="block mb-2">
    Card Color
  </label>

  <input
    type="color"
    value={cardColor}
    onChange={(e) =>
      setCardColor(
        e.target.value
      )
    }
  />
</div>
<div>
  <label className="block mb-2">
    Card Text Color
  </label>

  <input
    type="color"
    value={cardTextColor}
    onChange={(e) =>
      setCardTextColor(
        e.target.value
      )
    }
  />
</div>
<div>
  <label className="block mb-2">
    Button Gradient Start
  </label>

  <input
    type="color"
    value={buttonGradientFrom}
    onChange={(e) =>
      setButtonGradientFrom(
        e.target.value
      )
    }
  />
</div>
<div>
  <label className="block mb-2">
    Button Gradient End
  </label>

  <input
    type="color"
    value={buttonGradientTo}
    onChange={(e) =>
      setButtonGradientTo(
        e.target.value
      )
    }
  />
</div>
<div>
  <label className="block mb-2">
    Header Color
  </label>

  <input
    type="color"
    value={headerColor}
    onChange={(e) =>
      setHeaderColor(
        e.target.value
      )
    }
  />
</div>
<div>
  <label className="block mb-2">
    Footer Color
  </label>

  <input
    type="color"
    value={footerColor}
    onChange={(e) =>
      setFooterColor(
        e.target.value
      )
    }
  />
</div>

<div>
  <label className="block mb-2">
    Restaurant Location
  </label>

  <input
    type="text"
    value={location}
    onChange={(e) =>
      setLocation(e.target.value)
    }
    className="
      w-full
      border
      p-3
      rounded
    "
    placeholder="Patiala, Punjab"
  />
</div>

<div>
  <label className="block mb-2">
    Phone Number
  </label>

  <input
    type="text"
    value={phone}
    onChange={(e) =>
      setPhone(e.target.value)
    }
    className="
      w-full
      border
      p-3
      rounded
    "
    placeholder="+91 98765 43210"
  />
</div>

<div>
  <label className="block mb-2">
    Email Address
  </label>

  <input
    type="email"
    value={email}
    onChange={(e) =>
      setEmail(e.target.value)
    }
    className="
      w-full
      border
      p-3
      rounded
    "
    placeholder="hello@cafe.com"
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