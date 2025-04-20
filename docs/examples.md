# OpenAPI Examples

This document provides complete examples of using the OpenAPI library for different API scenarios.

## Basic REST API

Here's a complete example of a simple REST API for a todo application:

```typescript
import { OpenAPI, EndpointBuilder } from "@murat/openapi";

// Create the OpenAPI document
const api = new OpenAPI({
  title: "Todo API",
  version: "1.0.0",
  description: "A simple RESTful API for managing todos",
  servers: [
    {
      url: "https://api.example.com/v1",
      description: "Production server",
    },
    {
      url: "https://staging-api.example.com/v1",
      description: "Staging server",
    },
  ],
});

// Define reusable todo schema
const todoSchema = {
  type: "object",
  properties: {
    id: { type: "string" },
    title: { type: "string" },
    completed: { type: "boolean", default: false },
    createdAt: { type: "string", format: "date-time" },
    updatedAt: { type: "string", format: "date-time" },
  },
};

// GET /todos - List all todos
const listTodosEndpoint = new EndpointBuilder({
  method: "get",
  title: "List Todos",
})
  .setDescription("Get a list of all todos")
  .setOperationId("listTodos")
  .addTag("todos")
  .addQueryParameter(
    "status",
    { type: "string", enum: ["all", "completed", "active"], default: "all" },
    "Filter by completion status"
  )
  .addQueryParameter(
    "limit",
    { type: "integer", minimum: 1, maximum: 100, default: 20 },
    "Maximum number of todos to return"
  )
  .addQueryParameter(
    "offset",
    { type: "integer", minimum: 0, default: 0 },
    "Number of todos to skip"
  )
  .addJsonResponse(200, "A list of todos", {
    type: "object",
    properties: {
      data: {
        type: "array",
        items: todoSchema,
      },
      pagination: {
        type: "object",
        properties: {
          total: { type: "integer" },
          limit: { type: "integer" },
          offset: { type: "integer" },
        },
      },
    },
  });

// POST /todos - Create a new todo
const createTodoEndpoint = new EndpointBuilder({
  method: "post",
  title: "Create Todo",
})
  .setDescription("Create a new todo item")
  .setOperationId("createTodo")
  .addTag("todos")
  .setRequestBody({
    contentType: "application/json",
    required: true,
    schema: {
      type: "object",
      properties: {
        title: { type: "string", minLength: 1, maxLength: 100 },
        completed: { type: "boolean", default: false },
      },
      required: ["title"],
    },
  })
  .addJsonResponse(201, "Todo created successfully", todoSchema)
  .addJsonResponse(400, "Invalid input", {
    type: "object",
    properties: {
      error: { type: "string" },
      details: { type: "array", items: { type: "string" } },
    },
  });

// GET /todos/{id} - Get a specific todo
const getTodoEndpoint = new EndpointBuilder({
  method: "get",
  title: "Get Todo",
})
  .setDescription("Get a todo by its ID")
  .setOperationId("getTodo")
  .addTag("todos")
  .addPathParameter("id", { type: "string" }, "Todo ID")
  .addJsonResponse(200, "Todo retrieved successfully", todoSchema)
  .addJsonResponse(404, "Todo not found", {
    type: "object",
    properties: {
      error: { type: "string" },
    },
  });

// PUT /todos/{id} - Update a todo
const updateTodoEndpoint = new EndpointBuilder({
  method: "put",
  title: "Update Todo",
})
  .setDescription("Update an existing todo")
  .setOperationId("updateTodo")
  .addTag("todos")
  .addPathParameter("id", { type: "string" }, "Todo ID")
  .setRequestBody({
    contentType: "application/json",
    required: true,
    schema: {
      type: "object",
      properties: {
        title: { type: "string", minLength: 1, maxLength: 100 },
        completed: { type: "boolean" },
      },
    },
  })
  .addJsonResponse(200, "Todo updated successfully", todoSchema)
  .addJsonResponse(400, "Invalid input", {
    type: "object",
    properties: {
      error: { type: "string" },
      details: { type: "array", items: { type: "string" } },
    },
  })
  .addJsonResponse(404, "Todo not found", {
    type: "object",
    properties: {
      error: { type: "string" },
    },
  });

// DELETE /todos/{id} - Delete a todo
const deleteTodoEndpoint = new EndpointBuilder({
  method: "delete",
  title: "Delete Todo",
})
  .setDescription("Delete a todo")
  .setOperationId("deleteTodo")
  .addTag("todos")
  .addPathParameter("id", { type: "string" }, "Todo ID")
  .addResponse(204, {
    description: "Todo deleted successfully",
  })
  .addJsonResponse(404, "Todo not found", {
    type: "object",
    properties: {
      error: { type: "string" },
    },
  });

// Add endpoints to the API
api.addNewEndpoint_("/todos", listTodosEndpoint);
api.addNewEndpoint_("/todos", createTodoEndpoint);
api.addNewEndpoint_("/todos/{id}", getTodoEndpoint);
api.addNewEndpoint_("/todos/{id}", updateTodoEndpoint);
api.addNewEndpoint_("/todos/{id}", deleteTodoEndpoint);

// Export the OpenAPI documentation
const jsonString = api.getJSONString();
console.log(jsonString);
```

