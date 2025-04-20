# Webhooks in OpenAPI

Webhooks are used to define asynchronous, event-driven operations that might be
initiated by the API provider rather than the API consumer. In OpenAPI 3.1,
webhooks are first-class citizens, allowing you to properly document the
callbacks your API might send.

## Adding Webhooks

You can add webhooks to your OpenAPI document in several ways:

### Simple Webhook Addition

```typescript
import { OpenAPI } from "jsr:@murat/openapi";

const api = new OpenAPI({
  title: "Webhook API",
  version: "1.0.0",
});

// Define a simple webhook
api.addWebhook("newOrder", {
  post: {
    summary: "New Order Notification",
    description: "Sent when a new order is created",
    requestBody: {
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              orderId: { type: "string" },
              timestamp: { type: "string", format: "date-time" },
              items: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    id: { type: "string" },
                    quantity: { type: "integer" },
                  },
                },
              },
            },
            required: ["orderId", "timestamp"],
          },
        },
      },
      required: true,
    },
    responses: {
      "200": {
        description: "Webhook received successfully",
      },
    },
  },
});
```

### Using the WebhookOptions Interface

For more complex webhooks with multiple HTTP methods or additional
configuration, you can use the `createWebhook` method:

```typescript
api.createWebhook("orderStatusChanged", {
  summary: "Order Status Changed Webhook",
  description: "Triggered when an order's status is updated",

  // Define server-specific endpoints for this webhook
  servers: [
    {
      url: "https://webhook.example.com/v1",
      description: "Webhook processor endpoint",
    },
  ],

  // Define webhook parameters
  parameters: [
    {
      name: "X-Webhook-Source",
      in: "header",
      required: true,
      schema: { type: "string" },
      description: "Identifies the source of the webhook",
    },
  ],

  // Define operations for this webhook
  operations: {
    post: {
      summary: "Process status change",
      description: "Handle the order status change notification",
      requestBody: {
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                orderId: { type: "string" },
                status: {
                  type: "string",
                  enum: [
                    "pending",
                    "processing",
                    "shipped",
                    "delivered",
                    "cancelled",
                  ],
                },
                timestamp: { type: "string", format: "date-time" },
              },
              required: ["orderId", "status", "timestamp"],
            },
          },
        },
        required: true,
      },
      responses: {
        "200": {
          description: "Webhook received successfully",
        },
        "400": {
          description: "Invalid webhook payload",
        },
      },
    },
  },
});
```

## Reusable Webhook Components

For better organization and reusability, you can define webhooks in the
components section:

```typescript
// Define a reusable webhook in components
const webhookRef = api.addComponentWebhook("standardNotification", {
  post: {
    summary: "Standard Notification",
    description: "Standard notification format for all system events",
    requestBody: {
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              event: { type: "string" },
              data: { type: "object" },
              timestamp: { type: "string", format: "date-time" },
            },
            required: ["event", "timestamp"],
          },
        },
      },
      required: true,
    },
    responses: {
      "200": {
        description: "Webhook received",
      },
    },
  },
});

// Use the reference to add webhooks
api.addWebhook("systemAlert", webhookRef);
api.addWebhook("userNotification", webhookRef);
```

## Using EndpointBuilder for Webhooks

You can use the `EndpointBuilder` class to create webhook operation definitions:

```typescript
import { EndpointBuilder } from "jsr:@murat/openapi";

// Create a webhook operation using EndpointBuilder
const webhookOperation = new EndpointBuilder({
  method: "post",
  title: "Payment Processed",
})
  .setDescription("Notification sent when a payment is processed")
  .setRequestBody({
    schema: {
      type: "object",
      properties: {
        paymentId: { type: "string" },
        amount: { type: "number" },
        status: { type: "string", enum: ["successful", "failed"] },
        timestamp: { type: "string", format: "date-time" },
      },
      required: ["paymentId", "status"],
    },
    required: true,
  })
  .addJsonResponse(200, "Webhook received", {
    type: "object",
    properties: {
      received: { type: "boolean" },
    },
  })
  .getEndpoint();

// Add it as a webhook
api.addWebhook("paymentProcessed", webhookOperation);
```

## Managing Webhooks

The OpenAPI class provides several methods to manage webhooks:

### Retrieving Webhooks

```typescript
// Get all defined webhooks
const webhooks = api.getWebhooks();

// Get a specific webhook by name
const orderWebhook = api.getWebhookByName("newOrder");
```

### Updating Webhooks

```typescript
// Update an existing webhook
api.updateWebhook("newOrder", {
  post: {
    summary: "Updated Order Notification",
    // ... updated configuration
  },
});
```

### Adding Operations to Existing Webhooks

