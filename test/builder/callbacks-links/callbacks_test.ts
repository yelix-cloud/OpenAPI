import { EndpointBuilder } from "../../../src/EndpointBuilder.ts";
import { assertExists } from "jsr:@std/assert";

Deno.test("EndpointBuilder callbacks functionality", async (t) => {
  await t.step("should add callback", () => {
    const endpoint = new EndpointBuilder({
      method: "post",
      title: "Webhook Registration",
    });

    const callbackPathItem = new EndpointBuilder({
      method: "post",
      title: "Webhook Callback",
    })
      .addJsonResponse(200, "Success", { type: "object" })
      .getEndpoint();

    endpoint.addCallback(
      "paymentCallback",
      "{$request.body#/callbackUrl}",
      callbackPathItem,
    );

    const pathItem = endpoint.getEndpoint();

    assertExists(pathItem.post?.callbacks, "Callbacks should exist");
    assertExists(
      pathItem.post?.callbacks?.paymentCallback,
      "Payment callback should exist",
    );
  });
});