## Authentication API Example

Here's an example of an authentication API with login, registration, and password reset:

```typescript
import { OpenAPI, EndpointBuilder } from "@murat/openapi";

const api = new OpenAPI({
  title: "Auth API",
  version: "1.0.0",
  description: "Authentication and user management API",
  servers: [{ url: "https://auth.example.com/v1" }],
});

// POST /auth/register - User registration
const registerEndpoint = new EndpointBuilder({
  method: "post",
  title: "Register User",
})
  .setDescription("Register a new user account")
  .setOperationId("registerUser")
  .addTags(["auth", "public"])
  .setRequestBody({
    contentType: "application/json",
    required: true,
    schema: {
      type: "object",
      properties: {
        email: { type: "string", format: "email" },
        password: { type: "string", format: "password", minLength: 8 },
        firstName: { type: "string" },
        lastName: { type: "string" },
      },
      required: ["email", "password"],
    },
  })
  .addJsonResponse(201, "User registered successfully", {
    type: "object",
    properties: {
      id: { type: "string" },
      email: { type: "string" },
    },
  })
  .addJsonResponse(400, "Invalid input", {
    type: "object",
    properties: {
      error: { type: "string" },
      details: { type: "array", items: { type: "string" } },
    },
  })
  .addJsonResponse(409, "Email already in use", {
    type: "object",
    properties: {
      error: { type: "string" },
    },
  });

// POST /auth/login - User login
const loginEndpoint = new EndpointBuilder({
  method: "post",
  title: "Login",
})
  .setDescription("Authenticate a user and get a token")
  .setOperationId("loginUser")
  .addTags(["auth", "public"])
  .setRequestBody({
    contentType: "application/json",
    required: true,
    schema: {
      type: "object",
      properties: {
        email: { type: "string", format: "email" },
        password: { type: "string", format: "password" },
        rememberMe: { type: "boolean", default: false },
      },
      required: ["email", "password"],
    },
  })
  .addJsonResponse(200, "Login successful", {
    type: "object",
    properties: {
      token: { type: "string" },
      refreshToken: { type: "string" },
      expiresIn: { type: "integer" },
      user: {
        type: "object",
        properties: {
          id: { type: "string" },
          email: { type: "string" },
          firstName: { type: "string" },
          lastName: { type: "string" },
        },
      },
    },
  })
  .addJsonResponse(401, "Invalid credentials", {
    type: "object",
    properties: {
      error: { type: "string" },
    },
  });

// POST /auth/refresh - Refresh token
const refreshTokenEndpoint = new EndpointBuilder({
  method: "post",
  title: "Refresh Token",
})
  .setDescription("Get a new access token using a refresh token")
  .setOperationId("refreshToken")
  .addTag("auth")
  .setRequestBody({
    contentType: "application/json",
    required: true,
    schema: {
      type: "object",
      properties: {
        refreshToken: { type: "string" },
      },
      required: ["refreshToken"],
    },
  })
  .addJsonResponse(200, "Token refreshed successfully", {
    type: "object",
    properties: {
      token: { type: "string" },
      expiresIn: { type: "integer" },
    },
  })
  .addJsonResponse(401, "Invalid refresh token", {
    type: "object",
    properties: {
      error: { type: "string" },
    },
  });

// POST /auth/forgot-password - Request password reset
const forgotPasswordEndpoint = new EndpointBuilder({
  method: "post",
  title: "Forgot Password",
})
  .setDescription("Request a password reset link")
  .setOperationId("forgotPassword")
  .addTags(["auth", "public"])
  .setRequestBody({
    contentType: "application/json",
    required: true,
    schema: {
      type: "object",
      properties: {
        email: { type: "string", format: "email" },
      },
      required: ["email"],
    },
  })
  .addResponse(204, {
    description: "Password reset email sent (if email exists)",
  });

// POST /auth/reset-password - Reset password with token
const resetPasswordEndpoint = new EndpointBuilder({
  method: "post",
  title: "Reset Password",
})
  .setDescription("Reset a password using a token")
  .setOperationId("resetPassword")
  .addTags(["auth", "public"])
  .setRequestBody({
    contentType: "application/json",
    required: true,
    schema: {
      type: "object",
      properties: {
        token: { type: "string" },
        password: { type: "string", format: "password", minLength: 8 },
      },
      required: ["token", "password"],
    },
  })
  .addJsonResponse(200, "Password reset successful", {
    type: "object",
    properties: {
      success: { type: "boolean" },
      message: { type: "string" },
    },
  })
  .addJsonResponse(400, "Invalid token or password", {
    type: "object",
    properties: {
      error: { type: "string" },
      details: { type: "array", items: { type: "string" } },
    },
  });

// POST /auth/logout - Logout (invalidate token)
const logoutEndpoint = new EndpointBuilder({
  method: "post",
  title: "Logout",
})
  .setDescription("Invalidate the current authentication token")
  .setOperationId("logoutUser")
  .addTag("auth")
  .addHeaderParameter(
    "Authorization", 
    { type: "string" }, 
    "Bearer token",
    true
  )
  .addResponse(204, {
    description: "Logout successful",
  });

// Add endpoints to the API
api.addNewEndpoint_("/auth/register", registerEndpoint);
api.addNewEndpoint_("/auth/login", loginEndpoint);
api.addNewEndpoint_("/auth/refresh", refreshTokenEndpoint);
api.addNewEndpoint_("/auth/forgot-password", forgotPasswordEndpoint);
api.addNewEndpoint_("/auth/reset-password", resetPasswordEndpoint);
api.addNewEndpoint_("/auth/logout", logoutEndpoint);
```

