import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import fileSystemService from '../services/fileSystemService';
import { 
  FolderOpen, 
  Download, 
  Upload, 
  Save, 
  AlertCircle, 
  CheckCircle, 
  HardDrive,
  FileText,
  Calendar
} from 'lucide-react';

const SettingsPage = () => {
  const [fileInfo, setFileInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    setIsSupported(fileSystemService.isFileSystemSupported());
    updateFileInfo();
  }, []);

  const updateFileInfo = () => {
    const info = fileSystemService.getCurrentFileInfo();
    setFileInfo(info);
  };

  const showMessage = (text, type = 'info') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleSelectFolder = async () => {
    setLoading(true);
    try {
      const result = await fileSystemService.selectDataFolder();
      if (result.success) {
        showMessage(`Pasta "${result.folderName}" selecionada com sucesso!`, 'success');
        updateFileInfo();
      } else {
        showMessage(`Erro: ${result.error}`, 'error');
      }
    } catch (error) {
      showMessage('Erro ao selecionar pasta', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleLoadData = async () => {
    setLoading(true);
    try {
      const result = await fileSystemService.loadDataFromFile();
      if (result.success) {
        showMessage('Dados carregados com sucesso!', 'success');
        updateFileInfo();
        // Recarregar a página para atualizar todos os componentes
        window.location.reload();
      } else {
        showMessage(`Erro: ${result.error}`, 'error');
      }
    } catch (error) {
      showMessage('Erro ao carregar dados', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = async () => {
    setLoading(true);
    try {
      const result = await fileSystemService.exportData();
      if (result.success) {
        showMessage('Backup exportado com sucesso!', 'success');
      } else {
        showMessage(`Erro: ${result.error}`, 'error');
      }
    } catch (error) {
      showMessage('Erro ao exportar dados', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleManualSave = async () => {
    setLoading(true);
    try {
      const result = await fileSystemService.autoSave();
      if (result.success) {
        showMessage('Dados salvos com sucesso!', 'success');
        updateFileInfo();
      } else {
        showMessage(`Erro: ${result.error}`, 'error');
      }
    } catch (error) {
      showMessage('Erro ao salvar dados', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!isSupported) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Configurações</h1>
          <p className="text-gray-600 mt-1">Gerencie seus dados e configurações</p>
        </div>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Seu navegador não suporta o salvamento de arquivos locais. 
            Para usar esta funcionalidade, utilize um navegador moderno como Chrome, Edge ou Firefox.
            Os dados serão salvos temporariamente no navegador.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Configurações</h1>
        <p className="text-gray-600 mt-1">Gerencie seus dados e configurações</p>
      </div>

      {/* Mensagem de status */}
      {message && (
        <Alert className={message.type === 'error' ? 'border-red-200 bg-red-50' : 
                         message.type === 'success' ? 'border-green-200 bg-green-50' : ''}>
          {message.type === 'error' ? <AlertCircle className="h-4 w-4 text-red-600" /> :
           message.type === 'success' ? <CheckCircle className="h-4 w-4 text-green-600" /> :
           <AlertCircle className="h-4 w-4" />}
          <AlertDescription className={
            message.type === 'error' ? 'text-red-800' :
            message.type === 'success' ? 'text-green-800' : ''
          }>
            {message.text}
          </AlertDescription>
        </Alert>
      )}

      {/* Informações do arquivo atual */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <HardDrive className="h-5 w-5" />
            <span>Status dos Dados</span>
          </CardTitle>
          <CardDescription>
            Informações sobre seus dados salvos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <FileText className="h-4 w-4 text-blue-600" />
                <span className="font-medium">Arquivo</span>
              </div>
              <p className="text-sm text-gray-600">
                {fileInfo?.hasFile ? fileInfo.fileName : 'Nenhum arquivo selecionado'}
              </p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <BookOpen className="h-4 w-4 text-green-600" />
                <span className="font-medium">Total de Cards</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {fileInfo?.totalCards || 0}
              </p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Calendar className="h-4 w-4 text-purple-600" />
                <span className="font-medium">Último Salvamento</span>
              </div>
              <p className="text-sm text-gray-600">
                {fileInfo?.lastSync ? 
                  new Date(fileInfo.lastSync).toLocaleString('pt-BR') : 
                  'Nunca'
                }
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gerenciamento de arquivos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Salvar dados */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Save className="h-5 w-5" />
              <span>Salvar Dados</span>
            </CardTitle>
            <CardDescription>
              Escolha uma pasta para salvar seus dados
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={handleSelectFolder}
              disabled={loading}
              className="w-full"
            >
              <FolderOpen className="h-4 w-4 mr-2" />
              {fileInfo?.hasFile ? 'Alterar Pasta' : 'Selecionar Pasta'}
            </Button>
            
            {fileInfo?.hasFile && (
              <Button
                onClick={handleManualSave}
                disabled={loading}
                variant="outline"
                className="w-full"
              >
                <Save className="h-4 w-4 mr-2" />
                Salvar Agora
              </Button>
            )}
            
            <p className="text-xs text-gray-500">
              Os dados são salvos automaticamente a cada alteração
            </p>
          </CardContent>
        </Card>

        {/* Carregar dados */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Upload className="h-5 w-5" />
              <span>Carregar Dados</span>
            </CardTitle>
            <CardDescription>
              Importe seus dados de outro computador
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={handleLoadData}
              disabled={loading}
              variant="outline"
              className="w-full"
            >
              <Upload className="h-4 w-4 mr-2" />
              Carregar Arquivo
            </Button>
            
            <p className="text-xs text-gray-500">
              Selecione um arquivo studyapp-data.json para importar
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Backup */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Download className="h-5 w-5" />
            <span>Backup dos Dados</span>
          </CardTitle>
          <CardDescription>
            Crie uma cópia de segurança dos seus dados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={handleExportData}
            disabled={loading || !fileInfo?.totalCards}
            variant="outline"
          >
            <Download className="h-4 w-4 mr-2" />
            Exportar Backup
          </Button>
          <p className="text-xs text-gray-500 mt-2">
            Cria um arquivo de backup que pode ser usado em outro computador
          </p>
        </CardContent>
      </Card>

      {/* Instruções */}
      <Card className="bg-blue-50">
        <CardHeader>
          <CardTitle>Como usar</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p><strong>1. Primeira vez:</strong> Clique em "Selecionar Pasta" para escolher onde salvar seus dados</p>
          <p><strong>2. Backup:</strong> Use "Exportar Backup" para criar uma cópia de segurança</p>
          <p><strong>3. Outro computador:</strong> Use "Carregar Arquivo" para importar seus dados</p>
          <p><strong>4. Automático:</strong> Os dados são salvos automaticamente a cada alteração</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsPage;