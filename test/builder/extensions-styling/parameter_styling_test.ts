import { EndpointBuilder } from "../../../src/EndpointBuilder.ts";
import { assertEquals, assertExists } from "jsr:@std/assert";
import type { OpenAPIParameter } from "../../../src/index.ts";

Deno.test("EndpointBuilder parameter styling functionality", async (t) => {
  await t.step("should set parameter style", () => {
    const endpoint = new EndpointBuilder({
      method: "get",
      title: "Parameter Style",
    });
    
    endpoint
      .addQueryParameter("ids", { 
        type: "array",
        items: { type: "string" }
      }, "List of IDs")
      .setParameterStyle("ids", "form", true);
    
    const pathItem = endpoint.getEndpoint();
    const param = pathItem.get?.parameters?.[0] as OpenAPIParameter;
    
    assertExists(param, "Parameter should exist");
    assertEquals(param.style, "form", "Parameter style should be form");
    assertEquals(param.explode, true, "Parameter explode should be true");
  });
});
