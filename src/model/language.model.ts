import mongoose from "mongoose";
import { ILanguage } from "../interfaces/language.interface.js";

const languageSchema = new mongoose.Schema<ILanguage>({
  code: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  nativeName: { type: String },
  isActive: { type: Boolean, default: true },
});

export default mongoose.model<ILanguage>("Language", languageSchema);
