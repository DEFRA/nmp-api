const fs = require("node:fs");
const path = require("node:path");

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const getDefaultLogDir = () => {
  const mainFile = require.main?.filename || "";
  const isBuiltRuntime = mainFile.includes(`${path.sep}dist${path.sep}`);

  if (isBuiltRuntime) {
    return path.resolve(process.cwd(), "dist", "logs");
  }

  return path.resolve(process.cwd(), "logs");
};

const extractJsonObjects = (content) => {
  const blocks = [];
  let depth = 0;
  let blockStart = -1;
  let inString = false;
  let escaped = false;

  for (let i = 0; i < content.length; i += 1) {
    const char = content[i];

    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (char === "\\") {
        escaped = true;
      } else if (char === '"') {
        inString = false;
      }
      continue;
    }

    if (char === '"') {
      inString = true;
      continue;
    }

    if (char === "{") {
      if (depth === 0) {
        blockStart = i;
      }
      depth += 1;
      continue;
    }

    if (char === "}" && depth > 0) {
      depth -= 1;
      if (depth === 0 && blockStart >= 0) {
        blocks.push(content.slice(blockStart, i + 1));
        blockStart = -1;
      }
    }
  }

  return blocks;
};

class LogsService {
  constructor() {
    this.logDir = getDefaultLogDir();
  }

  validateDate(date) {
    return Boolean(date) && DATE_PATTERN.test(date);
  }

  async getLogsByDate(date) {
    if (!this.validateDate(date)) {
      return {
        date,
        totalFilesScanned: 0,
        totalLogs: 0,
        logs: [],
      };
    }

    if (!fs.existsSync(this.logDir)) {
      return {
        date,
        totalFilesScanned: 0,
        totalLogs: 0,
        logs: [],
      };
    }

    const files = await fs.promises.readdir(this.logDir, {
      withFileTypes: true,
    });
    const logFiles = files
      .filter(
        (file) =>
          file.isFile() && path.extname(file.name).toLowerCase() === ".log",
      )
      .map((file) => file.name);

    const collectedLogs = [];

    for (const fileName of logFiles) {
      const filePath = path.join(this.logDir, fileName);
      const fileContent = await fs.promises.readFile(filePath, "utf8");
      const jsonBlocks = extractJsonObjects(fileContent);

      for (const block of jsonBlocks) {
        try {
          const entry = JSON.parse(block);
          const timestamp = entry?.timestamp;

          if (typeof timestamp === "string" && timestamp.startsWith(date)) {
            collectedLogs.push({
              fileName,
              timestamp,
              level: entry.level || null,
              service: entry.service || null,
              payload: entry.payload || null,
              error: entry.error || null,
            });
          }
        } catch (_error) {
          console.log(_error);
        }
      }
    }

    collectedLogs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    return {
      date,
      totalFilesScanned: logFiles.length,
      totalLogs: collectedLogs.length,
      logs: collectedLogs,
    };
  }
}

module.exports = { LogsService };
