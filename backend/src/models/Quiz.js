import mongoose  from "mongoose";


const quizSchema = new mongoose.Schema({
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  question: {
    type: String,
    required: true,
    trim: true
  },
  options: [{
    type: String,
    required: true,
    trim: true
  }],
  correctOptionIndex: {
    type: Number,
    required: true,
    min: 0,
    max: 3
  }
}, { timestamps: true });

export default mongoose.model('Quiz', quizSchema);