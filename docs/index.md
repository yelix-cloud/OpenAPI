# Yelix OpenAPI Documentation

Yelix OpenAPI is a TypeScript-first library for generating OpenAPI 3.1 documentation for your API. It provides a simple and intuitive way to define your API endpoints, schemas, responses, and more.

## Features

- 🚀 **TypeScript-first**: Full type safety and autocomplete support
- 📚 **OpenAPI 3.1 compatible**: Generate OpenAPI documentation that follows the latest specification
- 🧩 **Components**: Define reusable schemas, responses, parameters, and more
- 📄 **JSON & YAML output**: Export your documentation in both formats
- 🔄 **Validation**: Associate validation rules with your API documentation

## Documentation

- [Getting Started](./getting-started.md): Learn how to use Yelix OpenAPI
- [Components](./components.md): Learn how to use reusable components
- [Validation](./validation.md): Learn about validation rules

## Basic Example

Here's a simple example of how to use Yelix OpenAPI:

```typescript
import { OpenAPI, EndpointBuilder } from "yelix/openapi";

// Create OpenAPI document
const openapi = new OpenAPI({
  title: "Pet Store API",
  version: "1.0.0",
  description: "API for managing a pet store",
  servers: [
    {
      url: "https://petstore.example.com/v1",
      description: "Production server"
    }
  ]
});

// Define a reusable schema
const petSchemaRef = openapi.addSchema("Pet", {
  type: "object",
  properties: {
    id: { type: "integer" },
    name: { type: "string" },
    status: { 
      type: "string",
      enum: ["available", "pending", "sold"]
    }
  },
  required: ["name"]
});

// Create an endpoint
const getPetsEndpoint = new EndpointBuilder()
  .setOperation("get")
  .setTags(["pets"])
  .setSummary("Get all pets")
  .addResponse("200", {
    description: "A list of all pets",
    content: {
      "application/json": {
        schema: {
          type: "array",
          items: petSchemaRef
        }
      }
    }
  });

// Add the endpoint to the OpenAPI document
openapi.addNewEndpoint_("/pets", getPetsEndpoint);

// Get the OpenAPI specification as YAML
const yaml = openapi.getYAMLString();
console.log(yaml);
```

## Advanced Usage

Check out the [Getting Started](./getting-started.md) guide for more detailed examples and the [Components](./components.md) documentation to learn how to use reusable components effectively.
