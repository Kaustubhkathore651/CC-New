import { useState, useEffect } from "react";
import { 
  Calendar, 
  MapPin, 
  Users, 
  Clock, 
  Star, 
  Search, 
  Filter, 
  Plus,
  Ticket,
  User,
  LogOut,
  Settings,
  Bell,
  Grid3X3,
  List,
  TrendingUp,
  Sparkles,
  IndianRupee
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { ParticleField } from "@/components/3d-background";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  isGuest?: boolean;
}

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  college: string;
  category: "fest" | "hackathon" | "workshop" | "seminar";
  price: number;
  currency: string;
  capacity: number;
  registered: number;
  rating: number;
  image: string;
  tags: string[];
  status: "upcoming" | "live" | "ended" | "full";
  deadline: string;
}

interface DashboardProps {
  user: User;
  onLogout: () => void;
}

export default function Dashboard({ user, onLogout }: DashboardProps) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const { toast } = useToast();

  // Mock events data
  useEffect(() => {
    setTimeout(() => {
      setEvents([
        {
          id: "1",
          title: "TechFest 2024",
          description: "Annual technology festival featuring hackathons, workshops, and tech talks by industry leaders.",
          date: "2024-11-15",
          time: "09:00",
          location: "Main Auditorium, IIT Delhi",
          college: "IIT Delhi",
          category: "fest",
          price: 500,
          currency: "INR",
          capacity: 1000,
          registered: 756,
          rating: 4.8,
          image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=250&fit=crop",
          tags: ["Technology", "Innovation", "Networking"],
          status: "upcoming",
          deadline: "2024-11-10"
        },
        {
          id: "2",
          title: "Code Warriors Hackathon",
          description: "48-hour coding marathon with amazing prizes and mentorship from tech giants.",
          date: "2024-10-28",
          time: "18:00",
          location: "Computer Lab, BITS Pilani",
          college: "BITS Pilani",
          category: "hackathon",
          price: 0,
          currency: "INR",
          capacity: 200,
          registered: 180,
          rating: 4.9,
          image: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=400&h=250&fit=crop",
          tags: ["Coding", "Competition", "AI/ML"],
          status: "upcoming",
          deadline: "2024-10-25"
        },
        {
          id: "3",
          title: "AI & Machine Learning Workshop",
          description: "Hands-on workshop on latest AI technologies and practical machine learning applications.",
          date: "2024-10-20",
          time: "14:00",
          location: "Seminar Hall, MIT Manipal",
          college: "MIT Manipal",
          category: "workshop",
          price: 299,
          currency: "INR",
          capacity: 50,
          registered: 45,
          rating: 4.7,
          image: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400&h=250&fit=crop",
          tags: ["AI", "Machine Learning", "Python"],
          status: "upcoming",
          deadline: "2024-10-18"
        },
        {
          id: "4",
          title: "Startup Pitch Competition",
          description: "Present your startup ideas to top VCs and win funding opportunities up to ₹10 lakhs.",
          date: "2024-11-05",
          time: "10:00",
          location: "Innovation Hub, NIT Trichy",
          college: "NIT Trichy",
          category: "seminar",
          price: 199,
          currency: "INR",
          capacity: 100,
          registered: 78,
          rating: 4.6,
          image: "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=400&h=250&fit=crop",
          tags: ["Startup", "Entrepreneurship", "Funding"],
          status: "upcoming",
          deadline: "2024-11-01"
        },
        {
          id: "5",
          title: "Cultural Fest - Sanskriti 2024",
          description: "Celebrate diversity with music, dance, drama and cultural performances from across India.",
          date: "2024-12-01",
          time: "16:00",
          location: "Open Theatre, JNU Delhi",
          college: "JNU Delhi",
          category: "fest",
          price: 150,
          currency: "INR",
          capacity: 800,
          registered: 234,
          rating: 4.5,
          image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=250&fit=crop",
          tags: ["Culture", "Music", "Dance", "Art"],
          status: "upcoming",
          deadline: "2024-11-25"
        },
        {
          id: "6",
          title: "Blockchain Development Bootcamp",
          description: "Intensive 3-day bootcamp covering Ethereum, Smart Contracts, and DeFi development.",
          date: "2024-10-15",
          time: "09:30",
          location: "Tech Park, VIT Vellore",
          college: "VIT Vellore",
          category: "workshop",
          price: 999,
          currency: "INR",
          capacity: 40,
          registered: 38,
          rating: 4.8,
          image: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400&h=250&fit=crop",
          tags: ["Blockchain", "Ethereum", "Smart Contracts"],
          status: "upcoming",
          deadline: "2024-10-12"
        }
      ]);
      setLoading(false);
    }, 800);
  }, []);

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.college.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === "all" || event.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "fest": return "bg-secondary/10 text-secondary border-secondary/20";
      case "hackathon": return "bg-primary/10 text-primary border-primary/20";
      case "workshop": return "bg-accent/10 text-accent border-accent/20";
      case "seminar": return "bg-success/10 text-success border-success/20";
      default: return "bg-muted/10 text-muted-foreground border-muted/20";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "live": return "bg-success text-success-foreground";
      case "upcoming": return "bg-primary text-primary-foreground";
      case "ended": return "bg-muted text-muted-foreground";
      case "full": return "bg-destructive text-destructive-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const handleEventRegister = (eventId: string) => {
    const event = events.find(e => e.id === eventId);
    if (event) {
      toast({
        title: "Registration Successful!",
        description: `You've registered for ${event.title}. Check your email for confirmation.`,
      });
      
      // Update registered count
      setEvents(prev => prev.map(e => 
        e.id === eventId ? { ...e, registered: e.registered + 1 } : e
      ));
    }
  };

  const formatTimeRemaining = (date: string, time: string) => {
    const eventDate = new Date(`${date}T${time}`);
    const now = new Date();
    const diff = eventDate.getTime() - now.getTime();
    
    if (diff < 0) return "Event ended";
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h`;
    return "Starting soon";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading your events...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative">
      <ParticleField />
      
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-cta rounded-xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">CampusConnect</h1>
                <p className="text-xs text-muted-foreground">Discover • Connect • Experience</p>
              </div>
            </div>

            {/* Search Bar */}
            <div className="hidden md:flex flex-1 max-w-md mx-8">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <Input
                  placeholder="Search events, colleges, or tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 bg-muted/50 border-border/50 focus:border-primary/50"
                />
              </div>
            </div>

            {/* Header Actions */}
            <div className="flex items-center space-x-3">
              <ThemeToggle />
              
              {/* View Toggle */}
              <div className="hidden sm:flex bg-muted rounded-lg p-1">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="h-8 w-8 p-0"
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="h-8 w-8 p-0"
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user.name} {user.isGuest && "(Guest)"}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Ticket className="mr-2 h-4 w-4" />
                    <span>My Events</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={onLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Search */}
      <div className="md:hidden px-4 py-3 border-b border-border/50">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
          <Input
            placeholder="Search events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 bg-muted/50"
          />
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 relative z-10">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-card border-primary/10 hover-lift">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Events</p>
                  <p className="text-2xl font-bold">{events.length}</p>
                </div>
                <Calendar className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-card border-secondary/10 hover-lift">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Live Events</p>
                  <p className="text-2xl font-bold">{events.filter(e => e.status === "live").length}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-secondary" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-card border-accent/10 hover-lift">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Registered</p>
                  <p className="text-2xl font-bold">{events.reduce((acc, e) => acc + e.registered, 0)}</p>
                </div>
                <Users className="w-8 h-8 text-accent" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-card border-success/10 hover-lift">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">My Events</p>
                  <p className="text-2xl font-bold">3</p>
                </div>
                <Ticket className="w-8 h-8 text-success" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4 mb-8">
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-muted-foreground" />
            <span className="text-sm font-medium">Filter by:</span>
          </div>
          
          {["all", "fest", "hackathon", "workshop", "seminar"].map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className={selectedCategory === category ? "" : "border-border/50 hover:border-primary/30"}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </Button>
          ))}
          
          <Button variant="outline" size="sm" className="ml-auto">
            <Plus className="w-4 h-4 mr-2" />
            Create Event
          </Button>
        </div>

        {/* Events Grid */}
        <div className={`grid gap-6 ${
          viewMode === "grid" 
            ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" 
            : "grid-cols-1"
        }`}>
          {filteredEvents.map((event) => (
            <Card key={event.id} className="group bg-gradient-card border-border/50 hover:border-primary/30 hover-lift transition-all duration-300 overflow-hidden">
              {/* Event Image */}
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={event.image} 
                  alt={event.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-4 left-4 flex gap-2">
                  <Badge className={getStatusColor(event.status)}>
                    {event.status.toUpperCase()}
                  </Badge>
                  <Badge variant="outline" className={getCategoryColor(event.category)}>
                    {event.category.toUpperCase()}
                  </Badge>
                </div>
                <div className="absolute top-4 right-4">
                  <div className="bg-background/90 backdrop-blur-sm rounded-lg px-2 py-1 text-sm font-medium">
                    {formatTimeRemaining(event.date, event.time)}
                  </div>
                </div>
              </div>

              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Title and College */}
                  <div>
                    <h3 className="text-xl font-semibold group-hover:text-primary transition-colors">
                      {event.title}
                    </h3>
                    <p className="text-sm text-muted-foreground font-medium">{event.college}</p>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {event.description}
                  </p>

                  {/* Event Details */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-primary" />
                      <span>{new Date(event.date).toLocaleDateString()} at {event.time}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-primary" />
                      <span className="line-clamp-1">{event.location}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4 text-primary" />
                        <span>{event.registered}/{event.capacity}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500" />
                        <span>{event.rating}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <IndianRupee className="w-4 h-4 text-primary" />
                        <span className="font-medium">
                          {event.price === 0 ? "Free" : `${event.price}`}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1">
                    {event.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  {/* Registration Button */}
                  <Button 
                    onClick={() => handleEventRegister(event.id)}
                    className="w-full bg-gradient-cta hover:opacity-90 transition-all duration-300"
                    disabled={event.status === "full" || event.status === "ended"}
                  >
                    {event.status === "full" ? "Event Full" : 
                     event.status === "ended" ? "Event Ended" : 
                     "Register Now"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredEvents.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No events found</h3>
            <p className="text-muted-foreground mb-6">
              Try adjusting your search or filter criteria
            </p>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Event
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}