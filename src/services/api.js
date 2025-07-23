@@ .. @@
-import axios from 'axios';
+import fileSystemService from './fileSystemService';

-const API_BASE_URL = 'http://localhost:3000/api';
-
-// Criar instância do axios
-const api = axios.create({
-  baseURL: API_BASE_URL,
-  headers: {
-    'Content-Type': 'application/json',
-  },
-});
-
-// Interceptor para adicionar token de autenticação
-api.interceptors.request.use(
-  (config) => {
-    const token = localStorage.getItem('token');
-    if (token) {
-      config.headers.Authorization = `Bearer ${token}`;
-    }
-    return config;
-  },
-  (error) => {
-    return Promise.reject(error);
-  }
-);
-
-// Interceptor para tratar respostas
-api.interceptors.response.use(
-  (response) => response,
-  (error) => {
-    if (error.response?.status === 401) {
-      // Token inválido ou expirado
-      localStorage.removeItem('token');
-      localStorage.removeItem('user');
-      window.location.href = '/login';
-    }
-    return Promise.reject(error);
-  }
-);
+// Simular respostas de API usando dados locais
+const createResponse = (data) => ({ data });

 // Serviços de autenticação
 export const authService = {
-  register: (userData) => api.post('/auth/register', userData),
-  login: (credentials) => api.post('/auth/login', credentials),
+  register: async (userData) => {
+    // Simulação offline - sempre sucesso
+    return createResponse({ user: userData, token: 'offline-token' });
+  },
+  login: async (credentials) => {
+    // Simulação offline - sempre sucesso
+    return createResponse({ user: credentials, token: 'offline-token' });
+  },
 };

 // Serviços de cards
 export const cardsService = {
-  getAll: () => api.get('/cards'),
-  getById: (id) => api.get(`/cards/${id}`),
-  create: (cardData) => api.post('/cards', cardData),
-  update: (id, cardData) => api.put(`/cards/${id}`, cardData),
-  delete: (id) => api.delete(`/cards/${id}`),
+  getAll: async () => {
+    const cards = fileSystemService.getCards();
+    return createResponse(cards);
+  },
+  getById: async (id) => {
+    const cards = fileSystemService.getCards();
+    const card = cards.find(c => c.id === id);
+    return createResponse(card);
+  },
+  create: async (cardData) => {
+    const newCard = fileSystemService.addCard(cardData);
+    return createResponse(newCard);
+  },
+  update: async (id, cardData) => {
+    const updatedCard = fileSystemService.updateCard(id, cardData);
+    return createResponse(updatedCard);
+  },
+  delete: async (id) => {
+    fileSystemService.deleteCard(id);
+    return createResponse({ success: true });
+  },
 };

 // Serviços de estudo
 export const studyService = {
-  getReviewCards: () => api.get('/study/review'),
-  getQuizCards: (limit = 10) => api.get(`/study/quiz?limit=${limit}`),
-  submitReview: (cardId, quality) => api.post(`/study/review/${cardId}`, { quality }),
-  getStats: () => api.get('/study/stats'),
+  getReviewCards: async () => {
+    const cards = fileSystemService.getReviewCards();
+    return createResponse(cards);
+  },
+  getQuizCards: async (limit = 10) => {
+    const cards = fileSystemService.getQuizCards(limit);
+    return createResponse(cards);
+  },
+  submitReview: async (cardId, quality) => {
+    const review = fileSystemService.addReview(cardId, quality);
+    return createResponse(review);
+  },
+  getStats: async () => {
+    const stats = fileSystemService.getStats();
+    return createResponse(stats);
+  },
 };

-export default api;
+export default { authService, cardsService, studyService };