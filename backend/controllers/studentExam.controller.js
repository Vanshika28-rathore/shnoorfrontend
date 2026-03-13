import pool from "../db/postgres.js";

export const getStudentExams = async (req, res) => {
  const studentId = req.user.id;

  const { rows } = await pool.query(
    `
    SELECT
      e.exam_id,
      e.title,
      e.duration,
      e.pass_percentage,
      '' AS course_title,
      er.exam_id IS NOT NULL AS attempted
    FROM exams e
    LEFT JOIN exam_results er
      ON er.exam_id = e.exam_id AND er.student_id = $1
    WHERE e.status = 'approved'
    ORDER BY e.created_at DESC
    `,
    [studentId],
  );

  res.json(rows);
};

export const getExamForAttempt = async (req, res) => {
  try {
    const { examId } = req.params;
    const studentId = req.user.id;

    /* =========================
       1️⃣ FETCH EXAM META
    ========================= */
    const examRes = await pool.query(
      `
      SELECT
        exam_id,
        title,
        duration,
        pass_percentage,
        course_id
      FROM exams
      WHERE exam_id = $1
      `,
      [examId],
    );

    if (examRes.rowCount === 0) {
      return res.status(404).json({ message: "Exam not found" });
    }

    const exam = examRes.rows[0];

    /* =========================
       2️⃣ ENROLLMENT CHECK (SKIPPED - COURSES MISSING)
    ========================= */
    // Skipping course enrollment check as courses table is missing

    /* =========================
       3️⃣ FETCH QUESTIONS
    ========================= */
    const { rows } = await pool.query(
      `
      SELECT
        e.exam_id,
        e.title,
        e.duration,
        e.pass_percentage AS pass_score,

        COALESCE(
          json_agg(
            json_build_object(
              'id', q.question_id,
              'text', q.question_text,
              'type', q.question_type,
              'marks', q.marks,
              'options', (
                SELECT json_agg(o.option_text)
                FROM exam_mcq_options o
                WHERE o.question_id = q.question_id
              )
            )
            ORDER BY q.question_order
          ) FILTER (WHERE q.question_id IS NOT NULL),
          '[]'
        ) AS questions

      FROM exams e
      LEFT JOIN exam_questions q ON q.exam_id = e.exam_id
      WHERE e.exam_id = $1
      GROUP BY e.exam_id
      `,
      [examId],
    );

    /* =========================
       4️⃣ SEND RESPONSE
    ========================= */
    res.json(rows[0]);
  } catch (err) {
    console.error("getExamForAttempt error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const submitExam = async (req, res) => {
  try {
    const { examId } = req.params;
    const studentId = req.user.id;
    const { answers } = req.body;

    const attempted = await pool.query(
      `
      SELECT 1
      FROM exam_results
      WHERE exam_id = $1 AND student_id = $2
      `,
      [examId, studentId]
    );

    if (attempted.rowCount > 0) {
      return res.status(400).json({
        message: "Exam already submitted",
      });
    }

    /* =========================
       2️⃣ SAVE SUBMISSION
    ========================= */
    await pool.query(
      `
      INSERT INTO exam_submissions
        (exam_id, student_id, answers, submitted_at)
      VALUES ($1, $2, $3, NOW())
      `,
      [examId, studentId, answers]
    );

    return res.status(200).json({
      message: "Exam submitted successfully",
    });

  } catch (err) {
    console.error("submitExam error:", err);
    return res.status(500).json({
      message: "Failed to submit exam",
    });
  }
};



// End of submitExam

export const logViolation = async (req, res) => {
  try {
    const { examId } = req.params;
    const studentId = req.user.id;
    const { type, details } = req.body;

    // VERY VISIBLE LOG FOR DEBUGGING
    console.log("\n**************************************************");
    console.log(`🚀 [VIOLATION RECEIVED]`);
    console.log(`📅 Time: ${new Date().toLocaleString()}`);
    console.log(`👤 Student ID: ${studentId}`);
    console.log(`📝 Exam ID: ${examId}`);
    console.log(`⚠️ Type: ${type}`);
    console.log("**************************************************\n");

    // Save to PostgreSQL for permanent auditing
    const queryText = "INSERT INTO exam_violations (exam_id, student_id, violation_type, details) VALUES ($1, $2, $3, $4)";
    const values = [String(examId), studentId, type, JSON.stringify(details)];

    await pool.query(queryText, values);

    console.log("✅ [DATABASE] Violation saved successfully.");

    res.json({ success: true });
  } catch (err) {
    console.error("❌ [VIOLATION ERROR]:", err.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const savePracticeResult = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { exam_name, percentage, obtained_marks, total_marks } = req.body;

    console.log(`\n--- [PRACTICE RESULT] Saving for Student: ${studentId} ---`);

    await pool.query(
      `
      INSERT INTO exam_results
        (exam_id, student_id, total_marks, obtained_marks, percentage, passed)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (exam_id, student_id)
      DO UPDATE SET
        total_marks = EXCLUDED.total_marks,
        obtained_marks = EXCLUDED.obtained_marks,
        percentage = EXCLUDED.percentage,
        passed = EXCLUDED.passed,
        evaluated_at = NOW()
      `,
      [
        'practice-quiz',
        studentId,
        total_marks || 100, // Default to 100 if not provided
        obtained_marks || percentage,
        percentage,
        percentage >= 50
      ]
    );

    console.log("✅ [DATABASE] Practice result saved successfully.");
    res.json({ success: true });
  } catch (err) {
    console.error("❌ [PRACTICE RESULT ERROR]:", err.message);
    res.status(500).json({ message: "Internal server error" });
  }
};
