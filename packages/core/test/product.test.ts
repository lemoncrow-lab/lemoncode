import { describe, expect, test } from "bun:test"
import { product } from "../src/product"

describe("LemonCode product controls", () => {
  test("defaults to LemonCode without managed request stripping", () => {
    const value = product({})
    expect(value.name).toBe("LemonCode")
    expect(value.cli).toBe("lemoncode")
    expect(value.storage).toBe("lemoncode")
    expect(value.managed).toBe(false)
    expect(value.stripHostPrompt).toBe(false)
    expect(value.stripHostTools).toBe(false)
    expect(value.selfUpdate).toBe(false)
  })

  test("managed mode strips redundant host context and remains overridable", () => {
    const value = product({
      LEMONCODE_MANAGED: "1",
      LEMONCODE_PRODUCT_NAME: "My Code",
      LEMONCODE_STRIP_HOST_TOOLS: "false",
    })
    expect(value.name).toBe("My Code")
    expect(value.stripHostPrompt).toBe(true)
    expect(value.stripHostTools).toBe(false)
  })
})
