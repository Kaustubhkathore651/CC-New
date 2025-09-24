import { useState } from "react";
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { FloatingElements } from "@/components/3d-background";
import { useToast } from "@/hooks/use-toast";
import heroImage from "@/assets/hero-image.jpg";

interface AuthProps {
  onAuthSuccess: (user: any) => void;
  onGuestAccess: () => void;
}

export default function Auth({ onAuthSuccess, onGuestAccess }: AuthProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate authentication
    setTimeout(() => {
      if (isLogin) {
        // Mock login success
        onAuthSuccess({
          id: "1",
          name: formData.name || "Demo User",
          email: formData.email,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.email}`
        });
        toast({
          title: "Welcome back!",
          description: "Successfully logged in to CampusConnect.",
        });
      } else {
        // Mock signup success
        onAuthSuccess({
          id: "1",
          name: formData.name,
          email: formData.email,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.email}`
        });
        toast({
          title: "Account created!",
          description: "Welcome to CampusConnect community.",
        });
      }
      setLoading(false);
    }, 1500);
  };

  const handleGoogleAuth = () => {
    setLoading(true);
    // Simulate Google OAuth
    setTimeout(() => {
      onAuthSuccess({
        id: "google_1",
        name: "Google User",
        email: "user@gmail.com",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=google"
      });
      toast({
        title: "Google Login Successful!",
        description: "Welcome to CampusConnect.",
      });
      setLoading(false);
    }, 1000);
  };

  const handleGuestClick = () => {
    toast({
      title: "Guest Access Granted",
      description: "Exploring CampusConnect as a guest user.",
    });
    onGuestAccess();
  };

  return (
    <div className="min-h-screen bg-gradient-hero relative overflow-hidden">
      {/* Hero Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
        style={{ backgroundImage: `url(${heroImage})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-primary/80 via-accent/60 to-secondary/80" />
      
      <FloatingElements />
      
      {/* Header */}
      <header className="relative z-10 flex justify-between items-center p-6">
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 bg-gradient-cta rounded-xl flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">CampusConnect</h1>
        </div>
        <ThemeToggle />
      </header>

      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-120px)] px-4">
        <div className="w-full max-w-md">
          <Card className="bg-gradient-card backdrop-blur-lg border-white/20 shadow-large animate-slide-up">
            <CardHeader className="text-center space-y-4">
              <CardTitle className="text-3xl font-bold bg-gradient-hero bg-clip-text text-transparent">
                {isLogin ? "Welcome Back" : "Join CampusConnect"}
              </CardTitle>
              <CardDescription className="text-muted-foreground text-lg">
                {isLogin 
                  ? "Sign in to discover amazing college events" 
                  : "Create your account to get started"
                }
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Google OAuth Button */}
              <Button
                onClick={handleGoogleAuth}
                disabled={loading}
                variant="outline"
                className="w-full h-12 border-primary/20 hover:border-primary/40 hover:bg-primary/5 transition-all duration-300"
              >
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                </div>
              </div>

              {/* Auth Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {!isLogin && (
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                    <Input
                      type="text"
                      placeholder="Full Name"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="pl-12 h-12 border-primary/20 focus:border-primary/40"
                      required={!isLogin}
                    />
                  </div>
                )}
                
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                  <Input
                    type="email"
                    placeholder="Email Address"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="pl-12 h-12 border-primary/20 focus:border-primary/40"
                    required
                  />
                </div>
                
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="pl-12 pr-12 h-12 border-primary/20 focus:border-primary/40"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                {!isLogin && (
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Confirm Password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                      className="pl-12 h-12 border-primary/20 focus:border-primary/40"
                      required={!isLogin}
                    />
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 bg-gradient-cta hover:opacity-90 transition-all duration-300 text-white font-semibold"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      {isLogin ? "Sign In" : "Create Account"}
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </>
                  )}
                </Button>
              </form>

              {/* Toggle Auth Mode */}
              <div className="text-center">
                <button
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  {isLogin ? "Don't have an account? " : "Already have an account? "}
                  <span className="text-primary font-semibold">
                    {isLogin ? "Sign up" : "Sign in"}
                  </span>
                </button>
              </div>

              {/* Guest Access */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Quick Access</span>
                </div>
              </div>

              <Button
                onClick={handleGuestClick}
                variant="ghost"
                className="w-full h-12 border border-dashed border-primary/30 hover:border-primary/50 hover:bg-primary/5 transition-all duration-300"
              >
                Continue as Guest
                <Sparkles className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>

          {/* Footer */}
          <p className="text-center text-white/70 text-sm mt-6">
            Connecting college communities through amazing events
          </p>
        </div>
      </div>
    </div>
  );
}