import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" 
             style={{
               backgroundImage: `
                 linear-gradient(hsl(var(--primary)) 1px, transparent 1px),
                 linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)
               `,
               backgroundSize: '50px 50px'
             }} 
        />
      </div>
      
      <div className="text-center space-y-8 relative z-10">
        {/* 404 Animation */}
        <div className="relative">
          <h1 className="text-9xl font-bold text-primary/20 select-none">404</h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-24 h-24 bg-gradient-cta rounded-full opacity-20 animate-pulse-slow" />
          </div>
        </div>
        
        {/* Message */}
        <div className="space-y-4">
          <h2 className="text-3xl font-bold">Page Not Found</h2>
          <p className="text-xl text-muted-foreground max-w-md mx-auto">
            Oops! The page you're looking for doesn't exist. It might have been moved or deleted.
          </p>
        </div>
        
        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            onClick={() => window.history.back()}
            variant="outline"
            className="border-primary/20 hover:border-primary/40"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
          <Button 
            onClick={() => window.location.href = "/"}
            className="bg-gradient-cta hover:opacity-90"
          >
            <Home className="w-4 h-4 mr-2" />
            Return Home
          </Button>
        </div>
        
        {/* Debug Info */}
        <div className="mt-8 p-4 bg-muted/30 rounded-lg border border-border/30">
          <p className="text-sm text-muted-foreground">
            <strong>Path:</strong> {location.pathname}
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
