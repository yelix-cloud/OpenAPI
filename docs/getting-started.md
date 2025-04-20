# Getting Started with Yelix OpenAPI

Yelix OpenAPI provides a simple way to create OpenAPI 3.1 documentation for your
API.

## Installation

```bash
# Using Deno
import { OpenAPI } from "jsr:@murat/openapi";
```

## Basic Usage

### Creating an OpenAPI Document

```typescript
import { OpenAPI } from "jsr:@murat/openapi";

// Initialize OpenAPI with basic info
const openapi = new OpenAPI({
  title: "My API",
  version: "1.0.0",
  description: "API for managing resources",
  servers: [
    {
      url: "https://api.example.com/v1",
      description: "Production server",
    },
    {
      url: "https://api.staging.example.com/v1",
      description: "Staging server",
    },
  ],
});
```

### Adding Endpoints

To add endpoints to your OpenAPI document, you use the `EndpointBuilder` class
in combination with the `addNewEndpoint_` method:

```typescript
import { EndpointBuilder } from "jsr:@murat/openapi";

// Create an endpoint for getting a list of users
const getUsersEndpoint = new EndpointBuilder()
  .setOperation("get")
  .setTags(["users"])
  .setSummary("Get users")
  .setDescription("Get a list of users with optional filtering")
  .addParameter({
    name: "limit",
    in: "query",
    description: "Maximum number of items to return",
    required: false,
    schema: {
      type: "integer",
      default: 20,
    },
  })
  .addResponse("200", {
    description: "List of users",
    content: {
      "application/json": {
        schema: {
          type: "array",
          items: {
            type: "object",
            properties: {
              id: { type: "integer" },
              name: { type: "string" },
              email: { type: "string" },
            },
          },
        },
      },
    },
  });

// Add the endpoint to the OpenAPI document
openapi.addNewEndpoint_("/users", getUsersEndpoint);
```

### Using Components for Reusability

For better organization and to avoid duplication, use the OpenAPI component
methods:

```typescript
// Define a reusable user schema
const userSchemaRef = openapi.addSchema("User", {
  type: "object",
  properties: {
    id: { type: "integer" },
    name: { type: "string" },
    email: { type: "string", format: "email" },
  },
  required: ["name", "email"],
});

// Define a reusable error response
const errorResponseRef = openapi.addResponse("Error", {
  description: "An error occurred",
  content: {
    "application/json": {
      schema: {
        type: "object",
        properties: {
          code: { type: "integer" },
          message: { type: "string" },
        },
        required: ["code", "message"],
      },
    },
  },
});

// Use these components in your endpoint
const getUserEndpoint = new EndpointBuilder()
  .setOperation("get")
  .setTags(["users"])
  .setSummary("Get user by ID")
  .setDescription("Returns a user based on the provided ID")
  .addParameter({
    name: "id",
    in: "path",
    required: true,
    schema: {
      type: "integer",
    },
  })
  .addResponse("200", {
    description: "User found",
    content: {
      "application/json": {
        schema: userSchemaRef,
      },
    },
  })
  .addResponse("404", errorResponseRef);

openapi.addNewEndpoint_("/users/{id}", getUserEndpoint);
```

### Adding Security Schemes

Configure authentication and authorization for your API:

```typescript
// Define API Key authentication
const apiKeyRef = openapi.addApiKeySecurity("ApiKey", {
  in: "header",
  parameterName: "X-API-Key",
  description: "API Key Authentication",
});

// Define JWT Bearer authentication
const jwtRef = openapi.addHttpSecurity("JWT", "bearer", {
  bearerFormat: "JWT",
  description: "JWT Bearer Token Authentication",
});

// Define OAuth2 authentication
const oauth2Ref = openapi.addOAuth2Security("OAuth2", {
  authorizationCode: {
    authorizationUrl: "https://example.com/oauth/authorize",
    tokenUrl: "https://example.com/oauth/token",
    scopes: {
      "read": "Read access",
      "write": "Write access",
      "admin": "Admin access",
    },
  },
}, "OAuth 2.0 Authentication");

// Set global security requirements (logical OR - any one can be satisfied)
openapi.setGlobalSecurity([
  openapi.createSecurityRequirement("ApiKey"),
  openapi.createSecurityRequirement("JWT"),
  openapi.createSecurityRequirement("OAuth2", ["read"]),
]);
```

For endpoints with specific security requirements, you can override the global
settings:

```typescript
const adminEndpoint = new EndpointBuilder()
  .setOperation("get")
  .setSummary("Admin operation")
  // Require OAuth2 with admin scope
  .setSecurity([
    openapi.createSecurityRequirement("OAuth2", ["admin"]),
  ])
  .addResponse("200", {
    description: "Success",
    // ... response details
  });

// Public endpoint with no security
const publicEndpoint = new EndpointBuilder()
  .setOperation("get")
  .setSummary("Public health check")
  .setSecurity([]) // Empty array removes security requirements
  .addResponse("200", {
    description: "API is healthy",
    // ... response details
  });
```

### Outputting the Documentation

You can get your OpenAPI documentation in different formats:

```typescript
// Get the OpenAPI document as a JavaScript object
const openApiObject = openapi.getJSON();

// Get the OpenAPI document as a JSON string (useful for saving to a file)
const openApiJson = openapi.getJSONString();

// Get the OpenAPI document as YAML (useful for readability)
const openApiYaml = openapi.getYAMLString();

// Save to a file
import { writeFileSync } from "fs";
writeFileSync("openapi.json", openApiJson);
writeFileSync("openapi.yaml", openApiYaml);
```

## Complete Example

Here's a more complete example showing how to use the OpenAPI class with
components:

```typescript
import { EndpointBuilder, OpenAPI } from "jsr:@murat/openapi";

// Create the OpenAPI instance
const openapi = new OpenAPI({
  title: "Pet Store API",
  version: "1.0.0",
  description: "API for pet store management",
  servers: [
    {
      url: "https://api.petstore.com/v1",
      description: "Production server",
    },
  ],
});

// Define reusable components
const petSchemaRef = openapi.addSchema("Pet", {
  type: "object",
  properties: {
    id: { type: "integer" },
    name: { type: "string" },
    tag: { type: "string" },
  },
  required: ["name"],
});

const errorResponseRef = openapi.addResponse("Error", {
  description: "An error occurred",
  content: {
    "application/json": {
      schema: {
        type: "object",
        properties: {
          code: { type: "integer" },
          message: { type: "string" },
        },
      },
    },
  },
});

// Create endpoints
const getPetsEndpoint = new EndpointBuilder()
  .setOperation("get")
  .setTags(["pets"])
  .setSummary("List all pets")
  .addResponse("200", {
    description: "A list of pets",
    content: {
      "application/json": {
        schema: {
          type: "array",
          items: petSchemaRef,
        },
      },
    },
  })
  .addResponse("default", errorResponseRef);

openapi.addNewEndpoint_("/pets", getPetsEndpoint);

// Output the documentation
console.log(openapi.getYAMLString());
```
