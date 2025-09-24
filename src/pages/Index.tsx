// CampusConnect - College Events Platform

import { useEffect } from "react";
import { FloatingElements } from "@/components/3d-background";

const Index = () => {
  useEffect(() => {
    // Redirect to main app since auth is now handled in App.tsx
    window.location.reload();
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-hero relative overflow-hidden">
      <FloatingElements />
      <div className="text-center relative z-10">
        <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4" />
        <h1 className="mb-4 text-4xl font-bold text-white">Loading CampusConnect...</h1>
        <p className="text-xl text-white/70">Connecting college communities through amazing events</p>
      </div>
    </div>
  );
};

export default Index;
