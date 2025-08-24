import mongoose, { Schema, Document } from 'mongoose';

export interface ISurveySession extends Document {
  surveyId: string;
  respondentId: string; // Anonymous UUID
  startTime: Date;
  lastActivity: Date;
  currentQuestionIndex: number;
  isCompleted: boolean;
  isAbandoned: boolean;
  steps: Array<{
    questionId: string;
    questionIndex: number;
    action: 'viewed' | 'answered' | 'skipped' | 'abandoned' | 'section_completed';
    timestamp: Date;
    timeSpent: number; // seconds on this question
    answer?: string;
  }>;
  browserInfo?: {
    userAgent: string;
    language: string;
    timezone: string;
  };
}

const SurveySessionSchema = new Schema<ISurveySession>({
  surveyId: { type: String, required: true },
  respondentId: { type: String, required: true },
  startTime: { type: Date, required: true },
  lastActivity: { type: Date, required: true },
  currentQuestionIndex: { type: Number, default: 0 },
  isCompleted: { type: Boolean, default: false },
  isAbandoned: { type: Boolean, default: false },
  steps: [{
    questionId: { type: String, required: true },
    questionIndex: { type: Number, required: true },
    action: { 
      type: String, 
      enum: ['viewed', 'answered', 'skipped', 'abandoned', 'completed', 'section_completed'], 
      required: true 
    },
    timestamp: { type: Date, default: Date.now },
    timeSpent: { type: Number, default: 0 },
    answer: String
  }],
  browserInfo: {
    userAgent: String,
    language: String,
    timezone: String
  }
}, {
  timestamps: true
});

// Index for efficient querying
SurveySessionSchema.index({ surveyId: 1, respondentId: 1 });
SurveySessionSchema.index({ surveyId: 1, isAbandoned: 1 });
SurveySessionSchema.index({ lastActivity: 1 }); // For cleanup of old sessions

export default mongoose.models.SurveySession || mongoose.model<ISurveySession>('SurveySession', SurveySessionSchema);