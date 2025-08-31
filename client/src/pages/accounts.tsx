import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { type Account } from "@shared/schema";
import AccountCard from "@/components/account-card";
import CreateAccountModal from "@/components/create-account-modal";
import { Button } from "@/components/ui/button";

export default function AccountsPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const { data: accounts = [], isLoading: accountsLoading } = useQuery<Account[]>({
    queryKey: ["/api/accounts"],
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">All Accounts</h1>
          <p className="text-muted-foreground mt-1">Manage all kids' accounts</p>
        </div>
        <Button 
          onClick={() => setIsCreateModalOpen(true)}
          className="mt-4 sm:mt-0"
          data-testid="button-add-account"
        >
          <i className="fas fa-plus mr-2"></i>Add Account
        </Button>
      </div>

      {/* Accounts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {accountsLoading ? (
          // Loading skeletons
          Array.from({ length: 6 }).map((_, i) => (
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

      {/* Create Account Modal */}
      <CreateAccountModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
      />
    </div>
  );
}