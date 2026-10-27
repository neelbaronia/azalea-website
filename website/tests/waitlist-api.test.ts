import { NextRequest } from "next/server";
import { beforeEach, expect, it, vi } from "vitest";
import { POST } from "@/app/api/waitlist/route";

const database = vi.hoisted(() => ({ insert: vi.fn(), from: vi.fn() }));
vi.mock("@/lib/supabase/admin", () => ({ createAdminClient: () => database }));
beforeEach(() => {
  vi.clearAllMocks();
  database.from.mockReturnValue(database);
  database.insert.mockResolvedValue({ error: null });
});

function request(body: unknown, headers: Record<string, string> = {}) {
  return new NextRequest("https://www.azalea-labs.com/api/waitlist", {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
}

it("normalizes and saves an email without creating an account", async () => {
  const response = await POST(request({ email: "  Reader@Example.com  " }));
  expect(response.status).toBe(201);
  expect(database.from).toHaveBeenCalledWith("waitlist");
  expect(database.insert).toHaveBeenCalledWith({ email: "reader@example.com" });
  expect(await response.json()).toEqual({
    success: true,
    alreadySubscribed: false,
  });
});

it.each([
  null,
  [],
  "hello",
  { email: null },
  { email: 123 },
  { email: "bad-email" },
  { email: "x".repeat(254) + "@example.com" },
])("rejects invalid input %j", async (body) => {
  expect((await POST(request(body))).status).toBe(400);
  expect(database.insert).not.toHaveBeenCalled();
});

it("handles malformed JSON", async () => {
  const response = await POST(
    new NextRequest("https://www.azalea-labs.com/api/waitlist", {
      method: "POST",
      body: "{",
    }),
  );
  expect(response.status).toBe(400);
});

it("accepts a native form POST", async () => {
  const response = await POST(
    new NextRequest("https://www.azalea-labs.com/api/waitlist", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: "email=reader%40example.com&website=",
    }),
  );
  expect(response.status).toBe(201);
});

it("returns success for duplicate emails without another conversion", async () => {
  database.insert.mockResolvedValue({ error: { code: "23505" } });
  const response = await POST(request({ email: "reader@example.com" }));
  expect(response.status).toBe(200);
  expect(await response.json()).toEqual({
    success: true,
    alreadySubscribed: true,
  });
});

it("does not write a filled honeypot", async () => {
  const response = await POST(
    request({ email: "reader@example.com", website: "https://spam.example" }),
  );
  expect(response.status).toBe(200);
  expect(database.insert).not.toHaveBeenCalled();
});

it("rejects a different origin", async () => {
  expect(
    (
      await POST(
        request(
          { email: "reader@example.com" },
          { origin: "https://other.example" },
        ),
      )
    ).status,
  ).toBe(403);
  expect(database.insert).not.toHaveBeenCalled();
});

it("accepts our own origin", async () => {
  expect(
    (
      await POST(
        request(
          { email: "reader@example.com" },
          { origin: "https://www.azalea-labs.com" },
        ),
      )
    ).status,
  ).toBe(201);
});

it("rejects oversized requests", async () => {
  expect(
    (
      await POST(
        request({ email: "reader@example.com" }, { "content-length": "5000" }),
      )
    ).status,
  ).toBe(413);
  expect(
    (
      await POST(
        request({ email: "reader@example.com", padding: "x".repeat(5000) }),
      )
    ).status,
  ).toBe(413);
  expect(database.insert).not.toHaveBeenCalled();
});

it("fails honestly when the database is unavailable", async () => {
  vi.spyOn(console, "error").mockImplementation(() => {});
  database.insert.mockResolvedValue({ error: { code: "unavailable" } });
  const response = await POST(request({ email: "reader@example.com" }));
  expect(response.status).toBe(503);
  expect((await response.json()).success).toBeUndefined();
});

it("throttles repeated attempts from one IP", async () => {
  for (let count = 0; count < 8; count += 1)
    expect(
      (
        await POST(
          request(
            { email: "reader@example.com" },
            { "x-real-ip": "192.0.2.17" },
          ),
        )
      ).status,
    ).toBe(201);
  const response = await POST(
    request({ email: "reader@example.com" }, { "x-real-ip": "192.0.2.17" }),
  );
  expect(response.status).toBe(429);
  expect(response.headers.get("retry-after")).toBe("300");
});
