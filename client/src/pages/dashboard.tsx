import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { type Account } from "@shared/schema";
import DashboardStats from "@/components/dashboard-stats";
import AccountCard from "@/components/account-card";
import CreateAccountModal from "@/components/create-account-modal";
import TransactionForm from "@/components/transaction-form";
import RecentTransactions from "@/components/recent-transactions";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const { data: accounts = [], isLoading: accountsLoading } = useQuery<Account[]>({
    queryKey: ["/api/accounts"],
  });

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
            <nav className="hidden md:flex space-x-8">
              <button className="text-primary font-medium border-b-2 border-primary pb-4" data-testid="nav-dashboard">
                Dashboard
              </button>
              <button className="text-muted-foreground hover:text-foreground pb-4" data-testid="nav-accounts">
                Accounts
              </button>
              <button className="text-muted-foreground hover:text-foreground pb-4" data-testid="nav-transactions">
                Transactions
              </button>
              <button className="text-muted-foreground hover:text-foreground pb-4" data-testid="nav-reports">
                Reports
              </button>
            </nav>
            <button className="md:hidden" data-testid="button-mobile-menu">
              <i className="fas fa-bars text-xl"></i>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Overview */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold text-foreground">Account Overview</h2>
              <p className="text-muted-foreground mt-1">Manage your kids' accounts and track their spending</p>
            </div>
            <Button 
              onClick={() => setIsCreateModalOpen(true)}
              className="mt-4 sm:mt-0"
              data-testid="button-add-account"
            >
              <i className="fas fa-plus mr-2"></i>Add Account
            </Button>
          </div>

          <DashboardStats />
        </div>

        {/* Accounts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
          {accountsLoading ? (
            // Loading skeletons
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
                <div className="bg-gray-200 h-3 animate-pulse"></div>
                <div className="p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
                      <div className="h-3 bg-gray-200 rounded animate-pulse w-12"></div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                    <div className="flex space-x-2 pt-4">
                      <div className="flex-1 h-8 bg-gray-200 rounded animate-pulse"></div>
                      <div className="flex-1 h-8 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : accounts.length === 0 ? (
            <div className="col-span-full bg-card rounded-xl border border-border shadow-sm p-12 text-center">
              <i className="fas fa-piggy-bank text-4xl text-muted-foreground mb-4"></i>
              <h3 className="text-lg font-semibold text-foreground mb-2">No accounts yet</h3>
              <p className="text-muted-foreground mb-4">Get started by creating your first kid's account</p>
              <Button onClick={() => setIsCreateModalOpen(true)} data-testid="button-create-first-account">
                <i className="fas fa-plus mr-2"></i>Create Account
              </Button>
            </div>
          ) : (
            accounts.map((account) => (
              <AccountCard key={account.id} account={account} />
            ))
          )}
        </div>

        {/* Transaction Management */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <TransactionForm accounts={accounts} />
          <RecentTransactions />
        </div>
      </main>

      {/* Create Account Modal */}
      <CreateAccountModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
      />
    </div>
  );
}
