import { PrismaClient } from "@prisma/client";

export type { Product, User, CartItem, Review } from "@prisma/client";
export const prisma = new PrismaClient();
