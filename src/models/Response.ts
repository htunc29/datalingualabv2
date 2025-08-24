import mongoose, { Schema } from 'mongoose';
import { Response as IResponse, Answer } from '@/types';

const AnswerSchema = new Schema<Answer>({
  questionId: { type: String, required: true },
  answer: { type: String, required: true },
  audioPath: { type: String },
  filePath: { type: String }
});

const ResponseSchema = new Schema<IResponse>({
  surveyId: { type: String, required: true },
  answers: [AnswerSchema],
  respondentId: { type: String, required: true }, // Anonymous UUID
  sessionSteps: [{ 
    questionId: String,
    action: String, // 'viewed', 'answered', 'skipped', 'abandoned'
    timestamp: { type: Date, default: Date.now },
    answer: String // Store partial answer if any
  }]
}, {
  timestamps: { createdAt: 'submittedAt', updatedAt: false }
});

export default mongoose.models.Response || mongoose.model<IResponse>('Response', ResponseSchema);