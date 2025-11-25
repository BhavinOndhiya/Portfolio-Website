const path = require("path");
const dotenv = require("dotenv");
const { reprocessPortfolioImages } = require("../api/_lib/reprocessPortfolio");

dotenv.config({ path: path.resolve(__dirname, "..", ".env") });

const args = new Set(process.argv.slice(2));
const dryRun = args.has("--dry-run");
const force = args.has("--force");

async function main() {
  try {
    const summary = await reprocessPortfolioImages({
      dryRun,
      force,
      logger: console,
    });

    if (dryRun) {
      console.log(
        "[reprocess] Dry run enabled; no database changes were persisted."
      );
    }

    console.log(
      `[reprocess] Completed. Updated=${summary.updated}, Skipped=${summary.skipped}, Errors=${summary.errors}`
    );

    process.exit(summary.errors ? 1 : 0);
  } catch (error) {
    console.error("[reprocess] Unhandled error", error);
    process.exit(1);
  }
}

main();
