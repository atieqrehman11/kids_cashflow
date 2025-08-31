import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { type Account } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TransactionFormProps {
  accounts: Account[];
}

export default function TransactionForm({ accounts }: TransactionFormProps) {
  const [selectedAccountId, setSelectedAccountId] = useState("");
  const [transactionType, setTransactionType] = useState<"credit" | "debit">("credit");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const transactionMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/transactions", {
        accountId: selectedAccountId,
        type: transactionType,
        amount,
        description: description || (transactionType === "credit" ? "Funds added" : "Purchase"),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/accounts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      
      // Reset form
      setSelectedAccountId("");
      setAmount("");
      setDescription("");
      
      const selectedAccount = accounts.find(acc => acc.id === selectedAccountId);
      toast({ 
        title: "Transaction completed", 
        description: `${transactionType === "credit" ? "Added" : "Deducted"} $${amount} ${transactionType === "credit" ? "to" : "from"} ${selectedAccount?.name}'s account`
      });
    },
    onError: (error: any) => {
      toast({ 
        title: "Transaction failed", 
        description: error.message || "Please try again",
        variant: "destructive" 
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedAccountId) {
      toast({ title: "Please select an account", variant: "destructive" });
      return;
    }
    
    if (!amount || parseFloat(amount) <= 0) {
      toast({ title: "Please enter a valid amount", variant: "destructive" });
      return;
    }

    if (transactionType === "debit") {
      const selectedAccount = accounts.find(acc => acc.id === selectedAccountId);
      if (selectedAccount && parseFloat(amount) > parseFloat(selectedAccount.balance)) {
        toast({ title: "Insufficient funds", variant: "destructive" });
        return;
      }
    }

    transactionMutation.mutate();
  };

  return (
    <div className="bg-card rounded-xl border border-border shadow-sm p-6">
      <h3 className="text-xl font-semibold text-foreground mb-6">
        <i className="fas fa-exchange-alt mr-2 text-primary"></i>
        Add Transaction
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label>Select Account</Label>
          <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
            <SelectTrigger data-testid="select-account">
              <SelectValue placeholder="Choose an account..." />
            </SelectTrigger>
            <SelectContent>
              {accounts.map((account) => (
                <SelectItem key={account.id} value={account.id}>
                  {account.name}'s Account (${account.balance})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Transaction Type</Label>
          <RadioGroup value={transactionType} onValueChange={(value: "credit" | "debit") => setTransactionType(value)}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="credit" id="credit" data-testid="radio-credit" />
              <Label htmlFor="credit">Add Funds (Credit)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="debit" id="debit" data-testid="radio-debit" />
              <Label htmlFor="debit">Spend Money (Debit)</Label>
            </div>
          </RadioGroup>
        </div>

        <div>
          <Label htmlFor="amount">Amount</Label>
          <div className="relative">
            <span className="absolute left-3 top-2 text-muted-foreground">$</span>
            <Input
              id="amount"
              type="number"
              step="0.01"
              placeholder="0.00"
              className="pl-8"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              data-testid="input-transaction-amount"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Input
            id="description"
            placeholder="What was this for?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            data-testid="input-transaction-description"
          />
        </div>

        <div className="flex space-x-3 pt-4">
          <Button 
            type="submit" 
            disabled={transactionMutation.isPending}
            className="flex-1"
            data-testid="button-process-transaction"
          >
            {transactionMutation.isPending ? "Processing..." : "Process Transaction"}
          </Button>
          <Button 
            type="button" 
            variant="outline"
            onClick={() => {
              setSelectedAccountId("");
              setAmount("");
              setDescription("");
            }}
            data-testid="button-clear-form"
          >
            Clear
          </Button>
        </div>
      </form>
    </div>
  );
}
