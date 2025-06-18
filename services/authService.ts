import { User } from "../types";

const USER_KEY = "realtyboost_user";
const ALL_USERS_KEY = "realtyboost_all_users"; // For simulating a user database

const generateId = (): string => Math.random().toString(36).substring(2, 11);

// Helper to get all users from localStorage
const getAllStoredUsers = (): User[] => {
  const usersJson = localStorage.getItem(ALL_USERS_KEY);
  return usersJson ? JSON.parse(usersJson) : [];
};

// Helper to save all users to localStorage
const saveAllStoredUsers = (users: User[]): void => {
  localStorage.setItem(ALL_USERS_KEY, JSON.stringify(users));
};

export const signup = async (
  email: string,
  password: string,
): Promise<User> => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  const users = getAllStoredUsers();
  const existingUser = users.find((u) => u.email === email);

  if (existingUser) {
    throw new Error("User with this email already exists.");
  }

  // In a real app, password would be hashed
  const newUser: User = { id: generateId(), email };
  users.push(newUser);
  saveAllStoredUsers(users);

  // For simplicity, we don't store password in this mock
  // We also don't automatically log them in here, they need to go to login page.
  return { id: newUser.id, email: newUser.email };
};

export const login = async (email: string, password: string): Promise<User> => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  const users = getAllStoredUsers();
  // Password check is omitted for this mock as we don't store passwords.
  // In a real app, you'd compare the provided password (hashed) with the stored hash.
  const user = users.find((u) => u.email === email);

  if (!user) {
    throw new Error("Invalid email or password.");
  }

  // Simulate successful login: store the "session"
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  return user;
};

export const logout = (): void => {
  localStorage.removeItem(USER_KEY);
};

export const getCurrentUser = (): User | null => {
  const userJson = localStorage.getItem(USER_KEY);
  if (userJson) {
    return JSON.parse(userJson) as User;
  }
  return null;
};
