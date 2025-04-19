import Language from "../model/language.model.js";
class LanguageService {
    async createLanguage(languageData) {
        const language = new Language(languageData);
        return language.save();
    }
    async getlanguages() {
        return Language.find({ isActive: true });
    }
    async updateLanguage(code, updateData) {
        return Language.findByIdAndUpdate({ code }, updateData, { new: true });
    }
    async getNigerianLanguages() {
        //define the language codes
        const nigerianLanguages = ["ig", "yo", "ha"];
        return Language.find({ code: { $in: nigerianLanguages }, isActive: true });
    }
}
export default new LanguageService();
