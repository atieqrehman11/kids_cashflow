import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertAccountSchema, insertTransactionSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Account routes
  app.get("/api/accounts", async (req, res) => {
    try {
      const accounts = await storage.getAllAccounts();
      res.json(accounts);
    } catch (error) {
      console.error("❌ API error:", error);
      res.status(500).json({ message: "Failed to fetch accounts" });
    }
  });

  app.get("/api/accounts/:id", async (req, res) => {
    try {
      const account = await storage.getAccount(req.params.id);
      if (!account) {
        return res.status(404).json({ message: "Account not found" });
      }
      res.json(account);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch account" });
    }
  });

  app.post("/api/accounts", async (req, res) => {
    try {
      const validatedData = insertAccountSchema.parse(req.body);
      const account = await storage.createAccount(validatedData);
      res.status(201).json(account);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid account data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create account" });
    }
  });

  app.patch("/api/accounts/:id", async (req, res) => {
    try {
      const updateData = insertAccountSchema.partial().parse(req.body);
      const account = await storage.updateAccount(req.params.id, updateData);
      if (!account) {
        return res.status(404).json({ message: "Account not found" });
      }
      res.json(account);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid account data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update account" });
    }
  });

  app.delete("/api/accounts/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteAccount(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Account not found" });
      }
      res.json({ message: "Account deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete account" });
    }
  });

  // Transaction routes
  app.get("/api/transactions", async (req, res) => {
    try {
      const { accountId, limit } = req.query;
      let transactions;
      
      if (accountId) {
        transactions = await storage.getTransactionsByAccount(accountId as string);
      } else if (limit) {
        transactions = await storage.getRecentTransactions(parseInt(limit as string));
      } else {
        transactions = await storage.getAllTransactions();
      }
      
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  app.post("/api/transactions", async (req, res) => {
    try {
      const validatedData = insertTransactionSchema.parse(req.body);
      
      // Get the account to check balance for debit transactions
      const account = await storage.getAccount(validatedData.accountId);
      if (!account) {
        return res.status(404).json({ message: "Account not found" });
      }

      const currentBalance = parseFloat(account.balance);
      const transactionAmount = parseFloat(validatedData.amount);

      // For debit transactions, check if there are sufficient funds
      if (validatedData.type === "debit" && currentBalance < transactionAmount) {
        return res.status(400).json({ 
          message: "Insufficient funds",
          currentBalance: account.balance,
          requestedAmount: validatedData.amount
        });
      }

      // Create the transaction
      const transaction = await storage.createTransaction(validatedData);

      // Update account balance
      let newBalance;
      if (validatedData.type === "credit") {
        newBalance = (currentBalance + transactionAmount).toFixed(2);
      } else {
        newBalance = (currentBalance - transactionAmount).toFixed(2);
      }

      await storage.updateAccountBalance(validatedData.accountId, newBalance);

      res.status(201).json(transaction);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid transaction data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create transaction" });
    }
  });

  // Dashboard stats route
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const accounts = await storage.getAllAccounts();
      const totalBalance = accounts.reduce((sum, account) => sum + parseFloat(account.balance), 0);
      
      // Calculate this month's transactions
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const allTransactions = await storage.getAllTransactions();
      const monthlyTransactions = allTransactions.filter(
        transaction => new Date(transaction.createdAt) >= startOfMonth
      );
      const monthlyAmount = monthlyTransactions.reduce((sum, transaction) => {
        const amount = parseFloat(transaction.amount);
        return transaction.type === "credit" ? sum + amount : sum - amount;
      }, 0);

      res.json({
        totalAccounts: accounts.length,
        totalBalance: totalBalance.toFixed(2),
        monthlyTransactions: Math.abs(monthlyAmount).toFixed(2)
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
