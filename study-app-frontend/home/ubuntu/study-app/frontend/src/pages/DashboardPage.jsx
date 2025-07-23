import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { studyService } from '../services/api';
import { BookOpen, Brain, Target, TrendingUp, Calendar, Clock } from 'lucide-react';

const DashboardPage = ({ onNavigate }) => {
  const [stats, setStats] = useState({
    totalCards: 0,
    reviewToday: 0,
    reviewedThisWeek: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await studyService.getStats();
      setStats(response.data);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total de Cards',
      value: stats.totalCards,
      description: 'Cards criados no total',
      icon: BookOpen,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Para Revisar Hoje',
      value: stats.reviewToday,
      description: 'Cards agendados para hoje',
      icon: Calendar,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      title: 'Revisados esta Semana',
      value: stats.reviewedThisWeek,
      description: 'Cards estudados nos últimos 7 dias',
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
  ];

  const quickActions = [
    {
      title: 'Revisar Cards',
      description: 'Continue seus estudos com revisão espaçada',
      icon: Brain,
      action: () => onNavigate('study'),
      color: 'bg-blue-600 hover:bg-blue-700',
      disabled: stats.reviewToday === 0,
    },
    {
      title: 'Fazer Quiz',
      description: 'Teste seus conhecimentos com perguntas aleatórias',
      icon: Target,
      action: () => onNavigate('quiz'),
      color: 'bg-green-600 hover:bg-green-700',
      disabled: stats.totalCards === 0,
    },
    {
      title: 'Gerenciar Cards',
      description: 'Adicione, edite ou organize seus cards de estudo',
      icon: BookOpen,
      action: () => onNavigate('cards'),
      color: 'bg-purple-600 hover:bg-purple-700',
      disabled: false,
    },
  ];

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
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-blue-100">
          Bem-vindo de volta! Vamos continuar seus estudos.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow duration-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-full ${stat.bgColor}`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {quickActions.map((action, index) => {
          const Icon = action.icon;
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow duration-200">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className={`p-3 rounded-full ${action.color} text-white`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{action.title}</CardTitle>
                    <CardDescription className="text-sm">
                      {action.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={action.action}
                  disabled={action.disabled}
                  className={`w-full ${action.color} text-white`}
                  variant={action.disabled ? "secondary" : "default"}
                >
                  {action.disabled ? 'Indisponível' : 'Começar'}
                </Button>
                {action.disabled && action.title === 'Revisar Cards' && (
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    Nenhum card agendado para hoje
                  </p>
                )}
                {action.disabled && action.title === 'Fazer Quiz' && (
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    Crie alguns cards primeiro
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Study Tips */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-green-600" />
            <span>Dica de Estudo</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700">
            A revisão espaçada é mais eficaz quando feita consistentemente. 
            Tente revisar seus cards todos os dias, mesmo que por poucos minutos. 
            O algoritmo ajustará automaticamente os intervalos baseado no seu desempenho.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardPage;

