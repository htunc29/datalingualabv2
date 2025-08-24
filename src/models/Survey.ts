import mongoose, { Schema, Document } from 'mongoose';
import { Survey as ISurvey, Question, Section } from '@/types';

const QuestionSchema = new Schema<Question>({
  id: { type: String, required: true },
  type: { 
    type: String, 
    required: true,
    enum: ['multiple-choice', 'short-answer', 'long-answer', 'audio', 'file-upload', 'date-time', 'likert-scale']
  },
  question: { type: String, required: true },
  options: [{ type: String }],
  required: { type: Boolean, default: false },
  conditionalLogic: {
    dependsOn: { type: String },
    showWhen: { type: Schema.Types.Mixed }, // Can be string or array of strings
    operator: { type: String, enum: ['equals', 'contains', 'not_equals'], default: 'equals' }
  },
  audioSettings: {
    canReRecord: { type: Boolean, default: true },
    maxDurationMinutes: { type: Number, default: 5 }
  },
  fileSettings: {
    allowedExtensions: [{ type: String }],
    maxFileSizeMB: { type: Number, default: 10 }
  },
  dateTimeSettings: {
    includeDate: { type: Boolean, default: true },
    includeTime: { type: Boolean, default: true },
    minDate: { type: String },
    maxDate: { type: String }
  },
  multipleChoiceSettings: {
    allowMultipleAnswers: { type: Boolean, default: false },
    randomizeOrder: { type: Boolean, default: false }
  },
  likertSettings: {
    scaleType: { 
      type: String, 
      enum: ['agreement', 'satisfaction', 'frequency', 'importance', 'quality', 'likelihood', 'custom'],
      default: 'agreement'
    },
    scaleSize: { type: Number, enum: [3, 4, 5, 7, 10], default: 5 },
    leftLabel: { type: String },
    rightLabel: { type: String },
    centerLabel: { type: String },
    customLabels: [{ type: String }],
    showNumbers: { type: Boolean, default: true },
    showNeutral: { type: Boolean, default: true }
  }
});

const SectionSchema = new Schema<Section>({
  id: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String },
  questions: [QuestionSchema],
  order: { type: Number, required: true }
});

const SurveySchema = new Schema<ISurvey>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  sections: [SectionSchema],
  questions: [QuestionSchema], // Keep for backward compatibility
  shareableId: { type: String, required: true, unique: true },
  createdBy: { type: String }, // User ID who created the survey
  createdByType: { type: String, enum: ['admin', 'user'], default: 'admin' }, // Type of creator
  scheduledDate: { type: Date }, // Optional scheduled date for survey
  expirationDate: { type: Date }, // Optional expiration date for survey
  isActive: { type: Boolean, default: true } // Can be used to activate/deactivate surveys
}, {
  timestamps: true
});

// Clear any existing model to force schema refresh
if (mongoose.models.Survey) {
  delete mongoose.models.Survey;
}

export default mongoose.model<ISurvey>('Survey', SurveySchema);