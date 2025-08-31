import { useQuery } from "@tanstack/react-query";

interface DashboardStats {
  totalAccounts: number;
  totalBalance: string;
  monthlyTransactions: string;
}

export default function DashboardStats() {
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-card p-6 rounded-xl border border-border shadow-sm">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
                <div className="h-8 bg-gray-200 rounded animate-pulse w-16"></div>
              </div>
              <div className="w-12 h-12 bg-gray-200 rounded-lg animate-pulse"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-muted-foreground text-sm font-medium">Total Accounts</p>
            <p className="text-3xl font-bold text-foreground mt-2" data-testid="stat-total-accounts">
              {stats?.totalAccounts || 0}
            </p>
          </div>
          <div className="p-3 bg-blue-100 rounded-lg">
            <i className="fas fa-users text-blue-600 text-xl"></i>
          </div>
        </div>
      </div>

      <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-muted-foreground text-sm font-medium">Total Balance</p>
            <p className="text-3xl font-bold text-green-600 mt-2" data-testid="stat-total-balance">
              ${stats?.totalBalance || "0.00"}
            </p>
          </div>
          <div className="p-3 bg-green-100 rounded-lg">
            <i className="fas fa-dollar-sign text-green-600 text-xl"></i>
          </div>
        </div>
      </div>

      <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-muted-foreground text-sm font-medium">This Month</p>
            <p className="text-3xl font-bold text-foreground mt-2" data-testid="stat-monthly-transactions">
              ${stats?.monthlyTransactions || "0.00"}
            </p>
          </div>
          <div className="p-3 bg-orange-100 rounded-lg">
            <i className="fas fa-chart-line text-orange-600 text-xl"></i>
          </div>
        </div>
      </div>
    </div>
  );
}
