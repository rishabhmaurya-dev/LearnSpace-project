import fs from "fs";
import path from "path";
import matter from "gray-matter";
import csvParser from "csv-parser";
import mongoose from "mongoose";
import dotenv from "dotenv";

// Models Imports (src/models/ ke according)
import { Course } from "../models/Course.model.js";
import { Lesson } from "../models/Lesson.model.js";

// .env root folder (`backend/.env`) se read karne ke liye
dotenv.config({ path: path.join(process.cwd(), ".env") });

/**
 * Helper function: CSV file parse karke Quiz Array convert karta hai
 */
const parseCSVQuiz = (filePath) => {
  return new Promise((resolve, reject) => {
    const results = [];
    if (!fs.existsSync(filePath)) return resolve([]);

    fs.createReadStream(filePath)
      .pipe(csvParser())
      .on("data", (data) => {
        results.push({
          question: data.question ? data.question.trim() : "",
          options: [
            data.option_0 ? data.option_0.trim() : "",
            data.option_1 ? data.option_1.trim() : "",
            data.option_2 ? data.option_2.trim() : "",
            data.option_3 ? data.option_3.trim() : "",
          ],
          correctOptionIndex: parseInt(data.correctOptionIndex, 10),
        });
      })
      .on("end", () => resolve(results))
      .on("error", (error) => reject(error));
  });
};

/**
 * Main Multi-Course Seeding Engine
 */
const seedAllCourses = async () => {
  try {
    // 1. Database Connect
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB Connected for Seeding");

    // 2. Locate `src/courses` Directory
    const coursesRootDir = path.join(process.cwd(), "src", "courses");

    if (!fs.existsSync(coursesRootDir)) {
      console.error("❌ Error: 'src/courses' folder exist nahi karta!");
      process.exit(1);
    }

    // 3. Read All Course Sub-Folders (e.g., react-mastery, node-express-pro, etc.)
    const courseFolders = fs
      .readdirSync(coursesRootDir, { withFileTypes: true })
      .filter((dir) => dir.isDirectory())
      .map((dir) => dir.name);

    if (courseFolders.length === 0) {
      console.log("⚠️ 'src/courses' ke andar koi course folders nahi mile.");
      process.exit(0);
    }

    console.log(
      `\n🚀 Found ${courseFolders.length} course folder(s). Seeding started...\n`,
    );

    // 4. Loop through each Course Folder
    for (const folderName of courseFolders) {
      const courseDir = path.join(coursesRootDir, folderName);
      console.log(`==================================================`);
      console.log(`📦 Processing Course Directory: [${folderName}]`);

      // A. Read course.json
      const courseJsonPath = path.join(courseDir, "course.json");
      if (!fs.existsSync(courseJsonPath)) {
        console.log(`⚠️ Skipped: 'course.json' missing in ${folderName}`);
        continue;
      }
      const courseMeta = JSON.parse(fs.readFileSync(courseJsonPath, "utf-8"));

      // B. Read quiz.csv
      const quizPath = path.join(courseDir, "quiz.csv");
      const quizQuestions = await parseCSVQuiz(quizPath);

      // C. Upsert Course in Database (Title basis par update / insert)
      const course = await Course.findOneAndUpdate(
        { title: courseMeta.title },
        { ...courseMeta, quiz: quizQuestions, isPublished: true },
        { upsert: true, new: true },
      );

      console.log(
        `✅ Course Document Saved: "${course.title}" (${quizQuestions.length} MCQs)`,
      );

      // D. Read Lessons from `lessons/` sub-folder
      const lessonsDir = path.join(courseDir, "lessons");
      if (fs.existsSync(lessonsDir)) {
        const lessonFiles = fs.readdirSync(lessonsDir).sort(); // Sort by filename

        for (const file of lessonFiles) {
          if (file.endsWith(".md")) {
            const filePath = path.join(lessonsDir, file);
            const fileContent = fs.readFileSync(filePath, "utf-8");

            // Frontmatter metadata (data) and Markdown body (content) parse karein
            const { data, content } = matter(fileContent);

            await Lesson.findOneAndUpdate(
              { courseId: course._id, lessonNumber: data.lessonNumber },
              {
                courseId: course._id,
                lessonNumber: data.lessonNumber,
                title: data.title,
                topicHeading: data.topicHeading,
                definition: data.definition,
                detailedMeaning: content, // Pure markdown text goes here
                codeExample: data.codeExample,
                codeExampleExplanation: data.codeExampleExplanation,
                videoUrl: data.videoUrl || "",
                notesPdfUrl: data.notesPdfUrl || "",
              },
              { upsert: true, new: true },
            );

            console.log(
              `   └─ Saved Lesson ${data.lessonNumber}: ${data.title}`,
            );
          }
        }
      } else {
        console.log(`   ⚠️ No 'lessons' folder found in ${folderName}`);
      }
    }

    console.log(`==================================================`);
    console.log("\n🎉 ALL Courses, MCQs & Lessons Seeded Successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding Error:", error.message);
    process.exit(1);
  }
};

seedAllCourses();
