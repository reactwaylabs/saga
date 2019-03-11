import path from "path";
import fs from "fs";

const PROJECT_ROOT = path.resolve(__dirname, "../");

function run(): void {
    const filePath = path.resolve("./", "version-policies.json");
    const resultPath = path.join(PROJECT_ROOT, "versions.json");

    const rawFileContent = fs.readFileSync(filePath, "utf8");
    const rawJson = rawFileContent.replace(/\/\*[\s\S]*?\*\/|([^\\:]|^)\/\/.*$/gm, "");
    const versionPolicies = JSON.parse(rawJson);

    const result: { [policyName: string]: string } = {};
    for (const policy of versionPolicies) {
        if (policy["definitionName"] !== "lockStepVersion") {
            continue;
        }

        result[policy.policyName] = policy.version;
    }

    fs.writeFileSync(resultPath, JSON.stringify(result, undefined, 4), "utf8");
}

run();
