import { OpenAPI } from "../src/Core.ts";
import { assertEquals } from "@std/assert";

Deno.test("OpenAPI constructor initializes with default values", () => {
  // Use the private property accessor trick to get access to the raw data
  const api = new OpenAPI();
  const raw = api.getJSON();

  assertEquals(raw.openapi, "3.1.0");
  assertEquals(raw.info.title, "OpenAPI 3.1.0");
  assertEquals(raw.info.version, "1.0.0");
});

Deno.test("OpenAPI setters correctly update info properties", () => {
  const api = new OpenAPI()
    .setTitle("Test API")
    .setVersion("2.0.0")
    .setDescription("Test Description")
    .setTermsOfService("https://example.com/terms")
    .setContactName("John Doe")
    .setContactEmail("john@example.com")
    .setContactUrl("https://example.com/contact")
    .setLicenseName("MIT")
    .setLicenseUrl("https://opensource.org/licenses/MIT")
    .setLicenseIdentifier("MIT");

  const raw = api.getJSON();

  assertEquals(raw.info.title, "Test API");
  assertEquals(raw.info.version, "2.0.0");
  assertEquals(raw.info.description, "Test Description");
  assertEquals(raw.info.termsOfService, "https://example.com/terms");
  assertEquals(raw.info.contact?.name, "John Doe");
  assertEquals(raw.info.contact?.email, "john@example.com");
  assertEquals(raw.info.contact?.url, "https://example.com/contact");
  assertEquals(raw.info.license?.name, "MIT");
  assertEquals(raw.info.license?.url, "https://opensource.org/licenses/MIT");
  assertEquals(raw.info.license?.identifier, "MIT");
});

Deno.test("OpenAPI license initialization happens correctly", () => {
  const api = new OpenAPI()
    .setLicenseIdentifier("Apache-2.0");

  const raw = api.getJSON();

  assertEquals(raw.info.license?.name, "");
  assertEquals(raw.info.license?.identifier, "Apache-2.0");
  assertEquals(raw.info.license?.url, undefined);
});

Deno.test("OpenAPI contact initialization happens correctly", () => {
  const api = new OpenAPI()
    .setContactEmail("test@example.com");

  const raw = api.getJSON();

  assertEquals(raw.info.contact?.email, "test@example.com");
  assertEquals(raw.info.contact?.name, undefined);
  assertEquals(raw.info.contact?.url, undefined);
});
