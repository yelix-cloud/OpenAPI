import { OpenAPI } from "../src/Core.ts";
import { assertEquals } from "@std/assert";

Deno.test("setJsonSchemaDialect sets the correct schema dialect", () => {
  const api = new OpenAPI().setJsonSchemaDialect(
    "https://json-schema.org/draft/2020-12/schema",
  );
  const raw = api.getJSON();

  assertEquals(
    raw.jsonSchemaDialect,
    "https://json-schema.org/draft/2020-12/schema",
  );
});
