import { EndpointBuilder } from "../../src/EndpointBuilder.ts";
import { assertEquals, assertExists, assertNotEquals } from "jsr:@std/assert";

Deno.test("EndpointBuilder method chaining", async (t) => {
  await t.step("should support chaining for all new methods", () => {
    const endpoint = new EndpointBuilder({
      method: "post",
      title: "Complete API",
    });

    // This test verifies that the fluent API works by chaining all new methods
    const chainedEndpoint = endpoint
      .setOperationId("createResource")
      .addTag("resource")
      .setDescription("Creates a new resource")
      .addSecurityRequirement("oauth2", ["write"])
      .setRequestBody({
        schema: {
          type: "object",
          properties: {
            name: { type: "string" },
            type: { type: "string" },
          },
        },
        required: true,
      })
      .setRequestBodyExample({ name: "Example Resource", type: "test" })
      .addJsonResponse(201, "Resource created", {
        type: "object",
        properties: {
          id: { type: "string" },
          name: { type: "string" },
        },
      })
      .setResponseExample(201, { id: "123", name: "Example Resource" })
      .addResponseLink(201, "getResource", {
        operationId: "getResource",
        parameters: { id: "$response.body#/id" },
      })
      .addExtension("x-created-by", "test");

    // Just verify that chaining doesn't break the object
    assertNotEquals(
      chainedEndpoint,
      null,
      "Chaining should return valid object",
    );

    const pathItem = endpoint.getEndpoint();
    assertExists(pathItem.post, "POST operation should exist");
    assertEquals(
      pathItem.post?.operationId,
      "createResource",
      "Operation ID should be set",
    );
  });
});
