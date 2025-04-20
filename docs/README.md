# OpenAPI Documentation

Welcome to the documentation for the OpenAPI library. This package provides a
developer-friendly way to define OpenAPI specifications for your APIs.

## Table of Contents

- [Getting Started](./getting-started.md)
- [EndpointBuilder](./endpoint-builder.md)
- [OpenAPI Schema](./openapi-schema.md)
- [JSON Schema Vocabularies](./json-schema-vocabularies.md)
- [Security](./security.md)
- [Tags](./tags.md)
- [Components](./components.md)
- [Webhooks](./webhooks.md)
- [Examples](./examples.md)

## Overview

The OpenAPI library helps you define your API specifications in a structured way
following the OpenAPI 3.1 standard. It provides:

- A fluent API for creating endpoints and their documentation
- Type-safe schema definitions for request and response objects
- Tools for serialization to JSON and YAML formats
- Validation rule handling and documentation
- Comprehensive security scheme definitions and requirements
- Tag management for API organization and categorization
- Webhook support for defining asynchronous API callbacks
- Component reusability for schemas, responses, parameters, and webhooks
- Full JSON Schema 2020-12 support with advanced schema vocabularies

## Basic Usage

Here's a basic example of creating an OpenAPI document:

```typescript
import { EndpointBuilder, OpenAPI } from "@murat/openapi";

// Create a new OpenAPI document
const api = new OpenAPI({
  title: "My API",
  version: "1.0.0",
  description: "A sample API for demonstration purposes",
});

// Create an endpoint
const getUserEndpoint = new EndpointBuilder({
  method: "get",
  title: "Get User",
})
  .setDescription("Retrieves user information by ID")
  .addPathParameter("id", { type: "string" }, "User ID")
  .addJsonResponse(200, "User retrieved successfully", {
    type: "object",
    properties: {
      id: { type: "string" },
      name: { type: "string" },
      email: { type: "string", format: "email" },
    },
  });

// Add the endpoint to the API document
api.addNewEndpoint_("/users/{id}", getUserEndpoint);

// Add a webhook to the API
api.createWebhook("userUpdated", {
  summary: "User Updated Notification",
  description: "Sent when a user profile is updated",
  operations: {
    post: {
      requestBody: {
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                userId: { type: "string" },
                updatedAt: { type: "string", format: "date-time" },
              },
              required: ["userId", "updatedAt"],
            },
          },
        },
        required: true,
      },
      responses: {
        "200": { description: "Webhook received" },
      },
    },
  },
});

// Export as JSON or YAML
const jsonString = api.getJSONString();
const yamlString = api.getYAMLString();
```

For more detailed instructions, check out the
[Getting Started](./getting-started.md) guide.
