import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { IUser } from "../interfaces/user.interface.js";

const userSchema = new mongoose.Schema<IUser>(
  {
    id: {
      type: mongoose.Schema.Types.ObjectId,
    },

    name: {
      type: String,
      required: [true, "What do we call you?"],
    },
    email: {
      type: String,
      required: [true, "Provide email please."],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Provide password please"],
      minlength: 6,
      select: false,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    languagePreference: {
      type: String,
      default: "en",
    },
    verified: {
      type: Boolean,
      default: false,
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {
      type: Boolean,
      default: true,
      select: false,
    },
  },
  { timestamps: true }
);

//encrypt password here
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 12);
  next();
});

//when password is modified, update passwordChangedAt
userSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) return next();

  this.passwordChangedAt = new Date(Date.now() - 1000);
  next();
});

//instance method that should check password
userSchema.methods.correctPassword = async function (
  candidatePassword: string,
  userPassword: string
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

//here creates password reset token
userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000); //reset should expire in 10 minutes

  return resetToken;
};

const User = mongoose.model<IUser>("User", userSchema);
export default User;
