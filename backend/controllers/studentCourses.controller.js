import pool from "../db/postgres.js";
const baseUrl = process.env.BACKEND_URL;

export const getStudentCourseById = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { courseId } = req.params;

    // Student must be enrolled to access the learning player/progress.
    const assigned = await pool.query(
      `SELECT 1
       FROM student_courses
       WHERE student_id = $1 AND course_id = $2`,
      [studentId, courseId],
    );

    if (assigned.rowCount === 0) {
      return res.status(403).json({ message: "Not enrolled in this course" });
    }

    // 2️⃣ Fetch course
    const courseResult = await pool.query(
      `SELECT
         courses_id AS id,
         title,
         description,
         difficulty,
         prereq_description,
         prereq_video_urls,
         prereq_pdf_url
       FROM courses
       WHERE courses_id = $1 AND status = 'approved'`,
      [courseId],
    );

    if (courseResult.rowCount === 0) {
      return res.status(404).json({ message: "Course not found" });
    }

    // 3️⃣ Fetch modules (FIXED)
    const modulesResult = await pool.query(
      `SELECT
         m.module_id AS id,
         m.title,
         m.type,
         CASE 
           WHEN m.type = 'pdf' OR m.pdf_filename IS NOT NULL THEN '${baseUrl}/api/modules/' || m.module_id || '/pdf'
           ELSE m.content_url 
         END AS url,
         m.duration_mins AS duration,
         COALESCE(mp.time_spent_seconds, 0) AS time_spent_seconds,
         COALESCE(mp.last_position_seconds, 0) AS last_position_seconds
       FROM modules m
       LEFT JOIN module_progress mp ON m.module_id = mp.module_id AND mp.student_id = $1
       WHERE m.course_id = $2
       ORDER BY m.module_order ASC`,
      [studentId, courseId],
    );
    if (modulesResult.rows.length > 0) {
      const firstModuleId = modulesResult.rows[0].id;

      await pool.query(
        `INSERT INTO module_progress (student_id, course_id, module_id, last_accessed_at)
     VALUES ($1, $2, $3, NOW())
     ON CONFLICT (student_id, module_id)
     DO UPDATE SET last_accessed_at = NOW()`,
        [studentId, courseId, firstModuleId],
      );
    }
    // 4️⃣ Fetch progress
    const progressResult = await pool.query(
      `SELECT module_id
       FROM module_progress
       WHERE student_id = $1 AND course_id = $2 AND completed_at IS NOT NULL`,
      [studentId, courseId],
    );

    const completedModules = progressResult.rows.map((r) => r.module_id);

    res.json({
      ...courseResult.rows[0],
      modules: modulesResult.rows,
      completedModules,
    });
  } catch (error) {
    console.error("getStudentCourseById error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getInstructorStudentCount = async (req, res) => {
  try {
    const instructorId = req.user.id;

    const { rows } = await pool.query(
      `
      SELECT COUNT(DISTINCT sc.student_id) AS total_students
      FROM student_courses sc
      JOIN courses c ON sc.course_id = c.courses_id
      WHERE c.instructor_id = $1
      `,
      [instructorId],
    );

    res.json(rows[0]);
  } catch (err) {
    console.error("Instructor student count error:", err);
    res.status(500).json({ message: "Failed to fetch students count" });
  }
};

export const enrollStudent = async (req, res) => {
  const studentId = req.user.id;
  const { courseId } = req.params;
  try {
    // 1️⃣ Fetch course details
    const courseResult = await pool.query(
      `
      SELECT 
        status,
        schedule_start_at,
        price_type
      FROM courses
      WHERE courses_id = $1
      `,
      [courseId],
    );

    if (courseResult.rowCount === 0) {
      return res.status(404).json({ message: "Course not found" });
    }

    const course = courseResult.rows[0];

    // 2️⃣ Course must be approved
    if (course.status !== "approved") {
      return res.status(403).json({
        message: "Course is not approved yet",
      });
    }

    // 3️⃣ Schedule check
    if (
      course.schedule_start_at &&
      new Date() < new Date(course.schedule_start_at)
    ) {
      return res.status(403).json({
        message: "Course enrollment has not started yet",
      });
    }

    // 4️⃣ Paid course → bypass stripe for now and enroll directly based on user request
    /*
    if (course.price_type === "paid") {
      return res.status(402).json({
        redirectToPayment: true,
        message: "Payment required to enroll",
      });
    }
    */

    await pool.query(
      `INSERT INTO student_courses (student_id, course_id)
     VALUES ($1, $2)
     ON CONFLICT DO NOTHING`,
      [studentId, courseId],
    );

    // Emit real-time update
    if (global.io) {
      global.io.to(`user_${studentId}`).emit("dashboard_update", {
        type: "enrollment",
        courseId,
      });
    }

    res.json({
      success: true,
      message: "Successfully enrolled in course",
    });
  } catch (error) {
    console.error("Enroll error:", error);
    res.status(500).json({ message: "Enrollment failed" });
  }
};

export const checkEnrollmentStatus = async (req, res) => {
  const studentId = req.user.id;
  const { courseId } = req.params;

  const enrolledRes = await pool.query(
    `SELECT 1 FROM student_courses WHERE student_id = $1 AND course_id = $2`,
    [studentId, courseId],
  );

  const assignedRes = await pool.query(
    `SELECT 1 FROM course_assignments WHERE student_id = $1 AND course_id = $2`,
    [studentId, courseId],
  );

  const enrolled = enrolledRes.rowCount > 0;
  const assigned = assignedRes.rowCount > 0;

  res.json({ enrolled, assigned: assigned || enrolled });
};

export const getMyCourses = async (req, res) => {
  const studentId = req.user.id;

  const { rows } = await pool.query(
    `
    SELECT 
      c.courses_id,
      c.title,
      c.description,
      c.category,
      c.difficulty,
      c.thumbnail_url,
      c.status,
      sc.enrolled_at AS created_at,
      c.price_type,
      c.price_amount,
      c.instructor_id,
      u.full_name AS instructor_name,
      CASE WHEN ir.course_id IS NULL THEN false ELSE true END AS has_reviewed,
      true AS is_enrolled,
      EXISTS (
        SELECT 1
        FROM course_assignments ca
        WHERE ca.course_id = c.courses_id
          AND ca.student_id = sc.student_id
      ) AS is_assigned,
      CASE WHEN c.price_type = 'paid' THEN true ELSE false END AS is_paid,
      CASE
        WHEN (SELECT COUNT(*) FROM modules m WHERE m.course_id = c.courses_id) > 0
          AND (SELECT COUNT(*) FROM modules m WHERE m.course_id = c.courses_id)
              = (SELECT COUNT(*) FROM module_progress mp
                 WHERE mp.course_id = c.courses_id
                   AND mp.student_id = sc.student_id
                   AND mp.completed_at IS NOT NULL)
        THEN true ELSE false END AS is_completed
    FROM student_courses sc
    JOIN courses c ON c.courses_id = sc.course_id
    LEFT JOIN users u ON u.user_id = c.instructor_id
    LEFT JOIN instructor_reviews ir
      ON ir.course_id = c.courses_id AND ir.student_id = sc.student_id
    WHERE sc.student_id = $1
      AND c.status = 'approved'
    ORDER BY sc.enrolled_at DESC
    `,
    [studentId],
  );

  res.json(rows);
};

export const getRecommendedCourses = async (req, res) => {
  const studentId = req.user.id;

  try {
    const result = await pool.query(
      `
      WITH learner_categories AS (
        SELECT DISTINCT c.category
        FROM student_courses sc
        JOIN courses c ON c.courses_id = sc.course_id
        WHERE sc.student_id = $1
          AND c.category IS NOT NULL
      ),
      eligible_courses AS (
        SELECT DISTINCT c.courses_id
        FROM courses c
        LEFT JOIN student_courses sc
          ON sc.course_id = c.courses_id AND sc.student_id = $1
        LEFT JOIN course_assignments ca
          ON ca.course_id = c.courses_id AND ca.student_id = $1
        WHERE c.status = 'approved'
          AND (c.schedule_start_at IS NULL OR c.schedule_start_at <= NOW())
          AND (sc.student_id IS NOT NULL OR ca.student_id IS NOT NULL)
      )
      SELECT 
        c.courses_id,
        c.title,
        c.description,
        c.category,
        c.difficulty,
        c.thumbnail_url,
        c.status,
        c.created_at,
        c.price_type,
        c.price_amount,
        CASE WHEN sc.course_id IS NOT NULL THEN true ELSE false END AS is_enrolled,
        CASE WHEN ca.course_id IS NOT NULL THEN true ELSE false END AS is_assigned,
        CASE WHEN c.price_type = 'paid' THEN true ELSE false END AS is_paid,
        CASE
          WHEN (SELECT COUNT(*) FROM modules m WHERE m.course_id = c.courses_id) > 0
            AND (SELECT COUNT(*) FROM modules m WHERE m.course_id = c.courses_id)
                = (SELECT COUNT(*) FROM module_progress mp
                   WHERE mp.course_id = c.courses_id
                     AND mp.student_id = $1
                     AND mp.completed_at IS NOT NULL)
          THEN true ELSE false END AS is_completed
      FROM courses c
      JOIN eligible_courses ec ON ec.courses_id = c.courses_id
      LEFT JOIN student_courses sc
        ON sc.course_id = c.courses_id AND sc.student_id = $1
      LEFT JOIN course_assignments ca
        ON ca.course_id = c.courses_id AND ca.student_id = $1
      ORDER BY
        CASE
          WHEN c.category IN (SELECT category FROM learner_categories) THEN 0
          ELSE 1
        END,
        c.created_at DESC
      `,
      [studentId],
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Fetch recommended courses error:", err);
    res.status(500).json({ message: "Failed to fetch recommendations" });
  }
};