## File Upload API Example

Here's an example of endpoints for file uploads:

```typescript
import { OpenAPI, EndpointBuilder } from "@murat/openapi";

const api = new OpenAPI({
  title: "File Storage API",
  version: "1.0.0",
  description: "API for uploading and managing files",
});

// POST /files - Upload a file
const uploadFileEndpoint = new EndpointBuilder({
  method: "post",
  title: "Upload File",
})
  .setDescription("Upload a new file")
  .setOperationId("uploadFile")
  .addTag("files")
  .setRequestBody({
    contentType: "multipart/form-data",
    required: true,
    schema: {
      type: "object",
      properties: {
        file: {
          type: "string",
          format: "binary",
        },
        description: {
          type: "string",
        },
        folder: {
          type: "string",
        },
      },
      required: ["file"],
    },
  })
  .addJsonResponse(201, "File uploaded successfully", {
    type: "object",
    properties: {
      id: { type: "string" },
      filename: { type: "string" },
      size: { type: "integer" },
      mimeType: { type: "string" },
      url: { type: "string", format: "uri" },
      description: { type: "string" },
      folder: { type: "string" },
      createdAt: { type: "string", format: "date-time" },
    },
  })
  .addJsonResponse(400, "Invalid request", {
    type: "object",
    properties: {
      error: { type: "string" },
    },
  })
  .addJsonResponse(413, "File too large", {
    type: "object",
    properties: {
      error: { type: "string" },
      maxSize: { type: "string" },
    },
  });

// GET /files - List files
const listFilesEndpoint = new EndpointBuilder({
  method: "get",
  title: "List Files",
})
  .setDescription("Get a list of files")
  .setOperationId("listFiles")
  .addTag("files")
  .addQueryParameter(
    "folder", 
    { type: "string" }, 
    "Filter files by folder"
  )
  .addQueryParameter(
    "type", 
    { type: "string", enum: ["image", "document", "video", "audio", "other"] }, 
    "Filter files by type"
  )
  .addQueryParameter(
    "limit", 
    { type: "integer", minimum: 1, maximum: 100, default: 20 }, 
    "Maximum number of files to return"
  )
  .addQueryParameter(
    "offset", 
    { type: "integer", minimum: 0, default: 0 }, 
    "Number of files to skip"
  )
  .addJsonResponse(200, "List of files", {
    type: "object",
    properties: {
      data: {
        type: "array",
        items: {
          type: "object",
          properties: {
            id: { type: "string" },
            filename: { type: "string" },
            size: { type: "integer" },
            mimeType: { type: "string" },
            url: { type: "string", format: "uri" },
            description: { type: "string" },
            folder: { type: "string" },
            createdAt: { type: "string", format: "date-time" },
          },
        },
      },
      pagination: {
        type: "object",
        properties: {
          total: { type: "integer" },
          limit: { type: "integer" },
          offset: { type: "integer" },
        },
      },
    },
  });

// GET /files/{id} - Download a file
const getFileEndpoint = new EndpointBuilder({
  method: "get",
  title: "Download File",
})
  .setDescription("Download a file by its ID")
  .setOperationId("downloadFile")
  .addTag("files")
  .addPathParameter("id", { type: "string" }, "File ID")
  .addResponse(200, {
    description: "The file content",
    contentType: "*/*",
  })
  .addJsonResponse(404, "File not found", {
    type: "object",
    properties: {
      error: { type: "string" },
    },
  });

// DELETE /files/{id} - Delete a file
const deleteFileEndpoint = new EndpointBuilder({
  method: "delete",
  title: "Delete File",
})
  .setDescription("Delete a file by its ID")
  .setOperationId("deleteFile")
  .addTag("files")
  .addPathParameter("id", { type: "string" }, "File ID")
  .addResponse(204, {
    description: "File deleted successfully",
  })
  .addJsonResponse(404, "File not found", {
    type: "object",
    properties: {
      error: { type: "string" },
    },
  });

// Add endpoints to the API
api.addNewEndpoint_("/files", uploadFileEndpoint);
api.addNewEndpoint_("/files", listFilesEndpoint);
api.addNewEndpoint_("/files/{id}", getFileEndpoint);
api.addNewEndpoint_("/files/{id}", deleteFileEndpoint);
```

