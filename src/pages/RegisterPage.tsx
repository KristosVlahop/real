import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Zap, ArrowRight, Loader2 } from "lucide-react";

export default function RegisterPage() {
  const [, navigate] = useLocation();
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [company, setCompany] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      await register(email, password, name, company);
      navigate("/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-blue-500/5 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-emerald-500/5 blur-3xl" />
      </div>

      <Card className="w-full max-w-md border-border/50">
        <CardHeader className="text-center pb-2">
          <div className="flex justify-center mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl gradient-primary">
              <Zap className="h-6 w-6 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl">Create your account</CardTitle>
          <CardDescription>Start recovering revenue with AI</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-md bg-destructive/10 border border-destructive/30 p-3 text-sm text-destructive">
                {error}
              </div>
            )}
            <div>
              <label className="text-sm font-medium mb-1.5 block">Full Name</label>
              <Input placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} required className="bg-secondary/50" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Email</label>
              <Input type="email" placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="bg-secondary/50" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Password</label>
              <Input type="password" placeholder="At least 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} required className="bg-secondary/50" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Company</label>
              <Input placeholder="Your company (optional)" value={company} onChange={(e) => setCompany(e.target.value)} className="bg-secondary/50" />
            </div>
            <Button type="submit" className="w-full gradient-primary border-0 text-white hover:opacity-90" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Create Account <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <button onClick={() => navigate("/login")} className="text-primary hover:underline font-medium">
              Sign in
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
