import { OpenAPI } from "../src/OpenAPI.ts";
import { EndpointBuilder } from "../src/EndpointBuilder.ts";
import { assertEquals, assertExists, assertFalse } from "jsr:@std/assert";
import type {
  OpenAPIOperation,
  OpenAPIPathItem,
} from "../src/OpenAPI.types.ts";

Deno.test("OpenAPI Webhook Support", async (t) => {
  await t.step("should add a simple webhook", () => {
    const api = new OpenAPI({
      title: "Webhook API",
      version: "1.0.0",
    });

    // Create a simple webhook path item manually
    const webhookPathItem: OpenAPIPathItem = {
      post: {
        summary: "Webhook notification",
        description: "Notification sent when an event occurs",
        responses: {
          "200": {
            description: "Webhook processed successfully",
          },
        },
      },
    };

    api.addWebhook("newOrder", webhookPathItem);

    const doc = api.getJSON();
    assertExists(doc.webhooks, "Webhooks section should exist in the document");
    assertExists(doc.webhooks.newOrder, "newOrder webhook should exist");

    // TypeScript guard to check that we have a PathItem, not a Reference
    if (!("$ref" in doc.webhooks.newOrder)) {
      assertEquals(
        doc.webhooks.newOrder.post?.summary,
        "Webhook notification",
        "Summary should match",
      );
    }
  });

  await t.step("should create a webhook using createWebhook method", () => {
    const api = new OpenAPI({
      title: "Webhook API",
      version: "1.0.0",
    });

    api.createWebhook("userUpdated", {
      summary: "User Updated Webhook",
      description: "Triggered when a user profile is updated",
      operations: {
        post: {
          summary: "Process user update",
          description: "Handle the user update notification",
          requestBody: {
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    userId: { type: "string" },
                    updateType: { type: "string" },
                    timestamp: { type: "string", format: "date-time" },
                  },
                  required: ["userId", "updateType", "timestamp"],
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

    const doc = api.getJSON();
    assertExists(doc.webhooks, "Webhooks section should exist in the document");
    assertExists(doc.webhooks.userUpdated, "userUpdated webhook should exist");

    // TypeScript guard to check that we have a PathItem, not a Reference
    if (!("$ref" in doc.webhooks.userUpdated)) {
      assertEquals(
        doc.webhooks.userUpdated.summary,
        "User Updated Webhook",
        "Summary should match",
      );
      assertExists(
        doc.webhooks.userUpdated.post,
        "POST operation should exist",
      );
      assertEquals(
        doc.webhooks.userUpdated.post?.summary,
        "Process user update",
        "Operation summary should match",
      );
    }
  });

  await t.step("should support multiple HTTP methods in webhooks", () => {
    const api = new OpenAPI({
      title: "Webhook API",
      version: "1.0.0",
    });

    api.createWebhook("multiMethodWebhook", {
      summary: "Multi-method webhook",
      operations: {
        post: {
          summary: "Create via webhook",
          responses: {
            "200": { description: "Success" },
          },
        },
        put: {
          summary: "Update via webhook",
          responses: {
            "200": { description: "Success" },
          },
        },
        delete: {
          summary: "Delete via webhook",
          responses: {
            "200": { description: "Success" },
          },
        },
      },
    });

    const doc = api.getJSON();
    assertExists(
      doc.webhooks?.multiMethodWebhook,
      "multiMethodWebhook should exist",
    );

    // TypeScript guard to check that we have a PathItem, not a Reference
    if (!("$ref" in doc.webhooks!.multiMethodWebhook)) {
      assertExists(
        doc.webhooks!.multiMethodWebhook.post,
        "POST operation should exist",
      );
      assertExists(
        doc.webhooks!.multiMethodWebhook.put,
        "PUT operation should exist",
      );
      assertExists(
        doc.webhooks!.multiMethodWebhook.delete,
        "DELETE operation should exist",
      );
    }
  });

  await t.step("should get webhooks with getWebhooks method", () => {
    const api = new OpenAPI({
      title: "Webhook API",
      version: "1.0.0",
    });

    // Add a couple of webhooks
    api.addWebhook("webhook1", {
      post: {
        responses: { "200": { description: "Success" } },
      },
    });

    api.addWebhook("webhook2", {
      post: {
        responses: { "200": { description: "Success" } },
      },
    });

    // Get all webhooks
    const webhooks = api.getWebhooks();
    assertExists(webhooks, "Should return webhooks object");
    assertEquals(
      Object.keys(webhooks).length,
      2,
      "Should have two webhooks",
    );
    assertExists(webhooks.webhook1, "webhook1 should exist");
    assertExists(webhooks.webhook2, "webhook2 should exist");
  });

  await t.step("should get a specific webhook by name", () => {
    const api = new OpenAPI({
      title: "Webhook API",
      version: "1.0.0",
    });

    api.addWebhook("orderCreated", {
      post: {
        summary: "Order created notification",
        responses: { "200": { description: "Success" } },
      },
    });

    api.addWebhook("orderUpdated", {
      post: {
        summary: "Order updated notification",
        responses: { "200": { description: "Success" } },
      },
    });

    // Get webhook by name
    const webhook = api.getWebhookByName("orderCreated");
    assertExists(webhook, "Should return the webhook");

    // TypeScript guard to check that we have a PathItem, not a Reference
    if (!("$ref" in webhook)) {
      assertExists(webhook.post, "Should have POST operation");
      assertEquals(
        webhook.post?.summary,
        "Order created notification",
        "Summary should match",
      );
    }

    // Test getting non-existent webhook
    const nonExistentWebhook = api.getWebhookByName("nonexistent");
    assertEquals(nonExistentWebhook, undefined, "Should return undefined");
  });

  await t.step("should update an existing webhook", () => {
    const api = new OpenAPI({
      title: "Webhook API",
      version: "1.0.0",
    });

    // Add initial webhook
    api.addWebhook("paymentProcessed", {
      post: {
        summary: "Payment processed notification",
        responses: { "200": { description: "Success" } },
      },
    });

    // Update the webhook
    const updatedWebhook: OpenAPIPathItem = {
      summary: "Updated payment webhook",
      post: {
        summary: "Updated payment processed notification",
        description: "Notification sent when a payment is processed",
        responses: {
          "200": { description: "Success" },
          "400": { description: "Bad request" },
        },
      },
    };

    const updateResult = api.updateWebhook("paymentProcessed", updatedWebhook);
    assertEquals(
      updateResult,
      true,
      "Should return true for successful update",
    );

    // Verify the update
    const webhook = api.getWebhookByName("paymentProcessed");
    assertExists(webhook, "Webhook should exist");

    // TypeScript guard to check that we have a PathItem, not a Reference
    if (!("$ref" in webhook)) {
      assertEquals(
        webhook.summary,
        "Updated payment webhook",
        "Summary should be updated",
      );
      assertEquals(
        webhook.post?.summary,
        "Updated payment processed notification",
        "Operation summary should be updated",
      );
    }

    // Test updating non-existent webhook
    const failedUpdateResult = api.updateWebhook("nonexistent", {});
    assertEquals(
      failedUpdateResult,
      false,
      "Should return false for non-existent webhook",
    );
  });

  await t.step("should remove a webhook", () => {
    const api = new OpenAPI({
      title: "Webhook API",
      version: "1.0.0",
    });

    // Add webhooks
    api.addWebhook("webhook1", {
      post: { responses: { "200": { description: "Success" } } },
    });
    api.addWebhook("webhook2", {
      post: { responses: { "200": { description: "Success" } } },
    });

    // Remove a webhook
    const removeResult = api.removeWebhook("webhook1");
    assertEquals(
      removeResult,
      true,
      "Should return true for successful removal",
    );

    // Verify removal
    const webhooks = api.getWebhooks();
    assertExists(webhooks, "Webhooks object should exist");
    assertEquals(
      Object.keys(webhooks).length,
      1,
      "Should have one webhook left",
    );
    assertEquals(webhooks.webhook1, undefined, "webhook1 should be removed");
    assertExists(webhooks.webhook2, "webhook2 should still exist");

    // Test removing non-existent webhook
    const failedRemoveResult = api.removeWebhook("nonexistent");
    assertEquals(
      failedRemoveResult,
      false,
      "Should return false for non-existent webhook",
    );
  });

  await t.step("should add an operation to an existing webhook", () => {
    const api = new OpenAPI({
      title: "Webhook API",
      version: "1.0.0",
    });

    // Create webhook with POST operation
    api.addWebhook("eventNotification", {
      post: {
        summary: "Event notification",
        responses: { "200": { description: "Success" } },
      },
    });

    // Define a PUT operation
    const putOperation: OpenAPIOperation = {
      summary: "Update event notification",
      description: "Update an existing event notification",
      responses: {
        "200": { description: "Success" },
        "404": { description: "Notification not found" },
      },
    };

    // Add PUT operation to existing webhook
    const result = api.addWebhookOperation(
      "eventNotification",
      "put",
      putOperation,
    );
    assertEquals(
      result,
      true,
      "Should return true for successful operation addition",
    );

    // Verify both operations exist
    const webhook = api.getWebhookByName("eventNotification");
    assertExists(webhook, "Webhook should exist");

    // TypeScript guard to check that we have a PathItem, not a Reference
    if (!("$ref" in webhook)) {
      assertExists(webhook.post, "POST operation should exist");
      assertExists(webhook.put, "PUT operation should exist");
      assertEquals(
        webhook.put?.summary,
        "Update event notification",
        "PUT summary should match",
      );
    }

    // Test adding to non-existent webhook
    const failedResult = api.addWebhookOperation("nonexistent", "get", {
      responses: { "200": { description: "Success" } },
    });
    assertEquals(
      failedResult,
      false,
      "Should return false for non-existent webhook",
    );
  });

  await t.step("should handle webhooks in components section", () => {
    const api = new OpenAPI({
      title: "Webhook API",
      version: "1.0.0",
    });

    // Add a reusable webhook to components
    const webhookPathItem: OpenAPIPathItem = {
      summary: "Standard webhook format",
      post: {
        summary: "Process webhook",
        responses: { "200": { description: "Success" } },
      },
    };

    const webhookRef = api.addComponentWebhook(
      "standardWebhook",
      webhookPathItem,
    );

    // Verify component webhook
    const doc = api.getJSON();
    assertExists(doc.components?.webhooks, "Components webhooks should exist");
    assertExists(
      doc.components?.webhooks?.standardWebhook,
      "standardWebhook component should exist",
    );
    assertEquals(
      webhookRef.$ref,
      "#/components/webhooks/standardWebhook",
      "Reference should be correct",
    );

    // Use the webhook reference
    api.addWebhook("orderCreated", webhookRef);

    // Verify reference was used
    assertExists(
      doc.webhooks?.orderCreated,
      "orderCreated webhook should exist",
    );
    assertEquals(
      doc.webhooks?.orderCreated.$ref,
      "#/components/webhooks/standardWebhook",
      "Reference should be used",
    );
  });

  await t.step("should create webhook reference correctly", () => {
    const api = new OpenAPI({
      title: "Webhook API",
      version: "1.0.0",
    });

    const ref = api.createWebhookReference("myWebhook");
    assertEquals(
      ref.$ref,
      "#/components/webhooks/myWebhook",
      "Reference should be formatted correctly",
    );
  });

  await t.step("should handle webhooks with servers and parameters", () => {
    const api = new OpenAPI({
      title: "Webhook API",
      version: "1.0.0",
    });

    api.createWebhook("advancedWebhook", {
      summary: "Advanced webhook with servers and parameters",
      servers: [
        {
          url: "https://webhook-receiver.example.com/v1",
          description: "Webhook receiver endpoint",
        },
      ],
      parameters: [
        {
          name: "X-Webhook-Source",
          in: "header",
          required: true,
          schema: { type: "string" },
          description: "Identifies the source of the webhook",
        },
      ],
      operations: {
        post: {
          summary: "Process webhook",
          responses: { "200": { description: "Success" } },
        },
      },
    });

    const webhook = api.getWebhookByName("advancedWebhook");
    assertExists(webhook, "Webhook should exist");

    // TypeScript guard to check that we have a PathItem, not a Reference
    if (!("$ref" in webhook)) {
      assertExists(webhook.servers, "Servers array should exist");
      assertEquals(webhook.servers?.length, 1, "Should have one server");
      assertEquals(
        webhook.servers?.[0].url,
        "https://webhook-receiver.example.com/v1",
        "Server URL should match",
      );

      assertExists(webhook.parameters, "Parameters array should exist");
      assertEquals(webhook.parameters?.length, 1, "Should have one parameter");

      // TypeScript guard to check that we have a Parameter, not a Reference
      const param = webhook.parameters?.[0];
      if (param && !("$ref" in param)) {
        assertEquals(
          param.name,
          "X-Webhook-Source",
          "Parameter name should match",
        );
        assertEquals(param.in, "header", "Parameter location should be header");
      }
    }
  });

  await t.step(
    "should integrate with EndpointBuilder for webhook operations",
    () => {
      const api = new OpenAPI({
        title: "Webhook API",
        version: "1.0.0",
      });

      // Create a webhook operation using EndpointBuilder
      const webhookOperation = new EndpointBuilder({
        method: "post",
        title: "Subscription Event",
      })
        .setDescription("Notifies about subscription events")
        .addJsonResponse(200, "Webhook received", {
          type: "object",
          properties: {
            success: { type: "boolean" },
          },
        })
        .getEndpoint();

      // Add the webhook with the operation from EndpointBuilder
      api.addWebhook("subscriptionEvent", webhookOperation);

      // Verify the webhook was added correctly
      const webhook = api.getWebhookByName("subscriptionEvent");
      assertExists(webhook, "Webhook should exist");

      // TypeScript guard to check that we have a PathItem, not a Reference
      if (!("$ref" in webhook)) {
        assertExists(webhook.post, "POST operation should exist");
        assertEquals(
          webhook.post?.summary,
          "Subscription Event",
          "Summary should match",
        );
        assertEquals(
          webhook.post?.description,
          "Notifies about subscription events",
          "Description should match",
        );
      }
    },
  );

  await t.step("should work with JSON and YAML serialization", () => {
    const api = new OpenAPI({
      title: "Webhook API",
      version: "1.0.0",
    });

    api.createWebhook("eventNotification", {
      summary: "Event notification webhook",
      operations: {
        post: {
          summary: "Process event notification",
          responses: { "200": { description: "Success" } },
        },
      },
    });

    // Test JSON serialization
    const jsonString = api.getJSONString();
    const parsedJson = JSON.parse(jsonString);

    assertExists(parsedJson.webhooks, "Webhooks should be in JSON output");
    assertExists(
      parsedJson.webhooks.eventNotification,
      "eventNotification webhook should be in JSON",
    );

    // Test YAML serialization
    const yamlString = api.getYAMLString();
    assertExists(yamlString, "YAML serialization should work");
    // Just verify it contains the webhook name (simplified test)
    assertFalse(
      yamlString.indexOf("eventNotification") === -1,
      "YAML should contain the webhook name",
    );
  });
});
