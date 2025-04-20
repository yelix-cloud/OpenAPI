import { EndpointBuilder } from "../../../src/EndpointBuilder.ts";
import { assertEquals, assertExists } from "jsr:@std/assert";
import type { OpenAPIExample, OpenAPIResponse } from "../../../src/index.ts";

Deno.test("EndpointBuilder response examples", async (t) => {
  await t.step("should set response example", () => {
    const endpoint = new EndpointBuilder({
      method: "get",
      title: "Response Example",
    });

    const example = { id: "123", status: "success" };

    endpoint
      .addJsonResponse(200, "Success", {
        type: "object",
        properties: {
          id: { type: "string" },
          status: { type: "string" },
        },
      })
      .setResponseExample(200, example);

    const pathItem = endpoint.getEndpoint();
    const response = pathItem.get?.responses?.["200"] as OpenAPIResponse;

    assertExists(response, "Response should exist");
    const mediaType = response.content?.["application/json"];
    assertExists(mediaType, "Media type should exist");
    assertEquals(mediaType.example, example, "Response example should be set");
  });

  await t.step("should add response named example", () => {
    const endpoint = new EndpointBuilder({
      method: "get",
      title: "Named Response Example",
    });

    const example = { error: "Not Found", code: 404 };

    endpoint
      .addJsonResponse(404, "Not Found", {
        type: "object",
        properties: {
          error: { type: "string" },
          code: { type: "integer" },
        },
      })
      .addResponseNamedExample(404, "userNotFound", {
        value: example,
        summary: "User Not Found",
        description: "Response when the requested user doesn't exist",
      });

    const pathItem = endpoint.getEndpoint();
    const response = pathItem.get?.responses?.["404"] as OpenAPIResponse;

    assertExists(response, "Response should exist");
    const mediaType = response.content?.["application/json"];
    assertExists(mediaType, "Media type should exist");
    assertExists(mediaType.examples, "Examples should exist");
    assertExists(
      mediaType.examples?.userNotFound,
      "Named example should exist",
    );
    assertEquals(
      (mediaType.examples?.userNotFound as OpenAPIExample).value,
      example,
      "Example value should match",
    );
  });
});
