import { useQuery } from "@tanstack/react-query";
import { type Transaction, type Account } from "@shared/schema";

interface TransactionWithAccount extends Transaction {
  account?: Account;
}

export default function TransactionsPage() {
  const { data: transactions = [], isLoading: transactionsLoading } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions"],
  });

  const { data: accounts = [] } = useQuery<Account[]>({
    queryKey: ["/api/accounts"],
  });

  // Combine transaction data with account names
  const transactionsWithAccounts: TransactionWithAccount[] = transactions.map(transaction => ({
    ...transaction,
    account: accounts.find(acc => acc.id === transaction.accountId)
  }));

  if (transactionsLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Transaction History</h1>
          <p className="text-muted-foreground mt-1">View all transactions across all accounts</p>
        </div>
        
        <div className="bg-card rounded-xl border border-border shadow-sm p-6">
          <div className="space-y-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gray-200 rounded-lg animate-pulse"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-32"></div>
                    <div className="h-3 bg-gray-200 rounded animate-pulse w-48"></div>
                  </div>
                </div>
                <div className="h-6 bg-gray-200 rounded animate-pulse w-20"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Transaction History</h1>
        <p className="text-muted-foreground mt-1">View all transactions across all accounts</p>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-foreground">
            <i className="fas fa-receipt mr-2 text-primary"></i>
            All Transactions
          </h2>
          <div className="text-sm text-muted-foreground">
            Total: {transactionsWithAccounts.length} transactions
          </div>
        </div>

        <div className="space-y-4">
          {transactionsWithAccounts.length === 0 ? (
            <div className="text-center py-12">
              <i className="fas fa-receipt text-4xl text-muted-foreground mb-4"></i>
              <h3 className="text-lg font-semibold text-foreground mb-2">No transactions yet</h3>
              <p className="text-muted-foreground">Transactions will appear here once you add or spend funds</p>
            </div>
          ) : (
            transactionsWithAccounts.map((transaction) => (
              <div 
                key={transaction.id} 
                className="flex items-center justify-between p-4 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
                data-testid={`transaction-row-${transaction.id}`}
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                    transaction.type === "credit" ? "bg-green-100" : "bg-red-100"
                  }`}>
                    <i className={`fas ${transaction.type === "credit" ? "fa-plus text-green-600" : "fa-minus text-red-600"} text-lg`}></i>
                  </div>
                  <div>
                    <p className="font-medium text-foreground" data-testid={`text-transaction-description-${transaction.id}`}>
                      {transaction.description}
                    </p>
                    <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                      <span data-testid={`text-transaction-account-${transaction.id}`}>
                        {transaction.account?.name}'s Account
                      </span>
                      <span>•</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        transaction.type === "credit" 
                          ? "bg-green-100 text-green-700" 
                          : "bg-red-100 text-red-700"
                      }`}>
                        {transaction.type === "credit" ? "Credit" : "Debit"}
                      </span>
                      <span>•</span>
                      <span data-testid={`text-transaction-date-${transaction.id}`}>
                        {new Date(transaction.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span 
                    className={`text-lg font-semibold ${transaction.type === "credit" ? "text-green-600" : "text-red-600"}`}
                    data-testid={`text-transaction-amount-${transaction.id}`}
                  >
                    {transaction.type === "credit" ? "+" : "-"}${transaction.amount}
                  </span>
                  <div className="text-sm text-muted-foreground">
                    Balance: ${transaction.account?.balance || "0.00"}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}