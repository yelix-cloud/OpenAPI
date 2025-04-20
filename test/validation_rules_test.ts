import { OpenAPI } from "../src/OpenAPI.ts";
import { assertEquals } from "jsr:@std/assert";

Deno.test("OpenAPI validation rule description tests", async (t) => {
  await t.step("should add a validation rule description", () => {
    const api = new OpenAPI({
      title: "Test API",
      version: "1.0.0",
    });

    const minLengthRule = (value: number) =>
      `Must be at least ${value} characters long`;
    const wasOverriding = api.describeValidationRule(
      "minLength",
      minLengthRule,
    );

    assertEquals(
      wasOverriding,
      false,
      "Should return false when adding a new rule",
    );
  });

  await t.step(
    "should override an existing validation rule description",
    () => {
      const api = new OpenAPI({
        title: "Test API",
        version: "1.0.0",
      });

      // Add initial rule
      api.describeValidationRule(
        "maxLength",
        (value: number) => `Must be at most ${value} characters long`,
      );

      // Override the rule
      const wasOverriding = api.describeValidationRule(
        "maxLength",
        (value: number) => `Cannot exceed ${value} characters`,
      );

      assertEquals(
        wasOverriding,
        true,
        "Should return true when overriding an existing rule",
      );
    },
  );

  await t.step("should retrieve a validation rule description", () => {
    const api = new OpenAPI({
      title: "Test API",
      version: "1.0.0",
    });

    const minLengthRule = (value: number) =>
      `Must be at least ${value} characters long`;
    api.describeValidationRule("minLength", minLengthRule);

    const retrievedRule = api.getValidationRuleDescription("minLength");

    assertEquals(
      retrievedRule,
      minLengthRule,
      "Should return the correct rule function",
    );
    assertEquals(
      retrievedRule?.(5),
      "Must be at least 5 characters long",
      "Rule function should work correctly",
    );
  });

  await t.step(
    "should return undefined for a non-existent validation rule",
    () => {
      const api = new OpenAPI({
        title: "Test API",
        version: "1.0.0",
      });

      const retrievedRule = api.getValidationRuleDescription("nonExistentRule");

      assertEquals(
        retrievedRule,
        undefined,
        "Should return undefined for non-existent rules",
      );
    },
  );
});
