const { Reporter } = require("@parcel/plugin");
const fs = require("fs");
const path = require("path");
const copy = require("copy-newer");

const PACKAGE_JSON_SECTION = "staticFiles";

const copier = new Reporter({
  async report({ event, options }) {
    if (event.type !== "buildSuccess") {
      return;
    }

    const config = loadConfig(options.projectRoot);

    if (!config) throw new Error(`no valid config section in package.json.`);

    const paths = config.staticPath;

    paths.forEach(async path => {
      const src = options.projectRoot + "/" + path.staticPath;
      const dest = options.projectRoot + "/" + path.staticOutDir;

      const result = await copy("**", dest, { cwd: src });

      if (result.some(val => val !== false && val !== "dir"))
        console.log(`📄 Wrote static files from : ${src} to: ${dest}`);
    });
  }
});

const loadConfig = rootFolder => {
  const packageJson = fs
    .readFileSync(path.join(rootFolder, "package.json"))
    .toString();
  const packageInfo = JSON.parse(packageJson);
  const packageSection = packageInfo[PACKAGE_JSON_SECTION];
  if (!packageSection) {
    throw new Error(`no "${PACKAGE_JSON_SECTION}" section in package.json.`);
  }

  return packageSection;
};

exports.default = copier;
