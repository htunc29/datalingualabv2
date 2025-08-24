import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  _id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  organization: string;
  researchArea: string;
  purpose: string;
  isEmailVerified: boolean;
  emailVerificationCode?: string;
  emailVerificationExpires?: Date;
  isApproved: boolean;
  isActive: boolean;
  approvedBy?: string;
  approvedAt?: Date;
  isBanned: boolean;
  banReason?: string;
  banDuration?: number; // Duration in days, null for permanent ban
  bannedAt?: Date;
  bannedBy?: string;
  banExpiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  organization: { type: String, required: true },
  researchArea: { type: String, required: true },
  purpose: { type: String, required: true },
  isEmailVerified: { type: Boolean, default: false },
  emailVerificationCode: { type: String },
  emailVerificationExpires: { type: Date },
  isApproved: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  approvedBy: { type: String },
  approvedAt: { type: Date },
  isBanned: { type: Boolean, default: false },
  banReason: { type: String },
  banDuration: { type: Number }, // Duration in days, null for permanent ban
  bannedAt: { type: Date },
  bannedBy: { type: String },
  banExpiresAt: { type: Date },
}, {
  timestamps: true
});

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);