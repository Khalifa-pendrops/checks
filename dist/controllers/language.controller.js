import LanguageService from "../services/language.service.js";
import { asyncHandler } from "../utils/apiFeatures.js";
import languageService from "../services/language.service.js";
class LanguageController {
    constructor() {
        this.createLangauge = asyncHandler(async (req, res) => {
            try {
                const languageData = req.body;
                const language = await LanguageService.createLanguage(languageData);
                res.status(201).json({
                    status: "Success",
                    data: language,
                });
            }
            catch (err) {
                res.status(500).json({
                    status: "Failed",
                    message: "Failed to create languages:",
                    err,
                });
            }
        });
        this.getLanguage = asyncHandler(async (req, res) => {
            try {
                const languages = await LanguageService.getlanguages();
                if (!languages) {
                    res.status(404).json({
                        message: "No language found! ❌",
                    });
                }
                res.status(200).json({
                    status: "Successful",
                    data: languages,
                });
            }
            catch (err) {
                res.status(500).json({
                    status: "Failed",
                    message: "Failed to fetch languages:",
                    err,
                });
            }
        });
        this.getNigerianLanguages = asyncHandler(async (req, res) => {
            try {
                const languages = await languageService.getNigerianLanguages();
                if (!languages) {
                    res.status(404).json({
                        message: "Sorry no languages found ❌",
                    });
                }
                res.status(200).json({
                    status: "Successful",
                    data: languages,
                });
            }
            catch (err) {
                res.status(500).json({
                    status: "Failed",
                    message: "Failed to fetch Nigerian languages",
                });
            }
        });
        this.updateLanguage = asyncHandler(async (req, res) => {
            try {
                const code = req.params.code;
                const updateData = req.body;
                const language = await LanguageService.updateLanguage(code, updateData);
                if (!language) {
                    res.status(404).json({
                        message: "Sorry no languages found ❌",
                    });
                }
                res.status(200).json({
                    status: "Success",
                    data: language,
                });
            }
            catch (err) {
                res.status(500).json({
                    message: "Failed to update language",
                });
            }
        });
    }
}
export default new LanguageController();
