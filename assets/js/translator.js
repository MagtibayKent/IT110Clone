// LYRIN Translator - MyMemory API Module
// Simple JavaScript module for text translation using MyMemory API

/**
 * Translates text between two languages using MyMemory API
 * @param {string} sourceText - The text to translate
 * @param {string} sourceLang - Source language code (e.g., 'en')
 * @param {string} targetLang - Target language code (e.g., 'tl')
 * @returns {Promise<string>} - Translated text or error message
 */
async function translateText(sourceText, sourceLang, targetLang) {
    try {
        // Validate input parameters
        if (!sourceText || typeof sourceText !== 'string') {
            throw new Error('Source text is required and must be a string');
        }
        
        if (!sourceLang || !targetLang) {
            throw new Error('Both source and target language codes are required');
        }
        
        // Clean and encode the text
        const cleanText = sourceText.trim();
        if (cleanText.length === 0) {
            throw new Error('Source text cannot be empty');
        }
        
        // Create the API URL
        const apiUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(cleanText)}&langpair=${sourceLang}|${targetLang}`;
        
        // Make the API request
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Check if translation was successful
        if (data.responseStatus === 200 && data.responseData) {
            const translatedText = data.responseData.translatedText;
            
            // Validate the translated text
            if (translatedText && translatedText.trim().length > 0) {
                return translatedText.trim();
            } else {
                throw new Error('Translation returned empty result');
            }
        } else {
            throw new Error(`Translation failed: ${data.responseDetails || 'Unknown error'}`);
        }
        
    } catch (error) {
        // Handle different types of errors
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            return 'Error: Network connection failed. Please check your internet connection.';
        } else if (error.message.includes('HTTP error')) {
            return 'Error: Translation service is temporarily unavailable. Please try again later.';
        } else if (error.message.includes('Translation failed')) {
            return 'Error: Could not translate this text. Please try with different words.';
        } else {
            return `Error: ${error.message}`;
        }
    }
}

/**
 * Get supported language codes
 * @returns {Object} - Object with language codes and names
 */
function getSupportedLanguages() {
    return {
        'en': 'English',
        'tl': 'Filipino',
        'es': 'Spanish',
        'fr': 'French',
        'de': 'German',
        'it': 'Italian',
        'pt': 'Portuguese',
        'ja': 'Japanese',
        'ko': 'Korean',
        'zh': 'Chinese',
        'ru': 'Russian',
        'ar': 'Arabic',
        'hi': 'Hindi',
        'id': 'Indonesian',
        'th': 'Thai',
        'vi': 'Vietnamese',
        'nl': 'Dutch',
        'el': 'Greek',
        'tr': 'Turkish',
        'sv': 'Swedish'
    };
}

/**
 * Validate language code
 * @param {string} langCode - Language code to validate
 * @returns {boolean} - True if valid, false otherwise
 */
function isValidLanguageCode(langCode) {
    const supportedLanguages = getSupportedLanguages();
    return supportedLanguages.hasOwnProperty(langCode);
}

/**
 * Get language name from code
 * @param {string} langCode - Language code
 * @returns {string} - Language name or 'Unknown'
 */
function getLanguageName(langCode) {
    const supportedLanguages = getSupportedLanguages();
    return supportedLanguages[langCode] || 'Unknown';
}

// Export functions for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    // Node.js environment
    module.exports = {
        translateText,
        getSupportedLanguages,
        isValidLanguageCode,
        getLanguageName
    };
} else {
    // Browser environment - attach to window object
    window.TranslatorAPI = {
        translateText,
        getSupportedLanguages,
        isValidLanguageCode,
        getLanguageName
    };
}

// Example usage and testing
if (typeof window !== 'undefined') {
    // Browser environment - add to global scope
    window.translateText = translateText;
    
    // Test function for development
    window.testTranslation = async function() {
        console.log('Testing MyMemory API...');
        
        try {
            // Test English to Filipino
            const result1 = await translateText('Hello world', 'en', 'tl');
            console.log('English to Filipino:', result1);
            
            // Test Filipino to English
            const result2 = await translateText('Kumusta mundo', 'tl', 'en');
            console.log('Filipino to English:', result2);
            
            // Test Spanish to English
            const result3 = await translateText('Hola mundo', 'es', 'en');
            console.log('Spanish to English:', result3);
            
            console.log('All tests completed successfully!');
            return true;
        } catch (error) {
            console.error('Test failed:', error);
            return false;
        }
    };
    
    // Auto-test on load (optional)
    // window.addEventListener('load', () => {
    //     setTimeout(() => {
    //         window.testTranslation();
    //     }, 1000);
    // });
}
