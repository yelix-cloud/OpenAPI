import { EndpointBuilder } from "../../../src/EndpointBuilder.ts";
import { assertEquals, assertThrows } from "jsr:@std/assert";

Deno.test("EndpointBuilder extensions functionality", async (t) => {
  await t.step("should add vendor extension", () => {
    const endpoint = new EndpointBuilder({
      method: "get",
      title: "Extension Test",
    });
    
    endpoint.addExtension("x-rate-limit", 100);
    
    const pathItem = endpoint.getEndpoint();
    const operation = pathItem.get as Record<string, unknown>;
    
    assertEquals(operation["x-rate-limit"], 100, "Extension should be set");
  });
  
  await t.step("should throw error for invalid extension name", () => {
    const endpoint = new EndpointBuilder({
      method: "get",
      title: "Invalid Extension",
    });
    
    assertThrows(
      () => endpoint.addExtension("invalid-extension", "value"),
      Error,
      "Extension name must start with x-"
    );
  });
});
