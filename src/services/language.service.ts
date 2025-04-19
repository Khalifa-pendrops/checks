import { ILanguage, ILanguageInput } from "../interfaces/language.interface.js";
import Language from "../model/language.model.js";

class LanguageService {
  async createLanguage(languageData: ILanguageInput): Promise<ILanguage> {
    const language = new Language(languageData);

    return language.save();
  }

  async getlanguages(): Promise<ILanguage[]> {
    return Language.find({ isActive: true });
  }

  async updateLanguage(
    code: string,
    updateData: Partial<ILanguageInput>
  ): Promise<ILanguage | null> {
    return Language.findByIdAndUpdate({ code }, updateData, { new: true });
  }

  async getNigerianLanguages(): Promise<ILanguage[]> {
    //define the language codes
    const nigerianLanguages = ["ig", "yo", "ha"];
    return Language.find({ code: { $in: nigerianLanguages }, isActive: true });
  }
}

export default new LanguageService();
