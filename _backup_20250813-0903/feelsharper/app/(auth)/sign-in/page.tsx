"use client";
import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import SimpleHeader from "@/components/navigation/SimpleHeader";

function SignInForm() {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const params = useSearchParams();
  const redirect = params.get("redirect") || "/today";

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErr(null);
    
    try {
      // Dynamic import to avoid build issues
      const { createSupabaseBrowser } = await import("@/lib/supabase/client");
      const supabase = createSupabaseBrowser();
      const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
      if (error) setErr(error.message);
      else window.location.href = redirect;
    } catch (error) {
      setErr("Sign in temporarily unavailable");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-bg text-text-primary">
      <SimpleHeader />
      <main className="mx-auto max-w-sm p-6 pt-20">
        <h1 className="text-2xl font-semibold mb-4 text-text-primary">Sign in</h1>
        <form onSubmit={onSubmit} className="space-y-3">
          <input 
            className="w-full rounded-md border border-border bg-surface p-2 text-text-primary" 
            placeholder="Email" 
            value={email} 
            onChange={(e)=>setEmail(e.target.value)} 
          />
          <input 
            className="w-full rounded-md border border-border bg-surface p-2 text-text-primary" 
            placeholder="Password" 
            type="password" 
            value={pass} 
            onChange={(e)=>setPass(e.target.value)} 
          />
          <button 
            disabled={loading} 
            className="w-full rounded-md bg-navy text-white py-2 hover:bg-navy-600 disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
          {err && <p className="text-error text-sm">{err}</p>}
        </form>
        <p className="mt-4 text-sm text-text-secondary">
          No account? <Link className="underline text-navy" href={`/sign-up?redirect=${encodeURIComponent(redirect)}`}>Create one</Link>
        </p>
      </main>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-bg text-text-primary flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-navy border-t-transparent mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading...</p>
        </div>
      </div>
    }>
      <SignInForm />
    </Suspense>
  );
}
