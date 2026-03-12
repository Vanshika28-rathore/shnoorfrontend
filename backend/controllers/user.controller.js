import admin from "../services/firebaseAdmin.js";
import pool from "../db/postgres.js";
import { sendInstructorInvite, sendStudentInvite } from "../services/email.service.js";
import { validateBulkInstructors } from "../utils/csvValidator.js";
import csvParser from "csv-parser";
import { Readable } from "stream";
const baseUrl = process.env.BACKEND_URL;

export const getMyProfile = async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT
        user_id AS id,
        full_name AS "displayName",
        email,
        role,
        status,
        bio,
        headline,
        linkedin,
        github,
        photo_url AS "photoURL",
        college,
        created_at
      FROM users
      WHERE user_id = $1
      `,
      [req.user.id],
    );

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("getMyProfile error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT user_id, full_name, email, role, status, created_at
       FROM users
       ORDER BY created_at DESC`,
    );

    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const addInstructor = async (req, res) => {
  const fullName = req.body?.fullName?.trim();
  const email = req.body?.email?.trim()?.toLowerCase();
  const subject = req.body?.subject?.trim();
  const phone = req.body?.phone?.trim() || null;
  const bio = req.body?.bio?.trim() || null;
  let firebaseUid = null;
  const client = await pool.connect();

  try {
    // Basic payload validation to avoid DB/Firebase hard failures.
    if (!fullName || !email || !subject) {
      return res.status(400).json({
        message: "fullName, email, and subject are required",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        message: "Invalid email format",
      });
    }

    // 1) Check duplicate email in DB (case-insensitive)
    const existing = await client.query(
      "SELECT 1 FROM users WHERE LOWER(email) = LOWER($1)",
      [email],
    );

    if (existing.rows.length > 0) {
      return res.status(409).json({
        message: "An account with this email already exists",
      });
    }

    // 2) Check duplicate email in Firebase Auth
    try {
      await admin.auth().getUserByEmail(email);
      return res.status(409).json({
        message: "An account with this email already exists",
      });
    } catch (firebaseCheckError) {
      if (firebaseCheckError.code !== "auth/user-not-found") {
        throw firebaseCheckError;
      }
    }

    // 3) Create Firebase user
    const firebaseUser = await admin.auth().createUser({
      email,
      displayName: fullName,
    });
    firebaseUid = firebaseUser.uid;

    // 4) Insert user/profile in one DB transaction
    await client.query("BEGIN");

    const userResult = await client.query(
      `INSERT INTO users (firebase_uid, full_name, email, role, status)
       VALUES ($1, $2, $3, 'instructor', 'active')
       RETURNING user_id`,
      [firebaseUser.uid, fullName, email],
    );

    const instructorId = userResult.rows[0].user_id;

    await client.query(
      `INSERT INTO instructor_profiles (instructor_id, subject, phone, bio)
       VALUES ($1, $2, $3, $4)`,
      [instructorId, subject, phone, bio],
    );

    await client.query("COMMIT");

    // 5) Send success response first
    res.status(201).json({
      message: "Instructor created successfully",
    });

    // 6) Send invite (do not break API if email fails)
    try {
      await sendInstructorInvite(email, fullName);
    } catch (mailError) {
      console.error("SMTP failed:", mailError);
    }
  } catch (error) {
    try {
      await client.query("ROLLBACK");
    } catch (rollbackError) {
      console.error("addInstructor rollback error:", rollbackError);
    }

    // Avoid orphan Firebase users when DB insert fails after Firebase creation.
    if (firebaseUid) {
      try {
        await admin.auth().deleteUser(firebaseUid);
      } catch (cleanupError) {
        console.error("addInstructor Firebase cleanup failed:", cleanupError);
      }
    }

    if (error.code === "auth/email-already-exists" || error.code === "23505") {
      return res.status(409).json({
        message: "An account with this email already exists",
      });
    }

    if (error.code === "auth/invalid-email") {
      return res.status(400).json({
        message: "Invalid email format",
      });
    }

    if (error.code === "22001") {
      return res.status(400).json({
        message: "One or more fields are too long (subject max length is 100)",
      });
    }

    if (error.code === "23503") {
      return res.status(400).json({
        message: "Failed to create instructor profile due to invalid reference data",
      });
    }

    console.error("addInstructor error:", error);
    res.status(500).json({
      message: "Failed to create instructor",
      details:
        process.env.NODE_ENV === "production"
          ? undefined
          : error.message || "Unknown server error",
    });
  } finally {
    client.release();
  }
};

