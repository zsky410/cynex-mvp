import { createClient } from "@supabase/supabase-js";
import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";

const fixturePrefix = `phase3a-acceptance-${Date.now()}`;

async function readVisible(prompt) {
  if (!stdin.isTTY) {
    throw new Error(`Missing environment variable for: ${prompt}`);
  }
  const readline = createInterface({ input: stdin, output: stdout });
  try {
    return (await readline.question(prompt)).trim();
  } finally {
    readline.close();
  }
}

async function readHidden(prompt) {
  if (!stdin.isTTY || !stdout.isTTY) {
    throw new Error(`Missing environment variable for: ${prompt}`);
  }

  stdout.write(prompt);
  stdin.setRawMode(true);
  stdin.resume();
  stdin.setEncoding("utf8");

  return new Promise((resolve, reject) => {
    let value = "";
    const cleanup = () => {
      stdin.off("data", onData);
      stdin.setRawMode(false);
      stdin.pause();
      stdout.write("\n");
    };
    const onData = (character) => {
      if (character === "\u0003") {
        cleanup();
        reject(new Error("Input cancelled"));
      } else if (character === "\r" || character === "\n") {
        cleanup();
        resolve(value);
      } else if (character === "\u007f" || character === "\b") {
        value = value.slice(0, -1);
      } else if (character >= " ") {
        value += character;
      }
    };
    stdin.on("data", onData);
  });
}

async function setting(name, prompt, { hidden = false } = {}) {
  const fromEnvironment = process.env[name]?.trim();
  if (fromEnvironment) return fromEnvironment;
  return hidden ? readHidden(prompt) : readVisible(prompt);
}

function assertOk(result, action) {
  if (result.error) {
    throw new Error(`${action} failed (${result.error.code ?? "unknown"})`);
  }
  return result.data;
}

function assertDenied(result, action) {
  if (!result.error) throw new Error(`${action} unexpectedly succeeded`);
}

function report(name) {
  console.log(`ok - ${name}`);
}

const supabaseUrl = await setting(
  "STAGING_SUPABASE_URL",
  "Staging Supabase URL: ",
);
const publishableKey = await setting(
  "STAGING_SUPABASE_PUBLISHABLE_KEY",
  "Staging Supabase publishable key: ",
  { hidden: true },
);
const adminEmail = await setting(
  "STAGING_ADMIN_EMAIL",
  "Staging Admin email: ",
);
const adminPassword = await setting(
  "STAGING_ADMIN_PASSWORD",
  "Staging Admin password: ",
  { hidden: true },
);
const nonAdminEmail = await setting(
  "STAGING_NON_ADMIN_EMAIL",
  "Staging non-admin email: ",
);
const nonAdminPassword = await setting(
  "STAGING_NON_ADMIN_PASSWORD",
  "Staging non-admin password: ",
  { hidden: true },
);

const clientOptions = {
  auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
};
const admin = createClient(supabaseUrl, publishableKey, clientOptions);
const nonAdmin = createClient(supabaseUrl, publishableKey, clientOptions);

let categoryId;
let productId;
let packageId;
let variantId;
let optionId;

