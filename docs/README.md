# Yelix OpenAPI

A TypeScript library for creating OpenAPI 3.1.0 specifications with a fluent
API.

## Table of Contents

- [Installation](#installation)
- [Basic Usage](#basic-usage)
- [API Reference](#api-reference)
  - [OpenAPI Class](#openapi-class)
  - [EndpointPath](#endpointpath)
  - [EndpointBuilder](#endpointbuilder)
- [Examples](#examples)
- [License](#license)

## Installation

```ts
import { OpenAPI } from "@murat/openapi";
// Or import specific components
import {
  createEndpointBuilder,
  createEndpointPath,
  OpenAPI,
} from "@murat/openapi";
```

## Basic Usage

```ts
import {
  createEndpointBuilder,
  createEndpointPath,
  OpenAPI,
} from "@murat/openapi";

// Create a new OpenAPI instance
const api = new OpenAPI()
  .setTitle("Pet Store API")
  .setVersion("1.0.0")
  .setDescription("A sample API for managing pets")
  .setLicenseIdentifier("MIT");

// Add an endpoint path
api.addEndpointPath(
  createEndpointPath("/pets")
    .setSummary("Pet operations")
    .setDescription("Endpoints for managing pets")
    .addEndpoint(
      createEndpointBuilder("get")
        .setOperationId("listPets")
        .setSummary("List all pets")
        .setResponses({
          200: {
            description: "A list of pets",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      id: { type: "string" },
                      name: { type: "string" },
                      type: { type: "string" },
                    },
                  },
                },
              },
            },
          },
        }),
    ),
);
```

## API Reference

### OpenAPI Class

The main class for creating OpenAPI 3.1.0 specifications.

#### Constructor

```ts
new OpenAPI();
```

Creates a new OpenAPI instance with default values:

- openapi: "3.1.0"
- info.title: "OpenAPI 3.1.0"
- info.version: "1.0.0"

#### Methods

All methods return `this` for method chaining.

##### Basic Information

- **setTitle(title: string)**
  - Sets the API title
  - Example: `api.setTitle("Pet Store API")`

- **setVersion(version: string)**
  - Sets the API version
  - Example: `api.setVersion("1.0.0")`

- **setDescription(description: string)**
  - Sets the API description
  - Example: `api.setDescription("A sample API for managing pets")`

- **setTermsOfService(termsOfService: string)**
  - Sets the terms of service URL
  - Example: `api.setTermsOfService("https://example.com/terms")`

##### Contact Information

- **setContactName(name: string)**
  - Sets the contact name
  - Example: `api.setContactName("API Support")`

- **setContactUrl(url: string)**
  - Sets the contact URL
  - Example: `api.setContactUrl("https://example.com/support")`

- **setContactEmail(email: string)**
  - Sets the contact email
  - Example: `api.setContactEmail("support@example.com")`

##### License Information

- **setLicenseName(name: string)**
  - Sets the license name
  - Example: `api.setLicenseName("MIT License")`

- **setLicenseUrl(url: string)**
  - Sets the license URL
  - Example: `api.setLicenseUrl("https://opensource.org/licenses/MIT")`

- **setLicenseIdentifier(identifier: AllowedLicenses)**
  - Sets the SPDX license identifier
  - Example: `api.setLicenseIdentifier("MIT")`
  - Uses standardized SPDX identifiers

##### API Documentation & Metadata

- **setJsonSchemaDialect(dialect: string)**
  - Sets the JSON Schema dialect for the OpenAPI document
  - Example:
    `api.setJsonSchemaDialect("https://json-schema.org/draft/2020-12/schema")`

- **setServers(servers: { url: string; description?: string }[])**
  - Sets the API servers list
  - Example:
    `api.setServers([{ url: "https://api.example.com", description: "Production" }])`

- **setSecurity(scheme: { type: 'apiKey' | 'http' | 'oauth2' | 'openIdConnect';
  name: string; scopes?: string[] })**
  - Sets global security requirements
  - Example: `api.setSecurity({ type: "apiKey", name: "api_key", scopes: [] })`

- **setTag(name: string, description?: string)**
  - Adds a tag definition that can be used for operation grouping
  - Example: `api.setTag("users", "User management endpoints")`

- **setTags(tags: string[])**
  - Adds multiple tags at once
  - Example: `api.setTags(["users", "products", "orders"])`

- **setExternalDocs(url: string, description?: string)**
  - Sets a link to external documentation
  - Example:
    `api.setExternalDocs("https://example.com/docs", "API Documentation")`

##### Endpoints

- **addEndpointPath(endpointPath: EndpointPath)**
  - Adds an endpoint path to the API
  - Example: `api.addEndpointPath(endpointPath)`
  - Warns if the path already exists

### EndpointPath

Represents a path in the OpenAPI specification, which may contain multiple HTTP
methods.

#### Creating an EndpointPath

```ts
createEndpointPath(path: string)
```

- Example: `createEndpointPath("/users")`

#### Methods

All methods return `this` for method chaining.

- **setSummary(summary: string)**
  - Sets a summary for the path
  - Example: `path.setSummary("User operations")`

- **setDescription(description: string)**
  - Sets a detailed description for the path
  - Example: `path.setDescription("Endpoints for managing users")`

- **setParameter(name: string, _in: OpenAPIParameterLocation, required: boolean,
  description: string)**
  - Adds a parameter that applies to all operations in the path
  - `_in` can be: 'path', 'query', 'header', 'cookie'
  - Example: `path.setParameter("userId", "path", true, "User identifier")`

- **setServers(servers: { url: string; description?: string }[])**
  - Sets server overrides for this path
  - Example:
    `path.setServers([{ url: "https://api.example.com", description: "Production" }])`

- **addEndpoint(builder: EndpointBuilder)**
  - Adds an HTTP method operation to this path
  - Example: `path.addEndpoint(getBuilder)`
  - Warns if the method already exists for this path

### EndpointBuilder

Builds operations for specific HTTP methods on a path.

#### Creating an EndpointBuilder

```ts
createEndpointBuilder(method: OpenAPIMethodsLowercase)
```

- `method` is one of: 'get', 'post', 'put', 'delete', 'patch', 'options',
  'head', 'trace'
- Example: `createEndpointBuilder("get")`

#### Methods

All methods return `this` for method chaining.

##### Basic Information

- **setOperationId(operationId: string)**
  - Sets a unique identifier for the operation
  - Example: `builder.setOperationId("getUsers")`

- **setSummary(summary: string)**
  - Sets a summary for the operation
  - Example: `builder.setSummary("Get users")`

- **setDescription(description: string)**
  - Sets a detailed description for the operation
  - Example: `builder.setDescription("Returns a list of users")`

- **setTags(tags: string[])**
  - Sets tags for organizing operations
  - Example: `builder.setTags(["Users", "Admin"])`

- **setDeprecated(deprecated: boolean)**
  - Marks the operation as deprecated
  - Example: `builder.setDeprecated(true)`

##### Documentation

- **setExternalDocs(url: string, description?: string)**
  - Adds link to external documentation
  - Example:
    `builder.setExternalDocs("https://example.com/docs", "API Documentation")`

##### Security

- **setSecurity(security: Record<string, string[]>)**
  - Sets security requirements
  - Example: `builder.setSecurity({ apiKey: [], oauth2: ["read", "write"] })`

##### Parameters

- **setParameter(name: string, _in: OpenAPIParameterLocation, required: boolean,
  description: string)**
  - Adds a parameter to the operation
  - `_in` can be: 'path', 'query', 'header', 'cookie'
  - Example: `builder.setParameter("userId", "path", true, "User identifier")`

##### Request

- **setRequestBody(content: Record<string, { schema: Record<string, unknown> }>,
  required: boolean)**
  - Sets the request body
  - Example:
    ```ts
    builder.setRequestBody({
      "application/json": {
        schema: {
          type: "object",
          properties: {
            name: { type: "string" },
          },
        },
      },
    }, true);
    ```

##### Responses

- **setResponses(responses: Record<string, { description: string; content?:
  Record<string, { schema: Record<string, unknown> }> }>)**
  - Sets the possible responses
  - Example:
    ```ts
    builder.setResponses({
      200: {
        description: "Success",
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
    ```

##### Advanced Features

- **setCallbacks(callbacks: Record<string, { [expression: string]: { $ref:
  string } }>)**
  - Sets callbacks for webhooks
  - Example:
    `builder.setCallbacks({ onUserCreate: { "{$request.body#/callbackUrl}": { $ref: "#/components/pathItems/UserCreated" } } })`

- **setServers(servers: { url: string; description?: string }[])**
  - Sets server overrides for this operation
  - Example:
    `builder.setServers([{ url: "https://api.example.com/v2", description: "API V2" }])`

## Examples

### Complete API Example

```ts
import {
  createEndpointBuilder,
  createEndpointPath,
  OpenAPI,
} from "@murat/openapi";

const api = new OpenAPI()
  .setTitle("Blog API")
  .setVersion("1.0.0")
  .setDescription("API for blog management")
  .setContactName("API Team")
  .setContactEmail("api@example.com")
  .setLicenseIdentifier("MIT");

// Add posts collection endpoint
api.addEndpointPath(
  createEndpointPath("/posts")
    .setSummary("Blog posts operations")
    .addEndpoint(
      createEndpointBuilder("get")
        .setOperationId("listPosts")
        .setSummary("List all posts")
        .setTags(["Posts"])
        .setParameter("page", "query", false, "Page number")
        .setParameter("limit", "query", false, "Results per page")
        .setResponses({
          200: {
            description: "List of posts",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      id: { type: "string" },
                      title: { type: "string" },
                      summary: { type: "string" },
                    },
                  },
                },
              },
            },
          },
        }),
    )
    .addEndpoint(
      createEndpointBuilder("post")
        .setOperationId("createPost")
        .setSummary("Create a new post")
        .setTags(["Posts"])
        .setSecurity({ apiKey: [] })
        .setRequestBody({
          "application/json": {
            schema: {
              type: "object",
              properties: {
                title: { type: "string" },
                content: { type: "string" },
                published: { type: "boolean" },
              },
              required: ["title", "content"],
            },
          },
        }, true)
        .setResponses({
          201: {
            description: "Post created",
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
          400: {
            description: "Invalid input",
          },
        }),
    ),
);

// Add single post endpoint
api.addEndpointPath(
  createEndpointPath("/posts/{postId}")
    .setParameter("postId", "path", true, "Post identifier")
    .addEndpoint(
      createEndpointBuilder("get")
        .setOperationId("getPost")
        .setSummary("Get a post by ID")
        .setTags(["Posts"])
        .setResponses({
          200: {
            description: "Post details",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    id: { type: "string" },
                    title: { type: "string" },
                    content: { type: "string" },
                    published: { type: "boolean" },
                    createdAt: { type: "string", format: "date-time" },
                  },
                },
              },
            },
          },
          404: {
            description: "Post not found",
          },
        }),
    )
    .addEndpoint(
      createEndpointBuilder("put")
        .setOperationId("updatePost")
        .setSummary("Update a post")
        .setTags(["Posts"])
        .setSecurity({ apiKey: [] })
        .setRequestBody({
          "application/json": {
            schema: {
              type: "object",
              properties: {
                title: { type: "string" },
                content: { type: "string" },
                published: { type: "boolean" },
              },
            },
          },
        }, true)
        .setResponses({
          200: { description: "Post updated" },
          404: { description: "Post not found" },
        }),
    )
    .addEndpoint(
      createEndpointBuilder("delete")
        .setOperationId("deletePost")
        .setSummary("Delete a post")
        .setTags(["Posts"])
        .setSecurity({ apiKey: [] })
        .setResponses({
          204: { description: "Post deleted" },
          404: { description: "Post not found" },
        }),
    ),
);
```

## License

This project is licensed under the MIT License - see the LICENSE file for
details.
