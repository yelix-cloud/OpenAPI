// This file serves as an entry point for running all EndpointBuilder tests

// Basic functionality tests
import "./builder/basic/functionality_test.ts";
import "./builder/basic/tags_test.ts";

// Security tests
import "./builder/security/security_tests.ts";

// Examples tests
import "./builder/examples/parameter_examples_test.ts";
import "./builder/examples/request_body_examples_test.ts";
import "./builder/examples/response_examples_test.ts";

// Callbacks and links tests
import "./builder/callbacks-links/callbacks_test.ts";
import "./builder/callbacks-links/links_test.ts";

// Extensions and styling tests
import "./builder/extensions-styling/extensions_test.ts";
import "./builder/extensions-styling/parameter_styling_test.ts";

// Method chaining tests
import "./builder/method_chaining_test.ts";

// No additional code needed - the tests are registered when imported

import { EndpointBuilder } from "../src/EndpointBuilder.ts";
import { assertEquals } from "jsr:@std/assert";

Deno.test("EndpointBuilder functionality tests", async (t) => {
  await t.step("should create an endpoint with basic information", () => {
    const endpoint = new EndpointBuilder({
      method: "get",
      title: "Get User",
    });
    
    const pathItem = endpoint.getEndpoint();
    
    // Verify method and title are correctly set
    assertEquals(pathItem.get?.summary, "Get User", "Summary should match the title");
    assertEquals(pathItem.get?.description, "Get User", "Description should match the title");
    assertEquals(Object.keys(pathItem).includes("get"), true, "Method should be set correctly");
    assertEquals(pathItem.get?.parameters?.length, 0, "Parameters should be initialized as empty array");
    assertEquals(Object.keys(pathItem.get?.requestBody || {}).length, 0, "Request body should be initialized as empty object");
    assertEquals(Object.keys(pathItem.get?.responses || {}).length, 0, "Responses should be initialized as empty object");
  });
  
  await t.step("should set tags using setTags method", () => {
    const endpoint = new EndpointBuilder({
      method: "post",
      title: "Create User",
    });
    
    endpoint.setTags(["users", "create"]);
    
    const pathItem = endpoint.getEndpoint();
    
    assertEquals(pathItem.post?.tags, ["users", "create"], "Tags should be set correctly");
  });
  
  await t.step("should add a single tag using addTag method", () => {
    const endpoint = new EndpointBuilder({
      method: "get",
      title: "Get User",
    });
    
    endpoint.addTag("users");
    
    const pathItem = endpoint.getEndpoint();
    
    assertEquals(pathItem.get?.tags, ["users"], "Single tag should be added correctly");
  });
  
  await t.step("should add multiple tags using addTags method", () => {
    const endpoint = new EndpointBuilder({
      method: "delete",
      title: "Delete User",
    });
    
    endpoint.addTags(["users", "delete", "admin"]);
    
    const pathItem = endpoint.getEndpoint();
    
    assertEquals(pathItem.delete?.tags, ["users", "delete", "admin"], "Multiple tags should be added correctly");
  });
  
  await t.step("should chain tag methods correctly", () => {
    const endpoint = new EndpointBuilder({
      method: "patch",
      title: "Update User",
    });
    
    endpoint
      .addTag("users")
      .addTag("update")
      .addTags(["profile", "admin"]);
    
    const pathItem = endpoint.getEndpoint();
    
    assertEquals(
      pathItem.patch?.tags, 
      ["users", "update", "profile", "admin"], 
      "Tags should be added in the correct order with chained methods"
    );
  });
  
  await t.step("should add tags to previously empty tags array", () => {
    const endpoint = new EndpointBuilder({
      method: "put",
      title: "Replace User",
    });
    
    // First call should initialize the tags array
    endpoint.addTag("users");
    // Second call should add to the existing array
    endpoint.addTag("replace");
    
    const pathItem = endpoint.getEndpoint();
    
    assertEquals(pathItem.put?.tags, ["users", "replace"], "Tags should be properly initialized and appended");
  });
  
  await t.step("should support different HTTP methods", () => {
    const methods: ["get", "post", "put", "delete", "patch", "options"] = ["get", "post", "put", "delete", "patch", "options"];
    
    for (const method of methods) {
      const endpoint = new EndpointBuilder({
        method,
        title: `${method.toUpperCase()} Operation`,
      });
      
      const pathItem = endpoint.getEndpoint();
      
      assertEquals(
        pathItem[method]?.summary, 
        `${method.toUpperCase()} Operation`, 
        `${method.toUpperCase()} method should be correctly configured`
      );
    }
  });
});
