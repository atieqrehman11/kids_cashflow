import { Link, useLocation } from "wouter";

export default function Navigation() {
  const [location] = useLocation();

  const navItems = [
    { path: "/", label: "Dashboard", icon: "fas fa-home" },
    { path: "/accounts", label: "Accounts", icon: "fas fa-users" },
    { path: "/transactions", label: "Transactions", icon: "fas fa-exchange-alt" },
    { path: "/reports", label: "Reports", icon: "fas fa-chart-bar" },
  ];

  return (
    <nav className="hidden md:flex space-x-8">
      {navItems.map((item) => {
        const isActive = location === item.path;
        return (
          <Link key={item.path} href={item.path}>
            <button 
              className={`pb-4 font-medium transition-colors ${
                isActive 
                  ? "text-primary border-b-2 border-primary" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
              data-testid={`nav-${item.label.toLowerCase()}`}
            >
              <i className={`${item.icon} mr-2`}></i>
              {item.label}
            </button>
          </Link>
        );
      })}
    </nav>
  );
}