# OpenAPI Schema Documentation

This guide explains how to define and use schemas in the OpenAPI library, which
are used to describe the structure of request and response data.

## Basic Schema Types

OpenAPI supports the following basic data types:

| Type      | Description                       | Example                                 |
| --------- | --------------------------------- | --------------------------------------- |
| `string`  | String values                     | `{ type: "string" }`                    |
| `number`  | Floating point numbers            | `{ type: "number" }`                    |
| `integer` | Whole numbers                     | `{ type: "integer" }`                   |
| `boolean` | True/false values                 | `{ type: "boolean" }`                   |
| `array`   | Ordered list of values            | `{ type: "array", items: {...} }`       |
| `object`  | Unordered set of name/value pairs | `{ type: "object", properties: {...} }` |

## String Format

You can specify string formats for common string patterns:

```typescript
// Email address
{ type: "string", format: "email" }

// Date and time
{ type: "string", format: "date-time" }

// Date only
{ type: "string", format: "date" }

// Time only
{ type: "string", format: "time" }

// UUID
{ type: "string", format: "uuid" }

// URI
{ type: "string", format: "uri" }

// Password (UI hint)
{ type: "string", format: "password" }

// Binary data
{ type: "string", format: "binary" }

// Base64-encoded data
{ type: "string", format: "byte" }
```

## Number Constraints

You can add constraints to number and integer types:

```typescript
{
  type: "number",
  minimum: 0,           // Minimum value (inclusive)
  maximum: 100,         // Maximum value (inclusive)
  exclusiveMinimum: 0,  // Minimum value (exclusive)
  exclusiveMaximum: 100 // Maximum value (exclusive)
}
```

## String Constraints

Add constraints to string types:

```typescript
{
  type: "string",
  minLength: 5,         // Minimum length
  maxLength: 100,       // Maximum length
  pattern: "^[A-Z]+$"   // Regular expression pattern
}
```

## Array Schemas

Define arrays with item constraints:

```typescript
// Array of strings
{
  type: "array",
  items: {
    type: "string"
  },
  minItems: 1,          // Minimum number of items
  maxItems: 10,         // Maximum number of items
  uniqueItems: true     // Whether items must be unique
}

// Array of objects
{
  type: "array",
  items: {
    type: "object",
    properties: {
      id: { type: "string" },
      name: { type: "string" }
    }
  }
}
```

## Object Schemas

Define object schemas with properties:

```typescript
{
  type: "object",
  properties: {
    id: { type: "string" },
    name: { type: "string" },
    age: { type: "integer", minimum: 0 },
    email: { type: "string", format: "email" }
  },
  required: ["id", "name"],    // List of required properties
  additionalProperties: false  // Whether additional properties are allowed
}
```

## Nested Objects

Define complex nested structures:

```typescript
{
  type: "object",
  properties: {
    user: {
      type: "object",
      properties: {
        id: { type: "string" },
        profile: {
          type: "object",
          properties: {
            firstName: { type: "string" },
            lastName: { type: "string" },
            address: {
              type: "object",
              properties: {
                street: { type: "string" },
                city: { type: "string" },
                country: { type: "string" }
              }
            }
          }
        }
      }
    }
  }
}
```

## Enums

Define enumerated values:

```typescript
// String enum
{
  type: "string",
  enum: ["pending", "active", "completed", "cancelled"]
}

// Number enum
{
  type: "integer",
  enum: [1, 2, 3, 5, 8, 13]
}
```

## Examples

Add examples to your schemas:

```typescript
{
  type: "object",
  properties: {
    id: { type: "string" },
    name: { type: "string" },
    email: { type: "string", format: "email" }
  },
  example: {
    id: "123e4567-e89b-12d3-a456-426614174000",
    name: "John Smith",
    email: "john.smith@example.com"
  }
}
```

## Default Values

Specify default values:

```typescript
{
  type: "object",
  properties: {
    sortOrder: { 
      type: "string", 
      enum: ["asc", "desc"], 
      default: "asc" 
    },
    pageSize: { 
      type: "integer", 
      minimum: 1, 
      maximum: 100, 
      default: 10 
    }
  }
}
```

## Common Schema Patterns

### Pagination Response

```typescript
{
  type: "object",
  properties: {
    data: {
      type: "array",
      items: {
        // Your item schema here
        type: "object",
        properties: {
          id: { type: "string" },
          name: { type: "string" }
        }
      }
    },
    pagination: {
      type: "object",
      properties: {
        total: { type: "integer" },
        pages: { type: "integer" },
        page: { type: "integer" },
        limit: { type: "integer" }
      }
    }
  }
}
```

### Error Response

```typescript
{
  type: "object",
  properties: {
    error: {
      type: "object",
      properties: {
        code: { type: "string" },
        message: { type: "string" },
        details: {
          type: "array",
          items: {
            type: "object",
            properties: {
              field: { type: "string" },
              issue: { type: "string" }
            }
          }
        }
      },
      required: ["code", "message"]
    }
  }
}
```

### File Upload

```typescript
{
  type: "object",
  properties: {
    file: {
      type: "string",
      format: "binary"
    },
    description: { type: "string" }
  },
  required: ["file"]
}
```

## Using Schemas in the API

### In Request Bodies

```typescript
endpoint.setRequestBody({
  contentType: "application/json",
  required: true,
  schema: {
    type: "object",
    properties: {
      // Your schema properties here
    },
  },
});
```

### In Responses

```typescript
endpoint.addJsonResponse(200, "Success", {
  type: "object",
  properties: {
    // Your schema properties here
  },
});
```

### In Parameters

```typescript
endpoint.addQueryParameter(
  "filter",
  {
    type: "string",
    enum: ["all", "active", "completed"],
    default: "all",
  },
  "Filter results by status",
);
```

## Best Practices

1. **Be Specific**: Use the most specific type and constraints possible
2. **Add Examples**: Include examples to help consumers understand your data
3. **Use Descriptions**: Add descriptions to complex properties
4. **Consistent Naming**: Use consistent naming conventions across your API
5. **Required Fields**: Always specify which properties are required
