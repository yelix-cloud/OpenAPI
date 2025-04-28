import { OpenAPI } from "../src/Core.ts";
import { assertEquals } from "@std/assert";

Deno.test("setTag adds a single tag", () => {
  const api = new OpenAPI().setTag("users", "User operations");
  const raw = api.getJSON();

  assertEquals(raw.tags?.[0].name, "users");
  assertEquals(raw.tags?.[0].description, "User operations");
});

Deno.test("setTags adds multiple tags", () => {
  const api = new OpenAPI().setTags(["users", "products", "orders"]);
  const raw = api.getJSON();

  assertEquals(raw.tags?.length, 3);
  assertEquals(raw.tags?.[0].name, "users");
  assertEquals(raw.tags?.[2].name, "orders");
});
