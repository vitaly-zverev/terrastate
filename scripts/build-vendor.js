// Copies pre-built browser bundles for the graph webview out of node_modules
// into media/vendor, so the "Terrastate: Graph" panel can render fully
// offline instead of fetching @hpcc-js/wasm and d3-graphviz from unpkg.com
// at runtime (see #<ISSUE_NUMBER>).
const fs = require("fs");
const path = require("path");

const outDir = path.join(__dirname, "..", "media", "vendor");
fs.mkdirSync(outDir, { recursive: true });

const files = [
  ["d3/dist/d3.min.js", "d3.min.js"],
  ["@hpcc-js/wasm/dist/graphviz.umd.js", "graphviz.umd.js"],
  ["d3-graphviz/build/d3-graphviz.min.js", "d3-graphviz.min.js"],
];

for (const [src, dest] of files) {
  const srcPath = path.join(__dirname, "..", "node_modules", src);
  const destPath = path.join(outDir, dest);
  fs.copyFileSync(srcPath, destPath);
  console.log(`vendored ${src} -> media/vendor/${dest}`);
}
