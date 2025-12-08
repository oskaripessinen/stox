import "dotenv/config";
import { deleteCache, cacheKeys } from "../src/lib/cache";

async function run() {
  try {
    await deleteCache(cacheKeys.indices());
    console.log("Indices cache cleared");
    process.exit(0);
  } catch (error) {
    console.error("Error clearing indices cache:", error);
    process.exit(1);
  }
}

run();
