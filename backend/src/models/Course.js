import mongoose  from "mongoose";

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Course title is required'],
    unique: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true
  },
  thumbnail: {
    type: String,
    trim: true,
    default: 'default-course.png'
  },
  capstoneProjectTitle: {
    type: String,
    required: [true, 'Capstone project title is required'],
    trim: true
  },
  capstoneProjectDescription: {
    type: String,
    required: [true, 'Capstone project description is required'],
    trim: true
  },
  isPublished: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

export default mongoose.model('Course', courseSchema);