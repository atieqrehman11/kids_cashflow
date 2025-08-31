import { useQuery } from "@tanstack/react-query";
import { type Transaction, type Account } from "@shared/schema";

interface TransactionWithAccount extends Transaction {
  account?: Account;
}

interface AccountStats {
  account: Account;
  totalCredits: number;
  totalDebits: number;
  transactionCount: number;
  avgTransaction: number;
}

export default function ReportsPage() {
  const { data: transactions = [], isLoading: transactionsLoading } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions"],
  });

  const { data: accounts = [] } = useQuery<Account[]>({
    queryKey: ["/api/accounts"],
  });

  // Combine transaction data with account names
  const transactionsWithAccounts: TransactionWithAccount[] = transactions.map((transaction: Transaction) => ({
    ...transaction,
    account: accounts.find(acc => acc.id === transaction.accountId)
  }));

  // Calculate account statistics
  const accountStats: AccountStats[] = accounts.map((account: Account) => {
    const accountTransactions = transactions.filter((t: Transaction) => t.accountId === account.id);
    const credits = accountTransactions.filter((t: Transaction) => t.type === "credit");
    const debits = accountTransactions.filter((t: Transaction) => t.type === "debit");
    
    const totalCredits = credits.reduce((sum: number, t: Transaction) => sum + parseFloat(t.amount), 0);
    const totalDebits = debits.reduce((sum: number, t: Transaction) => sum + parseFloat(t.amount), 0);
    const avgTransaction = accountTransactions.length > 0 
      ? (totalCredits + totalDebits) / accountTransactions.length 
      : 0;

    return {
      account,
      totalCredits,
      totalDebits,
      transactionCount: accountTransactions.length,
      avgTransaction
    };
  });

  if (transactionsLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Reports & Analytics</h1>
          <p className="text-muted-foreground mt-1">Financial insights for all accounts</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-card rounded-xl border border-border shadow-sm p-6">
              <div className="h-6 bg-gray-200 rounded animate-pulse w-32 mb-4"></div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Reports & Analytics</h1>
        <p className="text-muted-foreground mt-1">Financial insights for all accounts</p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm font-medium">Total Accounts</p>
              <p className="text-2xl font-bold text-foreground mt-1" data-testid="stat-total-accounts">
                {accounts.length}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <i className="fas fa-users text-blue-600"></i>
            </div>
          </div>
        </div>

        <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm font-medium">Total Transactions</p>
              <p className="text-2xl font-bold text-foreground mt-1" data-testid="stat-total-transactions">
                {transactions.length}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <i className="fas fa-exchange-alt text-green-600"></i>
            </div>
          </div>
        </div>

        <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm font-medium">Total Credits</p>
              <p className="text-2xl font-bold text-green-600 mt-1" data-testid="stat-total-credits">
                ${transactions
                  .filter(t => t.type === "credit")
                  .reduce((sum, t) => sum + parseFloat(t.amount), 0)
                  .toFixed(2)}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <i className="fas fa-plus text-green-600"></i>
            </div>
          </div>
        </div>

        <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm font-medium">Total Debits</p>
              <p className="text-2xl font-bold text-red-600 mt-1" data-testid="stat-total-debits">
                ${transactions
                  .filter(t => t.type === "debit")
                  .reduce((sum, t) => sum + parseFloat(t.amount), 0)
                  .toFixed(2)}
              </p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <i className="fas fa-minus text-red-600"></i>
            </div>
          </div>
        </div>
      </div>

      {/* Account-wise Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-card rounded-xl border border-border shadow-sm p-6">
          <h2 className="text-xl font-semibold text-foreground mb-6">
            <i className="fas fa-chart-bar mr-2 text-primary"></i>
            Account Statistics
          </h2>
          
          <div className="space-y-4">
            {accountStats.length === 0 ? (
              <div className="text-center py-8">
                <i className="fas fa-chart-bar text-4xl text-muted-foreground mb-4"></i>
                <h3 className="text-lg font-semibold text-foreground mb-2">No data available</h3>
                <p className="text-muted-foreground">Create accounts and add transactions to see analytics</p>
              </div>
            ) : (
              accountStats.map((stat) => (
                <div 
                  key={stat.account.id} 
                  className="p-4 bg-muted rounded-lg"
                  data-testid={`account-stats-${stat.account.id}`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-foreground" data-testid={`text-account-name-${stat.account.id}`}>
                      {stat.account.name}'s Account
                    </h3>
                    <span className="text-lg font-bold text-green-600" data-testid={`text-account-balance-${stat.account.id}`}>
                      ${stat.account.balance}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Total Credits</p>
                      <p className="font-semibold text-green-600" data-testid={`text-total-credits-${stat.account.id}`}>
                        ${stat.totalCredits.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Total Debits</p>
                      <p className="font-semibold text-red-600" data-testid={`text-total-debits-${stat.account.id}`}>
                        ${stat.totalDebits.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Transactions</p>
                      <p className="font-semibold text-foreground" data-testid={`text-transaction-count-${stat.account.id}`}>
                        {stat.transactionCount}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Avg Amount</p>
                      <p className="font-semibold text-foreground" data-testid={`text-avg-transaction-${stat.account.id}`}>
                        ${stat.avgTransaction.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Activity Summary */}
        <div className="bg-card rounded-xl border border-border shadow-sm p-6">
          <h2 className="text-xl font-semibold text-foreground mb-6">
            <i className="fas fa-clock mr-2 text-primary"></i>
            Recent Activity
          </h2>
          
          <div className="space-y-3">
            {transactionsWithAccounts.slice(0, 8).map((transaction) => (
              <div 
                key={transaction.id} 
                className="flex items-center justify-between p-3 bg-muted rounded-lg"
                data-testid={`recent-transaction-${transaction.id}`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    transaction.type === "credit" ? "bg-green-100" : "bg-red-100"
                  }`}>
                    <i className={`fas ${transaction.type === "credit" ? "fa-plus text-green-600" : "fa-minus text-red-600"} text-sm`}></i>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {transaction.description}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {transaction.account?.name} • {new Date(transaction.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <span 
                  className={`text-sm font-semibold ${transaction.type === "credit" ? "text-green-600" : "text-red-600"}`}
                >
                  {transaction.type === "credit" ? "+" : "-"}${transaction.amount}
                </span>
              </div>
            ))}
            
            {transactionsWithAccounts.length === 0 && (
              <div className="text-center py-8">
                <i className="fas fa-clock text-3xl text-muted-foreground mb-3"></i>
                <p className="text-muted-foreground">No recent activity</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}