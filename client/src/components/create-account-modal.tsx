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
  const [age, setAge] = useState("");
  const [initialBalance, setInitialBalance] = useState("");
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createAccountMutation = useMutation({
    mutationFn: async () => {
      const accountData = {
        name: name.trim(),
        age: parseInt(age),
        balance: initialBalance ? parseFloat(initialBalance).toFixed(2) : "0.00",
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
    setAge("");
    setInitialBalance("");
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast({ title: "Please enter a name", variant: "destructive" });
      return;
    }
    
    if (!age || parseInt(age) < 1 || parseInt(age) > 18) {
      toast({ title: "Please enter a valid age (1-18)", variant: "destructive" });
      return;
    }

    if (initialBalance && parseFloat(initialBalance) < 0) {
      toast({ title: "Initial balance cannot be negative", variant: "destructive" });
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
            <Label htmlFor="name">Child's Name</Label>
            <Input
              id="name"
              placeholder="Enter child's name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              data-testid="input-account-name"
            />
          </div>

          <div>
            <Label htmlFor="age">Age</Label>
            <Input
              id="age"
              type="number"
              min="1"
              max="18"
              placeholder="Age"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              data-testid="input-account-age"
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
