import { EndpointBuilder } from "../../../src/EndpointBuilder.ts";
import { assertEquals, assertExists } from "jsr:@std/assert";
import type { OpenAPIResponse, OpenAPILink } from "../../../src/index.ts";

Deno.test("EndpointBuilder links functionality", async (t) => {
  await t.step("should add response link", () => {
    const endpoint = new EndpointBuilder({
      method: "post",
      title: "Create User",
    });
    
    endpoint
      .addJsonResponse(201, "User Created", {
        type: "object",
        properties: {
          id: { type: "string" }
        }
      })
      .addResponseLink(201, "getUserById", {
        operationId: "getUser",
        parameters: {
          userId: "$response.body#/id"
        },
        description: "The `id` value returned in the response can be used as the `userId` parameter in `GET /users/{userId}`."
      });
    
    const pathItem = endpoint.getEndpoint();
    const response = pathItem.post?.responses?.["201"] as OpenAPIResponse;
    
    assertExists(response, "Response should exist");
    assertExists(response.links, "Links should exist");
    assertExists(response.links.getUserById, "getUserById link should exist");
    assertEquals((response.links.getUserById as OpenAPILink).operationId, "getUser", "Link should reference getUser operation");
    assertEquals(
      (response.links.getUserById as OpenAPILink).parameters?.userId, 
      "$response.body#/id", 
      "Link should include parameter mapping"
    );
  });
});
