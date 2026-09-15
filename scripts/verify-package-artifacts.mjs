import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtemp, mkdir, readFile, readdir, rm, cp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const packages = ["core", "vue-headless", "react-headless", "browser", "vue3", "react"];
const pnpm = process.env.npm_execpath;
assert.ok(pnpm, "Run this verifier with pnpm test:packages");

function run(command, args, cwd) {
  const result = spawnSync(command, args, { cwd, encoding: "utf8", env: process.env });
  if (result.error) throw result.error;
  assert.equal(
    result.status,
    0,
    `${command} ${args.join(" ")} failed:\n${result.stdout}\n${result.stderr}`,
  );
  return result.stdout;
}

function packageCommand(args, cwd) {
  return run(process.execPath, [pnpm, ...args], cwd);
}

async function filesBelow(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const groups = await Promise.all(
    entries.map(async (entry) => {
      const path = join(directory, entry.name);
      return entry.isDirectory() ? filesBelow(path) : [path];
    }),
  );
  return groups.flat();
}

async function addGuideExamples(consumer, framework) {
  const guides = await readdir(join(root, "docs", "guides"));
  for (const guide of guides) {
    const source = await readFile(join(root, "docs", "guides", guide), "utf8");
    let index = 0;
    for (const match of source.matchAll(/```(ts|tsx|vue)\n([\s\S]*?)```/g)) {
      const [, language, code] = match;
      if (
        (framework === "core" && language !== "ts") ||
        (framework === "vue" && language !== "vue") ||
        ((framework === "react" || framework === "next") && language !== "tsx")
      )
        continue;
      const context =
        guide === "calendar-lifecycle.md"
          ? 'import type { CalendarInstance, CalendarSnapshot, ReservationResponse } from "@zaptime/core";\ndeclare const calendar: CalendarInstance;\ndeclare function renderStatus(phase: CalendarSnapshot["phase"]): void;\ndeclare function showConfirmation(response: ReservationResponse): void;\n'
          : "";
      await writeFile(
        join(consumer, `guide-${guide.replace(/\.md$/, "")}-${index++}.${language}`),
        context + code,
      );
    }
  }
}

function exportPaths(value) {
  if (typeof value === "string") return [value];
  if (!value || typeof value !== "object") return [];
  return Object.values(value).flatMap(exportPaths);
}

