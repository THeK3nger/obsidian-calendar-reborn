// Run by `npm version <patch|minor|major|x.y.z>` (through the "version" script).
// Copies the new package.json version into manifest.json and records the
// minimum Obsidian version it requires in versions.json.
import { readFileSync, writeFileSync } from "node:fs";

const targetVersion = process.env.npm_package_version;
if (!targetVersion) {
  throw new Error("Run this through `npm version`; npm_package_version is not set.");
}

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function writeJson(path, value) {
  writeFileSync(path, JSON.stringify(value, null, 2) + "\n");
}

const manifest = readJson("manifest.json");
const { minAppVersion } = manifest;
manifest.version = targetVersion;
writeJson("manifest.json", manifest);

const versions = readJson("versions.json");
versions[targetVersion] = minAppVersion;
writeJson("versions.json", versions);

console.log(`manifest.json and versions.json set to ${targetVersion} (minAppVersion ${minAppVersion})`);
