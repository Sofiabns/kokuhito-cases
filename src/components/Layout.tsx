import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, PlusCircle, FolderOpen, Users, Moon, Sun, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import logo from "@/assets/logo.png";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains("dark");
    setIsDark(isDarkMode);
  }, []);

  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    if (newIsDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("kokuhito-auth");
    navigate("/login");
  };

  const navItems = [
    { path: "/", icon: Home, label: "Início" },
    { path: "/criar-caso", icon: PlusCircle, label: "Criar Caso" },
    { path: "/casos", icon: FolderOpen, label: "Casos" },
    { path: "/pessoas", icon: Users, label: "Pessoas" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-lg border-b border-border/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-18">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-4 group transition-transform hover:scale-105">
              <img src={logo} alt="Kokuhito Logo" className="w-12 h-12 object-contain rounded-xl" />
              <span className="font-poppins font-bold text-2xl hidden sm:block">
                Kokuhito
              </span>
            </Link>

            {/* Navigation */}
            <nav className="flex items-center gap-3">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link key={item.path} to={item.path}>
                    <Button
                      variant={isActive ? "default" : "ghost"}
                      size="default"
                      className={`rounded-2xl gap-3 px-4 py-2 font-medium transition-all duration-200 ${
                        isActive
                          ? "bg-primary text-primary-foreground shadow-md"
                          : "hover:bg-accent hover:scale-105"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="hidden md:inline">{item.label}</span>
                    </Button>
                  </Link>
                );
              })}

              {/* Theme Toggle */}
              <Button
                variant="ghost"
                size="default"
                onClick={toggleTheme}
                className="rounded-2xl px-3 hover:bg-accent hover:scale-105 transition-all duration-200"
              >
                {isDark ? (
                  <Sun className="w-5 h-5" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </Button>

              {/* Logout */}
              <Button
                variant="ghost"
                size="default"
                onClick={handleLogout}
                className="rounded-2xl px-3 text-destructive hover:text-destructive hover:bg-destructive/10 hover:scale-105 transition-all duration-200"
              >
                <LogOut className="w-5 h-5" />
              </Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">{children}</main>
    </div>
  );
};

export default Layout;
