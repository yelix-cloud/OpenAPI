# OpenAPI Components

Components are a powerful feature in OpenAPI 3.1 that allow you to define reusable objects in your API specification. The Components Object holds various schemas that can be referenced throughout the specification.

## Available Component Types

Yelix OpenAPI supports all component types from the OpenAPI 3.1 specification:

- **Schemas**: Reusable schema definitions
- **Responses**: Reusable response objects  
- **Parameters**: Reusable parameter objects
- **Examples**: Reusable examples
- **RequestBodies**: Reusable request body objects
- **Headers**: Reusable header objects
- **SecuritySchemes**: Authentication and authorization schemes
- **Links**: Reusable links between operations
- **Callbacks**: Reusable callback definitions
- **PathItems**: Reusable path item objects

## Adding Components

All component methods return a reference object that can be used in other parts of your API specification.

### Adding Schemas

```typescript
import { OpenAPI } from "yelix/openapi";

const openapi = new OpenAPI({
  title: "My API",
  version: "1.0.0"
});

// Define a reusable schema
const userSchemaRef = openapi.addSchema("User", {
  type: "object",
  properties: {
    id: { type: "integer" },
    name: { type: "string" },
    email: { type: "string", format: "email" }
  },
  required: ["id", "name", "email"]
});

// Now you can reference this schema in your endpoints
// using the returned reference object
console.log(userSchemaRef); // { $ref: "#/components/schemas/User" }
```

### Adding Responses

```typescript
// Define a reusable error response
const errorResponseRef = openapi.addResponse("Error", {
  description: "An error occurred",
  content: {
    "application/json": {
      schema: {
        type: "object",
        properties: {
          code: { type: "integer" },
          message: { type: "string" }
        },
        required: ["code", "message"]
      }
    }
  }
});
```

### Adding Parameters

```typescript
// Define a reusable parameter
const limitParamRef = openapi.addParameter("limit", {
  name: "limit",
  in: "query",
  description: "Maximum number of items to return",
  required: false,
  schema: {
    type: "integer",
    minimum: 1,
    maximum: 100,
    default: 20
  }
});
```

### Adding Security Schemes

```typescript
// Define an API key security scheme
const apiKeyRef = openapi.addSecurityScheme("ApiKey", {
  type: "apiKey",
  name: "X-API-KEY",
  in: "header",
  description: "API key authentication"
});

// Define OAuth2 security scheme
const oauth2Ref = openapi.addSecurityScheme("OAuth2", {
  type: "oauth2",
  flows: {
    implicit: {
      authorizationUrl: "https://example.com/oauth/authorize",
      tokenUrl: "https://example.com/oauth/token",
      scopes: {
        "read:items": "Read items",
        "write:items": "Write items"
      }
    }
  }
});
```

## Using Components with EndpointBuilder

You can use the returned reference objects directly in your operations with EndpointBuilder:

```typescript
import { EndpointBuilder } from "yelix/openapi";

// Create an endpoint builder
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
      type: "integer"
    }
  })
  .addResponse("200", {
    description: "User found",
    content: {
      "application/json": {
        schema: userSchemaRef // Using the reference from addSchema
      }
    }
  })
  .addResponse("404", errorResponseRef); // Using the reference from addResponse

openapi.addNewEndpoint_("/users/{id}", getUserEndpoint);
```

## Looking Up Components by Reference

You can retrieve a component using its reference string:

```typescript
const userSchema = openapi.getComponentByRef("#/components/schemas/User");
console.log(userSchema);
```

## Best Practices

1. **Use Components for Common Objects**: Define schemas, responses, and parameters that are used in multiple endpoints as components.
2. **Consistent Naming**: Use a consistent naming convention for your components.
3. **Schema Reuse**: Break down complex schemas into smaller, reusable components.
```
