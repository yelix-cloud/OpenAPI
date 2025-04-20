import { EndpointBuilder } from "../../../src/EndpointBuilder.ts";
import { assertEquals, assertExists } from "jsr:@std/assert";
import type { OpenAPIExample } from "../../../src/index.ts";

Deno.test("EndpointBuilder request body examples", async (t) => {
  await t.step("should set request body example", () => {
    const endpoint = new EndpointBuilder({
      method: "post",
      title: "Request Body Example",
    });
    
    const example = { name: "Test User", email: "test@example.com" };
    
    endpoint
      .setRequestBody({
        schema: {
          type: "object",
          properties: {
            name: { type: "string" },
            email: { type: "string", format: "email" }
          }
        }
      })
      .setRequestBodyExample(example);
    
    const pathItem = endpoint.getEndpoint();
    const mediaType = pathItem.post?.requestBody?.content?.["application/json"];
    
    assertExists(mediaType, "Media type should exist");
    assertEquals(mediaType.example, example, "Request body example should be set");
  });
  
  await t.step("should add request body named example", () => {
    const endpoint = new EndpointBuilder({
      method: "post",
      title: "Named Request Body Example",
    });
    
    const example = { name: "John Doe", role: "admin" };
    
    endpoint
      .setRequestBody({
        schema: {
          type: "object",
          properties: {
            name: { type: "string" },
            role: { type: "string" }
          }
        }
      })
      .addRequestBodyNamedExample("adminUser", {
        value: example,
        summary: "Admin User",
        description: "Example of an admin user payload"
      });
    
    const pathItem = endpoint.getEndpoint();
    const mediaType = pathItem.post?.requestBody?.content?.["application/json"];
    
    assertExists(mediaType, "Media type should exist");
    assertExists(mediaType.examples, "Examples should exist");
    assertExists(mediaType.examples?.adminUser, "Named example should exist");
    assertEquals((mediaType.examples?.adminUser as OpenAPIExample).value, example, "Example value should match");
  });
});
