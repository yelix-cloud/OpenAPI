import { OpenAPI } from "../../src/OpenAPI.ts";
import { EndpointBuilder } from "../../src/EndpointBuilder.ts";
import { assertEquals, assertExists } from "jsr:@std/assert";

Deno.test("Security Integration Examples", async (t) => {
  await t.step("Complete API with security", () => {
    // Create the OpenAPI document
    const api = new OpenAPI({
      title: "Secured API",
      version: "1.0.0",
      description: "API with various security mechanisms",
      servers: [
        { url: "https://api.example.com/v1", description: "Production" },
      ],
    });

    // Define security schemes
    api.addApiKeySecurity("ApiKeyAuth", {
      in: "header",
      parameterName: "X-API-Key",
      description: "API key authentication",
    });

    api.addHttpSecurity("BearerAuth", "bearer", {
      bearerFormat: "JWT",
      description: "JWT Bearer token authentication",
    });

    api.addOAuth2Security("OAuth2", {
      authorizationCode: {
        authorizationUrl: "https://example.com/oauth/authorize",
        tokenUrl: "https://example.com/oauth/token",
        scopes: {
          "user:read": "Read user data",
          "user:write": "Modify user data",
          "admin": "Administrative access",
        },
      },
    }, "OAuth 2.0 Authentication");

    // Set default security for the entire API
    // (either API key OR Bearer token will satisfy this requirement)
    api.setGlobalSecurity([
      api.createSecurityRequirement("ApiKeyAuth"),
      api.createSecurityRequirement("BearerAuth"),
    ]);

    // Create a public endpoint (no auth required)
    const healthEndpoint = new EndpointBuilder({
      method: "get",
      title: "Health Check",
    })
      .setDescription("Check if the API is operational")
      .setSecurity([]) // Empty array means no security requirements
      .addJsonResponse(200, "API is operational", {
        type: "object",
        properties: {
          status: { type: "string" },
          version: { type: "string" },
        },
      });

    // Create a standard endpoint that uses the default security
    const getUsersEndpoint = new EndpointBuilder({
      method: "get",
      title: "Get Users",
    })
      .setDescription("Get a list of users")
      .addQueryParameter(
        "limit",
        { type: "integer", default: 10 },
        "Number of users to return",
      )
      // No setSecurity call means it inherits the global security requirements
      .addJsonResponse(200, "List of users", {
        type: "object",
        properties: {
          users: {
            type: "array",
            items: {
              type: "object",
              properties: {
                id: { type: "string" },
                name: { type: "string" },
              },
            },
          },
        },
      });

    // Create an endpoint that requires OAuth2 with specific scopes
    const createUserEndpoint = new EndpointBuilder({
      method: "post",
      title: "Create User",
    })
      .setDescription("Create a new user")
      .setSecurity([
        api.createSecurityRequirement("OAuth2", ["user:write"]),
      ])
      .setRequestBody({
        schema: {
          type: "object",
          properties: {
            name: { type: "string" },
            email: { type: "string" },
          },
          required: ["name", "email"],
        },
        required: true,
      })
      .addJsonResponse(201, "User created", {
        type: "object",
        properties: {
          id: { type: "string" },
          name: { type: "string" },
          email: { type: "string" },
        },
      });

    // Create an admin endpoint that requires multiple security schemes simultaneously
    const systemConfigEndpoint = new EndpointBuilder({
      method: "put",
      title: "Update System Config",
    })
      .setDescription("Update system configuration (admin only)")
      .setSecurity([
        // This requires BOTH Bearer token AND OAuth2 with admin scope
        {
          "BearerAuth": [],
          "OAuth2": ["admin"],
        },
      ])
      .setRequestBody({
        schema: {
          type: "object",
          properties: {
            setting: { type: "string" },
            value: { type: "string" },
          },
          required: ["setting", "value"],
        },
        required: true,
      })
      .addJsonResponse(200, "Configuration updated", {
        type: "object",
        properties: {
          success: { type: "boolean" },
        },
      });

    // Add endpoints to the API
    api.addNewEndpoint_("/health", healthEndpoint);
    api.addNewEndpoint_("/users", getUsersEndpoint);
    api.addNewEndpoint_("/users", createUserEndpoint);
    api.addNewEndpoint_("/system/config", systemConfigEndpoint);

    // Verify the OpenAPI document
    const doc = api.getJSON();

    // Check global security
    assertExists(doc.security, "Global security should be defined");
    assertEquals(
      doc.security.length,
      2,
      "Should have two global security options",
    );

    // Check health endpoint (public)
    const healthPath = doc.paths?.["/health"];
    assertExists(healthPath, "Health path should exist");

    // Type guard to ensure we have a PathItem, not a Reference
    if ("get" in healthPath) {
      assertExists(
        healthPath.get?.security,
        "Health security should be defined",
      );
      assertEquals(
        healthPath.get?.security?.length,
        0,
        "Health should have no security",
      );
    }

    // Check users GET endpoint (uses global security)
    const usersPath = doc.paths?.["/users"];
    assertExists(usersPath, "Users path should exist");

    // Type guard to ensure we have a PathItem, not a Reference
    if ("get" in usersPath) {
      assertEquals(
        usersPath.get?.security,
        undefined,
        "GET users should inherit global security",
      );
    }

    // Check users POST endpoint (OAuth2)
    if ("post" in usersPath) {
      assertExists(
        usersPath.post?.security,
        "POST users security should be defined",
      );
      assertEquals(
        usersPath.post?.security?.length,
        1,
        "POST users should have one security requirement",
      );
      assertEquals(
        usersPath.post?.security?.[0].OAuth2,
        ["user:write"],
        "Should require OAuth2 with user:write scope",
      );
    }

    // Check admin endpoint (combined security)
    const configPath = doc.paths?.["/system/config"];
    assertExists(configPath, "Config path should exist");

    // Type guard to ensure we have a PathItem, not a Reference
    if ("put" in configPath) {
      assertExists(
        configPath.put?.security,
        "PUT config security should be defined",
      );
      assertEquals(
        configPath.put?.security?.length,
        1,
        "PUT config should have one security requirement",
      );
      assertExists(
        configPath.put?.security?.[0].BearerAuth,
        "Should require Bearer auth",
      );
      assertEquals(
        configPath.put?.security?.[0].OAuth2,
        ["admin"],
        "Should require OAuth2 with admin scope",
      );
    }
  });
});
