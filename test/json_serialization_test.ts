import { OpenAPI } from "../src/OpenAPI.ts";
import { assertEquals } from "jsr:@std/assert";

Deno.test("OpenAPI JSON string serialization", () => {
  const api = new OpenAPI({
    title: "JSON Test API",
    version: "1.0.0",
  });

  const jsonString = api.getJSONString();
  const parsed = JSON.parse(jsonString);

  assertEquals(parsed.openapi, "3.1.0");
  assertEquals(parsed.info.title, "JSON Test API");
});
