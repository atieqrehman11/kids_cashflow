import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { type Account } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface AccountCardProps {
  account: Account;
}

const gradientColors = [
  "from-blue-500 to-purple-600",
  "from-green-500 to-blue-600", 
  "from-purple-500 to-pink-600",
  "from-orange-500 to-red-600",
  "from-teal-500 to-green-600",
];

const avatarGradients = [
  "from-pink-400 to-purple-500",
  "from-green-400 to-blue-500",
  "from-purple-400 to-pink-500",
  "from-orange-400 to-red-500",
  "from-teal-400 to-green-500",
];

export default function AccountCard({ account }: AccountCardProps) {
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [transactionType, setTransactionType] = useState<"credit" | "debit">("credit");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const deleteAccountMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/accounts/${account.id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/accounts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({ title: "Account deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete account", variant: "destructive" });
    },
  });

  const transactionMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/transactions", {
        accountId: account.id,
        type: transactionType,
        amount,
        description: description || (transactionType === "credit" ? "Funds added" : "Purchase"),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/accounts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      setIsTransactionModalOpen(false);
      setAmount("");
      setDescription("");
      toast({ 
        title: `Transaction completed`, 
        description: `${transactionType === "credit" ? "Added" : "Deducted"} $${amount} ${transactionType === "credit" ? "to" : "from"} ${account.name}'s account`
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

  const gradientIndex = Math.abs(account.id.charCodeAt(0)) % gradientColors.length;
  const avatarGradientIndex = Math.abs(account.id.charCodeAt(0)) % avatarGradients.length;
  
  const initials = account.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

  const handleTransaction = () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast({ title: "Please enter a valid amount", variant: "destructive" });
      return;
    }

    if (transactionType === "debit" && parseFloat(amount) > parseFloat(account.balance)) {
      toast({ title: "Insufficient funds", variant: "destructive" });
      return;
    }

    transactionMutation.mutate();
  };

  return (
    <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden" data-testid={`card-account-${account.id}`}>
      <div className={`bg-gradient-to-r ${gradientColors[gradientIndex]} h-3`}></div>
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`w-12 h-12 bg-gradient-to-br ${avatarGradients[avatarGradientIndex]} rounded-full flex items-center justify-center text-white font-bold text-lg`}>
              <span data-testid={`text-initials-${account.id}`}>{initials}</span>
            </div>
            <div>
              <h3 className="font-semibold text-foreground" data-testid={`text-name-${account.id}`}>
                {account.name}'s Account
              </h3>
              <p className="text-sm text-muted-foreground" data-testid={`text-age-${account.id}`}>
                Age {account.age}
              </p>
            </div>
          </div>
          <div className="flex space-x-2">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button 
                  className="text-muted-foreground hover:text-destructive" 
                  data-testid={`button-delete-${account.id}`}
                >
                  <i className="fas fa-trash"></i>
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Account</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete {account.name}'s account? This action cannot be undone and will remove all transaction history.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel data-testid={`button-cancel-delete-${account.id}`}>Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={() => deleteAccountMutation.mutate()}
                    className="bg-destructive hover:bg-destructive/90"
                    data-testid={`button-confirm-delete-${account.id}`}
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Current Balance</span>
            <span className="text-2xl font-bold text-green-600" data-testid={`text-balance-${account.id}`}>
              ${account.balance}
            </span>
          </div>
          
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Created</span>
            <span className="text-foreground" data-testid={`text-created-${account.id}`}>
              {new Date(account.createdAt).toLocaleDateString()}
            </span>
          </div>
          
          <div className="flex space-x-2 pt-4">
            <Dialog open={isTransactionModalOpen} onOpenChange={setIsTransactionModalOpen}>
              <DialogTrigger asChild>
                <button 
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                  onClick={() => setTransactionType("credit")}
                  data-testid={`button-add-funds-${account.id}`}
                >
                  <i className="fas fa-plus mr-2"></i>Add Funds
                </button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {transactionType === "credit" ? "Add Funds" : "Debit Funds"} - {account.name}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Transaction Type</Label>
                    <RadioGroup value={transactionType} onValueChange={(value: "credit" | "debit") => setTransactionType(value)}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="credit" id="credit" />
                        <Label htmlFor="credit">Add Funds (Credit)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="debit" id="debit" />
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
                        data-testid={`input-amount-${account.id}`}
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
                      data-testid={`input-description-${account.id}`}
                    />
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <Button 
                      onClick={handleTransaction}
                      disabled={transactionMutation.isPending}
                      className="flex-1"
                      data-testid={`button-submit-transaction-${account.id}`}
                    >
                      {transactionMutation.isPending ? "Processing..." : "Process Transaction"}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setIsTransactionModalOpen(false)}
                      data-testid={`button-cancel-transaction-${account.id}`}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            
            <button 
              className="flex-1 bg-orange-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-orange-700 transition-colors"
              onClick={() => {
                setTransactionType("debit");
                setIsTransactionModalOpen(true);
              }}
              data-testid={`button-debit-funds-${account.id}`}
            >
              <i className="fas fa-minus mr-2"></i>Debit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
