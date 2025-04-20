# JSON Schema Vocabularies in OpenAPI

OpenAPI 3.1 expanded its support for JSON Schema, aligning with JSON Schema
2020-12 draft. This documentation covers how to use the enhanced JSON Schema
features in your API specifications.

## Setting the Default Schema Dialect

By default, OpenAPI 3.1 uses JSON Schema 2020-12 dialect, but you can explicitly
set a different dialect for your API specification:

```typescript
import { OpenAPI, SCHEMA_DIALECTS } from "jsr:@murat/openapi";

const api = new OpenAPI({
  title: "My API",
  version: "1.0.0",
});

// Change the default dialect to Draft 07
api.setJSONSchemaDialect(SCHEMA_DIALECTS.DRAFT_07);

// Or set a custom dialect
api.setJSONSchemaDialect("https://example.com/my-custom-schema");
```

You can also check the current dialect:

```typescript
const currentDialect = api.getJSONSchemaDialect();
console.log(currentDialect); // "https://json-schema.org/draft/2020-12/schema"
```

## Available Schema Dialects

The library provides constants for commonly used JSON Schema dialects:

```typescript
// Access via the SCHEMA_DIALECTS export
import { SCHEMA_DIALECTS } from "jsr:@murat/openapi";

// Available dialects
SCHEMA_DIALECTS.DRAFT_2020_12; // "https://json-schema.org/draft/2020-12/schema" (Default for OpenAPI 3.1)
SCHEMA_DIALECTS.DRAFT_2019_09; // "https://json-schema.org/draft/2019-09/schema"
SCHEMA_DIALECTS.DRAFT_07; // "https://json-schema.org/draft/07/schema"
SCHEMA_DIALECTS.DRAFT_06; // "https://json-schema.org/draft-06/schema#"
SCHEMA_DIALECTS.DRAFT_04; // "https://json-schema.org/draft-04/schema#"

// Also available as a static property
OpenAPI.SCHEMA_DIALECTS.DRAFT_2020_12;
```

## Creating Schemas with Specific Dialects

You can create schemas with specific JSON Schema dialects:

```typescript
// Create a schema using the default dialect (2020-12)
const userSchema = api.createSchema({
  type: "object",
  properties: {
    id: { type: "string", format: "uuid" },
    name: { type: "string" },
    email: { type: "string", format: "email" },
  },
  required: ["id", "name"],
});

// Create a schema using a specific dialect
const productSchema = api.createSchema({
  type: "object",
  properties: {
    id: { type: "string" },
    name: { type: "string" },
    price: { type: "number", minimum: 0 },
  },
  required: ["id", "name", "price"],
}, SCHEMA_DIALECTS.DRAFT_07);
```

## Adding Schemas with Custom Dialects to Components

When adding schemas to the components section, you can specify a custom dialect:

```typescript
// Add schema with default dialect
const userRef = api.addSchema("User", {
  type: "object",
  properties: {
    id: { type: "string", format: "uuid" },
    name: { type: "string" },
    email: { type: "string", format: "email" },
  },
  required: ["name", "email"],
});

// Add schema with specific dialect
const legacySchemaRef = api.addSchema("LegacyFormat", {
  type: "object",
  properties: {
    id: { type: "integer" },
    name: { type: "string" },
  },
}, SCHEMA_DIALECTS.DRAFT_04);
```

## JSON Schema Vocabularies

JSON Schema 2020-12 introduces the concept of vocabularies, which are
collections of keywords that serve specific purposes. You can define which
vocabularies your schema uses:

```typescript
// Create a schema with specific vocabularies enabled
const schemaWithVocabularies = api.createSchemaWithVocabularies({
  type: "object",
  properties: {
    name: { type: "string" },
  },
}, {
  "https://json-schema.org/draft/2020-12/vocab/core": true,
  "https://json-schema.org/draft/2020-12/vocab/validation": true,
  "https://json-schema.org/draft/2020-12/vocab/applicator": true,
  "https://json-schema.org/draft/2020-12/vocab/content": true,
  "https://json-schema.org/draft/2020-12/vocab/metadata": false,
  "https://example.com/my-custom-vocab": true,
});
```

You can also register vocabularies with descriptions:

```typescript
// Register vocabularies for documentation purposes
api.registerVocabulary(
  "https://json-schema.org/draft/2020-12/vocab/validation",
  "Core validation vocabulary for JSON Schema 2020-12",
);

api.registerVocabulary(
  "https://example.com/my-custom-vocab",
  "Custom validation rules for our organization",
);
```

## Using JSON Schema 2020-12 Features

OpenAPI 3.1 with JSON Schema 2020-12 supports many advanced features:

### Schema Identification and Reference

```typescript
const schema = {
  $schema: SCHEMA_DIALECTS.DRAFT_2020_12,
  $id: "https://example.com/schemas/user",
  $comment: "Schema for user data",
  type: "object",
  properties: {
    id: { type: "string" },
    profile: {
      $anchor: "userProfile", // Create an anchor for internal references
      type: "object",
      properties: {
        /* ... */
      },
    },
  },
  $defs: {
    // Define reusable sub-schemas
    address: {
      type: "object",
      properties: {
        street: { type: "string" },
        city: { type: "string" },
        country: { type: "string" },
      },
    },
  },
};
```

### Dynamic References

```typescript
{
  type: "object",
  properties: {
    user: {
      $dynamicRef: "#userType" // Dynamic reference that follows $dynamicAnchor
    }
  }
}
```

### Unevaluated Properties and Items

These keywords allow you to control validation for properties or items not
explicitly evaluated by other keywords:

