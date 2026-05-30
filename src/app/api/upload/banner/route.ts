import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No file uploaded" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const optimizedImage = await sharp(buffer)
      .resize(1600, 900, {
        fit: "cover",
      })
      .webp({
        quality: 80,
      })
      .toBuffer();

    const fileName =
      `banner-${Date.now()}.webp`;

    const { error } = await supabaseAdmin.storage
      .from("banners")
      .upload(fileName, optimizedImage, {
        contentType: "image/webp",
        upsert: true,
      });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    const { data } = supabaseAdmin.storage
      .from("banners")
      .getPublicUrl(fileName);

    return NextResponse.json({
      url: data.publicUrl,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Upload failed" },
      { status: 500 }
    );
  }
}