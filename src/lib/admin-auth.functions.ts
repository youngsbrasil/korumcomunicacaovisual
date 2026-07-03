import { createServerFn } from "@tanstack/react-start";
import { createHash, timingSafeEqual, randomBytes, createHmac } from "node:crypto";

function sign(token: string, secret: string) {
  return createHmac("sha256", secret).update(token).digest("hex");
}

function passwordMatches(input: string, expected: string) {
  const a = createHash("sha256").update(input, "utf8").digest();
  const b = createHash("sha256").update(expected, "utf8").digest();
  return a.length === b.length && timingSafeEqual(a, b);
}

export const adminLogin = createServerFn({ method: "POST" })
  .inputValidator((data: { password: string }) => {
    if (!data || typeof data.password !== "string") throw new Error("Invalid input");
    return { password: data.password.slice(0, 256) };
  })
  .handler(async ({ data }) => {
    const expected = process.env.ADMIN_PASSWORD;
    const secret = process.env.ADMIN_SESSION_SECRET;
    if (!expected || !secret) {
      return { ok: false as const, error: "Server not configured" };
    }
    if (!passwordMatches(data.password, expected)) {
      return { ok: false as const };
    }
    const raw = randomBytes(24).toString("hex");
    const token = `${raw}.${sign(raw, secret)}`;
    return { ok: true as const, token };
  });

export const adminVerify = createServerFn({ method: "POST" })
  .inputValidator((data: { token: string }) => {
    if (!data || typeof data.token !== "string") throw new Error("Invalid input");
    return { token: data.token.slice(0, 512) };
  })
  .handler(async ({ data }) => {
    const secret = process.env.ADMIN_SESSION_SECRET;
    if (!secret) return { ok: false as const };
    const [raw, sig] = data.token.split(".");
    if (!raw || !sig) return { ok: false as const };
    const expected = sign(raw, secret);
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return { ok: false as const };
    return { ok: true as const };
  });