```typescript
// Add a new operation to an existing webhook
api.addWebhookOperation("orderStatusChanged", "delete", {
  summary: "Cancel subscription to order updates",
  responses: {
    "204": {
      description: "Subscription cancelled",
    },
  },
});
```

### Removing Webhooks

```typescript
// Remove a webhook
const removed = api.removeWebhook("deprecatedWebhook");
```

## Creating References

You can create references to webhooks in the components section:

```typescript
// Create a reference to a component webhook
const webhookRef = api.createWebhookReference("standardNotification");

// Use the reference
api.addWebhook("newAlert", webhookRef);
```

## Complete Example

Here's a complete example showing how to define and use webhooks in an
e-commerce API:

```typescript
import { EndpointBuilder, OpenAPI } from "jsr:@murat/openapi";

const api = new OpenAPI({
  title: "E-commerce API",
  version: "1.0.0",
  description: "API for e-commerce operations with webhook notifications",
  servers: [
    { url: "https://api.example.com/v1", description: "Production" },
  ],
});

// Define regular API endpoints
const createOrderEndpoint = new EndpointBuilder({
  method: "post",
  title: "Create Order",
})
  .setDescription("Create a new order")
  .addTag("orders")
  .setOperationId("createOrder")
  .setRequestBody({
    schema: {
      type: "object",
      properties: {
        items: {
          type: "array",
          items: {
            type: "object",
            properties: {
              productId: { type: "string" },
              quantity: { type: "integer", minimum: 1 },
            },
          },
        },
        shippingAddress: { type: "string" },
        webhookUrl: {
          type: "string",
          format: "uri",
          description: "URL to receive order status updates",
        },
      },
      required: ["items", "shippingAddress"],
    },
    required: true,
  })
  .addJsonResponse(201, "Order created", {
    type: "object",
    properties: {
      orderId: { type: "string" },
      status: { type: "string", enum: ["pending", "processing"] },
      createdAt: { type: "string", format: "date-time" },
    },
  });

api.addNewEndpoint_("/orders", createOrderEndpoint);

// Define a reusable webhook component for order status updates
const orderStatusWebhookPathItem = new EndpointBuilder({
  method: "post",
  title: "Order Status Update",
})
  .setDescription("Webhook notification for order status updates")
  .setRequestBody({
    schema: {
      type: "object",
      properties: {
        orderId: { type: "string" },
        status: {
          type: "string",
          enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
        },
        updatedAt: { type: "string", format: "date-time" },
        additionalInfo: { type: "string" },
      },
      required: ["orderId", "status", "updatedAt"],
    },
    required: true,
  })
  .addJsonResponse(200, "Webhook received", {
    type: "object",
    properties: {
      success: { type: "boolean" },
    },
  })
  .getEndpoint();

// Add the webhook component and use it
const orderStatusWebhookRef = api.addComponentWebhook(
  "orderStatusWebhook",
  orderStatusWebhookPathItem,
);

// Add webhooks to the API
api.addWebhook("orderStatus", orderStatusWebhookRef);

// Add direct webhook without using a reference
api.createWebhook("paymentProcessed", {
  summary: "Payment Processed Notification",
  description: "Webhook notification sent when a payment is processed",
  operations: {
    post: {
      summary: "Payment Processed",
      description: "Notification for successful or failed payment processing",
      requestBody: {
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                orderId: { type: "string" },
                paymentId: { type: "string" },
                amount: { type: "number" },
                currency: { type: "string" },
                status: { type: "string", enum: ["successful", "failed"] },
                processingDate: { type: "string", format: "date-time" },
              },
              required: ["orderId", "paymentId", "amount", "status"],
            },
          },
        },
        required: true,
      },
      responses: {
        "200": {
          description: "Webhook received successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean" },
                  message: { type: "string" },
                },
              },
            },
          },
        },
      },
    },
  },
});

// Generate OpenAPI documentation
const jsonString = api.getJSONString();
console.log(jsonString);
```

## Best Practices

1. **Define Reusable Webhooks**: Use the components section to define webhook
   templates that can be reused.

2. **Provide Complete Schemas**: Include detailed request and response schemas
   for your webhooks to make integration easier.

3. **Document Required Responses**: Clearly document the responses your API
   expects to receive from the webhook consumer.

4. **Use Descriptive Names**: Give webhooks clear, descriptive names that
   indicate their purpose.

5. **Include Authentication Information**: Document how webhook security works,
   such as verification tokens or signatures.

6. **Versioning Strategy**: Consider how webhooks will evolve over time and
   document your versioning strategy.

7. **Rate Limits and Retries**: Document any rate limiting policies and retry
   behavior for your webhooks.
