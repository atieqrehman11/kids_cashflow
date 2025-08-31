import Navigation from "@/components/navigation";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-card border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <i className="fas fa-piggy-bank text-primary text-2xl"></i>
              <h1 className="text-xl font-bold text-foreground">Kids Account Manager</h1>
            </div>
            <Navigation />
            <button className="md:hidden" data-testid="button-mobile-menu">
              <i className="fas fa-bars text-xl"></i>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>
        {children}
      </main>
    </div>
  );
}