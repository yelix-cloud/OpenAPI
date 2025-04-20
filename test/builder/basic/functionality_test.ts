import { EndpointBuilder } from "../../../src/EndpointBuilder.ts";
import { assertEquals, assertExists } from "jsr:@std/assert";

Deno.test("EndpointBuilder basic functionality", async (t) => {
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
