import { OpenAPI } from "../../src/OpenAPI.ts";
import { EndpointBuilder } from "../../src/EndpointBuilder.ts";
import { assertEquals, assertExists } from "jsr:@std/assert";
import type { OpenAPISecurityScheme } from "../../src/OpenAPI.types.ts";

Deno.test("OpenAPI Security Features", async (t) => {
  await t.step("Security Schemes", async (t) => {
    await t.step("should add API key security scheme", () => {
      const api = new OpenAPI({
        title: "Test API",
        version: "1.0.0",
      });

      const apiKeyRef = api.addApiKeySecurity("ApiKey", {
        in: "header",
        parameterName: "X-API-Key",
        description: "API Key authentication",
      });

      const doc = api.getJSON();
      assertExists(
        doc.components?.securitySchemes?.ApiKey,
        "Security scheme should be defined",
      );
      assertEquals(
        doc.components?.securitySchemes?.ApiKey.type,
        "apiKey",
        "Type should be apiKey",
      );
      assertEquals(
        doc.components?.securitySchemes?.ApiKey.in,
        "header",
        "Location should be header",
      );
      assertEquals(
        doc.components?.securitySchemes?.ApiKey.name,
        "X-API-Key",
        "Name should be X-API-Key",
      );
      assertEquals(
        doc.components?.securitySchemes?.ApiKey.description,
        "API Key authentication",
        "Description should match",
      );
      assertEquals(
        apiKeyRef.$ref,
        "#/components/securitySchemes/ApiKey",
        "Reference should be correct",
      );
    });

    await t.step("should add HTTP security scheme", () => {
      const api = new OpenAPI({
        title: "Test API",
        version: "1.0.0",
      });

      const bearerRef = api.addHttpSecurity("BearerAuth", "bearer", {
        bearerFormat: "JWT",
        description: "Bearer token authentication",
      });

      const doc = api.getJSON();
      assertExists(
        doc.components?.securitySchemes?.BearerAuth,
        "Security scheme should be defined",
      );
      assertEquals(
        doc.components?.securitySchemes?.BearerAuth.type,
        "http",
        "Type should be http",
      );
      assertEquals(
        doc.components?.securitySchemes?.BearerAuth.scheme,
        "bearer",
        "Scheme should be bearer",
      );
      assertEquals(
        doc.components?.securitySchemes?.BearerAuth.bearerFormat,
        "JWT",
        "Bearer format should be JWT",
      );
      assertEquals(
        bearerRef.$ref,
        "#/components/securitySchemes/BearerAuth",
        "Reference should be correct",
      );
    });

    await t.step("should add OAuth2 security scheme", () => {
      const api = new OpenAPI({
        title: "Test API",
        version: "1.0.0",
      });

      const oauth2Ref = api.addOAuth2Security("OAuth2", {
        implicit: {
          authorizationUrl: "https://example.com/oauth/authorize",
          tokenUrl: "https://example.com/oauth/token",
          scopes: {
            "read": "Read access",
            "write": "Write access",
          },
        },
      }, "OAuth 2.0");

      const doc = api.getJSON();
      assertExists(
        doc.components?.securitySchemes?.OAuth2,
        "Security scheme should be defined",
      );
      assertEquals(
        doc.components?.securitySchemes?.OAuth2.type,
        "oauth2",
        "Type should be oauth2",
      );
      assertEquals(
        doc.components?.securitySchemes?.OAuth2.description,
        "OAuth 2.0",
        "Description should match",
      );
      assertExists(
        doc.components?.securitySchemes?.OAuth2.flows?.implicit,
        "Implicit flow should be defined",
      );
      assertEquals(
        doc.components?.securitySchemes?.OAuth2.flows?.implicit
          ?.authorizationUrl,
        "https://example.com/oauth/authorize",
        "Authorization URL should match",
      );
      assertEquals(
        oauth2Ref.$ref,
        "#/components/securitySchemes/OAuth2",
        "Reference should be correct",
      );
    });

    await t.step("should add OpenID Connect security scheme", () => {
      const api = new OpenAPI({
        title: "Test API",
        version: "1.0.0",
      });

      const openIdRef = api.addOpenIdConnectSecurity(
        "OpenID",
        "https://example.com/.well-known/openid-configuration",
        "OpenID Connect",
      );

      const doc = api.getJSON();
      assertExists(
        doc.components?.securitySchemes?.OpenID,
        "Security scheme should be defined",
      );
      assertEquals(
        doc.components?.securitySchemes?.OpenID.type,
        "openIdConnect",
        "Type should be openIdConnect",
      );
      assertEquals(
        doc.components?.securitySchemes?.OpenID.openIdConnectUrl,
        "https://example.com/.well-known/openid-configuration",
        "OpenID Connect URL should match",
      );
      assertEquals(
        openIdRef.$ref,
        "#/components/securitySchemes/OpenID",
        "Reference should be correct",
      );
    });

    await t.step("should add Mutual TLS security scheme", () => {
      const api = new OpenAPI({
        title: "Test API",
        version: "1.0.0",
      });

      const mtlsRef = api.addMutualTlsSecurity(
        "MTLS",
        "Mutual TLS authentication",
      );

      const doc = api.getJSON();
      assertExists(
        doc.components?.securitySchemes?.MTLS,
        "Security scheme should be defined",
      );
      assertEquals(
        doc.components?.securitySchemes?.MTLS.type,
        "mutualTLS",
        "Type should be mutualTLS",
      );
      assertEquals(
        doc.components?.securitySchemes?.MTLS.description,
        "Mutual TLS authentication",
        "Description should match",
      );
      assertEquals(
        mtlsRef.$ref,
        "#/components/securitySchemes/MTLS",
        "Reference should be correct",
      );
    });
  });

  await t.step("Global Security Requirements", async (t) => {
    await t.step("should add a global security requirement", () => {
      const api = new OpenAPI({
        title: "Test API",
        version: "1.0.0",
      });

      api.addApiKeySecurity("ApiKey", {
        in: "header",
        parameterName: "X-API-Key",
      });

      api.addGlobalSecurity(api.createSecurityRequirement("ApiKey"));

      const doc = api.getJSON();
      assertExists(doc.security, "Security requirements should be defined");
      assertEquals(
        doc.security.length,
        1,
        "Should have one security requirement",
      );
      assertEquals(
        doc.security[0].ApiKey,
        [],
        "ApiKey requirement should have empty scopes",
      );
    });

    await t.step("should add multiple global security requirements", () => {
      const api = new OpenAPI({
        title: "Test API",
        version: "1.0.0",
      });

      // Add security schemes
      api.addApiKeySecurity("ApiKey", {
        in: "header",
        parameterName: "X-API-Key",
      });

      api.addHttpSecurity("BearerAuth", "bearer");

      // Add global security requirements (OR relationship)
      api.addGlobalSecurity(api.createSecurityRequirement("ApiKey"));
      api.addGlobalSecurity(api.createSecurityRequirement("BearerAuth"));

      const doc = api.getJSON();
      assertExists(doc.security, "Security requirements should be defined");
      assertEquals(
        doc.security.length,
        2,
        "Should have two security requirements",
      );
      assertEquals(
        doc.security[0].ApiKey,
        [],
        "First requirement should be ApiKey",
      );
      assertEquals(
        doc.security[1].BearerAuth,
        [],
        "Second requirement should be BearerAuth",
      );
    });

    await t.step("should set global security requirements", () => {
      const api = new OpenAPI({
        title: "Test API",
        version: "1.0.0",
      });

      // Add security schemes
      api.addOAuth2Security("OAuth2", {
        authorizationCode: {
          authorizationUrl: "https://example.com/oauth/authorize",
          tokenUrl: "https://example.com/oauth/token",
          scopes: {
            "read": "Read access",
            "write": "Write access",
            "admin": "Admin access",
          },
        },
      });

      // Set global security requirements
      api.setGlobalSecurity([
        api.createSecurityRequirement("OAuth2", ["read", "write"]),
      ]);

      let doc = api.getJSON();
      assertExists(doc.security, "Security requirements should be defined");
      if (doc.security) { // Add null check
        assertEquals(
          doc.security.length,
          1,
          "Should have one security requirement",
        );
        assertEquals(
          doc.security[0].OAuth2,
          ["read", "write"],
          "OAuth2 requirement should have correct scopes",
        );
      }

      // Replace with new requirements
      api.setGlobalSecurity([
        api.createSecurityRequirement("OAuth2", ["admin"]),
      ]);

      doc = api.getJSON();
      assertExists(doc.security, "Security requirements should be defined");
      if (doc.security) { // Add null check
        assertEquals(
          doc.security[0].OAuth2,
          ["admin"],
          "OAuth2 requirement should have updated scopes",
        );
      }
    });
  });

  await t.step("Creating Security Requirements", () => {
    const api = new OpenAPI({
      title: "Test API",
      version: "1.0.0",
    });

    const emptyScopes = api.createSecurityRequirement("ApiKey");
    assertEquals(
      emptyScopes,
      { "ApiKey": [] },
      "Should create requirement with empty scopes",
    );

    const withScopes = api.createSecurityRequirement("OAuth2", [
      "read",
      "write",
    ]);
    assertEquals(
      withScopes,
      { "OAuth2": ["read", "write"] },
      "Should create requirement with specified scopes",
    );
  });

  await t.step("Integration with EndpointBuilder", async (t) => {
    await t.step("should apply security to endpoint", () => {
      const api = new OpenAPI({
        title: "Test API",
        version: "1.0.0",
      });

      // Add security schemes
      api.addApiKeySecurity("ApiKey", {
        in: "header",
        parameterName: "X-API-Key",
      });

      api.addOAuth2Security("OAuth2", {
        authorizationCode: {
          authorizationUrl: "https://example.com/oauth/authorize",
          tokenUrl: "https://example.com/oauth/token",
          scopes: {
            "read": "Read access",
            "write": "Write access",
          },
        },
      });

      // Add global security (default for all endpoints)
      api.setGlobalSecurity([
        api.createSecurityRequirement("ApiKey"),
      ]);

      // Create an endpoint with specific security
      const secureEndpoint = new EndpointBuilder({
        method: "post",
        title: "Create Resource",
      })
        .setDescription("Creates a new resource")
        .setSecurity([
          api.createSecurityRequirement("OAuth2", ["write"]),
        ]);

      // Create a public endpoint with no security
      const publicEndpoint = new EndpointBuilder({
        method: "get",
        title: "Health Check",
      })
        .setDescription("Public health check endpoint")
        .setSecurity([]); // Empty array removes all security requirements

      api.addNewEndpoint_("/resources", secureEndpoint);
      api.addNewEndpoint_("/health", publicEndpoint);

      const doc = api.getJSON();

      // Check that the secure endpoint has the correct security
      const securePath = doc.paths?.["/resources"];
      assertExists(securePath, "Secure path should exist");

      // Type guard to ensure we have a PathItem, not a Reference
      if ("post" in securePath) {
        assertExists(
          securePath.post?.security,
          "Security should be defined on POST operation",
        );
        assertEquals(
          securePath.post?.security?.length,
          1,
          "Should have one security requirement",
        );
        assertEquals(
          securePath.post?.security?.[0].OAuth2,
          ["write"],
          "Should require OAuth2 with write scope",
        );
      }

      // Check that the public endpoint has no security
      const publicPath = doc.paths?.["/health"];
      assertExists(publicPath, "Public path should exist");

      // Type guard to ensure we have a PathItem, not a Reference
      if ("get" in publicPath) {
        assertExists(
          publicPath.get?.security,
          "Security should be defined on GET operation",
        );
        assertEquals(
          publicPath.get?.security?.length,
          0,
          "Should have empty security array (no requirements)",
        );
      }
    });

    await t.step(
      "should use the getComponentByRef method to lookup security schemes",
      () => {
        const api = new OpenAPI({
          title: "Test API",
          version: "1.0.0",
        });

        // Add a security scheme
        const apiKeyRef = api.addApiKeySecurity("ApiKey", {
          in: "header",
          parameterName: "X-API-Key",
          description: "API Key authentication",
        });

        // Look up the security scheme using its reference
        const scheme = api.getComponentByRef(
          apiKeyRef.$ref,
        ) as OpenAPISecurityScheme;

        assertExists(scheme, "Security scheme should be found by reference");
        assertEquals(scheme.type, "apiKey", "Type should be apiKey");
        assertEquals(scheme.in, "header", "Location should be header");
        assertEquals(
          scheme.name,
          "X-API-Key",
          "Parameter name should be correct",
        );
      },
    );
  });

  await t.step("Complex Security Scenarios", async (t) => {
    await t.step(
      "should support logical OR between security requirements",
      () => {
        const api = new OpenAPI({
          title: "Test API",
          version: "1.0.0",
        });

        // Add security schemes
        api.addApiKeySecurity("ApiKey", {
          in: "header",
          parameterName: "X-API-Key",
        });

        api.addHttpSecurity("BearerAuth", "bearer", {
          bearerFormat: "JWT",
        });

        // Set global security with OR relationship
        // (either ApiKey OR BearerAuth can be used)
        api.setGlobalSecurity([
          api.createSecurityRequirement("ApiKey"),
          api.createSecurityRequirement("BearerAuth"),
        ]);

        const doc = api.getJSON();
        assertExists(doc.security, "Security requirements should be defined");
        assertEquals(
          doc.security.length,
          2,
          "Should have two alternative security requirements",
        );
      },
    );

    await t.step(
      "should support logical AND within a security requirement",
      () => {
        const api = new OpenAPI({
          title: "Test API",
          version: "1.0.0",
        });

        // Add security schemes
        api.addApiKeySecurity("ApiKey1", {
          in: "header",
          parameterName: "X-API-Key-1",
        });

        api.addApiKeySecurity("ApiKey2", {
          in: "header",
          parameterName: "X-API-Key-2",
        });

        // Create a single requirement with multiple schemes (AND relationship)
        const multipleKeys = {
          "ApiKey1": [],
          "ApiKey2": [],
        };

        api.setGlobalSecurity([multipleKeys]);

        const doc = api.getJSON();
        assertExists(doc.security, "Security requirements should be defined");
        assertEquals(
          doc.security.length,
          1,
          "Should have one security requirement",
        );
        assertExists(
          doc.security[0].ApiKey1,
          "First API key should be required",
        );
        assertExists(
          doc.security[0].ApiKey2,
          "Second API key should be required",
        );
      },
    );
  });
});
