'use client';

import { useState } from 'react';
import { message, Button, Spin } from 'antd';
import LessonPlanPreview from './LessonPlanPreview';
import { documentService } from '@/app/lib/api/documents';
import { useAuth } from '@/app/context/AuthContext';

export default function DocumentArchive() {
  const [file, setFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState<'pdf' | 'docx' | null>(null);
  const [uploading, setUploading] = useState(false);
  const [documentId, setDocumentId] = useState<string | null>(null);
  const { user, isAuthenticated } = useAuth();
  const [messageApi, contextHolder] = message.useMessage();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) {
      messageApi.error('Nenhum arquivo selecionado.');
      return;
    }

    const type = selectedFile.type === 'application/pdf' ? 'pdf' : selectedFile.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ? 'docx' : null;
    if (!type) {
      messageApi.error('Apenas arquivos PDF ou DOCX são suportados.');
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      messageApi.error('O arquivo deve ter no máximo 10MB.');
      return;
    }

    setFile(selectedFile);
    setFileType(type);
  };

  const handleUpload = async () => {
    if (!isAuthenticated || !user?.id) {
      messageApi.error('Usuário não autenticado.');
      return;
    }

    if (!file || !fileType) {
      messageApi.error('Selecione um arquivo válido.');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('userId', user.id);

      const response = await documentService.uploadFile(formData);
      if (!response.data || Array.isArray(response.data)) {
        throw new Error('Resposta da API inválida. Esperado um único documento.');
      }
      const uploadedDocumentId = response.data.id;
      if (!uploadedDocumentId || typeof uploadedDocumentId !== 'string') {
        throw new Error('ID do documento inválido retornado pela API.');
      }
      setDocumentId(uploadedDocumentId);
      messageApi.success('Documento carregado com sucesso!');
    } catch (error: any) {
      console.error('DocumentArchive: Erro ao carregar arquivo:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      const errorMessage = error.response?.data?.errors?.[0]?.detail || 'Erro ao carregar o documento. Tente novamente.';
      messageApi.error(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  if (!isAuthenticated || !user) {
    return <div>Usuário não autenticado.</div>;
  }

  return (
    <>
      {contextHolder}
      <Spin spinning={uploading}>
        <div>
          <input
            type="file"
            accept=".pdf,.docx"
            onChange={handleFileChange}
          />
          <Button
            onClick={handleUpload}
            disabled={!file}
          >
            Upload
          </Button>
          {file && fileType && (
            <div>
              <h3>Preview do Documento</h3>
              <LessonPlanPreview
                file={documentId ? `http://localhost:3001/uploads/${documentId}` : file}
                fileType={fileType}
              />
            </div>
          )}
        </div>
      </Spin>
    </>
  );
}