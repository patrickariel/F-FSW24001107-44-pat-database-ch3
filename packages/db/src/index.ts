import { PrismaClient } from "@prisma/client";

export type {
  Product,
  User,
  CartItem,
  Review,
  PrismaClient,
} from "@prisma/client";
export const db = new PrismaClient();
