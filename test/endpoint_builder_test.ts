import { createEndpointBuilder } from "../src/EndpointBuilder.ts";
import { assertEquals } from "@std/assert";

Deno.test("EndpointBuilder creates with correct method", () => {
  const endpoint = createEndpointBuilder("get");
  assertEquals(endpoint.method, "get");
});

Deno.test("EndpointBuilder sets basic properties", () => {
  const endpoint = createEndpointBuilder("post")
    .setOperationId("createUser")
    .setSummary("Create a user")
    .setDescription("This endpoint creates a new user")
    .setTags(["User", "Create"]);

  assertEquals(endpoint.operation.operationId, "createUser");
  assertEquals(endpoint.operation.summary, "Create a user");
  assertEquals(
    endpoint.operation.description,
    "This endpoint creates a new user",
  );
  assertEquals(endpoint.operation.tags, ["User", "Create"]);
});

Deno.test("EndpointBuilder sets external docs", () => {
  const endpoint = createEndpointBuilder("get").setExternalDocs(
    "https://example.com/docs",
    "API Documentation",
  );

  assertEquals(
    endpoint.operation.externalDocs?.url,
    "https://example.com/docs",
  );
  assertEquals(
    endpoint.operation.externalDocs?.description,
    "API Documentation",
  );
});

Deno.test("EndpointBuilder sets security requirements", () => {
  const endpoint = createEndpointBuilder("delete").setSecurity({
    apiKey: [],
    oauth2: ["read", "write"],
  });

  const fallbacked = endpoint?.operation?.security ?? {};
  assertEquals("apiKey" in fallbacked, true);
  assertEquals("oauth2" in fallbacked, true);
  assertEquals(fallbacked["apiKey"], []);
  assertEquals(fallbacked["oauth2"], ["read", "write"]);
});

Deno.test("EndpointBuilder sets response objects", () => {
  const endpoint = createEndpointBuilder("get").setResponses({
    200: {
      description: "Success response",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              id: { type: "string" },
            },
          },
        },
      },
    },
    404: {
      description: "Not found",
    },
  });

  const response200 = endpoint.operation.responses?.[200];
  const response404 = endpoint.operation.responses?.[404];

  assertEquals(response200?.description, "Success response");
  assertEquals(response404?.description, "Not found");

  if (response200 && "content" in response200) {
    const jsonContent = response200.content?.["application/json"];
    assertEquals(jsonContent?.schema?.type, "object");
    assertEquals(
      (jsonContent?.schema?.properties?.id as { type: string }).type,
      "string",
    );
  }
});
