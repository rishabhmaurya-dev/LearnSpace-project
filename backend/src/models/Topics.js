import mongoose  from "mongoose";


const topicSchema = new mongoose.Schema({
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Topic title is required'],
    trim: true
  },
  orderIndex: { // Position in dropdown (1, 2, 3...)
    type: Number,
    required: true,
    min: 1
  },
  videoUrl: {
    type: String,
    required: [true, 'Video URL is required'],
    trim: true
  },
  notesUrl: { // PDF / Markdown file link
    type: String,
    required: [true, 'Notes URL is required'],
    trim: true
  },
  monacoChallenge: {
    problemStatement: { type: String, trim: true },
    starterCode: { type: String },
    expectedOutput: { type: String }
  }
}, { timestamps: true });

// A course cannot have two topics with the same order index
topicSchema.index({ course: 1, orderIndex: 1 }, { unique: true });

export default mongoose.model('Topic', topicSchema);