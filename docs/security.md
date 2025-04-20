# Security in OpenAPI

This guide explains how to define and implement security requirements in your
API specification using Yelix OpenAPI.

## Security Schemes

Security schemes define how your API handles authentication and authorization.
OpenAPI supports several types of security schemes, all of which are available
in Yelix OpenAPI.

### API Key

```typescript
import { OpenAPI } from "jsr:@murat/openapi";

const api = new OpenAPI({
  title: "Secured API",
  version: "1.0.0",
});

// Define an API key security scheme
const apiKeyRef = api.addApiKeySecurity("ApiKeyAuth", {
  in: "header", // Where the key is expected (header, query, cookie)
  parameterName: "X-API-Key", // Name of the parameter
  description: "API key for authentication", // Optional description
});
```

### HTTP Authentication

HTTP authentication includes schemes like Basic, Bearer, etc.

```typescript
// Basic Auth
const basicAuthRef = api.addHttpSecurity("BasicAuth", "basic", {
  description: "Basic HTTP Authentication",
});

// Bearer Token Auth
const bearerAuthRef = api.addHttpSecurity("BearerAuth", "bearer", {
  bearerFormat: "JWT", // Format hint (e.g., JWT)
  description: "JWT Bearer Token Authentication",
});
```

### OAuth 2.0

```typescript
const oauth2Ref = api.addOAuth2Security("OAuth2", {
  implicit: {
    authorizationUrl: "https://example.com/oauth/authorize",
    tokenUrl: "https://example.com/oauth/token",
    scopes: {
      "read:users": "Read user information",
      "write:users": "Modify user information",
    },
  },
  authorizationCode: {
    authorizationUrl: "https://example.com/oauth/authorize",
    tokenUrl: "https://example.com/oauth/token",
    refreshUrl: "https://example.com/oauth/refresh", // Optional
    scopes: {
      "read:users": "Read user information",
      "write:users": "Modify user information",
    },
  },
}, "OAuth 2.0 Authentication");
```

### OpenID Connect

```typescript
const openIdRef = api.addOpenIdConnectSecurity(
  "OpenIDConnect",
  "https://example.com/.well-known/openid-configuration",
  "OpenID Connect Authentication",
);
```

### Mutual TLS

```typescript
const mtlsRef = api.addMutualTlsSecurity(
  "MTLS",
  "Client certificate authentication",
);
```

## Global Security Requirements

You can define security requirements that apply to all operations in your API:

```typescript
// Create a security requirement
const apiKeyRequirement = api.createSecurityRequirement("ApiKeyAuth");

// Add it as a global security requirement
api.addGlobalSecurity(apiKeyRequirement);

// For OAuth2 with specific scopes
const oauth2Requirement = api.createSecurityRequirement("OAuth2", [
  "read:users",
]);
api.addGlobalSecurity(oauth2Requirement);

// Set multiple global security requirements (any one can be satisfied)
api.setGlobalSecurity([
  api.createSecurityRequirement("ApiKeyAuth"),
  api.createSecurityRequirement("BearerAuth"),
]);
```

When you have multiple security requirements in the array, it means any one of
them can be satisfied (logical OR). For example, the above allows either API key
OR Bearer token authentication.

## Operation-Level Security

You can also define security requirements for specific operations using
EndpointBuilder:

```typescript
import { EndpointBuilder } from "jsr:@murat/openapi";

const getUserEndpoint = new EndpointBuilder()
  .setOperation("get")
  .setTags(["users"])
  .setSummary("Get user info")
  .addPathParameter("id", { type: "string" }, "User ID")
  // Add security requirement for this endpoint
  .setSecurity([
    api.createSecurityRequirement("OAuth2", ["read:users"]),
  ])
  .addResponse("200", {
    description: "User found",
    // ... response details
  });

api.addNewEndpoint_("/users/{id}", getUserEndpoint);
```

## Combining Multiple Security Schemes

You can require multiple security schemes to be satisfied simultaneously by
including them in the same security requirement object:

```typescript
// Require both API key AND specific OAuth2 scope
const combinedRequirement = {};
combinedRequirement["ApiKeyAuth"] = [];
combinedRequirement["OAuth2"] = ["read:users"];

api.addGlobalSecurity(combinedRequirement);
```

## Example: Complete API with Security

Here's a complete example showing how to implement security in an API:

```typescript
import { EndpointBuilder, OpenAPI } from "jsr:@murat/openapi";

const api = new OpenAPI({
  title: "Secure User API",
  version: "1.0.0",
  description: "API for user management with security",
});

// Define security schemes
const jwtAuth = api.addHttpSecurity("JWTAuth", "bearer", {
  bearerFormat: "JWT",
  description: "JWT Bearer Token Authentication",
});

const apiKeyAuth = api.addApiKeySecurity("ApiKeyAuth", {
  in: "header",
  parameterName: "X-API-Key",
  description: "API Key Authentication",
});

// Set default security for all endpoints (either JWT or API Key)
api.setGlobalSecurity([
  api.createSecurityRequirement("JWTAuth"),
  api.createSecurityRequirement("ApiKeyAuth"),
]);

// Create an endpoint that requires special scopes
const updateUserEndpoint = new EndpointBuilder()
  .setOperation("put")
  .setTags(["users"])
  .setSummary("Update user")
  .addPathParameter("id", { type: "string" }, "User ID")
  .setRequestBody({
    contentType: "application/json",
    required: true,
    schema: {
      type: "object",
      properties: {
        name: { type: "string" },
        email: { type: "string", format: "email" },
      },
    },
  })
  .setSecurity([
    // This endpoint requires BOTH JWT and API key (stronger security)
    {
      "JWTAuth": [],
      "ApiKeyAuth": [],
    },
  ])
  .addResponse("200", {
    description: "User updated successfully",
    // ... response details
  });

api.addNewEndpoint_("/users/{id}", updateUserEndpoint);

// Public endpoint with no security requirements
const healthCheckEndpoint = new EndpointBuilder()
  .setOperation("get")
  .setTags(["system"])
  .setSummary("Health check")
  .setSecurity([]) // Empty array removes security requirements for this endpoint
  .addResponse("200", {
    description: "API is operational",
    content: {
      "application/json": {
        schema: {
          type: "object",
          properties: {
            status: { type: "string" },
            version: { type: "string" },
          },
        },
      },
    },
  });

api.addNewEndpoint_("/health", healthCheckEndpoint);
```

## Best Practices

1. **Define Security Schemes Centrally**: Use the component methods to define
   all your security schemes in one place
2. **Set Global Security**: Apply default security requirements at the API level
3. **Override When Needed**: Override security requirements at the operation
   level only when necessary
4. **Document Security**: Add clear descriptions to your security schemes
5. **Public Endpoints**: Explicitly mark public endpoints with empty security
   requirements
6. **Proper Scopes**: When using OAuth2, be specific about required scopes
