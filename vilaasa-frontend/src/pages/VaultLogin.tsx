import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import vilaasaLogo from "@/assets/vilaasa-logo.svg";
import vilaasaSlogan from "@/assets/vilaasa-slogan.png";

const VaultLogin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate login (replace with real auth when Cloud is enabled)
    await new Promise((r) => setTimeout(r, 1500));

    // Demo credentials check
    if (formData.email === "demo@vilaasa.com" && formData.password === "demo123") {
      toast({
        title: "Welcome to The Vault",
        description: "Accessing your secure portfolio...",
      });
      navigate("/vault/dashboard");
    } else {
      toast({
        title: "Access Denied",
        description: "Invalid login details. Please try again.",
        variant: "destructive",
      });
    }

    setIsLoading(false);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    toast({
      title: "Reset Link Sent",
      description: "Check your email for password reset instructions.",
    });
    setIsLoading(false);
    setShowForgotPassword(false);
  };

  return (
    <div className="min-h-screen bg-[#0c1a14] flex">
      {/* Left: Branding */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent" />
        <img
          src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1920&q=80"
          alt="Luxury Estate"
          className="w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0c1a14] via-transparent to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 p-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <img src={vilaasaSlogan} alt="The Luxury of Certainty" className="h-[75px] mb-6" />
            <span className="text-gold/60 uppercase tracking-[0.2em] text-xs font-bold">Exclusive Access</span>
            <h1 className="text-4xl md:text-5xl font-light text-white mt-4 mb-4 font-serif">
              The <span className="italic text-gold">Vault</span>
            </h1>
            <p className="text-white/60 max-w-md">
              Your private portal to portfolio intelligence, secure documents,
              and personalized wealth management.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Right: Login Form */}
      <div className="flex-1 lg:max-w-xl flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md"
        >
          <Link to="/" className="inline-block mb-12">
            <img src={vilaasaLogo} alt="Vilaasa Estate" className="h-8" />
          </Link>

          <div className="lg:hidden mb-8">
            <span className="text-gold/60 uppercase tracking-[0.2em] text-xs font-bold">Secure Portal</span>
            <h1 className="text-3xl font-light text-white mt-2 font-serif">
              The <span className="italic text-gold">Vault</span>
            </h1>
          </div>

          {!showForgotPassword ? (
            <>
              <h2 className="text-2xl font-light text-white mb-2">Welcome back</h2>
              <p className="text-white/50 mb-8">
                Access your secure investment portfolio
              </p>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white/70">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="investor@example.com"
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-gold"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="password" className="text-white/70">Password</Label>
                    <button
                      type="button"
                      onClick={() => setShowForgotPassword(true)}
                      className="text-gold text-xs hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="••••••••"
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-gold"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  variant="hero"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span>
                      Authenticating...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-lg">lock_open</span>
                      Access The Vault
                    </span>
                  )}
                </Button>
              </form>

              <p className="text-white/40 text-xs text-center mt-8">
                Not a client yet?{" "}
                <Link to="/contact" className="text-gold hover:underline">
                  Schedule a consultation
                </Link>
              </p>
            </>
          ) : (
            <>
              <button
                onClick={() => setShowForgotPassword(false)}
                className="flex items-center gap-2 text-white/50 hover:text-white mb-8 transition-colors"
              >
                <span className="material-symbols-outlined text-lg">arrow_back</span>
                Back to login
              </button>

              <h2 className="text-2xl font-light text-white mb-2">Reset Password</h2>
              <p className="text-white/50 mb-8">
                Enter your email to receive reset instructions
              </p>

              <form onSubmit={handleForgotPassword} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="reset-email" className="text-white/70">Email Address</Label>
                  <Input
                    id="reset-email"
                    type="email"
                    placeholder="investor@example.com"
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-gold"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  variant="hero"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? "Sending..." : "Send Reset Link"}
                </Button>
              </form>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default VaultLogin;