```typescript
{
  type: "object",
  properties: {
    name: { type: "string" },
    email: { type: "string", format: "email" }
  },
  patternProperties: {
    "^x-": { type: "string" }  // Allow properties starting with x- to be strings
  },
  unevaluatedProperties: false  // Disallow any properties not matched by properties or patternProperties
}
```

For arrays:

```typescript
{
  type: "array",
  prefixItems: [
    { type: "string" },  // First item must be a string
    { type: "number" }   // Second item must be a number
  ],
  items: { type: "string" },  // Subsequent items must be strings
  unevaluatedItems: false     // No additional items allowed
}
```

### Content Validation

```typescript
{
  type: "string",
  contentEncoding: "base64",
  contentMediaType: "application/json",
  contentSchema: {
    type: "object",
    properties: {
      name: { type: "string" },
      value: { type: "number" }
    }
  }
}
```

### Dependent Schemas and Required

```typescript
{
  type: "object",
  properties: {
    name: { type: "string" },
    creditCard: { type: "string", pattern: "^[0-9]{16}$" },
    billingAddress: { type: "string" }
  },
  dependentRequired: {
    // If creditCard is present, billingAddress must also be present
    "creditCard": ["billingAddress"]
  },
  dependentSchemas: {
    // If creditCard is present, apply additional validation
    "creditCard": {
      properties: {
        // CVV must be provided with credit card
        cvv: { type: "string", pattern: "^[0-9]{3,4}$" }
      },
      required: ["cvv"]
    }
  }
}
```

### Conditional Validation

```typescript
{
  type: "object",
  properties: {
    type: { type: "string", enum: ["personal", "business"] },
    personalEmail: { type: "string", format: "email" },
    businessEmail: { type: "string", format: "email" },
    companyName: { type: "string" }
  },
  if: {
    properties: {
      type: { const: "business" }
    },
    required: ["type"]
  },
  then: {
    required: ["businessEmail", "companyName"]
  },
  else: {
    required: ["personalEmail"]
  }
}
```

## Full Example: API with Advanced Schema Features

Here's a complete example showing an API using JSON Schema 2020-12 features:

```typescript
import { EndpointBuilder, OpenAPI, SCHEMA_DIALECTS } from "jsr:@murat/openapi";

// Create API with explicit JSON Schema dialect
const api = new OpenAPI({
  title: "Advanced Schema API",
  version: "1.0.0",
});

// Explicitly set the dialect (though 2020-12 is already the default)
api.setJSONSchemaDialect(SCHEMA_DIALECTS.DRAFT_2020_12);

// Define a schema using 2020-12 features
const userSchemaRef = api.addSchema("User", {
  $id: "https://example.com/schemas/user",
  $comment: "Schema for user data with 2020-12 features",
  type: "object",
  properties: {
    id: {
      type: "string",
      format: "uuid",
      $anchor: "userId", // Can be referenced as #userId
    },
    name: { type: "string" },
    email: {
      type: "string",
      format: "email",
    },
    preferences: {
      type: "object",
      properties: {
        theme: {
          type: "string",
          enum: ["light", "dark", "system"],
        },
        notifications: {
          type: "array",
          prefixItems: [
            { type: "string", const: "email" }, // First item must be "email"
            { type: "boolean" }, // Second item must be boolean
          ],
          items: false, // No additional items allowed
        },
      },
      // If property names match this pattern, they must be strings
      propertyNames: {
        pattern: "^[a-z][a-zA-Z0-9]*$",
      },
      unevaluatedProperties: false, // No properties beyond what's defined
    },
    role: {
      type: "string",
      enum: ["user", "admin", "guest"],
    },
  },
  required: ["id", "name", "email"],
  // Define sub-schemas that can be reused
  $defs: {
    address: {
      type: "object",
      properties: {
        street: { type: "string" },
        city: { type: "string" },
        country: { type: "string" },
      },
      required: ["street", "city", "country"],
    },
  },
  // Conditional validation based on role
  if: {
    properties: { role: { const: "admin" } },
  },
  then: {
    properties: {
      adminPrivileges: {
        type: "array",
        items: { type: "string" },
      },
    },
    required: ["adminPrivileges"],
  },
});

// Create an endpoint that uses the schema
const getUserEndpoint = new EndpointBuilder({
  method: "get",
  title: "Get User",
})
  .setDescription("Get user profile")
  .addPathParameter("id", { type: "string", format: "uuid" }, "User ID")
  .addJsonResponse(200, "User found", userSchemaRef);

api.addNewEndpoint_("/users/{id}", getUserEndpoint);

// Get the OpenAPI document
const doc = api.getJSON();
console.log(JSON.stringify(doc, null, 2));
```

## Best Practices

1. **Be Explicit About Dialects**: When using features from a specific JSON
   Schema draft, explicitly set the dialect to avoid compatibility issues.

2. **Use Schema IDs and Anchors**: Leverage `$id` and `$anchor` to create
   referenceable, self-contained schemas.

3. **Leverage $defs**: Use the `$defs` keyword to define reusable sub-schemas
   within a larger schema.

4. **Adopt Conditional Validation**: Use `if`/`then`/`else` patterns for data
   with branching validation requirements.

5. **Control Property Access**: Use `unevaluatedProperties` to explicitly
   control which properties are allowed in your objects.

6. **Document Your Schemas**: Use `$comment` to add developer notes within your
   schemas for better maintainability.

7. **Consider Compatibility**: Be aware that some JSON Schema 2020-12 features
   might not be supported by all tools and validation libraries.
