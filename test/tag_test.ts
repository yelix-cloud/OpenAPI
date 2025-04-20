import { OpenAPI } from "../src/OpenAPI.ts";
import { assertEquals, assertExists, assertFalse } from "jsr:@std/assert";

Deno.test("OpenAPI Tag Management", async (t) => {
  await t.step("should add tags to OpenAPI document", () => {
    const api = new OpenAPI({
      title: "Test API",
      version: "1.0.0",
    });

    // Add a simple tag
    api.addTag("users", "User management endpoints");

    // Add a tag with external docs
    api.addTag("products", "Product management endpoints", {
      url: "https://example.com/docs/products",
      description: "More information about product endpoints",
    });

    const doc = api.getJSON();
    assertExists(doc.tags, "Tags array should exist");
    assertEquals(doc.tags.length, 2, "Should have two tags");

    // Check first tag
    assertEquals(doc.tags[0].name, "users", "First tag should be 'users'");
    assertEquals(
      doc.tags[0].description,
      "User management endpoints",
      "Description should match",
    );

    // Check second tag with external docs
    assertEquals(
      doc.tags[1].name,
      "products",
      "Second tag should be 'products'",
    );
    assertExists(doc.tags[1].externalDocs, "External docs should exist");
    assertEquals(
      doc.tags[1].externalDocs?.url,
      "https://example.com/docs/products",
      "External docs URL should match",
    );
  });

  await t.step("should prevent duplicate tags", () => {
    const api = new OpenAPI({
      title: "Test API",
      version: "1.0.0",
    });

    // Add a tag
    api.addTag("users", "User management endpoints");

    // Try to add the same tag again with different description
    api.addTag("users", "Different description");

    const doc = api.getJSON();
    assertExists(doc.tags, "Tags array should exist");
    assertEquals(doc.tags.length, 1, "Should still have only one tag");

    // The description should still be the original one
    assertEquals(
      doc.tags[0].description,
      "User management endpoints",
      "Description should not be updated by adding duplicate tag",
    );
  });

  await t.step("should support fluent interface for adding tags", () => {
    const api = new OpenAPI({
      title: "Test API",
      version: "1.0.0",
    });

    // Chain multiple addTag calls
    api
      .addTag("users")
      .addTag("products")
      .addTag("orders");

    const doc = api.getJSON();
    assertExists(doc.tags, "Tags array should exist");
    assertEquals(doc.tags.length, 3, "Should have three tags");
    assertEquals(
      doc.tags.map((tag) => tag.name).join(","),
      "users,products,orders",
      "Tags should be in the correct order",
    );
  });

  await t.step("should get all tags", () => {
    const api = new OpenAPI({
      title: "Test API",
      version: "1.0.0",
    });

    // Add tags
    api.addTag("users", "User management endpoints");
    api.addTag("products", "Product management endpoints");

    // Get all tags
    const tags = api.getTags();
    assertEquals(tags.length, 2, "Should get two tags");
    assertEquals(tags[0].name, "users", "First tag should be 'users'");
    assertEquals(tags[1].name, "products", "Second tag should be 'products'");
  });

  await t.step("should get a tag by name", () => {
    const api = new OpenAPI({
      title: "Test API",
      version: "1.0.0",
    });

    // Add tags
    api.addTag("users", "User management endpoints");
    api.addTag("products", "Product management endpoints");

    // Get tag by name
    const userTag = api.getTagByName("users");
    const productTag = api.getTagByName("products");
    const nonExistentTag = api.getTagByName("nonexistent");

    assertExists(userTag, "User tag should exist");
    assertEquals(userTag.name, "users", "Tag name should match");
    assertEquals(
      userTag.description,
      "User management endpoints",
      "Tag description should match",
    );

    assertExists(productTag, "Product tag should exist");
    assertEquals(productTag.name, "products", "Tag name should match");

    assertEquals(
      nonExistentTag,
      undefined,
      "Non-existent tag should return undefined",
    );
  });

  await t.step("should update tag descriptions", () => {
    const api = new OpenAPI({
      title: "Test API",
      version: "1.0.0",
    });

    // Add a tag
    api.addTag("users", "User management endpoints");

    // Update the tag description
    const updated = api.updateTag(
      "users",
      "Updated user management description",
    );

    assertEquals(updated, true, "Update should return true when successful");

    // Check the updated description
    const doc = api.getJSON();
    assertExists(doc.tags, "Tags array should exist");
    assertEquals(
      doc.tags[0].description,
      "Updated user management description",
      "Description should be updated",
    );
  });

  await t.step("should update tag external docs", () => {
    const api = new OpenAPI({
      title: "Test API",
      version: "1.0.0",
    });

    // Add a tag
    api.addTag("users", "User management endpoints");

    // Update with external docs
    const externalDocs = {
      url: "https://example.com/docs/users",
      description: "External user documentation",
    };

    const updated = api.updateTag("users", undefined, externalDocs);

    assertEquals(updated, true, "Update should return true when successful");

    // Check the updated external docs
    const tag = api.getTagByName("users");
    assertExists(tag?.externalDocs, "External docs should be added");
    assertEquals(
      tag?.externalDocs?.url,
      "https://example.com/docs/users",
      "External docs URL should match",
    );
    assertEquals(
      tag?.externalDocs?.description,
      "External user documentation",
      "External docs description should match",
    );
  });

  await t.step("should handle failed tag updates", () => {
    const api = new OpenAPI({
      title: "Test API",
      version: "1.0.0",
    });

    // Attempt to update a non-existent tag
    const updated = api.updateTag("nonexistent", "This won't work");

    assertEquals(
      updated,
      false,
      "Update should return false when tag doesn't exist",
    );
  });

  await t.step("should remove tags", () => {
    const api = new OpenAPI({
      title: "Test API",
      version: "1.0.0",
    });

    // Add tags
    api.addTag("users", "User management endpoints");
    api.addTag("products", "Product management endpoints");
    api.addTag("orders", "Order management endpoints");

    // Remove the middle tag
    const removed = api.removeTag("products");

    assertEquals(removed, true, "Remove should return true when successful");

    // Check remaining tags
    const tags = api.getTags();
    assertEquals(tags.length, 2, "Should have two tags remaining");
    assertEquals(tags[0].name, "users", "First tag should be 'users'");
    assertEquals(tags[1].name, "orders", "Second tag should now be 'orders'");
  });

  await t.step("should handle failed tag removal", () => {
    const api = new OpenAPI({
      title: "Test API",
      version: "1.0.0",
    });

    api.addTag("users");

    // Attempt to remove a non-existent tag
    const removed = api.removeTag("nonexistent");

    assertEquals(
      removed,
      false,
      "Remove should return false when tag doesn't exist",
    );

    // Tags array should be unchanged
    const tags = api.getTags();
    assertEquals(tags.length, 1, "Should still have one tag");
  });

  await t.step("should add external docs to existing tag", () => {
    const api = new OpenAPI({
      title: "Test API",
      version: "1.0.0",
    });

    // Add a tag without external docs
    api.addTag("users", "User management endpoints");

    // Add external docs to the tag
    const added = api.addTagExternalDocs(
      "users",
      "https://example.com/docs/users",
      "User documentation",
    );

    assertEquals(added, true, "Should successfully add external docs");

    // Check the added external docs
    const tag = api.getTagByName("users");
    assertExists(tag?.externalDocs, "External docs should be added");
    assertEquals(
      tag?.externalDocs?.url,
      "https://example.com/docs/users",
      "External docs URL should match",
    );
    assertEquals(
      tag?.externalDocs?.description,
      "User documentation",
      "External docs description should match",
    );
  });

  await t.step("should handle adding external docs to non-existent tag", () => {
    const api = new OpenAPI({
      title: "Test API",
      version: "1.0.0",
    });

    // Attempt to add external docs to a non-existent tag
    const added = api.addTagExternalDocs(
      "nonexistent",
      "https://example.com/docs",
      "Description",
    );

    assertEquals(added, false, "Should return false for non-existent tag");
  });

  await t.step("should create external documentation object", () => {
    const api = new OpenAPI({
      title: "Test API",
      version: "1.0.0",
    });

    // Create an external docs object
    const externalDocs = api.createExternalDocs(
      "https://example.com/docs",
      "API Documentation",
    );

    assertEquals(
      externalDocs.url,
      "https://example.com/docs",
      "URL should match",
    );
    assertEquals(
      externalDocs.description,
      "API Documentation",
      "Description should match",
    );

    // Create without description
    const minimalDocs = api.createExternalDocs("https://example.com/minimal");
    assertEquals(
      minimalDocs.url,
      "https://example.com/minimal",
      "URL should match",
    );
    assertEquals(
      minimalDocs.description,
      undefined,
      "Description should be undefined",
    );
  });

  await t.step("should work with JSON and YAML serialization", () => {
    const api = new OpenAPI({
      title: "Test API",
      version: "1.0.0",
    });

    api.addTag("users", "User management endpoints", {
      url: "https://example.com/docs/users",
    });

    // Test JSON serialization
    const jsonString = api.getJSONString();
    const parsedJson = JSON.parse(jsonString);

    assertExists(parsedJson.tags, "Tags should be in JSON output");
    assertEquals(parsedJson.tags.length, 1, "Should have one tag in JSON");
    assertEquals(
      parsedJson.tags[0].name,
      "users",
      "Tag name should be in JSON",
    );

    // Test YAML serialization
    const yamlString = api.getYAMLString();
    assertExists(yamlString, "YAML serialization should work");
    // Just verify it contains the tag name (simplified test)
    assertFalse(
      yamlString.indexOf("users") === -1,
      "YAML should contain the tag name",
    );
  });
});
