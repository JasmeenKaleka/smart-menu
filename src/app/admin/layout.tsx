"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import AdminSidebar from "@/components/admin/AdminSidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  async function checkUser() {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      router.push("/login");
      return;
    }

    setLoading(false);
  }

  if (loading) {
    return (
      <div className="p-10">
        Loading...
      </div>
    );
  }

  return (
    <div className="flex">
      <AdminSidebar />

      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  );
}