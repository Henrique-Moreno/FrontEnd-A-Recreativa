'use client';

import { useState, useEffect } from 'react';
import { Menu, message } from 'antd';
import { UnorderedListOutlined, FormOutlined, FilePdfOutlined, UploadOutlined, AppstoreOutlined, FileOutlined } from '@ant-design/icons';
import LessonPlanList from './LessonPlanList';
import LessonPlanForm from './LessonPlanForm';
import LessonPlanGeneratePDF from './LessonPlanGeneratePDF';
import LessonPlanUpload from './LessonPlanUpload';
import LessonPlanManager from './LessonPlanManager';
import DocumentArchive from './DocumentArchive';
import { useAuth } from '@/app/context/AuthContext';
import type { MenuInfo } from 'rc-menu/lib/interface';

type DashboardSection = 'list' | 'create' | 'pdf' | 'upload' | 'manage' | 'archive';

export default function DynamicDashboard() {
  const [currentSection, setCurrentSection] = useState<DashboardSection>('list');
  const [selectedLessonPlanId, setSelectedLessonPlanId] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState<'pdf' | 'docx' | null>(null);
  const [uploadedDocumentId, setUploadedDocumentId] = useState<string | null>(null);
  const { user, isAuthenticated, isLoading } = useAuth();
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    if (currentSection === 'pdf' && !selectedLessonPlanId) {
      messageApi.warning('Selecione um plano de aula antes de visualizar o PDF.');
      setCurrentSection('list');
    }
    if (currentSection === 'upload' && !selectedFile) {
      messageApi.warning('Selecione um arquivo para carregar.');
      setCurrentSection('create');
    }
    if (currentSection === 'archive' && !selectedFile) {
      messageApi.warning('Selecione um arquivo para arquivar.');
      setCurrentSection('create');
    }
  }, [currentSection, selectedLessonPlanId, selectedFile, messageApi]);

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  if (!isAuthenticated || !user) {
    messageApi.error('Usuário não autenticado.');
    return <div>Usuário não autenticado.</div>;
  }

  const handleMenuClick = (e: MenuInfo) => {
    const key = e.key as DashboardSection;
    if ((key === 'upload' || key === 'archive') && !selectedFile) {
      messageApi.warning('Selecione um arquivo antes de prosseguir.');
      return;
    }
    setCurrentSection(key);
    if (key !== 'pdf') {
      setSelectedLessonPlanId(null);
    }
    if (key !== 'upload' && key !== 'archive') {
      setSelectedFile(null);
      setFileType(null);
      setUploadedDocumentId(null);
    }
  };

  const handleFileSelect = (file: File, type: 'pdf' | 'docx') => {
    if (!file || !['pdf', 'docx'].includes(type)) {
      messageApi.error('Selecione um arquivo PDF ou DOCX válido.');
      return;
    }
    setSelectedFile(file);
    setFileType(type);
  };

  const handleDocumentUploaded = (documentId: string) => {
    setUploadedDocumentId(documentId);
    setCurrentSection('create');
  };

  const handleFormSubmit = () => {
    if (selectedFile && fileType) {
      setCurrentSection('upload');
    } else {
      messageApi.warning('Selecione um arquivo para prosseguir com o upload.');
    }
  };

  const renderSection = () => {
    switch (currentSection) {
      case 'list':
        return (
          <LessonPlanList
            onCreateNew={() => setCurrentSection('create')}
            onSelectPlan={(id: string) => {
              if (!id || typeof id !== 'string' || id.trim() === '') {
                console.error('DynamicDashboard: ID inválido recebido em onSelectPlan:', id);
                messageApi.error('ID do plano de aula inválido.');
                return;
              }
              console.log('DynamicDashboard: LessonPlanList: Plano selecionado:', id);
              setSelectedLessonPlanId(id);
              setCurrentSection('pdf');
            }}
          />
        );
      case 'create':
        return (
          <LessonPlanForm
            onSubmit={handleFormSubmit}
            onFileSelect={handleFileSelect}
            initialValues={uploadedDocumentId ? { documentId: uploadedDocumentId } : undefined}
          />
        );
      case 'pdf':
        return selectedLessonPlanId && typeof selectedLessonPlanId === 'string' && selectedLessonPlanId.trim() !== '' ? (
          <LessonPlanGeneratePDF lessonPlanId={selectedLessonPlanId} />
        ) : (
          <div>Selecione um plano de aula para visualizar o PDF.</div>
        );
      case 'upload':
        return selectedFile && fileType ? (
          <LessonPlanUpload
            file={selectedFile}
            fileType={fileType}
            userId={user.id}
            onDocumentUploaded={handleDocumentUploaded}
          />
        ) : (
          <div>Selecione um arquivo para carregar.</div>
        );
      case 'manage':
        return (
          <LessonPlanManager
            onSelectPlan={(id: string) => {
              if (!id || typeof id !== 'string' || id.trim() === '') {
                console.error('DynamicDashboard: ID inválido recebido em onSelectPlan:', id);
                messageApi.error('ID do plano de aula inválido.');
                return;
              }
              console.log('DynamicDashboard: LessonPlanManager: Plano selecionado:', id);
              setSelectedLessonPlanId(id);
              setCurrentSection('pdf');
            }}
            onCreateNew={() => setCurrentSection('create')}
            onFileSelect={handleFileSelect}
          />
        );
      case 'archive':
        return selectedFile && fileType ? (
          <DocumentArchive />
        ) : (
          <div>Selecione um arquivo para arquivar.</div>
        );
      default:
        return (
          <LessonPlanList
            onCreateNew={() => setCurrentSection('create')}
            onSelectPlan={(id: string) => {
              if (!id || typeof id !== 'string' || id.trim() === '') {
                console.error('DynamicDashboard: ID inválido recebido em onSelectPlan:', id);
                messageApi.error('ID do plano de aula inválido.');
                return;
              }
              console.log('DynamicDashboard: LessonPlanList: Plano selecionado:', id);
              setSelectedLessonPlanId(id);
              setCurrentSection('pdf');
            }}
          />
        );
    }
  };

  return (
    <>
      {contextHolder}
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <Menu
          mode="inline"
          selectedKeys={[currentSection]}
          onClick={handleMenuClick}
          style={{ width: 256 }}
          items={[
            {
              key: 'list',
              icon: <UnorderedListOutlined />,
              label: 'Listar Planos',
            },
            {
              key: 'create',
              icon: <FormOutlined />,
              label: 'Criar Plano',
            },
            {
              key: 'pdf',
              icon: <FilePdfOutlined />,
              label: 'Visualizar PDF',
            },
            {
              key: 'upload',
              icon: <UploadOutlined />,
              label: 'Carregar Documento',
              disabled: !selectedFile,
            },
            {
              key: 'manage',
              icon: <AppstoreOutlined />,
              label: 'Gerenciar Planos',
            },
            {
              key: 'archive',
              icon: <FileOutlined />,
              label: 'Arquivar Documento',
              disabled: !selectedFile,
            },
          ]}
        />
        <div style={{ flex: 1, padding: '24px' }}>
          {renderSection()}
        </div>
      </div>
    </>
  );
}