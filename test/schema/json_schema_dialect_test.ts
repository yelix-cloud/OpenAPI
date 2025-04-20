import { OpenAPI, SCHEMA_DIALECTS } from "../../src/OpenAPI.ts";
import { assertEquals } from "jsr:@std/assert";

Deno.test("JSON Schema Dialects", async (t) => {
  await t.step("should default to 2020-12 dialect", () => {
    const api = new OpenAPI({
      title: "Test API",
      version: "1.0.0",
    });

    const doc = api.getJSON();
    assertEquals(
      doc.jsonSchemaDialect,
      "https://json-schema.org/draft/2020-12/schema",
      "Should default to 2020-12 dialect",
    );
  });

  await t.step("should set and get JSON Schema dialect", () => {
    const api = new OpenAPI({
      title: "Test API",
      version: "1.0.0",
    });

    // Set to a different dialect
    api.setJSONSchemaDialect(SCHEMA_DIALECTS.DRAFT_07);

    // Verify it was set correctly
    assertEquals(
      api.getJSONSchemaDialect(),
      "https://json-schema.org/draft/07/schema",
      "Should update dialect to Draft 07",
    );

    const doc = api.getJSON();
    assertEquals(
      doc.jsonSchemaDialect,
      "https://json-schema.org/draft/07/schema",
      "Document should reflect updated dialect",
    );
  });

  await t.step("should support custom dialects", () => {
    const api = new OpenAPI({
      title: "Test API",
      version: "1.0.0",
    });

    const customDialect = "https://example.com/custom-schema";
    api.setJSONSchemaDialect(customDialect);

    assertEquals(
      api.getJSONSchemaDialect(),
      customDialect,
      "Should support custom dialect URIs",
    );
  });

  await t.step(
    "should provide access to standard dialects via constants",
    () => {
      // Check the most important dialect constants
      assertEquals(
        SCHEMA_DIALECTS.DRAFT_2020_12,
        "https://json-schema.org/draft/2020-12/schema",
        "Should have correct 2020-12 dialect URI",
      );

      assertEquals(
        SCHEMA_DIALECTS.DRAFT_2019_09,
        "https://json-schema.org/draft/2019-09/schema",
        "Should have correct 2019-09 dialect URI",
      );

      assertEquals(
        SCHEMA_DIALECTS.DRAFT_07,
        "https://json-schema.org/draft/07/schema",
        "Should have correct Draft 07 dialect URI",
      );

      // Also check via the static property
      assertEquals(
        OpenAPI.SCHEMA_DIALECTS.DRAFT_2020_12,
        "https://json-schema.org/draft/2020-12/schema",
        "Should expose dialects through static property",
      );
    },
  );
});
