import mongoose  from "mongoose";


const studentProgressSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  completedTopics: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Topic'
  }],
  progressPercentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  quizScore: {
    type: Number,
    default: 0
  },
  isQuizPassed: {
    type: Boolean,
    default: false
  },
  capstoneSubmissionUrl: {
    type: String,
    trim: true
  },
  isCourseCompleted: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

studentProgressSchema.index({ student: 1, course: 1 }, { unique: true });

export default mongoose.model('StudentProgress', studentProgressSchema);