import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";

type UserRole = "admin" | "manager" | "panel";

export interface RequestUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

export interface Context {
  user: RequestUser;
}

const allowedRoles: Record<string, UserRole> = {
  admin: "admin",
  manager: "manager",
  panel: "panel",
};

export const createContext = ({ req }: CreateExpressContextOptions): Context => {
  const requestedRole = (req.header("x-user-role") ?? "admin").toLowerCase();
  const role = allowedRoles[requestedRole] ?? "admin";

  return {
    user: {
      id: req.header("x-user-id") ?? "demo-user",
      email: req.header("x-user-email") ?? "mohammad.sudally@baynunah.ae",
      name: req.header("x-user-name") ?? "Baynunah Talent Ops",
      role,
    },
  };
};
