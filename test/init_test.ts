import { OpenAPI } from "../src/OpenAPI.ts";
import { parse as parseYAML } from "jsr:@eemeli/yaml";
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

Deno.test("OpenAPI YAML string serialization", () => {
  const api = new OpenAPI({
    title: "YAML Test API",
    version: "1.0.0",
  });

  const yamlString = api.getYAMLString();
  const parsed = parseYAML(yamlString);

  // More precise YAML validation using the parsed object
  assertEquals(parsed.openapi, "3.1.0");
  assertEquals(parsed.info.title, "YAML Test API");
  assertEquals(parsed.info.version, "1.0.0");
  assertEquals(parsed.info.description, "OpenAPI API Documentation");
  assertEquals(parsed.paths, {});
  assertEquals(parsed.servers?.length ?? 0, 0);
});
