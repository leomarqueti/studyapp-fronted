import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { cardsService } from '../services/api';
import { Plus, Edit, Trash2, BookOpen, Brain } from 'lucide-react';

const CardsPage = () => {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCard, setEditingCard] = useState(null);
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    type: 'flashcard',
    options: [
      { text: '', is_correct: false },
      { text: '', is_correct: false },
      { text: '', is_correct: false },
      { text: '', is_correct: false },
    ],
  });

  useEffect(() => {
    loadCards();
  }, []);

  const loadCards = async () => {
    try {
      const response = await cardsService.getAll();
      setCards(response.data);
    } catch (error) {
      console.error('Erro ao carregar cards:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const cardData = {
        question: formData.question,
        answer: formData.answer,
        type: formData.type,
      };

      if (formData.type === 'quiz') {
        cardData.options = formData.options.filter(opt => opt.text.trim() !== '');
      }

      if (editingCard) {
        await cardsService.update(editingCard.id, cardData);
      } else {
        await cardsService.create(cardData);
      }

      await loadCards();
      resetForm();
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Erro ao salvar card:', error);
    }
  };

  const handleDelete = async (cardId) => {
    if (window.confirm('Tem certeza que deseja deletar este card?')) {
      try {
        await cardsService.delete(cardId);
        await loadCards();
      } catch (error) {
        console.error('Erro ao deletar card:', error);
      }
    }
  };

  const handleEdit = (card) => {
    setEditingCard(card);
    setFormData({
      question: card.question,
      answer: card.answer,
      type: card.type,
      options: card.options || [
        { text: '', is_correct: false },
        { text: '', is_correct: false },
        { text: '', is_correct: false },
        { text: '', is_correct: false },
      ],
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setEditingCard(null);
    setFormData({
      question: '',
      answer: '',
      type: 'flashcard',
      options: [
        { text: '', is_correct: false },
        { text: '', is_correct: false },
        { text: '', is_correct: false },
        { text: '', is_correct: false },
      ],
    });
  };

  const handleOptionChange = (index, field, value) => {
    const newOptions = [...formData.options];
    newOptions[index][field] = value;
    
    // Se marcou como correta, desmarcar as outras
    if (field === 'is_correct' && value) {
      newOptions.forEach((opt, i) => {
        if (i !== index) opt.is_correct = false;
      });
    }
    
    setFormData({ ...formData, options: newOptions });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Meus Cards</h1>
          <p className="text-gray-600 mt-1">Gerencie suas perguntas e flashcards</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Novo Card</span>
            </Button>
          </DialogTrigger>
          
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingCard ? 'Editar Card' : 'Criar Novo Card'}
              </DialogTitle>
              <DialogDescription>
                {editingCard ? 'Edite as informações do card' : 'Adicione um novo card de estudo'}
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="type">Tipo de Card</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="flashcard">Flashcard</SelectItem>
                    <SelectItem value="quiz">Quiz (Múltipla Escolha)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="question">Pergunta</Label>
                <Textarea
                  id="question"
                  placeholder="Digite sua pergunta..."
                  value={formData.question}
                  onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                  required
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="answer">Resposta</Label>
                <Textarea
                  id="answer"
                  placeholder="Digite a resposta..."
                  value={formData.answer}
                  onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                  required
                  rows={3}
                />
              </div>

              {formData.type === 'quiz' && (
                <div className="space-y-4">
                  <Label>Opções de Múltipla Escolha</Label>
                  {formData.options.map((option, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Input
                        placeholder={`Opção ${index + 1}`}
                        value={option.text}
                        onChange={(e) => handleOptionChange(index, 'text', e.target.value)}
                        className="flex-1"
                      />
                      <label className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name="correct_option"
                          checked={option.is_correct}
                          onChange={(e) => handleOptionChange(index, 'is_correct', e.target.checked)}
                          className="text-blue-600"
                        />
                        <span className="text-sm text-gray-600">Correta</span>
                      </label>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingCard ? 'Salvar Alterações' : 'Criar Card'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Cards Grid */}
      {cards.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhum card encontrado
            </h3>
            <p className="text-gray-600 mb-4">
              Comece criando seu primeiro card de estudo
            </p>
            <Button onClick={() => setIsDialogOpen(true)}>
              Criar Primeiro Card
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((card) => (
            <Card key={card.id} className="hover:shadow-lg transition-shadow duration-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {card.type === 'flashcard' ? (
                      <BookOpen className="h-5 w-5 text-blue-600" />
                    ) : (
                      <Brain className="h-5 w-5 text-green-600" />
                    )}
                    <CardTitle className="text-sm font-medium">
                      {card.type === 'flashcard' ? 'Flashcard' : 'Quiz'}
                    </CardTitle>
                  </div>
                  <div className="flex space-x-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEdit(card)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(card.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Pergunta:</p>
                    <p className="text-sm text-gray-900 line-clamp-3">
                      {card.question}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Resposta:</p>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {card.answer}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default CardsPage;

