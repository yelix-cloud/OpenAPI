# OpenAPI Documentation

Welcome to the documentation for the OpenAPI library. This package provides a
developer-friendly way to define OpenAPI specifications for your APIs.

## Table of Contents

- [Getting Started](./getting-started.md)
- [EndpointBuilder](./endpoint-builder.md)
- [OpenAPI Schema](./openapi-schema.md)
- [Security](./security.md)
- [Components](./components.md)
- [Examples](./examples.md)

## Overview

The OpenAPI library helps you define your API specifications in a structured way
following the OpenAPI 3.1 standard. It provides:

- A fluent API for creating endpoints and their documentation
- Type-safe schema definitions for request and response objects
- Tools for serialization to JSON and YAML formats
- Validation rule handling and documentation
- Comprehensive security scheme definitions and requirements

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

// Export as JSON or YAML
const jsonString = api.getJSONString();
const yamlString = api.getYAMLString();
```

For more detailed instructions, check out the
[Getting Started](./getting-started.md) guide.
