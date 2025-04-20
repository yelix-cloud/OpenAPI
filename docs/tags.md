# Tags in OpenAPI

Tags are used to categorize and organize API operations in OpenAPI
specifications. They enable documentation tools to group related operations and
provide a better understanding of the API structure.

## Adding Tags

You can add tags to your OpenAPI document that operations can then reference:

```typescript
import { OpenAPI } from "jsr:@murat/openapi";

const api = new OpenAPI({
  title: "Tagged API",
  version: "1.0.0",
});

// Add a simple tag with just a name
api.addTag("users");

// Add a tag with description
api.addTag("products", "Product management endpoints");

// Add a tag with external documentation
api.addTag("orders", "Order management endpoints", {
  url: "https://example.com/docs/orders",
  description: "Extended documentation for order endpoints",
});

// Chain multiple tag additions using fluent interface
api
  .addTag("auth", "Authentication endpoints")
  .addTag("admin", "Administrative endpoints")
  .addTag("public", "Public endpoints");
```

## Using Tags in Endpoints

Tags added to your OpenAPI document can be referenced in your endpoints:

```typescript
import { EndpointBuilder } from "jsr:@murat/openapi";

const getUserEndpoint = new EndpointBuilder({
  method: "get",
  title: "Get User",
})
  .addTag("users") // Add the "users" tag to this endpoint
  .addTag("public"); // Add the "public" tag to this endpoint
// ... endpoint configuration

api.addNewEndpoint_("/users/{id}", getUserEndpoint);
```

## Retrieving Tags

You can access tags defined in your OpenAPI document:

```typescript
// Get all tags
const allTags = api.getTags();
console.log(`API has ${allTags.length} tags defined`);

// Get a specific tag by name
const userTag = api.getTagByName("users");
if (userTag) {
  console.log(`Found tag: ${userTag.name}`);
  console.log(`Description: ${userTag.description}`);
}
```

## Updating Tags

You can update existing tags in your OpenAPI document:

```typescript
// Update a tag's description
api.updateTag(
  "users", // Tag name to update
  "User management and profiles", // New description
);

// Update or add external documentation to a tag
api.updateTag(
  "products", // Tag name to update
  undefined, // Keep existing description
  { // New external docs
    url: "https://example.com/docs/products/v2",
    description: "Updated product documentation",
  },
);

// Add external docs to a tag (alternative method)
api.addTagExternalDocs(
  "orders", // Tag name
  "https://example.com/docs/orders", // Documentation URL
  "Detailed order documentation", // Optional description
);
```

## Removing Tags

You can remove tags from your OpenAPI document:

```typescript
// Remove a tag
const removed = api.removeTag("deprecated-tag");
if (removed) {
  console.log("Tag was successfully removed");
} else {
  console.log("Tag was not found");
}
```

> **Note**: Removing a tag from the OpenAPI document doesn't automatically
> remove that tag from operations that reference it. You'll need to update those
> operations separately.

## External Documentation

You can create external documentation objects for use with tags:

```typescript
// Create an external documentation object
const externalDocs = api.createExternalDocs(
  "https://example.com/docs/api",
  "Complete API documentation",
);

// Use it when adding a tag
api.addTag("payments", "Payment processing endpoints", externalDocs);
```

## Best Practices

1. **Consistency**: Use consistent naming conventions for tags
2. **Description**: Include clear descriptions for all tags
3. **Grouping**: Group related operations under the same tag
4. **Organization**: Organize tags logically to reflect your API's structure
5. **Documentation**: Provide external documentation links for complex
   functionality

## Complete Example

Here's a complete example showing how to use tags in your API:

```typescript
import { EndpointBuilder, OpenAPI } from "jsr:@murat/openapi";

const api = new OpenAPI({
  title: "E-commerce API",
  version: "1.0.0",
  description: "API for an e-commerce platform",
});

// Define tags with descriptions
api.addTag("products", "Product catalog operations")
  .addTag("customers", "Customer management operations")
  .addTag("orders", "Order processing operations", {
    url: "https://example.com/docs/orders",
    description: "Detailed order processing documentation",
  })
  .addTag("auth", "Authentication and authorization");

// Define endpoints using tags
const getProductsEndpoint = new EndpointBuilder({
  method: "get",
  title: "List Products",
})
  .addTag("products")
  .addTag("public");
// ... endpoint configuration

const createOrderEndpoint = new EndpointBuilder({
  method: "post",
  title: "Create Order",
})
  .addTags(["orders", "customers"]);
// ... endpoint configuration

// Add endpoints to the API
api.addNewEndpoint_("/products", getProductsEndpoint);
api.addNewEndpoint_("/orders", createOrderEndpoint);
```

In the OpenAPI UI (like Swagger UI), these tags will be used to organize your
API operations into logical groups, making your API documentation more
user-friendly and easier to navigate.
