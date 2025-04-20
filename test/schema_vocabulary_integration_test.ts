import { OpenAPI, SCHEMA_DIALECTS } from "../src/OpenAPI.ts";
import { EndpointBuilder } from "../src/EndpointBuilder.ts";
import { assertEquals, assertExists } from "jsr:@std/assert";

Deno.test("JSON Schema Vocabulary Integration", async (t) => {
  await t.step(
    "should support JSON Schema 2020-12 features in API specification",
    () => {
      // Create API with 2020-12 dialect
      const api = new OpenAPI({
        title: "Advanced Schema API",
        version: "1.0.0",
        description: "API demonstrating JSON Schema 2020-12 features",
      });

      // Ensure it's using 2020-12 dialect
      assertEquals(api.getJSONSchemaDialect(), SCHEMA_DIALECTS.DRAFT_2020_12);

      // Register vocabularies
      api.registerVocabulary(
        "https://json-schema.org/draft/2020-12/vocab/validation",
        "Core validation vocabulary",
      );

      api.registerVocabulary(
        "https://json-schema.org/draft/2020-12/vocab/applicator",
        "Schema applicator vocabulary",
      );

      // Create an endpoint that uses the schema
      const getUserEndpoint = new EndpointBuilder({
        method: "get",
        title: "Get User",
      })
        .setDescription("Get user by ID")
        .addPathParameter("id", { type: "string", format: "uuid" }, "User ID")
        // Use a direct schema object instead of reference
        .addJsonResponse(200, "User found", {
          type: "object",
          properties: {
            id: { type: "string" },
            name: { type: "string" },
            email: { type: "string", format: "email" },
          },
          required: ["id", "name", "email"],
        })
        .addJsonResponse(404, "User not found", {
          type: "object",
          properties: {
            error: { type: "string" },
            message: { type: "string" },
          },
          required: ["error", "message"],
        });

      // Create another endpoint with conditional schema
      const updateUserEndpoint = new EndpointBuilder({
        method: "patch",
        title: "Update User",
      })
        .setDescription("Update user preferences")
        .addPathParameter("id", { type: "string", format: "uuid" }, "User ID")
        .setRequestBody({
          schema: {
            type: "object",
            properties: {
              preferences: {
                type: "object",
                properties: {
                  theme: {
                    type: "string",
                    enum: ["light", "dark", "system"],
                  },
                  notifications: {
                    type: "object",
                    properties: {
                      email: { type: "boolean" },
                      push: { type: "boolean" },
                    },
                  },
                },
              },
            },
          },
        })
        // Use a direct schema object instead of reference
        .addJsonResponse(200, "User updated", {
          type: "object",
          properties: {
            id: { type: "string" },
            name: { type: "string" },
            email: { type: "string", format: "email" },
          },
          required: ["id", "name", "email"],
        });

      // Add endpoints to API
      api.addNewEndpoint_("/users/{id}", getUserEndpoint);
      api.addNewEndpoint_("/users/{id}", updateUserEndpoint);

      // Get the OpenAPI document
      const doc = api.getJSON();

      // Verify dialect is set
      assertEquals(
        doc.jsonSchemaDialect,
        SCHEMA_DIALECTS.DRAFT_2020_12,
        "Document should use 2020-12 dialect",
      );

      // Verify schema in components
      assertExists(
        doc.components?.schemas?.User,
        "User schema should be defined",
      );

      // Verify paths were created correctly - make sure paths structure exists first
      assertExists(doc.paths, "Paths should be defined");
      assertExists(doc.paths["/users/{id}"], "Endpoint path should exist");

      // Use type guards to safely check operations
      const pathItem = doc.paths["/users/{id}"];
      if (!("$ref" in pathItem)) {
        assertExists(pathItem.patch, "PATCH operation should exist");
      }

      // Convert to JSON and back to verify serialization works
      const jsonStr = api.getJSONString();
      const parsed = JSON.parse(jsonStr);

      assertEquals(
        parsed.jsonSchemaDialect,
        SCHEMA_DIALECTS.DRAFT_2020_12,
        "JSON serialization should preserve dialect",
      );

      assertExists(
        parsed.components?.schemas?.User?.$defs?.address,
        "JSON serialization should preserve $defs",
      );
    },
  );
});
