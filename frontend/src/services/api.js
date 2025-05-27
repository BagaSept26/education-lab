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
    // console.log('Starting Request', config);
    // const token = localStorage.getItem('user-token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
}, error => {
    return Promise.reject(error);
});
//interceptor untuk response
apiClient.interceptors.response.use(response => {
    // console.log('Response:', response)
    return response;
}, error => {
    // console.error('Response Error:', error.response || error.message);
    // Handle error global, misal redirect ke login jika 401 Unauthorized
    // if (error.response && error.response.status === 401) {
    //   router.push('/login');
    // }
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

  // fungsi lain untuk setiap fitur AI
  // 
  // generateSoal(materi) {
  //   return apiClient.post('/generate-soal', { materi });
  // },
};