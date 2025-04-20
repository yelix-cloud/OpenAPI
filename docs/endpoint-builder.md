# EndpointBuilder API Documentation

The `EndpointBuilder` is a powerful class for creating OpenAPI endpoint definitions with a fluent API. It allows you to define all aspects of an API endpoint including parameters, request bodies, responses, and more.

## Creating an Endpoint

```typescript
import { EndpointBuilder } from "@murat/openapi";

const endpoint = new EndpointBuilder({
  method: "get", // HTTP method: get, post, put, delete, patch, options
  title: "Get User", // A short title for the endpoint
});
```

## Tags

Tags help group related endpoints in API documentation:

```typescript
// Set all tags (replaces any existing tags)
endpoint.setTags(["users", "admin"]);

// Add a single tag
endpoint.addTag("public");

// Add multiple tags
endpoint.addTags(["read-only", "authenticated"]);
```

## Metadata

Set metadata for your endpoint:

```typescript
// Set a unique operation ID
endpoint.setOperationId("getUserById");

// Set a detailed description
endpoint.setDescription("Retrieves detailed user information by their unique identifier");

// Set a brief summary
endpoint.setSummary("Get user by ID");

// Mark as deprecated
endpoint.setDeprecated(true);

// Add external documentation
endpoint.setExternalDocs(
  "https://example.com/docs/users",
  "Additional documentation for the user API"
);

// Specify servers for this endpoint
endpoint.setServers([
  { 
    url: "https://api.example.com/v1", 
    description: "Production"
  },
  { 
    url: "https://api-staging.example.com/v1", 
    description: "Staging"
  }
]);
```

## Parameters

Add parameters to your endpoint:

### Path Parameters

```typescript
endpoint.addPathParameter(
  "userId", // Parameter name
  { type: "string" }, // Schema
  "The user's unique identifier" // Description
);
```

### Query Parameters

```typescript
endpoint.addQueryParameter(
  "includeDeleted", // Parameter name
  { type: "boolean" }, // Schema
  "Include soft-deleted users in the result", // Description
  false // Required (default: false)
);
```

### Header Parameters

```typescript
endpoint.addHeaderParameter(
  "X-API-Version", // Header name
  { type: "string" }, // Schema
  "API version override", // Description
  false // Required (default: false)
);
```

### Cookie Parameters

```typescript
endpoint.addCookieParameter(
  "session", // Cookie name
  { type: "string" }, // Schema
  "Session identifier", // Description
  true // Required
);
```

### Generic Parameter Method

For more complex cases, you can use the generic parameter method:

```typescript
endpoint.addParameter({
  name: "filter",
  in: "query",
  description: "Filter results by specific field",
  required: false,
  schema: {
    type: "object",
    properties: {
      field: { type: "string" },
      value: { type: "string" }
    }
  }
});
```

## Request Body

Define the request body for your endpoint:

```typescript
endpoint.setRequestBody({
  contentType: "application/json", // MIME type (default: application/json)
  required: true, // Whether the body is required
  schema: {
    type: "object",
    properties: {
      name: { type: "string" },
      email: { type: "string", format: "email" },
      age: { type: "integer", minimum: 18 }
    },
    required: ["name", "email"]
  },
  description: "User data" // Optional description
});
```

## Responses

Define the responses your endpoint can return:

### JSON Response (Convenience Method)

```typescript
endpoint.addJsonResponse(
  200, // HTTP status code
  "User found", // Description
  {
    type: "object",
    properties: {
      id: { type: "string" },
      name: { type: "string" },
      email: { type: "string" }
    }
  } // Schema
);
```

### Generic Response Method

For non-JSON responses or more control:

```typescript
endpoint.addResponse(
  404, // HTTP status code
  {
    description: "User not found",
    contentType: "application/json", // Optional, defaults to application/json
    schema: {
      type: "object",
      properties: {
        error: { type: "string" },
        code: { type: "integer" }
      }
    }
  }
);

// Response with no content
endpoint.addResponse(
  204,
  {
    description: "User deleted successfully"
    // No schema or contentType needed for 204 No Content
  }
);

// Response with non-JSON content
endpoint.addResponse(
  200,
  {
    description: "User profile image",
    contentType: "image/png",
    // Schema is optional for binary responses
  }
);
```

## Putting It All Together

Here's a complete example of defining a complex endpoint:

```typescript
const updateUserEndpoint = new EndpointBuilder({
  method: "put",
  title: "Update User",
})
  .setDescription("Updates an existing user's information")
  .addTags(["users", "write"])
  .setOperationId("updateUser")
  
  // Add path parameter
  .addPathParameter("userId", { type: "string" }, "User ID to update")
  
  // Add header parameter
  .addHeaderParameter(
    "If-Match", 
    { type: "string" }, 
    "ETag for concurrency control",
    true
  )
  
  // Define request body
  .setRequestBody({
    contentType: "application/json",
    required: true,
    schema: {
      type: "object",
      properties: {
        name: { type: "string" },
        email: { type: "string", format: "email" },
        address: {
          type: "object",
          properties: {
            street: { type: "string" },
            city: { type: "string" },
            postalCode: { type: "string" }
          }
        }
      }
    }
  })
  
  // Define successful response
  .addJsonResponse(200, "User updated successfully", {
    type: "object",
    properties: {
      id: { type: "string" },
      name: { type: "string" },
      email: { type: "string" },
      updatedAt: { type: "string", format: "date-time" }
    }
  })
  
  // Define error responses
  .addJsonResponse(400, "Invalid input", {
    type: "object", 
    properties: {
      error: { type: "string" },
      fields: { 
        type: "array",
        items: { type: "string" }
      }
    }
  })
  .addJsonResponse(404, "User not found", {
    type: "object",
    properties: {
      error: { type: "string" }
    }
  })
  .addJsonResponse(412, "Precondition failed", {
    type: "object",
    properties: {
      error: { type: "string" },
      currentETag: { type: "string" }
    }
  });
```

## Getting the OpenAPI Path Item

After defining your endpoint, get the OpenAPI Path Item object:

```typescript
const pathItem = endpoint.getEndpoint();
```

This object can then be added to your OpenAPI document:

```typescript
api.addNewEndpoint_("/users/{userId}", endpoint);
```