const temporary = await mkdtemp(join(tmpdir(), "zaptime-consumers-"));
try {
  const archives = join(temporary, "archives");
  await mkdir(archives);
  const packed = {};
  for (const name of packages) {
    const directory = join(root, "packages", name);
    const manifest = JSON.parse(await readFile(join(directory, "package.json"), "utf8"));
    assert.equal(manifest.name, `@zaptime/${name}`);
    packageCommand(["pack", "--pack-destination", archives], directory);
    const archive = join(archives, `zaptime-${name}-${manifest.version}.tgz`);
    const contents = run("tar", ["-tzf", archive], temporary).trim().split("\n");
    assert.ok(contents.includes("package/package.json"));
    for (const target of exportPaths(manifest.exports)) {
      assert.ok(
        target.startsWith("./"),
        `${manifest.name}: export must be package-relative: ${target}`,
      );
      assert.ok(
        contents.includes(`package/${target.slice(2)}`),
        `${manifest.name}: missing export ${target}`,
      );
    }
    assert.ok(
      contents.includes(`package/${manifest.types.replace(/^\.\//, "")}`),
      `${manifest.name}: missing declarations`,
    );
    assert.ok(
      !contents.some((path) =>
        /(?:^|\/)(?:\.env(?:\..*)?|__tests__|tests|src|\.git)(?:\/|$)/.test(path),
      ),
      `${manifest.name}: unexpected source/test/environment files in tarball`,
    );

    const unpacked = join(temporary, `unpacked-${name}`);
    await mkdir(unpacked);
    run("tar", ["-xzf", archive, "-C", unpacked], temporary);
    const emitted = await filesBelow(join(unpacked, "package", "dist"));
    const moduleFiles = emitted.filter((path) => /\.(?:m?js|cjs|d\.m?ts)$/.test(path));
    const imports = [];
    for (const file of moduleFiles) {
      const source = await readFile(file, "utf8");
      for (const match of source.matchAll(
        /(?:\bfrom\s*|\bimport\s*\(?\s*|\brequire\s*\(\s*)["']([^"']+)["']/g,
      )) {
        imports.push(match[1]);
        if (!/\.d\.m?ts$/.test(file))
          assert.ok(
            !match[1].endsWith(".vue"),
            `${manifest.name}: runtime imports an uncompiled Vue component`,
          );
      }
    }
    assert.ok(
      !imports.some((specifier) => /(?:^|\/)packages\/|(?:^|\/)src\//.test(specifier)),
      `${manifest.name}: emitted repository source import`,
    );
    if (name === "core") {
      assert.equal(manifest.peerDependencies?.vue, undefined);
      assert.equal(manifest.peerDependencies?.react, undefined);
      const dependencies = [...Object.keys(manifest.dependencies ?? {}), ...imports];
      assert.ok(
        !dependencies.some((specifier) =>
          /^(?:vue|react|react-dom|@vueuse\/|@vue\/|@stripe\/|stripe|analytics|@analytics\/|@zaptime\/(?:vue|react|browser))|\.css$/.test(
            specifier,
          ),
        ),
        "Core contains a framework, browser SDK, or CSS dependency",
      );
    }
    if (name.endsWith("-headless")) {
      assert.ok(
        ![...Object.keys(manifest.dependencies ?? {}), ...imports].some((specifier) =>
          /\.css$|^(?:@zaptime\/(?:browser|vue3|react)$|@stripe\/|analytics|@analytics\/)/.test(
            specifier,
          ),
        ),
        `${manifest.name}: headless entry imports UI or browser effects`,
      );
    }
    if (name === "vue3" || name === "react") {
      assert.ok(manifest.exports["./style.css"], `${manifest.name}: CSS export required`);
      assert.ok(
        manifest.sideEffects === true ||
          manifest.sideEffects?.some((value) => value.includes("css")),
        `${manifest.name}: CSS must be marked as a side effect`,
      );
      if (name === "vue3")
        assert.ok(manifest.exports["./dist/style.css"], "Vue legacy CSS alias required");
      if (name === "vue3") {
        const declarations = await readFile(join(unpacked, "package", manifest.types), "utf8");
        assert.match(
          declarations,
          /@deprecated[\s\S]*?ZapTimeCalendar/,
          "Vue legacy alias must carry declaration deprecation",
        );
      }
    }
    if (name === "react" || name === "react-headless") {
      const declarations = await readFile(join(unpacked, "package", manifest.types), "utf8");
      assert.doesNotMatch(
        declarations,
        /^\s*["']use client["'];?/,
        `${manifest.name}: client directive is invalid in ambient declarations`,
      );
      const entry = manifest.exports["."].import;
      const source = await readFile(join(unpacked, "package", entry), "utf8");
      assert.match(
        source,
        /^\s*(?:\/\*[\s\S]*?\*\/\s*|\/\/[^\n]*\n\s*)*["']use client["'];?/,
        `${manifest.name}: missing client directive`,
      );
    }
    packed[manifest.name] = `file:${archive}`;
  }

  const consumers = process.env.PACKED_CONSUMERS?.split(",") ?? ["core", "vue", "react", "next"];
  assert.ok(
    consumers.length && consumers.every((name) => ["core", "vue", "react", "next"].includes(name)),
    "Invalid packed consumer selection",
  );
  for (const name of consumers) {
    const consumer = join(temporary, `consumer-${name}`);
    await cp(join(root, "tests", "consumers", name), consumer, { recursive: true });
    await addGuideExamples(consumer, name);
    const manifest = JSON.parse(await readFile(join(consumer, "package.json"), "utf8"));
    for (const dependency of Object.keys(manifest.dependencies ?? {})) {
      if (packed[dependency]) manifest.dependencies[dependency] = packed[dependency];
    }
    if (name === "react" && process.env.REACT_VERSION) {
      assert.match(process.env.REACT_VERSION, /^(?:18\.3\.\d+|19\.\d+\.\d+)$/);
      manifest.dependencies.react = process.env.REACT_VERSION;
      manifest.dependencies["react-dom"] = process.env.REACT_VERSION;
      const major = process.env.REACT_VERSION.split(".")[0];
      manifest.devDependencies["@types/react"] = `^${major}.0.0`;
      manifest.devDependencies["@types/react-dom"] = `^${major}.0.0`;
    }
    if (name === "vue" && process.env.VUE_VERSION)
      manifest.dependencies.vue = process.env.VUE_VERSION;
    manifest.pnpm = { overrides: packed };
    await writeFile(join(consumer, "package.json"), `${JSON.stringify(manifest, null, 2)}\n`);
    packageCommand(["install", "--ignore-scripts", "--no-frozen-lockfile"], consumer);
    packageCommand(["run", "typecheck"], consumer);
    packageCommand(["run", "build"], consumer);
    if (name === "core") {
      run(
        process.execPath,
        [
          "--input-type=module",
          "-e",
          "import {createCalendar} from '@zaptime/core'; const calendar=createCalendar({config:{token:'fixture-token'}}); if(calendar.getSnapshot().phase!=='idle') throw Error('Core construction performed initialization'); await calendar.dispose(); for(const name of ['vue','react']) { try { import.meta.resolve(name); throw Error(name+' unexpectedly installed'); } catch(error) { if(error.code!=='ERR_MODULE_NOT_FOUND') throw error; } }",
        ],
        consumer,
      );
    }
    process.stdout.write(`Verified packed ${name} consumer\n`);
  }
} finally {
  await rm(temporary, { recursive: true, force: true });
}
