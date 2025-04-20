import { EndpointBuilder } from "../src/EndpointBuilder.ts";
import {
  assertEquals,
  assertExists,
  assertNotEquals,
  assertThrows,
} from "jsr:@std/assert";
import type {
  OpenAPIExample,
  OpenAPILink,
  OpenAPIParameter,
  OpenAPIResponse,
} from "../src/index.ts";

Deno.test("EndpointBuilder advanced features", async (t) => {
  await t.step("Security Requirements", async (t) => {
    await t.step("should set security requirements", () => {
      const endpoint = new EndpointBuilder({
        method: "get",
        title: "Secure Endpoint",
      });

      endpoint.setSecurity([
        { apiKey: [] },
        { oauth2: ["read", "write"] },
      ]);

      const pathItem = endpoint.getEndpoint();

      assertExists(pathItem.get?.security, "Security should be defined");
      assertEquals(
        pathItem.get?.security?.length,
        2,
        "Should have two security requirements",
      );
      assertEquals(
        pathItem.get?.security?.[0],
        { apiKey: [] },
        "First requirement should be apiKey",
      );
      assertEquals(
        pathItem.get?.security?.[1],
        { oauth2: ["read", "write"] },
        "Second requirement should be oauth2 with scopes",
      );
    });

    await t.step("should add a security requirement", () => {
      const endpoint = new EndpointBuilder({
        method: "post",
        title: "Add Security",
      });

      endpoint.addSecurityRequirement("jwt", ["user"]);

      const pathItem = endpoint.getEndpoint();

      assertExists(pathItem.post?.security, "Security should be defined");
      assertEquals(
        pathItem.post?.security?.length,
        1,
        "Should have one security requirement",
      );
      assertEquals(
        pathItem.post?.security?.[0],
        { jwt: ["user"] },
        "Security requirement should be jwt with user scope",
      );
    });

    await t.step("should add multiple security requirements", () => {
      const endpoint = new EndpointBuilder({
        method: "delete",
        title: "Multiple Securities",
      });

      endpoint
        .addSecurityRequirement("basic")
        .addSecurityRequirement("api_key");

      const pathItem = endpoint.getEndpoint();

      assertExists(pathItem.delete?.security, "Security should be defined");
      assertEquals(
        pathItem.delete?.security?.length,
        2,
        "Should have two security requirements",
      );
      assertEquals(
        pathItem.delete?.security?.[0],
        { basic: [] },
        "First requirement should be basic",
      );
      assertEquals(
        pathItem.delete?.security?.[1],
        { api_key: [] },
        "Second requirement should be api_key",
      );
    });
  });

  await t.step("Examples", async (t) => {
    await t.step("should set parameter example", () => {
      const endpoint = new EndpointBuilder({
        method: "get",
        title: "Parameter Example",
      });

      endpoint
        .addQueryParameter("limit", {
          type: "integer",
          minimum: 1,
        }, "Max items to return")
        .setParameterExample("limit", 25);

      const pathItem = endpoint.getEndpoint();
      const param = pathItem.get?.parameters?.[0] as OpenAPIParameter;

      assertExists(param, "Parameter should exist");
      assertEquals(param.name, "limit", "Parameter name should be limit");
      assertEquals(param.example, 25, "Parameter example should be 25");
    });

    await t.step("should add parameter named example", () => {
      const endpoint = new EndpointBuilder({
        method: "get",
        title: "Named Parameter Example",
      });

      endpoint
        .addQueryParameter("status", {
          type: "string",
          enum: ["pending", "active", "completed"],
        }, "Filter by status")
        .addParameterNamedExample("status", "activeStatus", {
          value: "active",
          summary: "Active status",
          description: "Filter to show only active items",
        });

      const pathItem = endpoint.getEndpoint();
      const param = pathItem.get?.parameters?.[0] as OpenAPIParameter;

      assertExists(param, "Parameter should exist");
      assertExists(param.examples, "Parameter examples should exist");
      assertExists(param.examples?.activeStatus, "Named example should exist");
      assertEquals(
        (param.examples?.activeStatus as OpenAPIExample).value,
        "active",
        "Example value should be 'active'",
      );
      assertEquals(
        param.examples?.activeStatus.summary,
        "Active status",
        "Example summary should be set",
      );
    });

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
              email: { type: "string", format: "email" },
            },
          },
        })
        .setRequestBodyExample(example);

      const pathItem = endpoint.getEndpoint();
      const mediaType = pathItem.post?.requestBody?.content
        ?.["application/json"];

      assertExists(mediaType, "Media type should exist");
      assertEquals(
        mediaType.example,
        example,
        "Request body example should be set",
      );
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
              role: { type: "string" },
            },
          },
        })
        .addRequestBodyNamedExample("adminUser", {
          value: example,
          summary: "Admin User",
          description: "Example of an admin user payload",
        });

      const pathItem = endpoint.getEndpoint();
      const mediaType = pathItem.post?.requestBody?.content
        ?.["application/json"];

      assertExists(mediaType, "Media type should exist");
      assertExists(mediaType.examples, "Examples should exist");
      assertExists(mediaType.examples?.adminUser, "Named example should exist");
      assertEquals(
        (mediaType.examples?.adminUser as OpenAPIExample).value,
        example,
        "Example value should match",
      );
    });

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
      assertEquals(
        mediaType.example,
        example,
        "Response example should be set",
      );
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

  await t.step("Callbacks and Links", async (t) => {
    await t.step("should add callback", () => {
      const endpoint = new EndpointBuilder({
        method: "post",
        title: "Webhook Registration",
      });

      const callbackPathItem = new EndpointBuilder({
        method: "post",
        title: "Webhook Callback",
      })
        .addJsonResponse(200, "Success", { type: "object" })
        .getEndpoint();

      endpoint.addCallback(
        "paymentCallback",
        "{$request.body#/callbackUrl}",
        callbackPathItem,
      );

      const pathItem = endpoint.getEndpoint();

      assertExists(pathItem.post?.callbacks, "Callbacks should exist");
      assertExists(
        pathItem.post?.callbacks?.paymentCallback,
        "Payment callback should exist",
      );
    });

    await t.step("should add response link", () => {
      const endpoint = new EndpointBuilder({
        method: "post",
        title: "Create User",
      });

      endpoint
        .addJsonResponse(201, "User Created", {
          type: "object",
          properties: {
            id: { type: "string" },
          },
        })
        .addResponseLink(201, "getUserById", {
          operationId: "getUser",
          parameters: {
            userId: "$response.body#/id",
          },
          description:
            "The `id` value returned in the response can be used as the `userId` parameter in `GET /users/{userId}`.",
        });

      const pathItem = endpoint.getEndpoint();
      const response = pathItem.post?.responses?.["201"] as OpenAPIResponse;

      assertExists(response, "Response should exist");
      assertExists(response.links, "Links should exist");
      assertExists(response.links.getUserById, "getUserById link should exist");
      assertEquals(
        (response.links.getUserById as OpenAPILink).operationId,
        "getUser",
        "Link should reference getUser operation",
      );
      assertEquals(
        (response.links.getUserById as OpenAPILink).parameters?.userId,
        "$response.body#/id",
        "Link should include parameter mapping",
      );
    });
  });

  await t.step("Extensions and Parameter Styling", async (t) => {
    await t.step("should add vendor extension", () => {
      const endpoint = new EndpointBuilder({
        method: "get",
        title: "Extension Test",
      });

      endpoint.addExtension("x-rate-limit", 100);

      const pathItem = endpoint.getEndpoint();
      const operation = pathItem.get as Record<string, unknown>;

      assertEquals(operation["x-rate-limit"], 100, "Extension should be set");
    });

    await t.step("should throw error for invalid extension name", () => {
      const endpoint = new EndpointBuilder({
        method: "get",
        title: "Invalid Extension",
      });

      assertThrows(
        () => endpoint.addExtension("invalid-extension", "value"),
        Error,
        "Extension name must start with x-",
      );
    });

    await t.step("should set parameter style", () => {
      const endpoint = new EndpointBuilder({
        method: "get",
        title: "Parameter Style",
      });

      endpoint
        .addQueryParameter("ids", {
          type: "array",
          items: { type: "string" },
        }, "List of IDs")
        .setParameterStyle("ids", "form", true);

      const pathItem = endpoint.getEndpoint();
      const param = pathItem.get?.parameters?.[0] as OpenAPIParameter;

      assertExists(param, "Parameter should exist");
      assertEquals(param.style, "form", "Parameter style should be form");
      assertEquals(param.explode, true, "Parameter explode should be true");
    });
  });

  await t.step("Method Chaining", async (t) => {
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
});
