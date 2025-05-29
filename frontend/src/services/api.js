import axios from 'axios';

//url dari huggingface
const HUGGING_FACE_REDIRECT_URL = 'https://bagaseptian-edulab.hf.space';

const apiClient = axios.create({
    baseURL: HUGGING_FACE_REDIRECT_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

//interceptor
apiClient.interceptors.request.use(config => {
    return config;
}, error => {
    return Promise.reject(error);
});
//interceptor untuk response
apiClient.interceptors.response.use(response => {
    // console.log('Response:', response)
    return response;
}, error => {
    return Promise.reject(error);
});

// fungsi untuk endpoint spesifik (nantinya)
export default {
  // Fungsi untuk fitur PersonaChat
  chatWithPersona(payload) {
    // payload = { persona: 'guru_bahasa_jepang', message: 'こんにちは' }
    return apiClient.post('/persona-chat', payload);
    
  },

  // Fungsi untuk fitur WhisperTranscriber
  transcribeAudio(formData) {
    // formData akan berisi file audio
    return apiClient.post('/transcribe', formData, {
      headers: {
        'Content-Type': 'multipart/form-data' // Penting untuk upload file
      }
    });
  },
  // --- soalGenerator ---
  generateSoal(payload){
    return apiClient.post('generate-soal', payload);
  },
  // ---Grammar Checker ---
  checkGrammar(payload){
    return apiClient.post('/check-grammar', payload);
  },
  // --- AIArtikelRreader ---
  processArticle(payload){
    return apiClient.post('/process-article', payload);
  },
  // --- AIFlashCard ---
  createFlashcards(payload){
    return apiClient.post('/create/flashcards', payload);
  },
  // --- kamus ---
  cariKataJepang(payload){
    return apiClient.post('/kamus-jepang', payload);
  },
  // --- Speaking practice ---
  submitSpeakingPractice(formData){
    return apiClient.post('/speaking-practice', formData, {
      headers:{
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  ///fungsi lain
};