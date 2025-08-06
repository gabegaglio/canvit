import { useState } from "react";
import { supabase } from "./lib/supabase";

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) setError(error.message);
      else setSuccess(true);
    } else {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) setError(error.message);
      else setSuccess(true);
    }
    setLoading(false);
  }

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 font-sans"
      style={{ fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif" }}
    >
      <div className="relative p-[2px] rounded-3xl bg-gradient-to-br from-blue-200/60 via-white/40 to-indigo-200/60 shadow-2xl">
        <form
          onSubmit={handleSubmit}
          className="bg-white/20 backdrop-blur-2xl rounded-3xl p-8 w-full max-w-sm space-y-6 border border-white/30"
        >
          <h2 className="text-2xl font-extrabold text-center text-blue-700 mb-2 tracking-tight drop-shadow-sm">
            {mode === "login" ? "Sign in to your account" : "Create an account"}
          </h2>
          <div className="space-y-3">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-blue-200 px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none transition"
              required
              autoFocus
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-blue-200 px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none transition"
              required
            />
          </div>
          {error && (
            <div className="text-red-500 text-sm text-center">{error}</div>
          )}
          {success && (
            <div className="text-green-600 text-sm text-center">Success!</div>
          )}
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold shadow transition disabled:opacity-60"
            disabled={loading}
          >
            {loading ? "Loading..." : mode === "login" ? "Sign In" : "Sign Up"}
          </button>
          <div className="text-center text-sm text-gray-600 mt-2">
            {mode === "login" ? (
              <span>
                Don&apos;t have an account?{" "}
                <button
                  type="button"
                  className="text-blue-600 font-medium"
                  onClick={() => setMode("signup")}
                >
                  Sign Up
                </button>
              </span>
            ) : (
              <span>
                Already have an account?{" "}
                <button
                  type="button"
                  className="text-blue-600 font-medium"
                  onClick={() => setMode("login")}
                >
                  Sign In
                </button>
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
