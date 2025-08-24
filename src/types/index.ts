export interface ConditionalLogic {
  dependsOn: string; // Question ID that this question depends on
  showWhen: string | string[]; // Answer value(s) that trigger this question to show
  operator?: 'equals' | 'contains' | 'not_equals'; // How to compare the answer
}

export interface Question {
  id: string;
  type: 'multiple-choice' | 'short-answer' | 'long-answer' | 'audio' | 'file-upload' | 'date-time' | 'likert-scale';
  question: string;
  options?: string[];
  required?: boolean;
  conditionalLogic?: ConditionalLogic;
  // Audio recording settings
  audioSettings?: {
    canReRecord?: boolean;
    maxDurationMinutes?: number;
  };
  // File upload settings
  fileSettings?: {
    allowedExtensions?: string[];
    maxFileSizeMB?: number;
  };
  // Date-time settings
  dateTimeSettings?: {
    includeDate?: boolean;
    includeTime?: boolean;
    minDate?: string;
    maxDate?: string;
  };
  // Multiple choice settings
  multipleChoiceSettings?: {
    allowMultipleAnswers?: boolean;
    randomizeOrder?: boolean;
  };
  // Likert scale settings
  likertSettings?: {
    scaleType?: 'agreement' | 'satisfaction' | 'frequency' | 'importance' | 'quality' | 'likelihood' | 'custom';
    scaleSize?: 3 | 4 | 5 | 7 | 10;
    leftLabel?: string;
    rightLabel?: string;
    centerLabel?: string;
    customLabels?: string[];
    showNumbers?: boolean;
    showNeutral?: boolean;
  };
}

export interface Section {
  id: string;
  title: string;
  description?: string;
  questions: Question[];
  order: number;
}

export interface Survey {
  _id: string;
  title: string;
  description: string;
  sections: Section[];
  // Keep questions for backward compatibility
  questions?: Question[];
  shareableId: string;
  createdBy?: string;
  createdByType?: 'admin' | 'user';
  scheduledDate?: Date;
  expirationDate?: Date;
  isActive?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Answer {
  questionId: string;
  answer: string;
  audioPath?: string;
  filePath?: string;
}

export interface Response {
  _id: string;
  surveyId: string;
  answers: Answer[];
  respondentId: string; // Anonymous UUID
  sessionSteps?: Array<{
    questionId: string;
    action: 'viewed' | 'answered' | 'skipped' | 'abandoned';
    timestamp: Date;
    answer?: string;
  }>;
  submittedAt: Date;
}

export interface Admin {
  _id: string;
  username: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}