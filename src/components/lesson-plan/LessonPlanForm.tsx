'use client';

import { useState } from 'react';
import { Form, Input, Button, message, Upload } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { lessonPlanService } from '@/app/lib/api/lessonPlans';
import { useAuth } from '@/app/context/AuthContext';
import { LessonPlanAttributes } from '@/app/lib/api/types';

interface LessonPlanFormProps {
  onSubmit: () => void;
  initialValues?: Partial<LessonPlanAttributes>;
  initialFile?: { file: File; fileType: 'pdf' | 'docx' };
  onFileSelect?: (file: File, type: 'pdf' | 'docx') => void;
}

export default function LessonPlanForm({ onSubmit, initialValues, initialFile, onFileSelect }: LessonPlanFormProps) {
  const [form] = Form.useForm();
  const [file, setFile] = useState<File | null>(initialFile?.file || null);
  const [fileType, setFileType] = useState<'pdf' | 'docx' | null>(initialFile?.fileType || null);
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();
  const [messageApi, contextHolder] = message.useMessage();

  const handleFileChange = (info: any) => {
    const selectedFile = info.file.originFileObj || info.file;
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
    onFileSelect?.(selectedFile, type);
  };

  const handleSubmit = async (values: Partial<LessonPlanAttributes>) => {
    if (!user?.id) {
      messageApi.error('Usuário não autenticado.');
      return;
    }

    if (!file || !fileType) {
      messageApi.error('Selecione um arquivo PDF ou DOCX.');
      return;
    }

    setSubmitting(true);
    try {
      const formData = {
        userId: user.id,
        objectives: values.objectives || '',
        activities: values.activities || '',
        assessment: values.assessment || '',
        originalDocument: file,
      };

      console.log('LessonPlanForm: Enviando plano de aula:', {
        userId: user.id,
        objectives: values.objectives,
        activities: values.activities,
        assessment: values.assessment,
        originalDocument: file.name,
      });

      const response = await lessonPlanService.createLessonPlan(formData);
      if (!response.id || typeof response.id !== 'string') {
        throw new Error('ID do plano de aula inválido retornado pela API.');
      }

      messageApi.success('Plano de aula criado com sucesso!');
      form.resetFields();
      setFile(null);
      setFileType(null);
      onSubmit();
    } catch (error: any) {
      console.error('LessonPlanForm: Erro ao criar plano de aula:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      const errorMessage = error.response?.data?.errors?.[0]?.detail || 'Erro ao criar o plano de aula. Tente novamente.';
      messageApi.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {contextHolder}
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={initialValues}
        disabled={submitting}
      >
        <Form.Item
          name="objectives"
          label="Objetivos"
          rules={[{ required: true, message: 'Por favor, insira os objetivos.' }]}
        >
          <Input.TextArea rows={4} />
        </Form.Item>
        <Form.Item
          name="activities"
          label="Atividades"
          rules={[{ required: true, message: 'Por favor, insira as atividades.' }]}
        >
          <Input.TextArea rows={4} />
        </Form.Item>
        <Form.Item
          name="assessment"
          label="Avaliação"
          rules={[{ required: true, message: 'Por favor, insira a avaliação.' }]}
        >
          <Input.TextArea rows={4} />
        </Form.Item>
        <Form.Item
          label="Documento Original"
          rules={[{ required: true, message: 'Por favor, selecione um arquivo.' }]}
        >
          <Upload
            accept=".pdf,.docx"
            beforeUpload={() => false}
            onChange={handleFileChange}
            fileList={file ? [{ uid: '-1', name: file.name, status: 'done' }] : []}
          >
            <Button icon={<UploadOutlined />}>Selecionar Arquivo</Button>
          </Upload>
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={submitting}>
            Criar Plano de Aula
          </Button>
        </Form.Item>
      </Form>
    </>
  );
}