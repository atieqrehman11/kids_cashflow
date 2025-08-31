import { type User, type InsertUser, type Account, type InsertAccount, type Transaction, type InsertTransaction } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User methods (existing)
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Account methods
  getAllAccounts(): Promise<Account[]>;
  getAccount(id: string): Promise<Account | undefined>;
  createAccount(account: InsertAccount): Promise<Account>;
  updateAccount(id: string, account: Partial<InsertAccount>): Promise<Account | undefined>;
  deleteAccount(id: string): Promise<boolean>;
  updateAccountBalance(id: string, newBalance: string): Promise<Account | undefined>;
  
  // Transaction methods
  getAllTransactions(): Promise<Transaction[]>;
  getTransactionsByAccount(accountId: string): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  getRecentTransactions(limit?: number): Promise<Transaction[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private accounts: Map<string, Account>;
  private transactions: Map<string, Transaction>;

  constructor() {
    this.users = new Map();
    this.accounts = new Map();
    this.transactions = new Map();
  }

  // User methods (existing)
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Account methods
  async getAllAccounts(): Promise<Account[]> {
    return Array.from(this.accounts.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getAccount(id: string): Promise<Account | undefined> {
    return this.accounts.get(id);
  }

  async createAccount(insertAccount: InsertAccount): Promise<Account> {
    const id = randomUUID();
    const account: Account = {
      ...insertAccount,
      id,
      balance: insertAccount.balance || "0.00",
      createdAt: new Date(),
    };
    this.accounts.set(id, account);
    return account;
  }

  async updateAccount(id: string, updateData: Partial<InsertAccount>): Promise<Account | undefined> {
    const account = this.accounts.get(id);
    if (!account) return undefined;
    
    const updatedAccount = { ...account, ...updateData };
    this.accounts.set(id, updatedAccount);
    return updatedAccount;
  }

  async deleteAccount(id: string): Promise<boolean> {
    const deleted = this.accounts.delete(id);
    if (deleted) {
      // Also delete all transactions for this account
      const accountTransactions = Array.from(this.transactions.entries())
        .filter(([, transaction]) => transaction.accountId === id);
      accountTransactions.forEach(([transactionId]) => {
        this.transactions.delete(transactionId);
      });
    }
    return deleted;
  }

  async updateAccountBalance(id: string, newBalance: string): Promise<Account | undefined> {
    const account = this.accounts.get(id);
    if (!account) return undefined;
    
    const updatedAccount = { ...account, balance: newBalance };
    this.accounts.set(id, updatedAccount);
    return updatedAccount;
  }

  // Transaction methods
  async getAllTransactions(): Promise<Transaction[]> {
    return Array.from(this.transactions.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getTransactionsByAccount(accountId: string): Promise<Transaction[]> {
    return Array.from(this.transactions.values())
      .filter(transaction => transaction.accountId === accountId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const id = randomUUID();
    const transaction: Transaction = {
      ...insertTransaction,
      id,
      createdAt: new Date(),
    };
    this.transactions.set(id, transaction);
    return transaction;
  }

  async getRecentTransactions(limit: number = 10): Promise<Transaction[]> {
    const allTransactions = Array.from(this.transactions.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    return allTransactions.slice(0, limit);
  }
}

export const storage = new MemStorage();
