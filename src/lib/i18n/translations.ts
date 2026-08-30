import { LanguageCode } from './config';

type TranslationDictionary = Record<string, string>;

export const translations: Record<LanguageCode, TranslationDictionary> = {
  en: {
    "Start Assessment": "Start Assessment",
    "Adjust Assessment": "Adjust Assessment",
    "Start New": "Start New",
    "Location": "Location",
    "Business Type": "Business Type",
    "Available Capital": "Available Capital",
    "Herd Size": "Herd Size",
    
    "PROCEED": "PROCEED",
    "MODIFY": "MODIFY",
    "HIGH RISK": "HIGH RISK",
    "HIGH_RISK": "HIGH RISK",

    "AVAILABLE": "AVAILABLE",
    "INSUFFICIENT": "INSUFFICIENT",
    "PROVIDER_UNAVAILABLE": "PROVIDER UNAVAILABLE",
    "AI_UNAVAILABLE": "AI UNAVAILABLE",

    "AI Advisory": "AI Advisory",
    "Summary": "Summary",
    "Why This Decision?": "Why This Decision?",
    "Biggest Risk": "Biggest Risk",
    "Stress Test Implication": "Stress Test Implication",
    "Local Evidence Context": "Local Evidence Context",
    "Recommended Actions": "Recommended Actions",
    
    "Eligibility vs Viability": "Eligibility vs Viability",
    "Maximum Eligible Project Size": "Maximum Eligible Project Size",
    "Prototype Suggested Project Size": "Prototype Suggested Project Size",
    "Maximum Eligible Loan": "Maximum Eligible Loan",
    "Suggested Indicative Loan": "Suggested Indicative Loan",
    
    "Financial Eligibility Pipeline": "Financial Eligibility Pipeline",
    "Business Economics": "Business Economics",
    "Annual Revenue": "Annual Revenue",
    "Annual Operating Cost": "Annual Operating Cost",
    "Operating Surplus": "Operating Surplus",
    "Repayment Burden": "Repayment Burden",
    "Post-Repayment Cash": "Post-Repayment Cash",
    
    "Stress Test": "Stress Test",
    "Market Reach": "Market Reach",
    "Opportunity Analysis": "Opportunity Analysis",
    "Product Market Value": "Product Market Value",
    "Competitor Mapping": "Competitor Mapping",
    "SWOT": "SWOT",
    "Threat Identification": "Threat Identification",
    
    "Live Evidence": "Live Evidence",
    "Limited Evidence": "Limited Evidence",
    "Data Unavailable": "Data Unavailable",
    "User Input": "User Input",
    "Calculated": "Calculated",
    "Prototype Assumption": "Prototype Assumption",

    "AI Advisory is currently unavailable.": "AI Advisory is currently unavailable.",
    "Analyzing financial and mapped evidence...": "Analyzing financial and mapped evidence...",
    "Generate Assessment": "Generate Assessment"
  },
  hi: {
    "Start Assessment": "मूल्यांकन शुरू करें",
    "Adjust Assessment": "मूल्यांकन समायोजित करें",
    "Start New": "नया शुरू करें",
    "Location": "स्थान",
    "Business Type": "व्यवसाय का प्रकार",
    "Available Capital": "उपलब्ध पूंजी",
    "Herd Size": "पशुओं की संख्या",
    
    "PROCEED": "आगे बढ़ें (PROCEED)",
    "MODIFY": "संशोधन करें (MODIFY)",
    "HIGH RISK": "उच्च जोखिम (HIGH RISK)",
    "HIGH_RISK": "उच्च जोखिम (HIGH RISK)",

    "AVAILABLE": "उपलब्ध",
    "INSUFFICIENT": "अपर्याप्त",
    "PROVIDER_UNAVAILABLE": "डेटा उपलब्ध नहीं",
    "AI_UNAVAILABLE": "AI अनुपलब्ध",

    "AI Advisory": "AI सलाहकार",
    "Summary": "सारांश",
    "Why This Decision?": "यह निर्णय क्यों?",
    "Biggest Risk": "सबसे बड़ा जोखिम",
    "Stress Test Implication": "तनाव परीक्षण प्रभाव",
    "Local Evidence Context": "स्थानीय साक्ष्य संदर्भ",
    "Recommended Actions": "अनुशंसित कार्रवाइयां",
    
    "Eligibility vs Viability": "पात्रता बनाम व्यवहार्यता",
    "Maximum Eligible Project Size": "अधिकतम पात्र परियोजना आकार",
    "Prototype Suggested Project Size": "सुझाया गया परियोजना आकार",
    "Maximum Eligible Loan": "अधिकतम पात्र ऋण",
    "Suggested Indicative Loan": "सुझाया गया सांकेतिक ऋण",
    
    "Financial Eligibility Pipeline": "वित्तीय पात्रता पाइपलाइन",
    "Business Economics": "व्यापार अर्थशास्त्र",
    "Annual Revenue": "वार्षिक आय",
    "Annual Operating Cost": "वार्षिक परिचालन लागत",
    "Operating Surplus": "परिचालन अधिशेष",
    "Repayment Burden": "ऋण अदायगी का बोझ",
    "Post-Repayment Cash": "ऋण चुकाने के बाद शेष नकदी",
    
    "Stress Test": "तनाव परीक्षण",
    "Market Reach": "बाजार पहुंच",
    "Opportunity Analysis": "अवसर विश्लेषण",
    "Product Market Value": "उत्पाद बाजार मूल्य",
    "Competitor Mapping": "प्रतिस्पर्धी मैपिंग",
    "SWOT": "SWOT विश्लेषण",
    "Threat Identification": "खतरों की पहचान",
    
    "Live Evidence": "लाइव साक्ष्य",
    "Limited Evidence": "सीमित साक्ष्य",
    "Data Unavailable": "डेटा उपलब्ध नहीं",
    "User Input": "उपयोगकर्ता इनपुट",
    "Calculated": "गणना की गई",
    "Prototype Assumption": "प्रोटोटाइप धारणा",

    "AI Advisory is currently unavailable.": "AI सलाहकार वर्तमान में अनुपलब्ध है।",
    "Analyzing financial and mapped evidence...": "वित्तीय और मैप किए गए साक्ष्यों का विश्लेषण हो रहा है...",
    "Generate Assessment": "मूल्यांकन तैयार करें"
  },
  bn: {
    "Start Assessment": "মূল্যায়ন শুরু করুন",
    "Adjust Assessment": "মূল্যায়ন সামঞ্জস্য করুন",
    "Start New": "নতুন শুরু করুন",
    "Location": "অবস্থান",
    "Business Type": "ব্যবসার ধরন",
    "Available Capital": "উপলব্ধ মূলধন",
    "Herd Size": "পশুর সংখ্যা",
    
    "PROCEED": "এগিয়ে যান (PROCEED)",
    "MODIFY": "পরিবর্তন করুন (MODIFY)",
    "HIGH RISK": "উচ্চ ঝুঁকি (HIGH RISK)",
    "HIGH_RISK": "উচ্চ ঝুঁকি (HIGH RISK)",

    "AVAILABLE": "উপলব্ধ",
    "INSUFFICIENT": "অপর্যাপ্ত",
    "PROVIDER_UNAVAILABLE": "প্রদানকারী অনুপলব্ধ",
    "AI_UNAVAILABLE": "AI অনুপলব্ধ",

    "AI Advisory": "AI পরামর্শদাতা",
    "Summary": "সারসংক্ষেপ",
    "Why This Decision?": "এই সিদ্ধান্ত কেন?",
    "Biggest Risk": "সবচেয়ে বড় ঝুঁকি",
    "Stress Test Implication": "স্ট্রেস টেস্টের প্রভাব",
    "Local Evidence Context": "স্থানীয় প্রমাণের প্রেক্ষাপট",
    "Recommended Actions": "প্রস্তাবিত পদক্ষেপ",
    
    "Eligibility vs Viability": "যোগ্যতা বনাম কার্যকারিতা",
    "Maximum Eligible Project Size": "সর্বোচ্চ যোগ্য প্রকল্প আকার",
    "Prototype Suggested Project Size": "প্রস্তাবিত প্রকল্প আকার",
    "Maximum Eligible Loan": "সর্বোচ্চ যোগ্য ঋণ",
    "Suggested Indicative Loan": "প্রস্তাবিত ঋণ",
    
    "Financial Eligibility Pipeline": "আর্থিক যোগ্যতার পাইপলাইন",
    "Business Economics": "ব্যবসায়িক অর্থনীতি",
    "Annual Revenue": "বার্ষিক আয়",
    "Annual Operating Cost": "বার্ষিক পরিচালন ব্যয়",
    "Operating Surplus": "পরিচালন উদ্বৃত্ত",
    "Repayment Burden": "ঋণ পরিশোধের বোঝা",
    "Post-Repayment Cash": "ঋণ পরিশোধের পর নগদ",
    
    "Stress Test": "স্ট্রেস টেস্ট",
    "Market Reach": "বাজারের নাগাল",
    "Opportunity Analysis": "সুযোগ বিশ্লেষণ",
    "Product Market Value": "পণ্যের বাজার মূল্য",
    "Competitor Mapping": "প্রতিযোগী ম্যাপিং",
    "SWOT": "SWOT বিশ্লেষণ",
    "Threat Identification": "হুমকি শনাক্তকরণ",
    
    "Live Evidence": "সরাসরি প্রমাণ",
    "Limited Evidence": "সীমিত প্রমাণ",
    "Data Unavailable": "ডেটা অনুপলব্ধ",
    "User Input": "ব্যবহারকারী ইনপুট",
    "Calculated": "গণনাকৃত",
    "Prototype Assumption": "প্রোটোটাইপ অনুমান",

    "AI Advisory is currently unavailable.": "AI পরামর্শদাতা বর্তমানে অনুপলব্ধ।",
    "Analyzing financial and mapped evidence...": "আর্থিক এবং ম্যাপ করা প্রমাণ বিশ্লেষণ করা হচ্ছে...",
    "Generate Assessment": "মূল্যায়ন তৈরি করুন"
  },
  mr: {
    "Start Assessment": "मूल्यांकन सुरू करा",
    "Adjust Assessment": "मूल्यांकन समायोजित करा",
    "Start New": "नवीन सुरू करा",
    "Location": "ठिकाण",
    "Business Type": "व्यवसायाचा प्रकार",
    "Available Capital": "उपलब्ध भांडवल",
    "Herd Size": "गुरांची संख्या",
    
    "PROCEED": "पुढे जा (PROCEED)",
    "MODIFY": "बदल करा (MODIFY)",
    "HIGH RISK": "उच्च धोका (HIGH RISK)",
    "HIGH_RISK": "उच्च धोका (HIGH RISK)",

    "AVAILABLE": "उपलब्ध",
    "INSUFFICIENT": "अपुरी माहिती",
    "PROVIDER_UNAVAILABLE": "माहिती उपलब्ध नाही",
    "AI_UNAVAILABLE": "AI उपलब्ध नाही",

    "AI Advisory": "AI सल्लागार",
    "Summary": "सारांश",
    "Why This Decision?": "हा निर्णय का?",
    "Biggest Risk": "सर्वात मोठा धोका",
    "Stress Test Implication": "तणाव चाचणी परिणाम",
    "Local Evidence Context": "स्थानिक पुरावा संदर्भ",
    "Recommended Actions": "शिफारस केलेल्या कृती",
    
    "Eligibility vs Viability": "पात्रता विरुद्ध व्यवहार्यता",
    "Maximum Eligible Project Size": "कमाल पात्र प्रकल्प आकार",
    "Prototype Suggested Project Size": "सुचविलेला प्रकल्प आकार",
    "Maximum Eligible Loan": "कमाल पात्र कर्ज",
    "Suggested Indicative Loan": "सुचविलेले कर्ज",
    
    "Financial Eligibility Pipeline": "आर्थिक पात्रता पाइपलाइन",
    "Business Economics": "व्यावसायिक अर्थशास्त्र",
    "Annual Revenue": "वार्षिक उत्पन्न",
    "Annual Operating Cost": "वार्षिक परिचालन खर्च",
    "Operating Surplus": "परिचालन अतिरिक्त रक्कम",
    "Repayment Burden": "कर्ज परतफेडीचा भार",
    "Post-Repayment Cash": "कर्ज परतफेडीनंतरची रोकड",
    
    "Stress Test": "तणाव चाचणी",
    "Market Reach": "बाजाराची पोहोच",
    "Opportunity Analysis": "संधी विश्लेषण",
    "Product Market Value": "उत्पादन बाजार मूल्य",
    "Competitor Mapping": "प्रतिस्पर्धी मॅपिंग",
    "SWOT": "SWOT विश्लेषण",
    "Threat Identification": "धोक्यांची ओळख",
    
    "Live Evidence": "थेट पुरावा",
    "Limited Evidence": "मर्यादित पुरावा",
    "Data Unavailable": "माहिती उपलब्ध नाही",
    "User Input": "वापरकर्ता इनपुट",
    "Calculated": "गणना केलेली",
    "Prototype Assumption": "प्रोटोटाइप गृहीतक",

    "AI Advisory is currently unavailable.": "AI सल्लागार सध्या अनुपलब्ध आहे.",
    "Analyzing financial and mapped evidence...": "आर्थिक आणि मॅप केलेल्या पुराव्यांचे विश्लेषण करत आहे...",
    "Generate Assessment": "मूल्यांकन व्युत्पन्न करा"
  },
  ta: {
    "Start Assessment": "மதிப்பீட்டைத் தொடங்கவும்",
    "Adjust Assessment": "மதிப்பீட்டை சரிசெய்யவும்",
    "Start New": "புதிதாக தொடங்கவும்",
    "Location": "இடம்",
    "Business Type": "வணிக வகை",
    "Available Capital": "கிடைக்கக்கூடிய மூலதனம்",
    "Herd Size": "கால்நடைகளின் எண்ணிக்கை",
    
    "PROCEED": "தொடரலாம் (PROCEED)",
    "MODIFY": "மாற்றவும் (MODIFY)",
    "HIGH RISK": "அதிக ஆபத்து (HIGH RISK)",
    "HIGH_RISK": "அதிக ஆபத்து (HIGH RISK)",

    "AVAILABLE": "கிடைக்கிறது",
    "INSUFFICIENT": "போதாது",
    "PROVIDER_UNAVAILABLE": "தரவு இல்லை",
    "AI_UNAVAILABLE": "AI கிடைக்கவில்லை",

    "AI Advisory": "AI ஆலோசகர்",
    "Summary": "சுருக்கம்",
    "Why This Decision?": "இந்த முடிவு ஏன்?",
    "Biggest Risk": "மிகப்பெரிய ஆபத்து",
    "Stress Test Implication": "கடின சோதனையின் தாக்கம்",
    "Local Evidence Context": "உள்ளூர் ஆதார சூழல்",
    "Recommended Actions": "பரிந்துரைக்கப்பட்ட செயல்கள்",
    
    "Eligibility vs Viability": "தகுதி மற்றும் சாத்தியக்கூறு",
    "Maximum Eligible Project Size": "அதிகபட்ச தகுதியான திட்ட அளவு",
    "Prototype Suggested Project Size": "பரிந்துரைக்கப்பட்ட திட்ட அளவு",
    "Maximum Eligible Loan": "அதிகபட்ச தகுதியான கடன்",
    "Suggested Indicative Loan": "பரிந்துரைக்கப்பட்ட கடன்",
    
    "Financial Eligibility Pipeline": "நிதி தகுதி திட்டம்",
    "Business Economics": "வணிகப் பொருளாதாரம்",
    "Annual Revenue": "ஆண்டு வருமானம்",
    "Annual Operating Cost": "ஆண்டு செயல்பாட்டு செலவு",
    "Operating Surplus": "செயல்பாட்டு உபரி",
    "Repayment Burden": "கடன் திருப்பிச் செலுத்தும் சுமை",
    "Post-Repayment Cash": "திரும்பிச் செலுத்திய பின் உள்ள பணம்",
    
    "Stress Test": "கடின சோதனை",
    "Market Reach": "சந்தை வரம்பு",
    "Opportunity Analysis": "வாய்ப்பு பகுப்பாய்வு",
    "Product Market Value": "தயாரிப்பு சந்தை மதிப்பு",
    "Competitor Mapping": "போட்டியாளர் வரைபடம்",
    "SWOT": "SWOT பகுப்பாய்வு",
    "Threat Identification": "அச்சுறுத்தல் அடையாளம்",
    
    "Live Evidence": "நேரடி சான்றுகள்",
    "Limited Evidence": "வரையறுக்கப்பட்ட சான்று",
    "Data Unavailable": "தரவு இல்லை",
    "User Input": "பயனர் உள்ளீடு",
    "Calculated": "கணக்கிடப்பட்டது",
    "Prototype Assumption": "முன்மாதிரி அனுமானம்",

    "AI Advisory is currently unavailable.": "AI ஆலோசகர் தற்போது கிடைக்கவில்லை.",
    "Analyzing financial and mapped evidence...": "நிதி மற்றும் வரைபட ஆதாரங்களை பகுப்பாய்வு செய்கிறது...",
    "Generate Assessment": "மதிப்பீட்டை உருவாக்கவும்"
  }
};

export function useTranslation(language: LanguageCode) {
  return function t(key: string): string {
    const translation = translations[language]?.[key];
    if (translation) return translation;
    
    // Fallback to English
    const fallback = translations.en[key];
    if (fallback) return fallback;
    
    // Return original key if neither is found
    return key;
  };
}
