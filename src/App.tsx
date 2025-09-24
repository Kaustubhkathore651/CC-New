import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  isGuest?: boolean;
}

const App = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleAuthSuccess = (userData: User) => {
    setUser(userData);
    setIsAuthenticated(true);
  };

  const handleGuestAccess = () => {
    const guestUser: User = {
      id: "guest",
      name: "Guest User",
      email: "guest@campusconnect.com",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=guest",
      isGuest: true
    };
    setUser(guestUser);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <BrowserRouter>
            <Routes>
              {!isAuthenticated ? (
                <>
                  <Route 
                    path="/" 
                    element={
                      <Auth 
                        onAuthSuccess={handleAuthSuccess}
                        onGuestAccess={handleGuestAccess}
                      />
                    } 
                  />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </>
              ) : (
                <>
                  <Route 
                    path="/" 
                    element={
                      user ? (
                        <Dashboard 
                          user={user} 
                          onLogout={handleLogout} 
                        />
                      ) : (
                        <Navigate to="/" replace />
                      )
                    } 
                  />
                  {/* Future routes */}
                  <Route path="/create-event" element={<div>Create Event - Coming Soon</div>} />
                  <Route path="/my-events" element={<div>My Events - Coming Soon</div>} />
                  <Route path="/profile" element={<div>Profile - Coming Soon</div>} />
                  <Route path="/admin" element={<div>Admin Panel - Coming Soon</div>} />
                  <Route path="*" element={<NotFound />} />
                </>
              )}
            </Routes>
          </BrowserRouter>
          <Toaster />
          <Sonner />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
