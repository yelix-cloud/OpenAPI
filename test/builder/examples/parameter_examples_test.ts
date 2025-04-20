import { EndpointBuilder } from "../../../src/EndpointBuilder.ts";
import { assertEquals, assertExists } from "jsr:@std/assert";
import type { OpenAPIExample, OpenAPIParameter } from "../../../src/index.ts";

Deno.test("EndpointBuilder parameter examples", async (t) => {
  await t.step("should set parameter example", () => {
    const endpoint = new EndpointBuilder({
      method: "get",
      title: "Parameter Example",
    });

    endpoint
      .addQueryParameter("limit", {
        type: "integer",
        minimum: 1,
      }, "Max items to return")
      .setParameterExample("limit", 25);

    const pathItem = endpoint.getEndpoint();
    const param = pathItem.get?.parameters?.[0] as OpenAPIParameter;

    assertExists(param, "Parameter should exist");
    assertEquals(param.name, "limit", "Parameter name should be limit");
    assertEquals(param.example, 25, "Parameter example should be 25");
  });

  await t.step("should add parameter named example", () => {
    const endpoint = new EndpointBuilder({
      method: "get",
      title: "Named Parameter Example",
    });

    endpoint
      .addQueryParameter("status", {
        type: "string",
        enum: ["pending", "active", "completed"],
      }, "Filter by status")
      .addParameterNamedExample("status", "activeStatus", {
        value: "active",
        summary: "Active status",
        description: "Filter to show only active items",
      });

    const pathItem = endpoint.getEndpoint();
    const param = pathItem.get?.parameters?.[0] as OpenAPIParameter;

    assertExists(param, "Parameter should exist");
    assertExists(param.examples, "Parameter examples should exist");
    assertExists(param.examples?.activeStatus, "Named example should exist");
    assertEquals(
      (param.examples?.activeStatus as OpenAPIExample).value,
      "active",
      "Example value should be 'active'",
    );
    assertEquals(
      param.examples?.activeStatus.summary,
      "Active status",
      "Example summary should be set",
    );
  });
});
