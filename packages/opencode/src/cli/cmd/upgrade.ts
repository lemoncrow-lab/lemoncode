import type { Argv } from "yargs"
import { UI } from "../ui"
import * as prompts from "@clack/prompts"
import { Product } from "@opencode-ai/core/product"

export const UpgradeCommand = {
  command: "upgrade",
  describe: "update the LemonCode host through LemonCrow",
  builder: (yargs: Argv) => yargs,
  handler: async () => {
    UI.empty()
    UI.println(UI.logo("  "))
    UI.empty()
    prompts.intro(`Update ${Product.name}`)
    prompts.log.info("Run `lc code host update` so the signed LemonCode release channel remains authoritative.")
    prompts.outro("No changes made")
  },
}
