import { useQuery } from "@tanstack/react-query";
import { type Transaction, type Account } from "@shared/schema";

interface TransactionWithAccount extends Transaction {
  account?: Account;
}

export default function RecentTransactions() {
  const { data: transactions = [], isLoading } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions", { limit: 10 }],
  });

  const { data: accounts = [] } = useQuery<Account[]>({
    queryKey: ["/api/accounts"],
  });

  // Combine transaction data with account names
  const transactionsWithAccounts: TransactionWithAccount[] = transactions.map((transaction: Transaction) => ({
    ...transaction,
    account: accounts.find(acc => acc.id === transaction.accountId)
  }));

  if (isLoading) {
    return (
      <div className="bg-card rounded-xl border border-border shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-foreground">
            <i className="fas fa-history mr-2 text-primary"></i>
            Recent Transactions
          </h3>
        </div>
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-32"></div>
                </div>
              </div>
              <div className="h-6 bg-gray-200 rounded animate-pulse w-16"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl border border-border shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-foreground">
          <i className="fas fa-history mr-2 text-primary"></i>
          Recent Transactions
        </h3>
        <button className="text-primary hover:text-primary/80 text-sm font-medium" data-testid="button-view-all-transactions">
          View All
        </button>
      </div>

      <div className="space-y-4">
        {transactionsWithAccounts.length === 0 ? (
          <div className="text-center py-8">
            <i className="fas fa-receipt text-4xl text-muted-foreground mb-4"></i>
            <h4 className="text-lg font-semibold text-foreground mb-2">No transactions yet</h4>
            <p className="text-muted-foreground">Transactions will appear here once you add or spend funds</p>
          </div>
        ) : (
          transactionsWithAccounts.map((transaction) => (
            <div 
              key={transaction.id} 
              className="flex items-center justify-between p-3 bg-muted rounded-lg"
              data-testid={`transaction-${transaction.id}`}
            >
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  transaction.type === "credit" ? "bg-green-100" : "bg-red-100"
                }`}>
                  <i className={`fas ${transaction.type === "credit" ? "fa-plus text-green-600" : "fa-minus text-red-600"}`}></i>
                </div>
                <div>
                  <p className="font-medium text-foreground" data-testid={`text-description-${transaction.id}`}>
                    {transaction.description}
                  </p>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <span data-testid={`text-account-${transaction.id}`}>
                      {transaction.account?.name}'s Account
                    </span>
                    <span>•</span>
                    <span data-testid={`text-date-${transaction.id}`}>
                      {new Date(transaction.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
              <span 
                className={`font-semibold ${transaction.type === "credit" ? "text-green-600" : "text-red-600"}`}
                data-testid={`text-amount-${transaction.id}`}
              >
                {transaction.type === "credit" ? "+" : "-"}${transaction.amount}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
