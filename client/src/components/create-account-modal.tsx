import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface CreateAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateAccountModal({ isOpen, onClose }: CreateAccountModalProps) {
  const [name, setName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [initialBalance, setInitialBalance] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createAccountMutation = useMutation({
    mutationFn: async () => {
      const accountData = {
        name: name.trim(),
        dateOfBirth: new Date(dateOfBirth), // Convert to Date object
        balance: initialBalance ? parseFloat(initialBalance).toFixed(2) : "0.00",
        email: email.trim(),
        password: password.trim(),
      };

      const response = await apiRequest("POST", "/api/accounts", accountData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/accounts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({ title: "Account created successfully" });
      handleClose();
    },
    onError: (error: any) => {
      toast({ 
        title: "Failed to create account", 
        description: error.message || "Please try again",
        variant: "destructive" 
      });
    },
  });

  const handleClose = () => {
    setName("");
    setDateOfBirth("");
    setInitialBalance("");
    setEmail("");
    setPassword("");
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast({ title: "Please enter a name", variant: "destructive" });
      return;
    }

    if (!dateOfBirth || !dateOfBirth.trim()) {
      toast({ title: "Please enter a valid date of birth", variant: "destructive" });
      return;
    }

    const enteredDate = new Date(dateOfBirth);
    if (Number.isNaN(enteredDate.getTime())) {
      toast({ title: "Invalid date format", variant: "destructive" });
      return;
    }

    const currentDate = new Date();
    const fiveYearsAgo = new Date();
    fiveYearsAgo.setFullYear(currentDate.getFullYear() - 5);

    if (enteredDate > fiveYearsAgo) {
      toast({ title: "Date of birth must be at least 5 years before today", variant: "destructive" });
      return;
    }

    if (initialBalance && parseFloat(initialBalance) < 0) {
      toast({ title: "Initial balance cannot be negative", variant: "destructive" });
      return;
    }

    if (!email.trim()) {
      toast({ title: "Please enter an email", variant: "destructive" });
      return;
    }

    if (!password.trim()) {
      toast({ title: "Please enter a password", variant: "destructive" });
      return;
    }

    createAccountMutation.mutate();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Account</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder="Enter name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              data-testid="input-account-name"
            />
          </div>

          <div>
            <Label htmlFor="dateOfBirth">Date of Birth</Label>
            <Input
              id="dateOfBirth"
              type="date"
              placeholder="YYYY-MM-DD"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              data-testid="input-account-dateOfBirth"
            />
          </div>

          <div>
            <Label htmlFor="initialBalance">Initial Balance (Optional)</Label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-muted-foreground">$</span>
              <Input
                id="initialBalance"
                type="number"
                step="0.01"
                placeholder="0.00"
                className="pl-8"
                value={initialBalance}
                onChange={(e) => setInitialBalance(e.target.value)}
                data-testid="input-initial-balance"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              data-testid="input-account-email"
            />
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              data-testid="input-account-password"
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <Button 
              type="submit" 
              disabled={createAccountMutation.isPending}
              className="flex-1"
              data-testid="button-create-account"
            >
              {createAccountMutation.isPending ? "Creating..." : "Create Account"}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose}
              data-testid="button-cancel-create"
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
