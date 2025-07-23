import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { studyService } from '../services/api';
import { RotateCcw, CheckCircle, XCircle, Brain, ArrowRight } from 'lucide-react';

const StudyPage = ({ onNavigate }) => {
  const [cards, setCards] = useState([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sessionComplete, setSessionComplete] = useState(false);

  useEffect(() => {
    loadReviewCards();
  }, []);

  const loadReviewCards = async () => {
    try {
      const response = await studyService.getReviewCards();
      setCards(response.data);
      
      if (response.data.length === 0) {
        setSessionComplete(true);
      }
    } catch (error) {
      console.error('Erro ao carregar cards para revisão:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (quality) => {
    const currentCard = cards[currentCardIndex];
    
    try {
      await studyService.submitReview(currentCard.id, quality);
      
      // Avançar para o próximo card
      if (currentCardIndex < cards.length - 1) {
        setCurrentCardIndex(currentCardIndex + 1);
        setShowAnswer(false);
      } else {
        setSessionComplete(true);
      }
    } catch (error) {
      console.error('Erro ao registrar revisão:', error);
    }
  };

  const resetSession = () => {
    setCurrentCardIndex(0);
    setShowAnswer(false);
    setSessionComplete(false);
    loadReviewCards();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (sessionComplete || cards.length === 0) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="text-center py-12">
          <CardContent>
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {cards.length === 0 ? 'Nenhum card para revisar!' : 'Sessão concluída!'}
            </h2>
            <p className="text-gray-600 mb-6">
              {cards.length === 0 
                ? 'Você não tem cards agendados para revisão hoje. Que tal criar alguns cards ou fazer um quiz?'
                : 'Parabéns! Você completou todas as revisões agendadas para hoje.'
              }
            </p>
            <div className="flex justify-center space-x-4">
              {cards.length === 0 ? (
                <>
                  <Button onClick={() => onNavigate('cards')}>
                    Criar Cards
                  </Button>
                  <Button variant="outline" onClick={() => onNavigate('quiz')}>
                    Fazer Quiz
                  </Button>
                </>
              ) : (
                <>
                  <Button onClick={resetSession}>
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Revisar Novamente
                  </Button>
                  <Button variant="outline" onClick={() => onNavigate('dashboard')}>
                    Voltar ao Dashboard
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentCard = cards[currentCardIndex];
  const progress = ((currentCardIndex + 1) / cards.length) * 100;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header com progresso */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg p-6 text-white">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Sessão de Revisão</h1>
          <div className="text-right">
            <p className="text-blue-100">Progresso</p>
            <p className="text-xl font-bold">{currentCardIndex + 1} / {cards.length}</p>
          </div>
        </div>
        
        {/* Barra de progresso */}
        <div className="w-full bg-blue-500 rounded-full h-2">
          <div 
            className="bg-white h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* Card de estudo */}
      <Card className="min-h-[400px]">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Brain className="h-5 w-5 text-blue-600" />
            <CardTitle>
              {currentCard.type === 'flashcard' ? 'Flashcard' : 'Quiz'}
            </CardTitle>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Pergunta */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Pergunta:</h3>
            <p className="text-gray-700 text-lg leading-relaxed">
              {currentCard.question}
            </p>
          </div>

          {/* Resposta (quando mostrada) */}
          {showAnswer && (
            <div className="bg-blue-50 p-6 rounded-lg border-l-4 border-blue-500">
              <h3 className="text-lg font-medium text-blue-900 mb-2">Resposta:</h3>
              <p className="text-blue-800 text-lg leading-relaxed">
                {currentCard.answer}
              </p>
              
              {/* Opções para quiz */}
              {currentCard.type === 'quiz' && currentCard.options && (
                <div className="mt-4 space-y-2">
                  <p className="text-sm font-medium text-blue-900">Opções:</p>
                  {currentCard.options.map((option, index) => (
                    <div 
                      key={index}
                      className={`p-2 rounded ${
                        option.is_correct 
                          ? 'bg-green-100 border border-green-300' 
                          : 'bg-gray-100'
                      }`}
                    >
                      <span className="text-sm">
                        {String.fromCharCode(65 + index)}. {option.option_text}
                        {option.is_correct && (
                          <span className="ml-2 text-green-600 font-medium">✓ Correta</span>
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Botões de ação */}
          <div className="flex justify-center">
            {!showAnswer ? (
              <Button 
                onClick={() => setShowAnswer(true)}
                className="flex items-center space-x-2"
                size="lg"
              >
                <span>Mostrar Resposta</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <div className="space-y-4 w-full">
                <p className="text-center text-gray-600 font-medium">
                  Como foi sua resposta?
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button
                    onClick={() => handleReview(1)}
                    variant="outline"
                    className="flex items-center justify-center space-x-2 h-12 border-red-300 text-red-700 hover:bg-red-50"
                  >
                    <XCircle className="h-5 w-5" />
                    <span>Errei</span>
                  </Button>
                  
                  <Button
                    onClick={() => handleReview(3)}
                    variant="outline"
                    className="flex items-center justify-center space-x-2 h-12 border-yellow-300 text-yellow-700 hover:bg-yellow-50"
                  >
                    <RotateCcw className="h-5 w-5" />
                    <span>Difícil</span>
                  </Button>
                  
                  <Button
                    onClick={() => handleReview(5)}
                    variant="outline"
                    className="flex items-center justify-center space-x-2 h-12 border-green-300 text-green-700 hover:bg-green-50"
                  >
                    <CheckCircle className="h-5 w-5" />
                    <span>Fácil</span>
                  </Button>
                </div>
                
                <p className="text-xs text-gray-500 text-center">
                  Sua avaliação ajuda o algoritmo a agendar a próxima revisão
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudyPage;

