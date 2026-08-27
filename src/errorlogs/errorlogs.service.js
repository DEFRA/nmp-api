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

const handleStringState = (char, stringState) => {
  const nextState = { ...stringState };

  if (!nextState.inString) {
    if (char === '"') {
      nextState.inString = true;
    } else {
      nextState.inString = false;
    }
    return nextState;
  }

  if (nextState.escaped) {
    nextState.escaped = false;
  } else if (char === "\\") {
    nextState.escaped = true;
  } else if (char === '"') {
    nextState.inString = false;
  } else {
    nextState.inString = true;
    nextState.escaped = false;
  }

  return nextState;
};

const handleBraceState = (char, index, content, braceState, blocks) => {
  if (char === "{") {
    if (braceState.depth === 0) {
      braceState.blockStart = index;
    }
    braceState.depth += 1;
    return;
  }

  if (char === "}" && braceState.depth > 0) {
    braceState.depth -= 1;
    if (braceState.depth === 0 && braceState.blockStart >= 0) {
      blocks.push(content.slice(braceState.blockStart, index + 1));
      braceState.blockStart = -1;
    }
  }
};

const extractJsonObjects = (content) => {
  const blocks = [];
  const stringState = {
    inString: false,
    escaped: false,
  };
  const braceState = {
    depth: 0,
    blockStart: -1,
  };

  for (let i = 0; i < content.length; i += 1) {
    const char = content[i];

    const nextStringState = handleStringState(char, stringState);
    stringState.inString = nextStringState.inString;
    stringState.escaped = nextStringState.escaped;

    if (stringState.inString || stringState.escaped) {
      continue;
    }

    handleBraceState(char, i, content, braceState, blocks);
  }

  return blocks;
};

class LogsService {
  constructor() {
    this.logDir = getDefaultLogDir();
  }

  buildEmptyLogsResponse(date) {
    return {
      date,
      totalFilesScanned: 0,
      totalLogs: 0,
      logs: [],
    };
  }

  async getLogFiles() {
    const files = await fs.promises.readdir(this.logDir, {
      withFileTypes: true,
    });

    return files
      .filter(
        (file) =>
          file.isFile() && path.extname(file.name).toLowerCase() === ".log",
      )
      .map((file) => file.name);
  }

  mapEntryToCollectedLog(entry, fileName) {
    return {
      fileName,
      timestamp: entry.timestamp,
      level: entry.level || null,
      service: entry.service || null,
      payload: entry.payload || null,
      error: entry.error || null,
    };
  }

  collectLogsFromBlocks(jsonBlocks, fileName, date) {
    const matchingLogs = [];

    for (const block of jsonBlocks) {
      try {
        const entry = JSON.parse(block);
        const timestamp = entry?.timestamp;

        if (typeof timestamp === "string" && timestamp.startsWith(date)) {
          matchingLogs.push(this.mapEntryToCollectedLog(entry, fileName));
        }
      } catch (_error) {
        console.log(_error);
      }
    }

    return matchingLogs;
  }

  async collectLogsByDate(date, logFiles) {
    const collectedLogs = [];

    for (const fileName of logFiles) {
      const filePath = path.join(this.logDir, fileName);
      const fileContent = await fs.promises.readFile(filePath, "utf8");
      const jsonBlocks = extractJsonObjects(fileContent);
      const matchingLogs = this.collectLogsFromBlocks(
        jsonBlocks,
        fileName,
        date,
      );

      collectedLogs.push(...matchingLogs);
    }

    return collectedLogs;
  }

  validateDate(date) {
    return Boolean(date) && DATE_PATTERN.test(date);
  }

  async getLogsByDate(date) {
    if (!this.validateDate(date)) {
      return this.buildEmptyLogsResponse(date);
    }

    if (!fs.existsSync(this.logDir)) {
      return this.buildEmptyLogsResponse(date);
    }

    const logFiles = await this.getLogFiles();
    const collectedLogs = await this.collectLogsByDate(date, logFiles);

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
