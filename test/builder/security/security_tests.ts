import { EndpointBuilder } from "../../../src/EndpointBuilder.ts";
import { assertEquals, assertExists } from "jsr:@std/assert";

Deno.test("EndpointBuilder security functionality", async (t) => {
  await t.step("should set security requirements", () => {
    const endpoint = new EndpointBuilder({
      method: "get",
      title: "Secure Endpoint",
    });
    
    endpoint.setSecurity([
      { apiKey: [] },
      { oauth2: ["read", "write"] }
    ]);
    
    const pathItem = endpoint.getEndpoint();
    
    assertExists(pathItem.get?.security, "Security should be defined");
    assertEquals(pathItem.get?.security?.length, 2, "Should have two security requirements");
    assertEquals(pathItem.get?.security?.[0], { apiKey: [] }, "First requirement should be apiKey");
    assertEquals(pathItem.get?.security?.[1], { oauth2: ["read", "write"] }, "Second requirement should be oauth2 with scopes");
  });
  
  await t.step("should add a security requirement", () => {
    const endpoint = new EndpointBuilder({
      method: "post",
      title: "Add Security",
    });
    
    endpoint.addSecurityRequirement("jwt", ["user"]);
    
    const pathItem = endpoint.getEndpoint();
    
    assertExists(pathItem.post?.security, "Security should be defined");
    assertEquals(pathItem.post?.security?.length, 1, "Should have one security requirement");
    assertEquals(pathItem.post?.security?.[0], { jwt: ["user"] }, "Security requirement should be jwt with user scope");
  });
  
  await t.step("should add multiple security requirements", () => {
    const endpoint = new EndpointBuilder({
      method: "delete",
      title: "Multiple Securities",
    });
    
    endpoint
      .addSecurityRequirement("basic")
      .addSecurityRequirement("api_key");
    
    const pathItem = endpoint.getEndpoint();
    
    assertExists(pathItem.delete?.security, "Security should be defined");
    assertEquals(pathItem.delete?.security?.length, 2, "Should have two security requirements");
    assertEquals(pathItem.delete?.security?.[0], { basic: [] }, "First requirement should be basic");
    assertEquals(pathItem.delete?.security?.[1], { api_key: [] }, "Second requirement should be api_key");
  });
});
