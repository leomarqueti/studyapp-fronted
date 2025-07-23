// Serviço para gerenciar dados em arquivos locais
class FileSystemService {
  constructor() {
    this.dataFileName = 'studyapp-data.json';
    this.defaultData = {
      user: null,
      cards: [],
      reviews: [],
      stats: {
        totalCards: 0,
        reviewToday: 0,
        reviewedThisWeek: 0
      },
      settings: {
        dataFolder: null,
        lastSync: null
      }
    };
    this.currentData = { ...this.defaultData };
    this.fileHandle = null;
  }

  // Verificar se o navegador suporta File System Access API
  isFileSystemSupported() {
    return 'showOpenFilePicker' in window && 'showSaveFilePicker' in window;
  }

  // Selecionar pasta para salvar dados
  async selectDataFolder() {
    try {
      const dirHandle = await window.showDirectoryPicker({
        mode: 'readwrite'
      });
      
      this.currentData.settings.dataFolder = dirHandle.name;
      await this.saveDataToFolder(dirHandle);
      
      return { success: true, folderName: dirHandle.name };
    } catch (error) {
      console.error('Erro ao selecionar pasta:', error);
      return { success: false, error: error.message };
    }
  }

  // Salvar dados na pasta selecionada
  async saveDataToFolder(dirHandle) {
    try {
      const fileHandle = await dirHandle.getFileHandle(this.dataFileName, {
        create: true
      });
      
      const writable = await fileHandle.createWritable();
      await writable.write(JSON.stringify(this.currentData, null, 2));
      await writable.close();
      
      this.fileHandle = fileHandle;
      this.currentData.settings.lastSync = new Date().toISOString();
      
      return { success: true };
    } catch (error) {
      console.error('Erro ao salvar dados:', error);
      return { success: false, error: error.message };
    }
  }

  // Carregar dados de um arquivo
  async loadDataFromFile() {
    try {
      const [fileHandle] = await window.showOpenFilePicker({
        types: [{
          description: 'StudyApp Data',
          accept: {
            'application/json': ['.json']
          }
        }]
      });

      const file = await fileHandle.getFile();
      const contents = await file.text();
      const data = JSON.parse(contents);
      
      // Validar estrutura dos dados
      if (this.validateDataStructure(data)) {
        this.currentData = { ...this.defaultData, ...data };
        this.fileHandle = fileHandle;
        return { success: true, data: this.currentData };
      } else {
        return { success: false, error: 'Arquivo de dados inválido' };
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      return { success: false, error: error.message };
    }
  }

  // Validar estrutura dos dados
  validateDataStructure(data) {
    return (
      data &&
      typeof data === 'object' &&
      Array.isArray(data.cards) &&
      Array.isArray(data.reviews) &&
      data.stats &&
      typeof data.stats === 'object'
    );
  }

  // Salvar dados automaticamente
  async autoSave() {
    if (this.fileHandle) {
      try {
        const writable = await this.fileHandle.createWritable();
        await writable.write(JSON.stringify(this.currentData, null, 2));
        await writable.close();
        this.currentData.settings.lastSync = new Date().toISOString();
        return { success: true };
      } catch (error) {
        console.error('Erro no auto-save:', error);
        return { success: false, error: error.message };
      }
    }
    return { success: false, error: 'Nenhum arquivo selecionado' };
  }

  // Exportar dados para backup
  async exportData() {
    try {
      const fileHandle = await window.showSaveFilePicker({
        suggestedName: `studyapp-backup-${new Date().toISOString().split('T')[0]}.json`,
        types: [{
          description: 'StudyApp Backup',
          accept: {
            'application/json': ['.json']
          }
        }]
      });

      const writable = await fileHandle.createWritable();
      await writable.write(JSON.stringify(this.currentData, null, 2));
      await writable.close();

      return { success: true };
    } catch (error) {
      console.error('Erro ao exportar dados:', error);
      return { success: false, error: error.message };
    }
  }

  // Métodos para gerenciar usuários
  setUser(user) {
    this.currentData.user = user;
    this.autoSave();
  }

  getUser() {
    return this.currentData.user;
  }

  removeUser() {
    this.currentData.user = null;
    this.autoSave();
  }

  // Métodos para gerenciar cards
  getCards() {
    return this.currentData.cards || [];
  }

  addCard(card) {
    const newCard = {
      ...card,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      next_review: new Date().toISOString(),
      interval: 1,
      ease_factor: 2.5,
      repetitions: 0
    };
    
    this.currentData.cards.push(newCard);
    this.updateStats();
    this.autoSave();
    return newCard;
  }

  updateCard(id, cardData) {
    const index = this.currentData.cards.findIndex(card => card.id === id);
    if (index !== -1) {
      this.currentData.cards[index] = { ...this.currentData.cards[index], ...cardData };
      this.updateStats();
      this.autoSave();
      return this.currentData.cards[index];
    }
    return null;
  }

  deleteCard(id) {
    this.currentData.cards = this.currentData.cards.filter(card => card.id !== id);
    this.updateStats();
    this.autoSave();
  }

  // Métodos para revisões
  addReview(cardId, quality) {
    const card = this.currentData.cards.find(c => c.id === cardId);
    if (!card) return null;

    const review = {
      id: Date.now().toString(),
      card_id: cardId,
      quality: quality,
      reviewed_at: new Date().toISOString()
    };

    this.currentData.reviews.push(review);

    // Atualizar algoritmo de repetição espaçada
    this.updateSpacedRepetition(card, quality);
    this.updateStats();
    this.autoSave();

    return review;
  }

  // Algoritmo de repetição espaçada (SM-2)
  updateSpacedRepetition(card, quality) {
    if (quality >= 3) {
      if (card.repetitions === 0) {
        card.interval = 1;
      } else if (card.repetitions === 1) {
        card.interval = 6;
      } else {
        card.interval = Math.round(card.interval * card.ease_factor);
      }
      card.repetitions++;
    } else {
      card.repetitions = 0;
      card.interval = 1;
    }

    card.ease_factor = Math.max(1.3, card.ease_factor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));
    
    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + card.interval);
    card.next_review = nextReview.toISOString();
  }

  // Obter cards para revisão
  getReviewCards() {
    const now = new Date();
    return this.currentData.cards.filter(card => new Date(card.next_review) <= now);
  }

  // Obter cards para quiz
  getQuizCards(limit = 10) {
    const shuffled = [...this.currentData.cards].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, limit);
  }

  // Atualizar estatísticas
  updateStats() {
    const now = new Date();
    const today = now.toDateString();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    this.currentData.stats = {
      totalCards: this.currentData.cards.length,
      reviewToday: this.getReviewCards().length,
      reviewedThisWeek: this.currentData.reviews.filter(review => 
        new Date(review.reviewed_at) >= weekAgo
      ).length
    };
  }

  getStats() {
    this.updateStats();
    return this.currentData.stats;
  }

  // Obter informações do arquivo atual
  getCurrentFileInfo() {
    return {
      hasFile: !!this.fileHandle,
      fileName: this.fileHandle?.name || null,
      lastSync: this.currentData.settings.lastSync,
      totalCards: this.currentData.cards.length,
      totalReviews: this.currentData.reviews.length
    };
  }
}

export default new FileSystemService();