try {
  assertOk(
    await admin.auth.signInWithPassword({ email: adminEmail, password: adminPassword }),
    "Admin login",
  );
  report("real staging Admin authenticated with publishable client");

  const category = assertOk(
    await admin
      .from("categories")
      .insert({
        name: fixturePrefix,
        slug: fixturePrefix,
        icon_key: "acceptance",
        is_active: false,
      })
      .select("id")
      .single(),
    "Admin Category fixture create",
  );
  categoryId = category.id;

  const product = assertOk(
    await admin
      .from("products")
      .insert({
        category_id: categoryId,
        name: fixturePrefix,
        slug: fixturePrefix,
        short_description: "Phase 3A staging role acceptance fixture",
      })
      .select("id")
      .single(),
    "Admin Product fixture create",
  );
  productId = product.id;

  const packageRow = assertOk(
    await admin
      .from("packages")
      .insert({ product_id: productId, name: `${fixturePrefix}-package` })
      .select("id")
      .single(),
    "Admin Package fixture create",
  );
  packageId = packageRow.id;

  const variant = assertOk(
    await admin
      .from("variants")
      .insert({ package_id: packageId, name: `${fixturePrefix}-variant` })
      .select("id")
      .single(),
    "Admin Variant create",
  );
  variantId = variant.id;
  report("Admin created Variant under RLS");

  assertOk(
    await admin
      .from("variants")
      .update({ description: "updated by Phase 3A acceptance" })
      .eq("id", variantId)
      .select("id")
      .single(),
    "Admin Variant update",
  );
  report("Admin updated Variant under RLS");

  const durationOption = assertOk(
    await admin
      .from("options")
      .insert({
        variant_id: variantId,
        duration_label: "1 tháng",
        price_vnd: 100000,
      })
      .select("id")
      .single(),
    "Admin Duration Option create",
  );
  optionId = durationOption.id;
  report("Admin created Duration Option under RLS");

  assertOk(
    await admin
      .from("options")
      .update({ price_vnd: 110000 })
      .eq("id", optionId)
      .select("id")
      .single(),
    "Admin Duration Option update",
  );
  report("Admin updated Duration Option under RLS");

  assertOk(
    await nonAdmin.auth.signInWithPassword({
      email: nonAdminEmail,
      password: nonAdminPassword,
    }),
    "Non-admin login",
  );
  report("real staging non-admin authenticated with publishable client");

  assertDenied(
    await nonAdmin.from("variants").insert({
      package_id: packageId,
      name: `${fixturePrefix}-forbidden-variant`,
    }),
    "Non-admin Variant create",
  );
  assertDenied(
    await nonAdmin
      .from("variants")
      .update({ name: `${fixturePrefix}-forbidden-update` })
      .eq("id", variantId)
      .select("id")
      .single(),
    "Non-admin Variant update",
  );
  assertDenied(
    await nonAdmin.from("variants").delete().eq("id", variantId).select("id").single(),
    "Non-admin Variant delete",
  );
  report("non-admin Variant create/update/delete denied by RLS");

  assertDenied(
    await nonAdmin.from("options").insert({
      variant_id: variantId,
      duration_label: "3 tháng",
      price_vnd: 250000,
    }),
    "Non-admin Duration Option create",
  );
  assertDenied(
    await nonAdmin
      .from("options")
      .update({ price_vnd: 1 })
      .eq("id", optionId)
      .select("id")
      .single(),
    "Non-admin Duration Option update",
  );
  assertDenied(
    await nonAdmin.from("options").delete().eq("id", optionId).select("id").single(),
    "Non-admin Duration Option delete",
  );
  report("non-admin Duration Option create/update/delete denied by RLS");

  const retainedVariant = assertOk(
    await admin
      .from("variants")
      .select("name,description")
      .eq("id", variantId)
      .single(),
    "Admin Variant verification after non-admin attempts",
  );
  if (
    retainedVariant.name !== `${fixturePrefix}-variant` ||
    retainedVariant.description !== "updated by Phase 3A acceptance"
  ) {
    throw new Error("Non-admin Variant attempts changed the fixture");
  }

  const retainedOption = assertOk(
    await admin
      .from("options")
      .select("price_vnd")
      .eq("id", optionId)
      .single(),
    "Admin Duration Option verification after non-admin attempts",
  );
  if (retainedOption.price_vnd !== 110000) {
    throw new Error("Non-admin Duration Option attempts changed the fixture");
  }
  report("non-admin attempts left Admin fixtures unchanged");

  assertOk(
    await admin.from("options").delete().eq("id", optionId).select("id").single(),
    "Admin Duration Option delete",
  );
  optionId = undefined;
  report("Admin deleted Duration Option under RLS");

  assertOk(
    await admin.from("variants").delete().eq("id", variantId).select("id").single(),
    "Admin Variant delete",
  );
  variantId = undefined;
  report("Admin deleted Variant under RLS");
} finally {
  if (productId) {
    const cleanup = await admin.from("products").delete().eq("id", productId);
    if (cleanup.error) process.exitCode = 1;
  }
  if (categoryId) {
    const cleanup = await admin.from("categories").delete().eq("id", categoryId);
    if (cleanup.error) process.exitCode = 1;
  }
  await Promise.allSettled([admin.auth.signOut(), nonAdmin.auth.signOut()]);
  console.log(
    process.exitCode ? "not ok - fixture cleanup" : "ok - all staging fixtures cleaned",
  );
}
