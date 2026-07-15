import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

console.log(
  "Project ID:",
  process.env.FIREBASE_ADMIN_PROJECT_ID ? "✅ Set" : "❌ Missing",
);
console.log(
  "Client Email:",
  process.env.FIREBASE_ADMIN_CLIENT_EMAIL ? "✅ Set" : "❌ Missing",
);
console.log(
  "Private Key:",
  process.env.FIREBASE_ADMIN_PRIVATE_KEY ?
    "✅ Set (length: " + process.env.FIREBASE_ADMIN_PRIVATE_KEY.length + ")"
  : "❌ Missing",
);
