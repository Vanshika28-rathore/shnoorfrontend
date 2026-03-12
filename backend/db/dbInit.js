import pool from './postgres.js';

/**
 * Centrally initializes all required database tables if they don't exist.
 * This ensures the application remains stable even if a developer forgets 
 * to run manual migrations.
 */
export const initializeDatabase = async () => {
    try {
        console.log("🛠️  Initializing Database Tables...");

        // 1. Ensure PGCrypto for UUID generation
        await pool.query('CREATE EXTENSION IF NOT EXISTS "pgcrypto";');

        // 2. Learning Paths Module
        console.log("   - Setting up Learning Paths...");
        await pool.query(`
            CREATE TABLE IF NOT EXISTS learning_paths (
                id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                description TEXT,
                instructor_id UUID REFERENCES users(user_id) ON DELETE SET NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS learning_path_courses (
                id SERIAL PRIMARY KEY,
                learning_path_id UUID REFERENCES learning_paths(id) ON DELETE CASCADE,
                course_id UUID REFERENCES courses(courses_id) ON DELETE CASCADE,
                order_index INT DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(learning_path_id, course_id)
            );
        `);

        // 3. Exams Module
        console.log("   - Setting up Exams...");
        await pool.query(`
            CREATE TABLE IF NOT EXISTS exams (
                exam_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                description TEXT,
                duration INT NOT NULL, -- in minutes
                pass_percentage INT DEFAULT 40,
                instructor_id UUID REFERENCES users(user_id) ON DELETE SET NULL,
                course_id UUID REFERENCES courses(courses_id) ON DELETE CASCADE,
                validity_value INT,
                validity_unit VARCHAR(20), -- 'days', 'months', 'years'
                disconnect_grace_time INT DEFAULT 300, -- 5 mins grace for power cuts/net loss
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Ensure disconnect_grace_time exists (migration)
        await pool.query(`
            ALTER TABLE exams ADD COLUMN IF NOT EXISTS disconnect_grace_time INTEGER DEFAULT 300;
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS exam_questions (
                question_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                exam_id UUID REFERENCES exams(exam_id) ON DELETE CASCADE,
                question_text TEXT NOT NULL,
                question_type VARCHAR(50) DEFAULT 'mcq', -- mcq, descriptive, coding
                marks INT DEFAULT 1,
                question_order INT DEFAULT 0,
                keywords TEXT, -- for descriptive auto-grading
                min_word_count INT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Ensure question_order exists (migration)
        await pool.query(`
            ALTER TABLE exam_questions ADD COLUMN IF NOT EXISTS question_order INTEGER DEFAULT 0;
        `);


        await pool.query(`
            CREATE TABLE IF NOT EXISTS exam_mcq_options (
                option_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                question_id UUID REFERENCES exam_questions(question_id) ON DELETE CASCADE,
                option_text TEXT NOT NULL,
                is_correct BOOLEAN DEFAULT FALSE,
                option_order INT DEFAULT 0
            );
        `);

        // --- Coding Questions Support ---
        await pool.query(`
            CREATE TABLE IF NOT EXISTS exam_coding_questions (
                coding_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                question_id UUID REFERENCES exam_questions(question_id) ON DELETE CASCADE,
                title VARCHAR(255),
                description TEXT,
                language VARCHAR(50),
                starter_code TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS exam_test_cases (
                test_id SERIAL PRIMARY KEY,
                coding_id UUID REFERENCES exam_coding_questions(coding_id) ON DELETE CASCADE,
                input TEXT,
                expected_output TEXT,
                is_hidden BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Migration: Ensure test_id exists
        const checkTestId = await pool.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'exam_test_cases' AND column_name = 'test_id'
        `);

        if (checkTestId.rows.length === 0) {
            console.log("   - Adding test_id to exam_test_cases...");
            // Add as SERIAL first
            await pool.query(`ALTER TABLE exam_test_cases ADD COLUMN test_id SERIAL;`);

            // Now check if there's an existing PK
            const pkCheck = await pool.query(`
                SELECT count(*) FROM pg_index i
                JOIN pg_class c ON c.oid = i.indrelid
                WHERE c.relname = 'exam_test_cases' AND i.indisprimary;
            `);

            if (parseInt(pkCheck.rows[0].count) === 0) {
                console.log("   - No PK found, making test_id the primary key...");
                await pool.query(`ALTER TABLE exam_test_cases ADD PRIMARY KEY (test_id);`);
            }
        }


        await pool.query(`
            CREATE TABLE IF NOT EXISTS exam_attempts (
                exam_id UUID REFERENCES exams(exam_id) ON DELETE CASCADE,
                student_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
                status VARCHAR(50) DEFAULT 'in_progress', -- in_progress, submitted, graded
                start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                end_time TIMESTAMP,
                submitted_at TIMESTAMP,
                disconnected_at TIMESTAMP,
                PRIMARY KEY (exam_id, student_id)
            );
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS exam_answers (
                answer_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                exam_id UUID REFERENCES exams(exam_id) ON DELETE CASCADE,
                question_id UUID REFERENCES exam_questions(question_id) ON DELETE CASCADE,
                student_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
                selected_option_id UUID REFERENCES exam_mcq_options(option_id),
                answer_text TEXT,
                marks_obtained INT DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT unique_answer_per_question UNIQUE (exam_id, question_id, student_id)
            );
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS exam_results (
                exam_id UUID REFERENCES exams(exam_id) ON DELETE CASCADE,
                student_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
                total_marks INT NOT NULL,
                obtained_marks INT NOT NULL,
                percentage FLOAT NOT NULL,
                passed BOOLEAN DEFAULT FALSE,
                evaluated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (exam_id, student_id)
            );
        `);

        // 4. Practice Challenges
        console.log("   - Setting up Practice Challenges...");
        await pool.query(`
            CREATE TABLE IF NOT EXISTS practice_challenges (
                challenge_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                description TEXT NOT NULL,
                type VARCHAR(50) DEFAULT 'code',
                difficulty VARCHAR(50) CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
                starter_code TEXT,
                test_cases JSONB,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // 5. Course Comments
        console.log("   - Setting up Course Comments...");
        await pool.query(`
            CREATE TABLE IF NOT EXISTS course_comments (
                comment_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                course_id UUID REFERENCES courses(courses_id) ON DELETE CASCADE,
                user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
                comment_text TEXT NOT NULL,
                parent_comment_id UUID REFERENCES course_comments(comment_id) ON DELETE CASCADE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Legacy schema compatibility: normalize older column names if they exist
        await pool.query(`
            DO $$
            BEGIN
                IF EXISTS (
                    SELECT 1
                    FROM information_schema.columns
                    WHERE table_name = 'course_comments' AND column_name = 'id'
                ) THEN
                    ALTER TABLE course_comments RENAME COLUMN id TO comment_id;
                END IF;

                IF EXISTS (
                    SELECT 1
                    FROM information_schema.columns
                    WHERE table_name = 'course_comments' AND column_name = 'text'
                ) THEN
                    ALTER TABLE course_comments RENAME COLUMN text TO comment_text;
                END IF;

                IF EXISTS (
                    SELECT 1
                    FROM information_schema.columns
                    WHERE table_name = 'course_comments' AND column_name = 'parent_id'
                ) THEN
                    ALTER TABLE course_comments RENAME COLUMN parent_id TO parent_comment_id;
                END IF;
            END $$;
        `);

        // Helpful indexes for comments reads
        await pool.query(`
            CREATE INDEX IF NOT EXISTS idx_course_comments_course_created
            ON course_comments(course_id, created_at DESC);
        `);
        await pool.query(`
            CREATE INDEX IF NOT EXISTS idx_course_comments_parent
            ON course_comments(parent_comment_id);
        `);

        console.log("   - Setting up Comment Votes...");
        await pool.query(`
            CREATE TABLE IF NOT EXISTS comment_votes (
                vote_id SERIAL PRIMARY KEY,
                comment_id UUID REFERENCES course_comments(comment_id) ON DELETE CASCADE,
                user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
                vote_type INTEGER NOT NULL, -- 1 for upvote, -1 for downvote
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(comment_id, user_id)
            );
        `);

        // Ensure expected vote_type semantics and fast lookups
        await pool.query(`
            ALTER TABLE comment_votes
            ADD CONSTRAINT comment_votes_vote_type_check
            CHECK (vote_type IN (-1, 1)) NOT VALID;
        `).catch(() => {});
        await pool.query(`
            ALTER TABLE comment_votes
            VALIDATE CONSTRAINT comment_votes_vote_type_check;
        `).catch(() => {});
        await pool.query(`
            CREATE INDEX IF NOT EXISTS idx_comment_votes_comment
            ON comment_votes(comment_id);
        `);

        // 6. Notifications
        console.log("   - Setting up Notifications...");
        await pool.query(`
            CREATE TABLE IF NOT EXISTS notifications (
                id SERIAL PRIMARY KEY,
                user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
                message TEXT NOT NULL,
                link TEXT,
                is_read BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // 7. Certificates
        console.log("   - Setting up Certificates...");
        await pool.query(`
            CREATE TABLE IF NOT EXISTS certificates (
                id SERIAL PRIMARY KEY,
                user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
                exam_id UUID REFERENCES exams(exam_id) ON DELETE CASCADE,
                exam_name VARCHAR(255),
                score INT,
                certificate_id VARCHAR(255),
                issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(user_id, exam_id)
            );
        `);

        console.log("✅ Database tables verified and initialized successfully!");
    } catch (err) {
        console.error("❌ Database Initialization Error:", err);
        // We don't exit process here to allow the app to try starting anyway,
        // but critical features might fail.
    }
};