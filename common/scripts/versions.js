"use strict";
var __importDefault =
    (this && this.__importDefault) ||
    function(mod) {
        return mod && mod.__esModule ? mod : { default: mod };
    };
Object.defineProperty(exports, "__esModule", { value: true });
var path_1 = __importDefault(require("path"));
var fs_1 = __importDefault(require("fs"));
var PROJECT_ROOT = path_1.default.resolve(__dirname, "../../");
function run() {
    var filePath = path_1.default.resolve(PROJECT_ROOT, "common/config/rush/version-policies.json");
    var resultPath = path_1.default.join(PROJECT_ROOT, "versions.json");
    var rawFileContent = fs_1.default.readFileSync(filePath, "utf8");
    var rawJson = rawFileContent.replace(/\/\*[\s\S]*?\*\/|([^\\:]|^)\/\/.*$/gm, "");
    var versionPolicies = JSON.parse(rawJson);
    var result = {};
    for (var _i = 0, versionPolicies_1 = versionPolicies; _i < versionPolicies_1.length; _i++) {
        var policy = versionPolicies_1[_i];
        if (policy["definitionName"] !== "lockStepVersion") {
            continue;
        }
        result[policy.policyName] = policy.version;
    }
    fs_1.default.writeFileSync(resultPath, JSON.stringify(result, undefined, 4), "utf8");
}
run();
