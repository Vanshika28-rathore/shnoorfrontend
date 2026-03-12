import pool from "../db/postgres.js";
import csvParser from "csv-parser";
import { Readable } from "stream";
import { spawn } from "child_process";
import fs from "fs";
import path from "path";

// Create a new challenge
export const createChallenge = async (req, res) => {
  try {
    const {
      title,
      description,
      type = "code",
      difficulty,
      starter_code,
      test_cases,
    } = req.body;

    if (!title || !description || !difficulty) {
      return res
        .status(400)
        .json({ message: "Title, description, and difficulty are required" });
    }

    // 🔥 Ensure every test case has isPublic
    const normalizedTestCases = (test_cases || []).map((tc) => ({
      input: tc.input,
      output: tc.output,
      isPublic: tc.isPublic === true, // default false if not provided
    }));

    const result = await pool.query(
      `INSERT INTO practice_challenges 
            (title, description, type, difficulty, starter_code, test_cases) 
            VALUES ($1, $2, $3, $4, $5, $6) 
            RETURNING *`,
      [
        title,
        description,
        type,
        difficulty,
        starter_code,
        JSON.stringify(normalizedTestCases),
      ],
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Create Challenge Error:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

// Delete a challenge
export const deleteChallenge = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query(
      "DELETE FROM practice_challenges WHERE challenge_id = $1",
      [id],
    );
    res.json({ message: "Challenge deleted successfully" });
  } catch (err) {
    console.error("Delete Challenge Error:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

// Get all challenges
export const getChallenges = async (req, res) => {
  try {
    // Assume we have a practice_challenges table. If not, I will create it.
    const result = await pool.query(
      "SELECT * FROM practice_challenges ORDER BY RANDOM()",
    );
    res.json(result.rows);
  } catch (err) {
    // If table doesn't exist, return empty or mock for now to prevent crash until schema runs
    console.error("Get Challenges Error:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

// Get single challenge
export const getChallengeById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "SELECT * FROM practice_challenges WHERE challenge_id = $1",
      [id],
    );
    if (result.rows.length === 0)
      return res.status(404).json({ message: "Challenge not found" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Get Challenge Error:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

// Verify Schema Helper (to run on startup)
export const verifyPracticeSchema = async () => {
  try {
    await pool.query(`
            CREATE TABLE IF NOT EXISTS practice_challenges (
                challenge_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                description TEXT NOT NULL,
                type VARCHAR(50) DEFAULT 'code', -- Added missing column
                difficulty VARCHAR(50) CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
                starter_code TEXT,
                test_cases JSONB, -- Array of {input, output}
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

    // Check if empty, seed it
    const check = await pool.query("SELECT COUNT(*) FROM practice_challenges");
    if (parseInt(check.rows[0].count) === 0) {
      console.log("🌱 Seeding Practice Challenges...");
      await pool.query(`
    INSERT INTO practice_challenges (title, description, type, difficulty, starter_code, test_cases) VALUES 
    ('Two Sum', 'Given an array...', 'code', 'Easy', 'function twoSum(nums, target) {\n\n}', 
    '[{"input": "([2, 7, 11, 15], 9)", "output": "[0, 1]", "isPublic": true},
      {"input": "([3, 2, 4], 6)", "output": "[1, 2]", "isPublic": false}]'),

    ('Reverse String', 'Write a function...', 'code', 'Easy', 'function reverseString(s) {\n\n}', 
    '[{"input": "(\\"hello\\")", "output": "\\"olleh\\"", "isPublic": true}]')
`);
    }
    console.log("✅ Practice schema verified");
  } catch (err) {
    console.error("❌ Practice schema check failed", err);
  }
};

export const bulkUploadChallenges = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const results = [];
    const errors = [];
    let rowNumber = 0;

    // Parse CSV from buffer
    const stream = Readable.from(req.file.buffer.toString());

    stream
      .pipe(csvParser())
      .on("data", (row) => {
        rowNumber++;
        try {
          // Validate required fields
          if (!row.title || !row.description || !row.difficulty) {
            errors.push({
              row: rowNumber,
              data: row,
              error: "Missing required fields (title, description, or difficulty)",
            });
            return;
          }

          // Validate difficulty
          const validDifficulties = ["Easy", "Medium", "Hard"];
          if (!validDifficulties.includes(row.difficulty)) {
            errors.push({
              row: rowNumber,
              data: row,
              error: `Invalid difficulty. Must be one of: ${validDifficulties.join(", ")}`,
            });
            return;
          }

          // Parse test_cases JSON
          let testCases = [];
          if (row.test_cases) {
            try {
              testCases = JSON.parse(row.test_cases);

              // Validate test case structure
              if (!Array.isArray(testCases)) {
                throw new Error("test_cases must be an array");
              }

              // Ensure each test case has required fields
              testCases = testCases.map((tc) => ({
                input: tc.input || "",
                output: tc.output || "",
                isPublic: tc.isPublic === true || tc.isPublic === "true",
              }));
            } catch (e) {
              errors.push({
                row: rowNumber,
                data: row,
                error: `Invalid test_cases JSON: ${e.message}`,
              });
              return;
            }
          }

          // Add to results for bulk insert
          results.push({
            title: row.title.trim(),
            description: row.description.trim(),
            type: row.type || "code",
            difficulty: row.difficulty.trim(),
            starter_code: row.starter_code || "",
            test_cases: testCases,
          });
        } catch (err) {
          errors.push({
            row: rowNumber,
            data: row,
            error: err.message,
          });
        }
      })
      .on("end", async () => {
        try {
          // Bulk insert valid challenges
          const insertedChallenges = [];

          for (const challenge of results) {
            const result = await pool.query(
              `INSERT INTO practice_challenges 
               (title, description, type, difficulty, starter_code, test_cases) 
               VALUES ($1, $2, $3, $4, $5, $6) 
               RETURNING *`,
              [
                challenge.title,
                challenge.description,
                challenge.type,
                challenge.difficulty,
                challenge.starter_code,
                JSON.stringify(challenge.test_cases),
              ]
            );
            insertedChallenges.push(result.rows[0]);
          }

          res.status(200).json({
            message: "CSV upload completed",
            summary: {
              total: rowNumber,
              successful: insertedChallenges.length,
              failed: errors.length,
            },
            insertedChallenges,
            errors: errors.length > 0 ? errors : undefined,
          });
        } catch (dbError) {
          console.error("Database insertion error:", dbError);
          res.status(500).json({
            message: "Database error during bulk insert",
            error: dbError.message,
            partialResults: {
              parsed: results.length,
              errors: errors.length,
            },
          });
        }
      })
      .on("error", (err) => {
        console.error("CSV parsing error:", err);
        res.status(500).json({
          message: "Failed to parse CSV file",
          error: err.message,
        });
      });
  } catch (err) {
    console.error("Bulk upload error:", err);
    res.status(500).json({
      message: "Server error during upload",
      error: err.message,
    });
  }
};

// =====================================================
//  Helper: run a single process
// =====================================================
const runSingleTest = (cmd, args, input, options = {}, timeoutMs = null) => {
  return new Promise((resolve) => {
    let child;
    try {
      child = spawn(cmd, args, options);
    } catch (spawnError) {
      resolve({ stdout: "", stderr: spawnError.message || "Failed to start runtime process" });
      return;
    }

    let settled = false;
    const safeResolve = (value) => {
      if (!settled) {
        settled = true;
        resolve(value);
      }
    };

    let stdout = "";
    let stderr = "";
    let timeoutHandle = null;

    if (timeoutMs && Number.isFinite(timeoutMs) && timeoutMs > 0) {
      timeoutHandle = setTimeout(() => {
        try {
          child.kill("SIGKILL");
        } catch (_) {
          // ignore kill errors
        }
        safeResolve({
          stdout: stdout.trim(),
          stderr: `Execution timed out after ${timeoutMs / 1000} seconds`,
        });
      }, timeoutMs);
    }

    child.stdout.on("data", (d) => (stdout += d.toString()));
    child.stderr.on("data", (d) => (stderr += d.toString()));
    if (input !== undefined && input !== null) {
      child.stdin.write(input);
    }
    child.stdin.end();
    child.on("error", (err) => {
      if (timeoutHandle) clearTimeout(timeoutHandle);
      safeResolve({ stdout: "", stderr: err?.message || `Runtime command not found: ${cmd}` });
    });
    child.on("close", () => {
      if (timeoutHandle) clearTimeout(timeoutHandle);
      safeResolve({ stdout: stdout.trim(), stderr: stderr.trim() });
    });
  });
};

const loadTestCasesById = async (id) => {
  if (!id) return null;

  // 1) Try practice challenge id
  const practiceRes = await pool.query(
    "SELECT test_cases FROM practice_challenges WHERE challenge_id::text = $1",
    [String(id)]
  );
  if (practiceRes.rowCount > 0) {
    return practiceRes.rows[0].test_cases;
  }

  // 2) Try exam coding question mapping (question_id or coding_id)
  const examRes = await pool.query(
    `
    SELECT json_agg(
      json_build_object(
        'input', tc.input,
        'output', tc.expected_output,
        'isPublic', NOT tc.is_hidden
      )
      ORDER BY tc.test_id
    ) AS test_cases
    FROM exam_test_cases tc
    JOIN exam_coding_questions cq ON cq.coding_id = tc.coding_id
    WHERE cq.question_id::text = $1 OR cq.coding_id::text = $1
    `,
    [String(id)]
  );

  if (examRes.rowCount > 0 && examRes.rows[0].test_cases) {
    return examRes.rows[0].test_cases;
  }

  return null;
};

const normalizeOutput = (value) =>
  String(value ?? "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .split("\n")
    .map((line) => line.trimEnd())
    .join("\n")
    .trim();

const normalizeToken = (token) => {
  const raw = String(token ?? "").trim();
  if (raw === "") return "";

  const lower = raw.toLowerCase();
  if (lower === "true") return "true";
  if (lower === "false") return "false";

  // Normalize numeric formatting: 1 == 1.0 == 1.000000
  if (/^[+-]?\d+(\.\d+)?$/.test(raw)) {
    const asNumber = Number(raw);
    if (Number.isFinite(asNumber)) {
      return String(asNumber);
    }
  }

  return raw;
};

const compareOutputs = (expectedRaw, actualRaw) => {
  const expected = normalizeOutput(expectedRaw);
  const actual = normalizeOutput(actualRaw);

  // Fast path exact match after newline/trim normalization.
  if (expected === actual) {
    return { passed: true, expected, actual };
  }

  // Fallback token-based comparison to tolerate extra spacing/newlines.
  const expectedTokens = expected.split(/\s+/).filter(Boolean).map(normalizeToken);
  const actualTokens = actual.split(/\s+/).filter(Boolean).map(normalizeToken);

  if (expectedTokens.length !== actualTokens.length) {
    return { passed: false, expected, actual };
  }

  for (let i = 0; i < expectedTokens.length; i += 1) {
    if (expectedTokens[i] !== actualTokens[i]) {
      return { passed: false, expected, actual };
    }
  }

  return { passed: true, expected, actual };
};

const runWithFallbackCommands = async (
  candidates,
  args,
  input,
  options = {},
  timeoutMs = null
) => {
  let lastError = "";
  for (const cmd of candidates) {
    const result = await runSingleTest(cmd, args, input, options, timeoutMs);
    const stderr = String(result.stderr || "");

    // Command-not-found signatures across platforms.
    const notFound =
      /not recognized|enoent|command not found|cannot find/i.test(stderr);
    if (notFound) {
      lastError = stderr;
      continue;
    }
    return result;
  }
  return {
    stdout: "",
    stderr: lastError || `None of these runtimes are available: ${candidates.join(", ")}`,
  };
};

const isDockerUnavailableError = (stderr) =>
  /not recognized|enoent|command not found|cannot find/i.test(String(stderr || ""));

const runDockerCommand = async (
  workDir,
  image,
  command,
  input = "",
  timeoutMs = 5000
) => {
  const mountPath = path.resolve(workDir);
  return runSingleTest(
    "docker",
    [
      "run",
      "--rm",
      "-i",
      "--network",
      "none",
      "--memory",
      "256m",
      "--cpus",
      "1",
      "-e",
      "PYTHONDONTWRITEBYTECODE=1",
      "-v",
      `${mountPath}:/code`,
      "-w",
      "/code",
      image,
      "sh",
      "-lc",
      command,
    ],
    input,
    { cwd: workDir },
    timeoutMs
  );
};

const prepareLanguageRunner = async (workDir, language, code, timeoutMs = 5000) => {
  const normalizedLanguage = (language || "").toLowerCase();

  if (normalizedLanguage === "python") {
    fs.writeFileSync(path.join(workDir, "main.py"), code);
    return {
      runFn: async (input) => {
        const dockerResult = await runDockerCommand(
          workDir,
          "python:3.11-alpine",
          "python /code/main.py",
          input,
          timeoutMs
        );
        if (!isDockerUnavailableError(dockerResult.stderr)) return dockerResult;
        return runWithFallbackCommands(
          ["python3", "python", "py"],
          ["main.py"],
          input,
          { cwd: workDir },
          timeoutMs
        );
      },
    };
  }

  if (normalizedLanguage === "javascript" || normalizedLanguage === "js") {
    fs.writeFileSync(path.join(workDir, "main.js"), code);
    return {
      runFn: async (input) => {
        const dockerResult = await runDockerCommand(
          workDir,
          "node:20-alpine",
          "node /code/main.js",
          input,
          timeoutMs
        );
        if (!isDockerUnavailableError(dockerResult.stderr)) return dockerResult;
        return runWithFallbackCommands(
          ["node"],
          ["main.js"],
          input,
          { cwd: workDir },
          timeoutMs
        );
      },
    };
  }

  if (normalizedLanguage === "java") {
    fs.writeFileSync(path.join(workDir, "Main.java"), code);
    const dockerCompile = await runDockerCommand(
      workDir,
      "eclipse-temurin:17-jdk-alpine",
      "javac /code/Main.java",
      "",
      timeoutMs
    );

    if (!isDockerUnavailableError(dockerCompile.stderr)) {
      if (dockerCompile.stderr) return { compileError: dockerCompile.stderr };
      return {
        runFn: (input) =>
          runDockerCommand(
            workDir,
            "eclipse-temurin:17-jdk-alpine",
            "java -cp /code Main",
            input,
            timeoutMs
          ),
      };
    }

    const localCompile = await runSingleTest(
      "javac",
      ["Main.java"],
      null,
      { cwd: workDir },
      timeoutMs
    );
    if (localCompile.stderr) return { compileError: localCompile.stderr };
    return {
      runFn: (input) =>
        runSingleTest("java", ["Main"], input, { cwd: workDir }, timeoutMs),
    };
  }

  if (normalizedLanguage === "c") {
    fs.writeFileSync(path.join(workDir, "main.c"), code);
    const dockerCompile = await runDockerCommand(
      workDir,
      "gcc:13",
      "gcc /code/main.c -O2 -o /code/main",
      "",
      timeoutMs
    );

    if (!isDockerUnavailableError(dockerCompile.stderr)) {
      if (dockerCompile.stderr) return { compileError: dockerCompile.stderr };
      return {
        runFn: (input) =>
          runDockerCommand(workDir, "gcc:13", "/code/main", input, timeoutMs),
      };
    }

    const localCompile = await runSingleTest(
      "gcc",
      ["main.c", "-O2", "-o", "main"],
      null,
      { cwd: workDir },
      timeoutMs
    );
    if (localCompile.stderr) return { compileError: localCompile.stderr };
    return {
      runFn: (input) =>
        runSingleTest(
          process.platform === "win32" ? "main.exe" : "./main",
          [],
          input,
          { cwd: workDir },
          timeoutMs
        ),
    };
  }

  if (normalizedLanguage === "cpp" || normalizedLanguage === "c++") {
    fs.writeFileSync(path.join(workDir, "main.cpp"), code);
    const dockerCompile = await runDockerCommand(
      workDir,
      "gcc:13",
      "g++ /code/main.cpp -std=c++17 -O2 -o /code/main",
      "",
      timeoutMs
    );

    if (!isDockerUnavailableError(dockerCompile.stderr)) {
      if (dockerCompile.stderr) return { compileError: dockerCompile.stderr };
      return {
        runFn: (input) =>
          runDockerCommand(workDir, "gcc:13", "/code/main", input, timeoutMs),
      };
    }

    const localCompile = await runSingleTest(
      "g++",
      ["main.cpp", "-std=c++17", "-O2", "-o", "main"],
      null,
      { cwd: workDir },
      timeoutMs
    );
    if (localCompile.stderr) return { compileError: localCompile.stderr };
    return {
      runFn: (input) =>
        runSingleTest(
          process.platform === "win32" ? "main.exe" : "./main",
          [],
          input,
          { cwd: workDir },
          timeoutMs
        ),
    };
  }

  if (normalizedLanguage === "go") {
    fs.writeFileSync(path.join(workDir, "main.go"), code);
    return {
      runFn: async (input) => {
        const dockerResult = await runDockerCommand(
          workDir,
          "golang:1.22-alpine",
          "go run /code/main.go",
          input,
          timeoutMs
        );
        if (!isDockerUnavailableError(dockerResult.stderr)) return dockerResult;
        return runSingleTest(
          "go",
          ["run", "main.go"],
          input,
          { cwd: workDir },
          timeoutMs
        );
      },
    };
  }

  return { unsupported: true };
};

// =====================================================
//  Student → Run practice code
// =====================================================
export const runPracticeCode = async (req, res) => {
  let workDir = null;

  try {
    let { code, language, challengeId, testCases, isExamMode } = req.body;

    if (!code || !language) {
      return res.status(400).json({ message: "code and language required" });
    }

    language = language.toLowerCase();

    // Normalize incoming test case payload variants.
    if (!Array.isArray(testCases) && typeof testCases === "string") {
      try {
        testCases = JSON.parse(testCases);
      } catch (_) {
        testCases = [];
      }
    }

    // Prefer explicit test cases (exam embedded mode). Otherwise load by challengeId.
    if (!Array.isArray(testCases) || testCases.length === 0) {
      if (!challengeId) {
        return res.status(400).json({
          message: isExamMode
            ? "No test cases configured for this exam coding question"
            : "challengeId is required",
        });
      }

      const dbTestCases = await loadTestCasesById(challengeId);
      if (!dbTestCases) {
        return res.status(isExamMode ? 400 : 404).json({
          message: isExamMode
            ? "No test cases configured for this exam coding question"
            : "Challenge not found",
        });
      }
      testCases = dbTestCases;

      // Parse if stored as string
      if (typeof testCases === "string") {
        testCases = JSON.parse(testCases);
      }
    }

    if (!testCases || !Array.isArray(testCases) || testCases.length === 0) {
      return res.status(404).json({ message: "No test cases found for this challenge" });
    }

    // Create temp working directory
    const baseTmp = path.join(process.cwd(), "tmp");
    if (!fs.existsSync(baseTmp)) fs.mkdirSync(baseTmp);

    workDir = path.join(baseTmp, `practice_${Date.now()}_${Math.random().toString(36).slice(2)}`);
    fs.mkdirSync(workDir);

    const results = [];
    let passedCount = 0;

    const checkOutput = async (runFn) => {
      for (let i = 0; i < testCases.length; i++) {
        const tc = testCases[i];
        const input = tc.input ?? "";
        const expectedRaw = tc.output ?? tc.expected_output ?? tc.expectedOutput ?? "";
        const result = await runFn(input);
        const isPublic = tc.isPublic !== false && tc.is_hidden !== true;
        const comparison = compareOutputs(expectedRaw, result.stdout);
        const expected = comparison.expected;
        const actual = comparison.actual;
        const ok = result.stderr === "" && comparison.passed;
        if (ok) passedCount++;

        results.push({
          testCaseNumber: i + 1,
          passed: ok,
          isPublic,
          input: isPublic ? tc.input : undefined,
          expectedOutput: isPublic ? expected : undefined,
          actualOutput: isPublic ? actual : undefined,
          error: result.stderr || null,
        });
      }
    };

    const prepared = await prepareLanguageRunner(workDir, language, code, 5000);

    if (prepared.unsupported) {
      return res.status(400).json({ message: "Unsupported language" });
    }

    if (prepared.compileError) {
      const compileFailureResults = testCases.map((tc, index) => ({
        testCaseNumber: index + 1,
        passed: false,
        isPublic: tc.isPublic !== false && tc.is_hidden !== true,
        input: tc.isPublic !== false && tc.is_hidden !== true ? tc.input ?? "" : undefined,
        expectedOutput:
          tc.isPublic !== false && tc.is_hidden !== true
            ? normalizeOutput(tc.output ?? tc.expected_output ?? tc.expectedOutput ?? "")
            : undefined,
        actualOutput: tc.isPublic !== false && tc.is_hidden !== true ? "" : undefined,
        error: prepared.compileError,
      }));
      return res.json({
        results: compileFailureResults,
        summary: { total: testCases.length, passed: 0, failed: testCases.length },
        passed: false,
      });
    }

    await checkOutput(prepared.runFn);

    res.json({
      results,
      summary: {
        total: results.length,
        passed: passedCount,
        failed: results.length - passedCount,
      },
      passed: passedCount === results.length,
    });

  } catch (err) {
    console.error("runPracticeCode error:", err);
    res.status(500).json({ message: "Failed to run code", error: err.message });

  } finally {
    try {
      if (workDir && fs.existsSync(workDir)) {
        fs.rmSync(workDir, { recursive: true, force: true });
      }
    } catch (_) { /* ignore cleanup errors */ }
  }
};

// =====================================================
//  Student → Submit practice code (run + save)
// =====================================================
export const submitPracticeCode = async (req, res) => {
  let workDir = null;

  try {
    let { code, language, challengeId, testCases, isExamMode } = req.body;
    const userId = req.user?.user_id;

    if (!code || !language) {
      return res.status(400).json({ message: "code and language required" });
    }

    if (!isExamMode && !challengeId && (!Array.isArray(testCases) || testCases.length === 0)) {
      return res.status(400).json({ message: "challengeId is required" });
    }

    language = language.toLowerCase();

    // Normalize incoming test case payload variants.
    if (!Array.isArray(testCases) && typeof testCases === "string") {
      try {
        testCases = JSON.parse(testCases);
      } catch (_) {
        testCases = [];
      }
    }

    // Prefer explicit test cases (embedded/exam mode). Otherwise load by challengeId.
    if (!Array.isArray(testCases) || testCases.length === 0) {
      if (!challengeId) {
        return res.status(400).json({
          message: isExamMode
            ? "No test cases configured for this exam coding question"
            : "challengeId is required",
        });
      }

      const dbTestCases = await loadTestCasesById(challengeId);
      if (!dbTestCases) {
        return res.status(isExamMode ? 400 : 404).json({
          message: isExamMode
            ? "No test cases configured for this exam coding question"
            : "Challenge not found",
        });
      }
      testCases = dbTestCases;

      // Parse if stored as string
      if (typeof testCases === "string") {
        testCases = JSON.parse(testCases);
      }
    }

    if (!testCases || !Array.isArray(testCases) || testCases.length === 0) {
      return res.status(404).json({ message: "No test cases found for this challenge" });
    }

    // Create temp working directory
    const baseTmp = path.join(process.cwd(), "tmp");
    if (!fs.existsSync(baseTmp)) fs.mkdirSync(baseTmp);

    workDir = path.join(baseTmp, `submit_${Date.now()}_${Math.random().toString(36).slice(2)}`);
    fs.mkdirSync(workDir);

    const results = [];
    let passedCount = 0;

    const checkOutput = async (runFn) => {
      for (let i = 0; i < testCases.length; i++) {
        const tc = testCases[i];
        const input = tc.input ?? "";
        const expectedRaw = tc.output ?? tc.expected_output ?? tc.expectedOutput ?? "";
        const result = await runFn(input);
        const isPublic = tc.isPublic !== false && tc.is_hidden !== true;
        const comparison = compareOutputs(expectedRaw, result.stdout);
        const expected = comparison.expected;
        const actual = comparison.actual;
        const ok = result.stderr === "" && comparison.passed;
        if (ok) passedCount++;

        results.push({
          testCaseNumber: i + 1,
          passed: ok,
          isPublic,
          input: isPublic ? tc.input : undefined,
          expectedOutput: isPublic ? expected : undefined,
          actualOutput: isPublic ? actual : undefined,
          error: result.stderr || null,
        });
      }
    };

    const prepared = await prepareLanguageRunner(workDir, language, code, 5000);

    if (prepared.unsupported) {
      return res.status(400).json({ message: "Unsupported language" });
    }

    if (prepared.compileError) {
      const compileFailureResults = testCases.map((tc, index) => ({
        testCaseNumber: index + 1,
        passed: false,
        isPublic: tc.isPublic !== false && tc.is_hidden !== true,
        input: tc.isPublic !== false && tc.is_hidden !== true ? tc.input ?? "" : undefined,
        expectedOutput:
          tc.isPublic !== false && tc.is_hidden !== true
            ? normalizeOutput(tc.output ?? tc.expected_output ?? tc.expectedOutput ?? "")
            : undefined,
        actualOutput: tc.isPublic !== false && tc.is_hidden !== true ? "" : undefined,
        error: prepared.compileError,
      }));
      return res.json({
        results: compileFailureResults,
        summary: { total: testCases.length, passed: 0, failed: testCases.length },
        passed: false,
      });
    }

    await checkOutput(prepared.runFn);

    const allPassed = passedCount === results.length;
    const score = `${passedCount}/${results.length}`;

    // ✅ Save submission to database
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS practice_submissions (
          submission_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id UUID REFERENCES users(user_id),
          challenge_id UUID REFERENCES practice_challenges(challenge_id),
          code TEXT NOT NULL,
          language VARCHAR(50) NOT NULL,
          passed_count INTEGER DEFAULT 0,
          total_count INTEGER DEFAULT 0,
          score VARCHAR(20),
          all_passed BOOLEAN DEFAULT FALSE,
          submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      await pool.query(
        `INSERT INTO practice_submissions 
          (user_id, challenge_id, code, language, passed_count, total_count, score, all_passed) 
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [userId, challengeId, code, language, passedCount, results.length, score, allPassed]
      );
    } catch (dbErr) {
      console.error("Failed to save submission:", dbErr);
      // Don't fail the entire request if DB save fails — still return results
    }

    res.json({
      results,
      summary: {
        total: results.length,
        passed: passedCount,
        failed: results.length - passedCount,
      },
      passed: allPassed,
      score,
      message: allPassed
        ? "All test cases passed! Solution submitted."
        : `${passedCount}/${results.length} test cases passed. Solution submitted.`,
    });

  } catch (err) {
    console.error("submitPracticeCode error:", err);
    res.status(500).json({ message: "Failed to submit code", error: err.message });

  } finally {
    try {
      if (workDir && fs.existsSync(workDir)) {
        fs.rmSync(workDir, { recursive: true, force: true });
      }
    } catch (_) { /* ignore cleanup errors */ }
  }
};