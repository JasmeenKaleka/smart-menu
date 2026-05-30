"use client";

import { useEffect, useState } from "react";
import QRCode from "react-qr-code";
import { supabase } from "@/lib/supabase";

export default function QRPage() {
  const [menuUrl, setMenuUrl] = useState("");
  const [cafeName, setCafeName] = useState("Cafe");

  async function loadData() {
    setMenuUrl(window.location.origin);

    const { data, error } = await supabase
      .from("settings")
      .select("*")
      .limit(1);

    if (error) {
      console.error(error);
      return;
    }

    if (data && data.length > 0) {
      setCafeName(
        data[0].cafe_name || "Cafe"
      );
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function copyUrl() {
    navigator.clipboard.writeText(menuUrl);

    alert("Menu URL copied");
  }

  function openMenu() {
    window.open(
      menuUrl,
      "_blank"
    );
  }

  function printQR() {
    const qrElement =
      document.getElementById(
        "qr-print-area"
      );

    if (!qrElement) return;

    const printWindow =
      window.open(
        "",
        "_blank",
        "width=800,height=800"
      );

    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>${cafeName} QR Code</title>

          <style>
            *{
              box-sizing:border-box;
            }

            body{
              margin:0;
              padding:0;
              display:flex;
              justify-content:center;
              align-items:center;
              height:100vh;
              font-family:Arial,sans-serif;
            }

            .container{
              text-align:center;
              border:2px solid #000;
              border-radius:16px;
              padding:40px;
            }

            h1{
              margin:0;
              margin-bottom:20px;
              font-size:32px;
            }

            p{
              margin-top:20px;
              font-size:18px;
            }
          </style>
        </head>

        <body>

          <div class="container">

            <h1>${cafeName}</h1>

            ${qrElement.innerHTML}

            <p>
              Scan To View Menu
            </p>

          </div>

        </body>
      </html>
    `);

    printWindow.document.close();

    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    }, 500);
  }

  return (
    <div className="max-w-4xl space-y-8">

      <div>
        <h1 className="text-3xl font-bold">
          QR Code
        </h1>

        <p className="text-gray-500 mt-2">
          Customers can scan this QR code
          to open your digital menu.
        </p>
      </div>

      <div className="border rounded-xl p-6">

        <label className="block mb-2 font-medium">
          Menu URL
        </label>

        <div className="flex gap-3">

          <input
            value={menuUrl}
            readOnly
            className="
              flex-1
              border
              p-3
              rounded
              bg-gray-50
            "
          />

          <button
            onClick={copyUrl}
            className="
              bg-black
              text-white
              px-5
              rounded
            "
          >
            Copy
          </button>

        </div>

      </div>

      <div
        className="
          border
          rounded-xl
          p-10
          flex
          flex-col
          items-center
          gap-6
        "
      >

        <div
          className="
            text-center
            space-y-4
          "
        >

          <h2 className="text-2xl font-bold">
            {cafeName}
          </h2>

          <div id="qr-print-area">

            {menuUrl && (
              <QRCode
                value={menuUrl}
                size={250}
              />
            )}

          </div>

          <p className="text-gray-500">
            Scan To View Menu
          </p>

        </div>

        <div className="flex gap-3 flex-wrap">

          <button
            onClick={openMenu}
            className="
              bg-black
              text-white
              px-5
              py-3
              rounded
            "
          >
            Open Menu
          </button>

          <button
            onClick={printQR}
            className="
              border
              px-5
              py-3
              rounded
            "
          >
            Print QR
          </button>

        </div>

      </div>

    </div>
  );
}