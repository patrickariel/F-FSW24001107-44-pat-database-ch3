import { PrismaClient } from "@prisma/client";

export type {
  Product,
  User,
  CartItem,
  Review,
  PrismaClient,
  Prisma,
} from "@prisma/client";

export {
  ProductSchema,
  UserSchema,
  CartItemSchema,
  ReviewSchema,
} from "../prisma/generated/zod";

export const db = new PrismaClient();
