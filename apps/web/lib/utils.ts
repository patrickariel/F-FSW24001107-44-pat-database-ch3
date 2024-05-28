import _ from "lodash";
import short from "short-uuid";
import type { Tuple } from "ts-toolbelt";

export const uuidTranslator = short(short.constants.flickrBase58);

export function getBaseUrl() {
  if (typeof window !== "undefined") return "";
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  if (process.env.RENDER_INTERNAL_HOSTNAME)
    return `http://${process.env.RENDER_INTERNAL_HOSTNAME}:${process.env.PORT}`;

  return `http://localhost:${process.env.PORT ?? 3000}`;
}

export const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function fixed<I, N extends number>(iter: (num: number) => I, count: N) {
  return _.times(count, iter) as Tuple.Repeat<I, N>;
}
