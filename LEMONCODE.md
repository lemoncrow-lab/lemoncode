# LemonCode downstream

LemonCode is the controlled coding host for LemonCrow. This repository remains a
GitHub fork of `anomalyco/opencode` so upstream commits can be merged without
vendoring or periodically replacing the source tree.

## Control surface

The stable downstream patch surface is intentionally small:

- `packages/core/src/product.ts` owns product naming, storage, update policy,
  and managed-host optimization switches.
- `LEMONCODE_MANAGED=1` enables the LemonCrow-owned agent loop.
- `LEMONCODE_STRIP_HOST_PROMPT` and `LEMONCODE_STRIP_HOST_TOOLS` remove
  redundant frontend prompt/tool payloads before they reach the loopback gateway.
- `LEMONCODE_PRODUCT_NAME`, `LEMONCODE_CLI_NAME`, and
  `LEMONCODE_STORAGE_NAME` provide runtime white-label overrides.
- `LEMONCODE_SELF_UPDATE=1` is an escape hatch; it is off by default because
  `lc code host update` owns verified LemonCode releases.

Internal `@opencode-ai/*` package names and legacy `OPENCODE_*` compatibility
variables are retained as an ABI. They are not product branding, and retaining
them keeps upstream merges small and reviewable.

This repository owns scheduled upstream merges, validation, multi-platform builds,
checksums, and release publication. LemonCrow owns host installation and policy.
