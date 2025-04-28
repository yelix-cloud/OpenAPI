import { OpenAPI } from "../src/Core.ts";
import { assertEquals } from "@std/assert";

Deno.test("setExternalDocs sets external documentation", () => {
  const api = new OpenAPI().setExternalDocs(
    "https://example.com/docs",
    "API Documentation",
  );
  const raw = api.getJSON();

  assertEquals(raw.externalDocs?.url, "https://example.com/docs");
  assertEquals(raw.externalDocs?.description, "API Documentation");
});