## Validation Rules Example

Here's how to use validation rule descriptions in your API:

```typescript
import { OpenAPI, EndpointBuilder } from "@murat/openapi";

const api = new OpenAPI({
  title: "Validation API",
  version: "1.0.0",
});

// Define validation rule descriptions
api.describeValidationRule("minLength", (value) => `Must be at least ${value} characters long`);
api.describeValidationRule("maxLength", (value) => `Cannot exceed ${value} characters`);
api.describeValidationRule("pattern", (value) => `Must match pattern: ${value}`);
api.describeValidationRule("minimum", (value) => `Must be at least ${value}`);
api.describeValidationRule("maximum", (value) => `Cannot exceed ${value}`);
api.describeValidationRule("email", () => "Must be a valid email address");
api.describeValidationRule("required", () => "This field is required");

// Now your documentation will include these human-readable validation descriptions
```

## Exporting Documentation to Files

```typescript
import { OpenAPI, EndpointBuilder } from "@murat/openapi";
import { writeFile } from "fs/promises";
import { join } from "path";

async function generateApiDocs() {
  const api = new OpenAPI({
    title: "My API",
    version: "1.0.0",
    description: "API Description",
  });
  
  // Add endpoints here...
  
  // Export documentation
  const jsonString = api.getJSONString();
  const yamlString = api.getYAMLString();
  
  // Save files
  await writeFile(join(process.cwd(), "public", "openapi.json"), jsonString);
  await writeFile(join(process.cwd(), "public", "openapi.yaml"), yamlString);
  
  console.log("API documentation generated successfully!");
}

generateApiDocs().catch(console.error);
```

These examples demonstrate various common API patterns and how to implement them using the OpenAPI library.
