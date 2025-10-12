import appService from '../services/AppService';
const translateText = async (text, targetLanguage, authToken) => {
    
    // If it's already English or Hindi, don't translate
    if (targetLanguage === 'en-US' || targetLanguage === 'hi-IN') {
      return text;
    }
  
    try {
      const response = await fetch(appService.data.translate, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` },
        body: JSON.stringify({
          text,
          targetLang: 'hi' // Always translate to Hindi for this app
        })
      });
  
      const result = await response.json();
      return result.translatedText || text;
    } catch (error) {
      console.error('Translation failed:', error);
      return text; // Return original text if translation fails
    }
  };
  
export default translateText;