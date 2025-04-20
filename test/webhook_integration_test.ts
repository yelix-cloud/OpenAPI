import { OpenAPI } from "../src/OpenAPI.ts";
import { EndpointBuilder } from "../src/EndpointBuilder.ts";
import { assertEquals, assertExists } from "jsr:@std/assert";

Deno.test("Webhook Integration Example", async (t) => {
  await t.step("E-commerce API with Webhooks", () => {
    // Create the OpenAPI document
    const api = new OpenAPI({
      title: "E-commerce API",
      version: "1.0.0",
      description: "API for e-commerce operations with webhook notifications",
      servers: [
        { url: "https://api.example.com/v1", description: "Production" },
      ],
    });

    // Add API authentication
    api.addApiKeySecurity("ApiKeyAuth", {
      in: "header",
      parameterName: "X-API-Key",
      description: "API key authentication",
    });

    api.setGlobalSecurity([api.createSecurityRequirement("ApiKeyAuth")]);

    // Add standard endpoints

    // Create Order Endpoint
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

    // Get Order Status Endpoint
    const getOrderEndpoint = new EndpointBuilder({
      method: "get",
      title: "Get Order",
    })
      .setDescription("Get order details and status")
      .addTag("orders")
      .setOperationId("getOrder")
      .addPathParameter(
        "orderId",
        { type: "string" },
        "Order ID to retrieve",
      )
      .addJsonResponse(200, "Order details", {
        type: "object",
        properties: {
          orderId: { type: "string" },
          items: {
            type: "array",
            items: {
              type: "object",
              properties: {
                productId: { type: "string" },
                quantity: { type: "integer" },
              },
            },
          },
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
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      });

    // Add the endpoints to the API
    api.addNewEndpoint_("/orders", createOrderEndpoint);
    api.addNewEndpoint_("/orders/{orderId}", getOrderEndpoint);

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
              enum: [
                "pending",
                "processing",
                "shipped",
                "delivered",
                "cancelled",
              ],
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

    // Add the webhook component
    const orderStatusWebhookRef = api.addComponentWebhook(
      "orderStatusWebhook",
      orderStatusWebhookPathItem,
    );

    // Add a webhook that uses the reference
    api.addWebhook("orderStatus", orderStatusWebhookRef);

    // Add another webhook with a specific implementation
    api.createWebhook("paymentProcessed", {
      summary: "Payment Processed Notification",
      description: "Webhook notification sent when a payment is processed",
      operations: {
        post: {
          summary: "Payment Processed",
          description:
            "Notification for successful or failed payment processing",
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
                  required: [
                    "orderId",
                    "paymentId",
                    "amount",
                    "currency",
                    "status",
                  ],
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
            "400": {
              description: "Invalid webhook payload",
            },
          },
        },
      },
    });

    // Test the completed API document
    const doc = api.getJSON();

    // Verify API basics
    assertEquals(doc.openapi, "3.1.0", "Should use OpenAPI 3.1.0");
    assertEquals(doc.info.title, "E-commerce API", "Title should match");

    // Verify paths
    assertExists(doc.paths?.["/orders"], "Orders endpoint should exist");
    assertExists(
      doc.paths?.["/orders/{orderId}"],
      "Order detail endpoint should exist",
    );

    // Verify webhooks
    assertExists(doc.webhooks, "Webhooks section should exist");
    assertExists(doc.webhooks.orderStatus, "Order status webhook should exist");
    assertExists(
      doc.webhooks.paymentProcessed,
      "Payment processed webhook should exist",
    );

    // Verify webhook reference
    assertEquals(
      doc.webhooks.orderStatus.$ref,
      "#/components/webhooks/orderStatusWebhook",
      "Order status webhook should use reference",
    );

    // Verify webhook component
    assertExists(doc.components?.webhooks, "Webhook components should exist");
    assertExists(
      doc.components?.webhooks?.orderStatusWebhook,
      "Order status webhook component should exist",
    );

    // Verify payment processed webhook structure
    if (!("$ref" in doc.webhooks.paymentProcessed)) {
      assertExists(
        doc.webhooks.paymentProcessed.post,
        "Payment webhook should have POST operation",
      );
      assertEquals(
        doc.webhooks.paymentProcessed.summary,
        "Payment Processed Notification",
        "Summary should match",
      );
    }
  });
});
