type Environment = Record<string, string | undefined>

function text(env: Environment, key: string, fallback: string) {
  return env[key]?.trim() || fallback
}

function enabled(env: Environment, key: string, fallback: boolean) {
  const value = env[key]?.trim().toLowerCase()
  if (value === undefined || value === "") return fallback
  return value === "1" || value === "true" || value === "yes" || value === "on"
}

export function product(env: Environment = process.env) {
  const managed = enabled(env, "LEMONCODE_MANAGED", false)
  return {
    name: text(env, "LEMONCODE_PRODUCT_NAME", "LemonCode"),
    cli: text(env, "LEMONCODE_CLI_NAME", "lemoncode"),
    storage: text(env, "LEMONCODE_STORAGE_NAME", "lemoncode"),
    repository: text(env, "LEMONCODE_REPOSITORY", "lemoncrow-lab/lemoncode"),
    managed,
    stripHostPrompt: managed && enabled(env, "LEMONCODE_STRIP_HOST_PROMPT", true),
    stripHostTools: managed && enabled(env, "LEMONCODE_STRIP_HOST_TOOLS", true),
    selfUpdate: enabled(env, "LEMONCODE_SELF_UPDATE", false),
  } as const
}

export const Product = product()
