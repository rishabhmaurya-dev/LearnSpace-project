import csvParser from "csv-parser";
import matter from "gray-matter";
import { Stream } from "stream";
import { Course } from "../models/Course.model.js";
import { Lesson } from "../models/Lesson.model.js";

// Helper: CSV Buffer parsing for Quiz Questions
const parseCsvQuiz = (buffer) => {
  return new Promise((resolve, reject) => {
    const results = [];
    const stream = Stream.Readable.from(buffer);

    stream
      .pipe(csvParser())
      .on("data", (data) => {
        results.push({
          question: data.question?.trim(),
          options: [
            data.option_0?.trim() || data.option1?.trim(),
            data.option_1?.trim() || data.option2?.trim(),
            data.option_2?.trim() || data.option3?.trim(),
            data.option_3?.trim() || data.option4?.trim(),
          ],
          correctOptionIndex: Number(data.correctOptionIndex),
        });
      })
      .on("end", () => resolve(results))
      .on("error", (err) => reject(err));
  });
};

export const createFullCourse = async (req, res) => {
  try {
    // 1. Text Data Parsing from req.body
    const {
      title,
      category,
      description,
      thumbnailUrl,
      skillBadgeName,
      skillBadgeIcon,
      passingPercentage,
      quizTimeLimitMinutes,
      isPublished,
      capstoneTitle,
      capstoneDescription,
      submissionRequirements,
    } = req.body;

    // 2. Parse CSV Quiz Questions
    let quizQuestions = [];
    if (req.files?.quizCsv) {
      quizQuestions = await parseCsvQuiz(req.files.quizCsv[0].buffer);
    }

    // 3. Save Course to DB (Matching Course Schema)
    const newCourse = await Course.create({
      title,
      category,
      description,
      thumbnailUrl: thumbnailUrl || "https://placeholder.com/thumb.jpg",
      skillBadgeName,
      skillBadgeIcon: skillBadgeIcon || "",
      quiz: quizQuestions, // Embedded quizQuestionSchema validation (10 to 100)
      passingPercentage: Number(passingPercentage) || 70,
      quizTimeLimitMinutes: Number(quizTimeLimitMinutes) || 45,
      capstoneProject: {
        title: capstoneTitle,
        description: capstoneDescription,
        submissionRequirements:
          submissionRequirements ||
          "Submit GitHub Repository URL & Live Demo Link",
      },
      isPublished: isPublished === "true" || isPublished === true,
    });

    // 4. Parse .md Files & Save Lessons to DB (Matching Lesson Schema)
    const savedLessons = [];

    if (req.files?.markdownFiles) {
      const files = req.files.markdownFiles;

      // Filenames sort kar lete hain taaki sequence order sahi rhe (01-xyz.md, 02-abc.md)
      files.sort((a, b) => a.originalname.localeCompare(b.originalname));

      for (let index = 0; index < files.length; index++) {
        const fileContent = files[index].buffer.toString("utf-8");
        const { data, content } = matter(fileContent);

        // Required schema validation check for each lesson
        const lessonDoc = await Lesson.create({
          courseId: newCourse._id, // References the newly created course
          lessonNumber: Number(data.lessonNumber) || index + 1,
          title: data.title || `Lesson ${index + 1}`,
          topicHeading: data.topicHeading || "General Topic",
          definition: data.definition || "Definition placeholder",
          detailedMeaning: content, // Pure markdown theory
          codeExample: data.codeExample || "// Code snippet",
          codeExampleExplanation:
            data.codeExampleExplanation || "Code explanation",
          videoUrl: data.videoUrl || "",
          notesPdfUrl: data.notesPdfUrl || "",
        });

        savedLessons.push(lessonDoc);
      }
    }

    return res.status(201).json({
      success: true,
      message: "🎉 Course, Quiz & Markdown Lessons saved according to schema!",
      data: {
        course: newCourse,
        lessonsCount: savedLessons.length,
      },
    });
  } catch (error) {
    console.error("❌ DB Saving Error:", error);

    // Mongoose Validation Error Handling
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Schema Validation Failed",
        errors: error.errors,
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};
