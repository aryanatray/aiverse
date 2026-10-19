import ts from "typescript";
import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
const source = ts.createSourceFile(
  "curriculum.ts",
  readFileSync("src/lib/curriculum.ts", "utf8"),
  ts.ScriptTarget.Latest,
  true,
);
const codes = [];
function walk(node) {
  if (
    ts.isPropertyAssignment(node) &&
    node.name.getText(source) === "code" &&
    ts.isStringLiteral(node.initializer)
  )
    codes.push(node.initializer.text);
  ts.forEachChild(node, walk);
}
walk(source);
let failures = 0;
for (let i = 0; i < codes.length; i++) {
  const r = spawnSync("python3", ["-c", codes[i]], {
    encoding: "utf8",
    timeout: 10000,
  });
  if (r.status !== 0) {
    failures++;
    console.error(`Example ${i + 1} failed: ${r.stderr || r.error}`);
  } else console.log(`Example ${i + 1}: ${r.stdout.trim()}`);
}
console.log(
  `${codes.length - failures}/${codes.length} Python examples executed successfully.`,
);
if (codes.length !== 11 || failures) process.exit(1);