export const addStudent = async (req, res) => {
  const { fullName, email, phone, bio } = req.body;

  try {
    console.log(`📝 Attempting to add student: ${email}`);
    
    // 1️⃣ Check duplicate email
    const existing = await pool.query("SELECT 1 FROM users WHERE email = $1", [
      email,
    ]);

    if (existing.rows.length > 0) {
      console.log(`⚠️ Duplicate email detected: ${email}`);
      return res.status(409).json({
        message: "An account with this email already exists",
      });
    }

    // 2️⃣ Create Firebase user
    const firebaseUser = await admin.auth().createUser({
      email,
      displayName: fullName,
    });

    console.log(`✅ Firebase user created: ${firebaseUser.uid}`);

    // 3️⃣ Insert user
    const userResult = await pool.query(
      `INSERT INTO users (firebase_uid, full_name, email, role, status)
       VALUES ($1, $2, $3, 'student', 'active')
       RETURNING user_id`,
      [firebaseUser.uid, fullName, email],
    );

    const studentId = userResult.rows[0].user_id;

    console.log(`✅ Student record created with ID: ${studentId}`);

    // ✅ 4️⃣ SEND SUCCESS RESPONSE FIRST
    res.status(201).json({
      message: "Student created successfully",
    });

    // 🔵 5️⃣ SEND EMAIL (DO NOT BREAK API IF IT FAILS)
    try {
      console.log(`📧 Attempting to send email to: ${email}`);
      await sendStudentInvite(email, fullName);
      console.log(`✅ Email sent successfully to: ${email}`);
    } catch (mailError) {
      console.error("SMTP failed:", mailError);
    }
  } catch (error) {
    console.error("addStudent error:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({ message: "Failed to create student" });
  }
};

export const updateUserStatus = async (req, res) => {
  const { userId } = req.params;
  const { status } = req.body;

  try {
    const result = await pool.query(
      `UPDATE users
       SET status = $1
       WHERE user_id = $2
       RETURNING user_id, status`,
      [status, userId],
    );

    res.status(200).json({
      message: "User status updated",
      user: result.rows[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateMyProfile = async (req, res) => {
  const { displayName, bio, headline, linkedin, github, photoURL,college } = req.body;

  try {
    await pool.query(
      `
      UPDATE users SET
        full_name = $1,
        bio = $2,
        headline = $3,
        linkedin = $4,
        github = $5,
        photo_url = $6,
        college = $7,
        updated_at = NOW()
      WHERE user_id = $8
      `,
      [displayName, bio, headline, linkedin, github, photoURL, college, req.user.id],
    );

    res.status(200).json({ message: "Profile updated successfully" });
  } catch (error) {
    console.error("updateMyProfile error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const uploadProfilePicture = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  const fileUrl = `${baseUrl}/uploads/profile_pictures/${req.file.filename}`;

  try {
    await pool.query(
      "UPDATE users SET photo_url = $1 WHERE user_id = $2",
      [fileUrl, req.user.id]
    );

    res.status(200).json({
      message: "Image uploaded and profile updated successfully",
      url: fileUrl,
    });
  } catch (error) {
    console.error("uploadProfilePicture error:", error);
    res.status(500).json({ message: "Failed to save to database" });
  }
};

export const bulkUploadInstructors = async (req, res) => {
  const client = await pool.connect();
  
  try {
    // 1️⃣ Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        message: "No CSV file uploaded",
      });
    }

    console.log(`📁 Processing CSV file: ${req.file.originalname}`);

    // 2️⃣ Parse CSV file from buffer
    const instructors = [];
    const parsePromise = new Promise((resolve, reject) => {
      const stream = Readable.from(req.file.buffer);
      
      stream
        .pipe(csvParser({
          skipEmptyLines: true,
          trim: true,
        }))
        .on("data", (row) => {
          instructors.push(row);
        })
        .on("end", () => {
          console.log(`✅ CSV parsed: ${instructors.length} rows`);
          if (instructors.length > 0) {
            console.log(`📊 Sample row:`, instructors[0]);
          }
          resolve();
        })
        .on("error", (error) => {
          console.error("CSV parsing error:", error);
          reject(error);
        });
    });

    await parsePromise;

    if (instructors.length === 0) {
      return res.status(400).json({
        message: "CSV file is empty or contains only headers",
      });
    }

    // 3️⃣ Validate CSV data
    const { valid, errors, validData } = validateBulkInstructors(instructors);

    if (!valid) {
      console.log(`❌ CSV validation failed with ${errors.length} error(s):`, errors);
      return res.status(400).json({
        message: "CSV validation failed",
        errors: errors, // errors already include row numbers
      });
    }

    // 4️⃣ Check for duplicate emails in database (batch check)
    const emailsToCheck = validData.map((d) => d.email);
    const duplicateCheck = await pool.query(
      `SELECT email FROM users WHERE email = ANY($1::text[])`,
      [emailsToCheck]
    );

    const existingEmails = new Set(duplicateCheck.rows.map((r) => r.email));
    
    if (existingEmails.size > 0) {
      const duplicateErrors = validData
        .filter((d) => existingEmails.has(d.email))
        .map((d) => `Row ${d.rowNumber}: Email already exists in database: ${d.email}`);

      console.log(`❌ Found ${duplicateErrors.length} duplicate email(s) in database`);
      return res.status(400).json({
        message: "Duplicate emails found in database",
        errors: duplicateErrors,
      });
    }

    // 4b. Check for existing emails in Firebase Auth
    const firebaseEmailChecks = await Promise.allSettled(
      validData.map(async (instructor) => {
        try {
          await admin.auth().getUserByEmail(instructor.email);
          return { email: instructor.email, exists: true, rowNumber: instructor.rowNumber };
        } catch (err) {
          if (err.code === 'auth/user-not-found') {
            return { email: instructor.email, exists: false };
          }
          throw err;
        }
      })
    );

    const firebaseDuplicates = firebaseEmailChecks
      .filter(result => result.status === 'fulfilled' && result.value.exists)
      .map(result => `Row ${result.value.rowNumber}: Email already exists in Firebase Auth: ${result.value.email}`);

    if (firebaseDuplicates.length > 0) {
      console.log(`❌ Found ${firebaseDuplicates.length} email(s) in Firebase Auth`);
      return res.status(400).json({
        message: "Duplicate emails found in Firebase Auth",
        errors: firebaseDuplicates,
      });
    }

    console.log(`✅ All ${validData.length} instructors validated successfully`);

    // 5️⃣ Begin transaction
    await client.query("BEGIN");
    console.log("🔄 Starting transaction...");

    const successfulUploads = [];
    const uploadErrors = [];

    // 6️⃣ Process each instructor
    for (let i = 0; i < validData.length; i++) {
      const instructor = validData[i];
      const { fullName, email, subject, phone, bio, rowNumber } = instructor;

      try {
        console.log(`[${i + 1}/${validData.length}] Processing: ${email}`);

        // Create Firebase user
        const firebaseUser = await admin.auth().createUser({
          email,
          displayName: fullName,
        });

        console.log(`  ✅ Firebase user created: ${firebaseUser.uid}`);

        // Insert into users table
        const userResult = await client.query(
          `INSERT INTO users (firebase_uid, full_name, email, role, status)
           VALUES ($1, $2, $3, 'instructor', 'active')
           RETURNING user_id`,
          [firebaseUser.uid, fullName, email]
        );

        const instructorId = userResult.rows[0].user_id;
        console.log(`  ✅ User record created: ${instructorId}`);

        // Insert into instructor_profiles table
        await client.query(
          `INSERT INTO instructor_profiles (instructor_id, subject, phone, bio)
           VALUES ($1, $2, $3, $4)`,
          [instructorId, subject, phone, bio]
        );

        console.log(`  ✅ Instructor profile created`);

        successfulUploads.push({
          row: rowNumber,
          fullName,
          email,
          instructorId,
        });

        // Send email (non-blocking, don't fail transaction if email fails)
        try {
          await sendInstructorInvite(email, fullName);
          console.log(`  📧 Email sent to: ${email}`);
        } catch (emailError) {
          console.error(`  ⚠️ Email failed for ${email}:`, emailError.message);
        }

        // Rate limiting: wait 500ms between Firebase API calls
        if (i < validData.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
      } catch (error) {
        console.error(`  ❌ Error processing row ${rowNumber}:`, error);
        
        // Check if it's a Firebase duplicate email error
        if (error.code === 'auth/email-already-exists') {
          uploadErrors.push({
            row: rowNumber,
            error: `Email already exists in Firebase Auth: ${email}`,
            data: { fullName, email },
          });
        } else {
          uploadErrors.push({
            row: rowNumber,
            error: error.message || "Unknown error",
            data: { fullName, email },
          });
        }
        
        // If any row fails, rollback everything
        throw error;
      }
    }

    // 7️⃣ Commit transaction
    await client.query("COMMIT");
    console.log("✅ Transaction committed successfully");

    // 8️⃣ Return results
    res.status(201).json({
      message: "Bulk upload completed successfully",
      summary: {
        total: validData.length,
        successful: successfulUploads.length,
        failed: uploadErrors.length,
      },
      successful: successfulUploads,
      errors: uploadErrors,
    });
  } catch (error) {
    // Rollback transaction on error
    await client.query("ROLLBACK");
    console.error("❌ Bulk upload failed, transaction rolled back:", error);

    // Check if it's a Firebase duplicate email error
    if (error.code === 'auth/email-already-exists') {
      return res.status(409).json({
        message: "Duplicate email found",
        error: "One or more email addresses already exist in the system. Please use unique email addresses.",
        details: error.message,
      });
    }

    res.status(500).json({
      message: "Bulk upload failed",
      error: error.message,
    });
  } finally {
    client.release();
  }
};

export const bulkUploadStudents = async (req, res) => {
  const client = await pool.connect();
  
  try {
    // 1️⃣ Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        message: "No CSV file uploaded",
      });
    }

    console.log(`📁 Processing student CSV file: ${req.file.originalname}`);

    // 2️⃣ Parse CSV file from buffer
    const students = [];
    const parsePromise = new Promise((resolve, reject) => {
      const stream = Readable.from(req.file.buffer);
      
      stream
        .pipe(csvParser({
          skipEmptyLines: true,
          trim: true,
        }))
        .on("data", (row) => {
          students.push(row);
        })
        .on("end", () => {
          console.log(`✅ CSV parsed: ${students.length} rows`);
          if (students.length > 0) {
            console.log(`📊 Sample row:`, students[0]);
          }
          resolve();
        })
        .on("error", (error) => {
          console.error("CSV parsing error:", error);
          reject(error);
        });
    });

    await parsePromise;

    if (students.length === 0) {
      return res.status(400).json({
        message: "CSV file is empty or contains only headers",
      });
    }

    // 3️⃣ Validate CSV data - simple validation for students
    const validData = [];
    const validationErrors = [];

    students.forEach((row, index) => {
      const rowNumber = index + 2; // Account for header row
      const fullName = row.fullName?.trim();
      const email = row.email?.trim().toLowerCase();
      const phone = row.phone?.trim() || null;
      const bio = row.bio?.trim() || null;

      // Validate required fields
      if (!fullName || !email) {
        validationErrors.push({
          row: rowNumber,
          error: "Missing required field (fullName or email)",
          data: row,
        });
        return;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        validationErrors.push({
          row: rowNumber,
          error: `Invalid email format: ${email}`,
          data: row,
        });
        return;
      }

      validData.push({
        fullName,
        email,
        phone,
        bio,
        rowNumber,
      });
    });

    if (validationErrors.length > 0) {
      console.log(`❌ CSV validation failed with ${validationErrors.length} error(s)`);
      return res.status(400).json({
        message: "CSV validation failed",
        errors: validationErrors,
      });
    }

    // 4️⃣ Check for duplicate emails in database
    const emailsToCheck = validData.map((d) => d.email);
    const duplicateCheck = await pool.query(
      `SELECT email FROM users WHERE email = ANY($1::text[])`,
      [emailsToCheck]
    );

    const existingEmails = new Set(duplicateCheck.rows.map((r) => r.email));
    
    if (existingEmails.size > 0) {
      const duplicateErrors = validData
        .filter((d) => existingEmails.has(d.email))
        .map((d) => ({
          row: d.rowNumber,
          error: `Email already exists in database: ${d.email}`,
          data: d,
        }));

      console.log(`❌ Found ${duplicateErrors.length} duplicate email(s)`);
      return res.status(400).json({
        message: "Duplicate emails found",
        errors: duplicateErrors,
      });
    }

    console.log(`✅ All ${validData.length} students validated successfully`);

    // 5️⃣ Begin transaction
    await client.query("BEGIN");
    console.log("🔄 Starting transaction...");

    const successfulUploads = [];
    const uploadErrors = [];

    // 6️⃣ Process each student
    for (let i = 0; i < validData.length; i++) {
      const student = validData[i];
      const { fullName, email, phone, bio, rowNumber } = student;

      try {
        console.log(`[${i + 1}/${validData.length}] Processing: ${email}`);

        // Create Firebase user
        const firebaseUser = await admin.auth().createUser({
          email,
          displayName: fullName,
        });

        console.log(`  ✅ Firebase user created: ${firebaseUser.uid}`);

        // Insert into users table with bio and phone in the main users table
        const userResult = await client.query(
          `INSERT INTO users (firebase_uid, full_name, email, role, status, bio)
           VALUES ($1, $2, $3, 'student', 'active', $4)
           RETURNING user_id`,
          [firebaseUser.uid, fullName, email, bio]
        );

        const studentId = userResult.rows[0].user_id;
        console.log(`  ✅ Student record created: ${studentId}`);

        successfulUploads.push({
          row: rowNumber,
          fullName,
          email,
          studentId,
        });

        // Send email (non-blocking)
        try {
          await sendStudentInvite(email, fullName);
          console.log(`  📧 Email sent to: ${email}`);
        } catch (emailError) {
          console.error(`  ⚠️ Email failed for ${email}:`, emailError.message);
        }

        // Rate limiting: wait 500ms between Firebase API calls
        if (i < validData.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
      } catch (error) {
        console.error(`  ❌ Error processing row ${rowNumber}:`, error);
        
        uploadErrors.push({
          row: rowNumber,
          error: error.message || "Unknown error",
          data: { fullName, email },
        });
        
        // Rollback on any error
        throw error;
      }
    }

    // 7️⃣ Commit transaction
    await client.query("COMMIT");
    console.log("✅ Transaction committed successfully");

    // 8️⃣ Return results
    res.status(201).json({
      message: "Bulk student upload completed successfully",
      summary: {
        total: validData.length,
        successful: successfulUploads.length,
        failed: uploadErrors.length,
      },
      successful: successfulUploads,
      errors: uploadErrors,
    });
  } catch (error) {
    // Rollback transaction on error
    await client.query("ROLLBACK");
    console.error("❌ Bulk student upload failed, transaction rolled back:", error);

    if (error.code === 'auth/email-already-exists') {
      return res.status(409).json({
        message: "Duplicate email found",
        error: "One or more email addresses already exist in the system.",
      });
    }

    res.status(500).json({
      message: "Bulk student upload failed",
      error: error.message,
    });
  } finally {
    client.release();
  }
};