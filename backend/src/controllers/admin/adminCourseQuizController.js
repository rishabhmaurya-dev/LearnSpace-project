import mongoose from "mongoose";
import { Course } from "../../models/Course.model.js";
import { parse } from "csv-parse/sync";

const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

export const uploadFinalQuizCsv = async (req, res) => {
  try {
    const { courseId } = req.params;

    if (!isValidObjectId(courseId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid course ID",
      });
    }

    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    if (course.isPublished) {
      return res.status(400).json({
        success: false,
        message: "Published course cannot be modified",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "CSV file is required",
      });
    }

    const csvText = req.file.buffer.toString("utf-8");

    const records = parse(csvText, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      bom: true,
    });

    if (records.length < 10 || records.length > 50) {
      return res.status(400).json({
        success: false,
        message: "Final quiz must contain between 10 and 50 MCQs",
      });
    }

    const questions = [];

    for (let i = 0; i < records.length; i++) {
      const row = records[i];

      const correctOptionIndex = Number(row.correctOptionIndex);

      if (
        !row.question ||
        !row.optionA ||
        !row.optionB ||
        !row.optionC ||
        !row.optionD
      ) {
        return res.status(400).json({
          success: false,
          message: `Invalid question data at row ${i + 2}`,
        });
      }

      if (
        !Number.isInteger(correctOptionIndex) ||
        correctOptionIndex < 0 ||
        correctOptionIndex > 3
      ) {
        return res.status(400).json({
          success: false,
          message: `Invalid correct option at row ${i + 2}`,
        });
      }

      questions.push({
        question: row.question.trim(),

        options: [
          row.optionA.trim(),
          row.optionB.trim(),
          row.optionC.trim(),
          row.optionD.trim(),
        ],

        correctOptionIndex,
      });
    }

    course.quiz = questions;

    await course.save();

    return res.status(200).json({
      success: true,
      message: "Final course quiz uploaded successfully",
      count: questions.length,
    });
  } catch (error) {
    console.error("uploadFinalQuizCsv:", error);

    return res.status(400).json({
      success: false,
      message: "Failed to upload final quiz",
      error: error.message,
    });
  }
};
