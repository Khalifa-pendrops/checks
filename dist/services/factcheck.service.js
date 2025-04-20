import axios from "axios";
import config from "../config/index.config.js";
class FactCheckService {
    constructor() {
        this.apiKey = config.google_factcheck_api_key;
        this.apiUrl = config.google_factcheck_url;
    }
    async checkClaim(claimData) {
        try {
            const params = {
                key: this.apiKey,
                query: claimData.content,
                languageCode: claimData.language || "en",
            };
            console.log("📡 Making API call to Fact Check API...");
            const response = await axios.get(this.apiUrl, { params });
            console.log("Full API Response:", response.data);
            console.log("✅ API call successful and logged to the console");
            const rawClaims = response.data?.claims || [];
            // const rawClaims: IRawClaim[] = response.data;
            console.log("🔍 Raw API response:", JSON.stringify(rawClaims, null, 2));
            if (rawClaims.length === 0) {
                console.warn("⚠️ No claims found in API response");
                return {
                    rawClaims: [],
                    claimReview: [],
                    accuracy: 0,
                    verdict: "unverified",
                    sources: [],
                    rawApiResponse: {
                        claims: [],
                    },
                };
            }
            const claimsWithReviews = rawClaims.filter((claim) => Array.isArray(claim.claimReview) && claim.claimReview.length > 0);
            console.log(`📊 Found ${claimsWithReviews.length} claims with reviews`);
            const claimReviews = claimsWithReviews.flatMap((claim) => (claim.claimReview || []).map((review) => ({
                publisher: review.publisher?.name || "Unknown",
                url: review.url || "Unavailable",
                date: review.reviewDate || "N/A",
                rating: review.textualRating || "Unrated",
                text: review.title || "No title provided",
            })));
            const sources = claimsWithReviews.map((claim) => ({
                publisher: {
                    name: claim.claimReview?.[0]?.publisher?.name || "Unknown",
                    site: claim.claimReview?.[0]?.publisher?.site || "",
                },
                url: claim.claimReview?.[0]?.url || "",
                reviewDate: claim.claimReview?.[0]?.reviewDate || "",
            }));
            return {
                claimReview: claimReviews,
                accuracy: this.calculateAccuracy(claimsWithReviews),
                verdict: this.determineVerdict(claimsWithReviews),
                sources,
                rawApiResponse: response.data,
                rawClaims: claimsWithReviews,
            };
        }
        catch (error) {
            console.error("❌ FactCheck API Error:", error);
            return {
                rawClaims: [],
                claimReview: [],
                accuracy: 0,
                verdict: "unverified",
                sources: [],
                rawApiResponse: {
                    claims: [],
                },
            };
        }
    }
    calculateAccuracy(claims) {
        if (!claims || claims.length === 0)
            return 0;
        const validClaims = claims.filter((claim) => claim.claimReview?.[0]?.reviewRating?.ratingValue !== undefined);
        if (validClaims.length === 0)
            return 0;
        const total = validClaims.reduce((sum, claim) => {
            const rating = claim.claimReview?.[0]?.reviewRating?.ratingValue;
            return sum + (rating || 0);
        }, 0);
        return total / validClaims.length;
    }
    determineVerdict(claims) {
        if (!claims || claims.length === 0)
            return "unknown";
        const allowedVerdicts = [
            "true",
            "mostly-true",
            "half-true",
            "mostly-false",
            "false",
            "pants-fire",
            "unknown",
            "unverified",
        ];
        // Get all valid verdicts from claims
        const verdicts = claims
            .flatMap((claim) => claim.claimReview?.map((review) => this.normalizeVerdict(review.textualRating || "unknown")) || [])
            .filter((v) => allowedVerdicts.includes(v));
        if (verdicts.length === 0)
            return "unknown";
        // Count verdict occurrences
        const verdictCounts = verdicts.reduce((counts, verdict) => {
            counts[verdict] = (counts[verdict] || 0) + 1;
            return counts;
        }, {});
        // Return the most common verdict
        const [mostCommonVerdict] = Object.entries(verdictCounts)
            .sort((a, b) => b[1] - a[1])
            .map(([verdict]) => verdict);
        return mostCommonVerdict || "unknown";
    }
    normalizeVerdict(rawVerdict) {
        const cleanVerdict = rawVerdict.trim().toLowerCase();
        if (cleanVerdict.includes("pants on fire"))
            return "pants-fire";
        if (cleanVerdict.includes("mostly true"))
            return "mostly-true";
        if (cleanVerdict.includes("half true"))
            return "half-true";
        if (cleanVerdict.includes("mostly false"))
            return "mostly-false";
        const verdictMap = {
            true: "true",
            false: "false",
            unverified: "unverified",
        };
        return verdictMap[cleanVerdict] || "unknown";
    }
}
export default new FactCheckService();
// //uncomment this part to add other claimTypes (url, images)
// import axios from "axios";
// import * as cheerio from "cheerio";
// import Tesseract from "tesseract.js";
// import config from "../config/index.config.js";
// import {
//   IClaimInput,
//   IFactCheckResult,
//   IVerdictSource,
//   IClaim,
//   IRawClaim,
// } from "../interfaces/claim.interface.js";
// import AppError from "../utils/appError.js";
// import { Verdict } from "../types/verdict.type.js";
// import { timeStamp } from "console";
// // interface IVerdictSource {
// //   name: string;
// //   url: string;
// //   rating: string;
// //   date: string;
// // }
// // interface IFactCheckResult {
// //   verdict: string;
// //   confidence: number;
// //   sources: IVerdictSource[];
// //   metadata?: {
// //     extractedText?: string;
// //     similarClaims?: any[];
// //   };
// // }
// class FactCheckService {
//   private googleApiKey: string;
//   private googleApiUrl: string;
//   constructor() {
//     this.googleApiKey = config.google_factcheck_api_key as string;
//     this.googleApiUrl = config.google_factcheck_url as string;
//   }
//   async checkClaim(claimData: IClaimInput): Promise<IFactCheckResult> {
//     try {
//       let processedContent = claimData.content;
//       const metadata: any = {};
//       // Pre-process based on claim type
//       if (claimData.claimType === "url") {
//         const { text, finalUrl, title } = await this.processUrlClaim(
//           claimData.content
//         );
//         processedContent = text;
//         metadata.urlAnalysis = {
//           finalUrl,
//           title,
//           excerpt: text.substring(0, 200),
//         };
//       } else if (claimData.claimType === "image") {
//         const { text, confidence } = await this.processImageClaim(
//           claimData.content
//         );
//         processedContent = text;
//         metadata.imageAnalysis = {
//           ocrText: text,
//           ocrConfidence: confidence,
//         };
//       }
//       // Check all fact-check sources
//       const [googleResults, africaCheckResults, localResults] =
//         await Promise.all([
//           this.checkGoogleFactCheck(processedContent, claimData.language),
//           this.checkAfricaCheck(processedContent, "NG"),
//           this.scrapeLocalFactCheckers(processedContent),
//         ]);
//       return this.consolidateResults(
//         {
//           google: googleResults,
//           africaCheck: africaCheckResults,
//           local: localResults,
//         },
//         metadata
//       );
//     } catch (error) {
//       console.error(`FactCheck Error (${claimData.claimType}):`, error);
//       throw new AppError(`Failed to verify ${claimData.claimType} claim`, 500);
//     }
//   }
//   private async processUrlClaim(
//     url: string
//   ): Promise<{ text: string; finalUrl: string; title: string }> {
//     try {
//       // Follow redirects and get final URL
//       const response = await axios.get(url, {
//         maxRedirects: 5,
//         timeout: 5000,
//         validateStatus: null,
//       });
//       const finalUrl = response.request.res.responseUrl || url;
//       const $ = cheerio.load(response.data);
//       // Clean and extract text
//       $("script, style, iframe, nav, footer").remove();
//       const title = $("title").text().trim();
//       const text = $("body").text().replace(/\s+/g, " ").substring(0, 10000);
//       return { text, finalUrl, title };
//     } catch (error) {
//       console.error("URL Processing Error:", error);
//       throw new AppError("Failed to process URL content", 400);
//     }
//   }
//   private async processImageClaim(
//     imageUrl: string
//   ): Promise<{ text: string; confidence: number }> {
//     try {
//       const {
//         data: { text, confidence },
//       } = await Tesseract.recognize(imageUrl, "eng", {
//         logger: (m) => console.log(m.status),
//       });
//       return {
//         text: text.substring(0, 2000), // Limit OCR text
//         confidence: Math.round(confidence),
//       };
//     } catch (error) {
//       console.error("Image Processing Error:", error);
//       return { text: "", confidence: 0 };
//     }
//   }
//   // Google FactCheck Tools
//   private async checkGoogleFactCheck(text: string, language: string = "en") {
//     const params = {
//       key: this.googleApiKey,
//       query: text,
//       languageCode: language,
//     };
//     const response = await axios.get(this.googleApiUrl, { params });
//     return response.data?.claims || [];
//   }
//   // Africa Check API
//   private async checkAfricaCheck(text: string, country: string = "NG") {
//     try {
//       const response = await axios.get(
//         "https://africacheck.org/api/v1/fact-checks",
//         {
//           params: {
//             search: text,
//             country,
//             limit: 5,
//           },
//           timeout: 5000,
//         }
//       );
//       return response.data?.results || [];
//     } catch (error) {
//       console.error("Africa Check API Error:", error);
//       return [];
//     }
//   }
//   // Local Nigerian Fact-Checkers Scraping
//   private async scrapeLocalFactCheckers(text: string) {
//     try {
//       const [dubawaResults, factCheckHubResults] = await Promise.all([
//         this.scrapeDubawa(text),
//         this.scrapeFactCheckHub(text),
//       ]);
//       return [...dubawaResults, ...factCheckHubResults];
//     } catch (error) {
//       console.error("Scraping Error:", error);
//       return [];
//     }
//   }
//   private async scrapeDubawa(query: string) {
//     const { data } = await axios.get("https://dubawa.org/", {
//       params: { s: query },
//       headers: {
//         "User-Agent": "Mozilla/5.0",
//       },
//     });
//     const $ = cheerio.load(data);
//     const results: IVerdictSource[] = [];
//     $(".fact-check-item").each((_, el) => {
//       results.push({
//         name: "Dubawa",
//         url: $(el).find("a").attr("href") || "",
//         rating: $(el).find(".verdict").text().trim(),
//         date: $(el).find(".date").text().trim(),
//       });
//     });
//     return results;
//   }
//   private async scrapeFactCheckHub(query: string) {
//     const { data } = await axios.get("https://factcheckhub.com/", {
//       params: { s: query },
//       headers: {
//         "User-Agent": "Mozilla/5.0",
//       },
//     });
//     const $ = cheerio.load(data);
//     const results: IVerdictSource[] = [];
//     $(".post-item").each((_, el) => {
//       results.push({
//         name: "FactCheckHub",
//         url: $(el).find("a").attr("href") || "",
//         rating: $(el).find(".verdict").text().trim(),
//         date: $(el).find(".post-date").text().trim(),
//       });
//     });
//     return results;
//   }
//   private consolidateResults(
//     results: {
//       google: any[];
//       africaCheck: any[];
//       local: IVerdictSource[];
//     },
//     metadata: any
//   ): IFactCheckResult {
//     const allSources = [
//       ...this.formatGoogleResults(results.google),
//       ...this.formatAfricaCheckResults(results.africaCheck),
//       ...results.local,
//     ].filter((source) => source.url);
//     return {
//       verdict: this.determineCompositeVerdict(allSources),
//       confidence: this.calculateConfidence(allSources),
//       sources: allSources.slice(0, 5),
//       metadata: {
//         ...metadata,
//         similarClaims: allSources
//           .filter((s) => s.origin !== "google")
//           .slice(0, 3),
//       },
//     };
//   }
//   private determineCompositeVerdict(sources: IVerdictSource[]): string {
//     const verdictCount: Record<string, number> = {};
//     sources.forEach((source) => {
//       const rating = source.rating.toLowerCase();
//       if (rating.includes("false"))
//         verdictCount.false = (verdictCount.false || 0) + 1;
//       else if (rating.includes("true"))
//         verdictCount.true = (verdictCount.true || 0) + 1;
//       else verdictCount.unknown = (verdictCount.unknown || 0) + 1;
//     });
//     if (verdictCount.false > verdictCount.true) return "false";
//     if (verdictCount.true > verdictCount.false) return "true";
//     return "unverified";
//   }
//   private calculateConfidence(sources: IVerdictSource[]): number {
//     if (sources.length === 0) return 0;
//     const total = sources.reduce((sum, source) => {
//       if (source.rating.includes("false")) return sum + 0;
//       if (source.rating.includes("true")) return sum + 100;
//       return sum + 50;
//     }, 0);
//     return Math.round(total / sources.length);
//   }
// }
// export default new FactCheckService();
