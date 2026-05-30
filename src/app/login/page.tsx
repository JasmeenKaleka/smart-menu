"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin() {
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    router.push("/admin/dashboard");
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-[400px] space-y-4 border p-6 rounded-xl">

        <h1 className="text-2xl font-bold">
          Admin Login
        </h1>

        <input
          className="w-full border p-3 rounded"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          className="w-full border p-3 rounded"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && (
          <p className="text-red-500">
            {error}
          </p>
        )}

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-black text-white p-3 rounded"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

      </div>
    </div>
  );
}