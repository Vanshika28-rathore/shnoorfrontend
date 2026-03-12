import pool from "../db/postgres.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';

export const addModules = async (req, res) => {
  try {
    const { courseId } = req.body;

    if (!courseId) {
      return res.status(400).json({ message: "courseId is required" });
    }

    // ✅ SAFE PARSING
    let modules = [];

    if (typeof req.body.modules === "string") {
      modules = JSON.parse(req.body.modules);
    } else if (Array.isArray(req.body.modules)) {
      modules = req.body.modules;
    }

    const pdfFiles = req.files || [];

    if (modules.length === 0) {
      return res.status(200).json({
        message: "Course created without modules",
      });
    }

    for (let i = 0; i < modules.length; i++) {
      const m = modules[i];
      const pdf = pdfFiles[i] || null;

      const result = await pool.query(
        `
        INSERT INTO modules (
          course_id,
          title,
          type,
          content_url,
          duration_mins,
          module_order,
          notes,
          pdf_data,
          pdf_filename,
          pdf_mime
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
        RETURNING module_id
        `,
        [
          courseId,
          m.title,
          m.type,
          m.content_url,
          m.duration || 0,
          m.order_index || i + 1,
          m.notes || null,
          pdf ? pdf.buffer : null,
          pdf ? pdf.originalname : null,
          pdf ? pdf.mimetype : null,
        ]
      );

      // Handle text_stream chunking for batch upload or file upload
      if (m.type === "text_stream") {
        const moduleId = result.rows[0].module_id;
        let textToChunk = m.notes || "";

        // If no notes but we have a content_url that might be a local text file
        if (!textToChunk && m.content_url && m.content_url.includes("/uploads/")) {
          try {
            const filename = m.content_url.split("/uploads/").pop();
            const filePath = path.join(process.cwd(), "uploads", filename);
            if (fs.existsSync(filePath) && (filename.endsWith(".txt") || filename.endsWith(".md"))) {
              textToChunk = fs.readFileSync(filePath, "utf-8");
            }
          } catch (readError) {
            console.error("Error reading text stream file:", readError);
          }
        }

        if (textToChunk) {
          const chunks = textToChunk.split(/\s+/).filter((c) => c.length > 0).map((c) => c + " ");
          if (chunks.length > 0) {
            const chunkVals = [];
            const chunkPlaceholders = [];
            for (let k = 0; k < chunks.length; k++) {
              chunkVals.push(moduleId, chunks[k], k, 1);
              const o = k * 4;
              chunkPlaceholders.push(`($${o + 1}, $${o + 2}, $${o + 3}, $${o + 4})`);
            }
            // Batch inserts to avoid too many parameters in a single query if file is large
            const batchSize = 100; // 100 chunks * 4 params = 400 params (safe)
            for (let i = 0; i < chunkPlaceholders.length; i += batchSize) {
              const pBatch = chunkPlaceholders.slice(i, i + batchSize);
              const vBatch = chunkVals.slice(i * 4, (i + batchSize) * 4);

              // We need to re-index the placeholders for each batch
              const rebindexedPlaceholders = pBatch.map((_, idx) => {
                const base = idx * 4;
                return `($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4})`;
              });

              await pool.query(
                `INSERT INTO module_text_chunks (module_id, content, chunk_order, duration_seconds)
                 VALUES ${rebindexedPlaceholders.join(", ")}`,
                vBatch
              );
            }
          }
        }
      }
    }

    res.status(201).json({
      message: "Modules added successfully",
      count: modules.length,
    });
  } catch (error) {
    console.error("addModules error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const baseUrl = process.env.BACKEND_URL;

export const getModulesByCourse = async (req, res) => {
  const { courseId } = req.params;

  try {
    const result = await pool.query(
      `
      SELECT
        module_id,
        title,
        type,
        CASE 
          WHEN type = 'pdf' OR pdf_filename IS NOT NULL THEN '${baseUrl}/api/modules/' || module_id || '/pdf'
          ELSE content_url 
        END AS content_url,
        duration_mins,
        module_order,
        notes,
        pdf_filename,
        created_at
      FROM modules
      WHERE course_id = $1
      ORDER BY module_order ASC
      `,
      [courseId]
    );

    res.status(200).json(result.rows);
  } catch (error) {
    console.error("getModulesByCourse error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getModulePdf = async (req, res) => {
  const { moduleId } = req.params;

  try {
    const result = await pool.query(
      `
      SELECT pdf_data, pdf_filename, pdf_mime, content_url, type
      FROM modules
      WHERE module_id = $1
      `,
      [moduleId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Module not found" });
    }

    const moduleData = result.rows[0];

    // ✅ Set security headers for iframe compatibility
    res.removeHeader("X-Frame-Options");
    res.setHeader("Content-Security-Policy", "frame-ancestors 'self' *");
    res.setHeader("Access-Control-Allow-Origin", "*");

    // 1️⃣ Priority: Binary data in DB
    if (moduleData.pdf_data) {
      res.setHeader("Content-Type", moduleData.pdf_mime || "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `inline; filename="${moduleData.pdf_filename || "document.pdf"}"`
      );
      return res.send(moduleData.pdf_data);
    }

    // 2️⃣ Fallback: File on disk (from content_url)
    if (moduleData.content_url) {
      // Check if it's a relative path to uploads
      let filePath = "";
      if (moduleData.content_url.includes("/uploads/")) {
        const filename = moduleData.content_url.split("/uploads/").pop();
        filePath = path.join(process.cwd(), "uploads", filename);
      } else if (moduleData.content_url.startsWith("uploads/")) {
        filePath = path.join(process.cwd(), moduleData.content_url);
      }

      if (filePath && fs.existsSync(filePath)) {
        const ext = path.extname(filePath).toLowerCase();
        const mimeByExt = {
          ".pdf": "application/pdf",
          ".txt": "text/plain; charset=utf-8",
          ".md": "text/plain; charset=utf-8",
          ".html": "text/html; charset=utf-8",
          ".htm": "text/html; charset=utf-8",
        };
        res.setHeader("Content-Type", mimeByExt[ext] || "application/octet-stream");
        return res.sendFile(filePath);
      }

      // If it's an external URL, we can't easily serve it through here with these headers 
      // without proxying, but we can redirect.
      if (moduleData.content_url.startsWith("http")) {
        return res.redirect(moduleData.content_url);
      }
    }

    res.status(404).json({ message: "PDF content not found" });
  } catch (error) {
    console.error("getModulePdf error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteModule = async (req, res) => {
  const { moduleId } = req.params;

  try {
    // 🔐 Check instructor ownership via course
    const ownershipCheck = await pool.query(
      `SELECT m.module_id
       FROM modules m
       JOIN courses c ON m.course_id = c.course_id
       WHERE m.module_id = $1 AND c.instructor_id = $2`,
      [moduleId, req.user.id]
    );

    if (ownershipCheck.rows.length === 0) {
      return res.status(403).json({
        message: "You are not allowed to delete this module",
      });
    }

    await pool.query(
      `DELETE FROM modules WHERE module_id = $1`,
      [moduleId]
    );

    res.status(200).json({
      message: "Module deleted successfully",
    });
  } catch (error) {
    console.error("deleteModule error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getModuleStream = async (req, res) => {
  try {
    const { moduleId } = req.params;
    const studentId = req.user.id;

    // 1. Get Progress
    let progress = await pool.query(
      `SELECT current_chunk_index, completed_at FROM module_progress 
       WHERE module_id = $1 AND student_id = $2`,
      [moduleId, studentId]
    );

    let currentIndex = 0;
    let isCompleted = false;

    if (progress.rows.length === 0) {
      // First access, create progress entry
      // Fetch course_id first to avoid subquery issues with UUIDs
      const courseRes = await pool.query(`SELECT course_id FROM modules WHERE module_id = $1`, [moduleId]);

      if (courseRes.rows.length > 0) {
        const courseId = courseRes.rows[0].course_id;
        await pool.query(
          `INSERT INTO module_progress (module_id, student_id, course_id, current_chunk_index, last_accessed_at)
           VALUES ($1, $2, $3, 0, NOW())
           ON CONFLICT (module_id, student_id) DO NOTHING`,
          [moduleId, studentId, courseId]
        );
      } else {
        console.warn(`Module ${moduleId} not found when initializing progress`);
        return res.status(404).json({ message: "Module not found" });
      }
    } else {
      currentIndex = progress.rows[0].current_chunk_index || 0;
      isCompleted = !!progress.rows[0].completed_at;
    }

    // 2. Check Total Chunks
    const chunksRes = await pool.query(
      `SELECT chunk_id, content, chunk_order, duration_seconds 
       FROM module_text_chunks 
       WHERE module_id = $1 
       ORDER BY chunk_order ASC`,
      [moduleId]
    );
    const allChunks = chunksRes.rows;

    if (allChunks.length === 0) {
      return res.status(404).json({ message: "No content found for this module" });
    }

    // 3. If Completed, Return ALL chunks (Review Mode)
    if (isCompleted || currentIndex >= allChunks.length) {
      return res.json({
        completed: true,
        chunks: allChunks
      });
    }

    // 4. Return Accumulated Chunks (Streaming Mode)
    const chunksSoFar = allChunks.slice(0, currentIndex + 1);
    const currentChunk = chunksSoFar[chunksSoFar.length - 1];

    res.json({
      completed: false,
      chunks: chunksSoFar,
      currentChunk: currentChunk,
      index: currentIndex,
      total: allChunks.length
    });

  } catch (err) {
    console.error("getModuleStream error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const advanceModuleStream = async (req, res) => {
  try {
    const { moduleId } = req.params;
    const studentId = req.user.id;

    // 1. Get Current Progress
    const progress = await pool.query(
      `SELECT current_chunk_index FROM module_progress 
       WHERE module_id = $1 AND student_id = $2`,
      [moduleId, studentId]
    );

    if (progress.rows.length === 0) {
      return res.status(400).json({ message: "No progress found. Start the module first." });
    }

    let currentIndex = progress.rows[0].current_chunk_index || 0;

    // 2. Get Total Chunks Count
    const countRes = await pool.query(
      `SELECT COUNT(*) as count FROM module_text_chunks WHERE module_id = $1`,
      [moduleId]
    );
    const totalChunks = parseInt(countRes.rows[0].count);

    // 3. Advance Index
    const nextIndex = currentIndex + 1;

    // 4. Update Progress
    console.log(`[AdvanceStream] Module: ${moduleId}, Student: ${studentId}, NextIndex: ${nextIndex}, Total: ${totalChunks}`);

    if (nextIndex >= totalChunks) {
      // Mark as Completed
      const updateRes = await pool.query(
        `UPDATE module_progress 
         SET current_chunk_index = $1, completed_at = NOW(), last_accessed_at = NOW()
         WHERE module_id = $2 AND student_id = $3
         RETURNING module_id, student_id`,
        [totalChunks, moduleId, studentId]
      );

      if (updateRes.rowCount === 0) {
        console.warn(`[AdvanceStream] No progress record found to update for M:${moduleId} S:${studentId}`);
        return res.status(404).json({ message: "Progress record not found" });
      }

      // Also mark module completion in course_progress if needed (logic might be separate, but good to know)
      res.json({ completed: true, message: "Module completed" });
    } else {
      // Just Advance
      const updateRes = await pool.query(
        `UPDATE module_progress 
         SET current_chunk_index = $1, last_accessed_at = NOW()
         WHERE module_id = $2 AND student_id = $3`,
        [nextIndex, moduleId, studentId]
      );

      if (updateRes.rowCount === 0) {
        console.warn(`[AdvanceStream] No progress record found to update for M:${moduleId} S:${studentId}`);
        return res.status(404).json({ message: "Progress record not found" });
      }

      res.json({ completed: false, nextIndex });
    }

  } catch (err) {
    console.error(`[AdvanceStream Error] Module: ${req.params?.moduleId} User: ${req.user?.id}`, err);
    res.status(500).json({ message: "Server error marking progress" });
  }
};

export const updateModuleTime = async (req, res) => {
  try {
    const { moduleId } = req.params;
    const { seconds } = req.body;
    const studentId = req.user.id;

    console.log(`[updateModuleTime] Received request for module ${moduleId} from student ${studentId} with ${seconds} seconds`);

    if (isNaN(seconds) || seconds <= 0) {
      console.log(`[updateModuleTime] Invalid seconds value: ${seconds}`);
      return res.status(400).json({ message: "Invalid seconds value" });
    }

    // Update or insert progress with updated time
    // We try to find the row first to get the course_id if it's missing
    const progress = await pool.query(
      `SELECT course_id FROM module_progress WHERE module_id = $1 AND student_id = $2`,
      [moduleId, studentId]
    );

    if (progress.rows.length > 0) {
      await pool.query(
        `UPDATE module_progress 
         SET time_spent_seconds = COALESCE(time_spent_seconds, 0) + $1, last_accessed_at = NOW()
         WHERE module_id = $2 AND student_id = $3`,
        [parseInt(seconds), moduleId, studentId]
      );
    } else {
      // If no progress exists, we need course_id
      const moduleRes = await pool.query(`SELECT course_id FROM modules WHERE module_id = $1`, [moduleId]);
      if (moduleRes.rows.length === 0) {
        return res.status(404).json({ message: "Module not found" });
      }

      const courseId = moduleRes.rows[0].course_id;
      await pool.query(
        `INSERT INTO module_progress (module_id, student_id, course_id, time_spent_seconds, last_accessed_at)
         VALUES ($1, $2, $3, $4, NOW())`,
        [moduleId, studentId, courseId, parseInt(seconds)]
      );
    }

    res.json({ success: true, message: "Time updated" });
  } catch (err) {
    console.error("updateModuleTime error:", err);
    res.status(500).json({ message: "Server error updating time" });
  }
};