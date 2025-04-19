import { Document } from "mongoose";

export interface ILanguage extends Document {
  code: string;
  name: string;
  nativeName?: string;
  isActive?: boolean;
}

export interface ILanguageInput {
  code: string;
  name: string;
  nativeName?: string;
  isActive?: boolean;
}
