'use client';

import { useState, useEffect } from 'react';
import { message, Row, Col, Spin } from 'antd';
import LessonPlanPreview from './LessonPlanPreview';
import LessonPlanForm from './LessonPlanForm';
import { lessonPlanService } from '@/app/lib/api/lessonPlans';
import { LessonPlanAttributes } from '@/app/lib/api/types';

interface LessonPlanUploadProps {
  file: File;
  fileType: 'pdf' | 'docx';
  userId: string;
  onDocumentUploaded: (lessonPlanId: string) => void;
}

export default function LessonPlanUpload({ file, fileType, userId, onDocumentUploaded }: LessonPlanUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [lessonPlanId, setLessonPlanId] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<Partial<LessonPlanAttributes> | undefined>(undefined);
  const [submitTriggered, setSubmitTriggered] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  const handleFormSubmit = () => {
    setSubmitTriggered(true);
  };

  useEffect(() => {
    const createLessonPlan = async () => {
      if (!file || !fileType || !userId || !formValues || !submitTriggered) {
        console.error('LessonPlanUpload: Parâmetros inválidos ou formulário não submetido:', {
          file,
          fileType,
          userId,
          formValues,
          submitTriggered,
        });
        if (submitTriggered) {
          messageApi.error('Preencha todos os campos e selecione um arquivo válido.');
        }
        return;
      }

      if (!['pdf', 'docx'].includes(fileType)) {
        messageApi.error('Apenas arquivos PDF ou DOCX são suportados.');
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        messageApi.error('O arquivo deve ter no máximo 10MB.');
        return;
      }

      if (!formValues.objectives || !formValues.activities || !formValues.assessment) {
        messageApi.error('Todos os campos (objetivos, atividades, avaliação) são obrigatórios.');
        return;
      }

      setUploading(true);
      try {
        const formData = {
          userId,
          objectives: formValues.objectives,
          activities: formValues.activities,
          assessment: formValues.assessment,
          originalDocument: file,
        };

        const response = await lessonPlanService.createLessonPlan(formData);
        const uploadedLessonPlanId = response.id;
        if (!uploadedLessonPlanId || typeof uploadedLessonPlanId !== 'string') {
          throw new Error('ID do plano de aula inválido retornado pela API.');
        }
        setLessonPlanId(uploadedLessonPlanId);
        onDocumentUploaded(uploadedLessonPlanId);
        messageApi.success('Plano de aula criado com sucesso!');
      } catch (error: any) {
        console.error('LessonPlanUpload: Erro ao criar plano de aula:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
        });
        const errorMessage = error.response?.data?.errors?.[0]?.detail || 'Erro ao criar o plano de aula. Verifique os dados e tente novamente.';
        messageApi.error(errorMessage);
      } finally {
        setUploading(false);
        setSubmitTriggered(false);
      }
    };

    if (submitTriggered && formValues) {
      createLessonPlan();
    }
  }, [file, fileType, userId, formValues, submitTriggered, onDocumentUploaded, messageApi]);

  return (
    <>
      {contextHolder}
      <Spin spinning={uploading}>
        <div style={{ padding: '16px' }}>
          <Row gutter={16}>
            <Col span={12}>
              <h3 style={{ marginBottom: '16px' }}>Preview do Documento Original</h3>
              <LessonPlanPreview file={file} fileType={fileType} />
            </Col>
            <Col span={12}>
              <h3 style={{ marginBottom: '16px' }}>Preencher Plano de Aula</h3>
              <LessonPlanForm
                onSubmit={handleFormSubmit}
                initialFile={{ file, fileType }}
                initialValues={formValues}
              />
            </Col>
          </Row>
        </div>
      </Spin>
    </>
  );
}