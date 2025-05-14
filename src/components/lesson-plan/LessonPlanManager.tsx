'use client';

import { useState, useEffect } from 'react';
import { Button, message, Tabs, Spin } from 'antd';
import { FilePdfOutlined } from '@ant-design/icons';
import LessonPlanList from './LessonPlanList';
import LessonPlanPreview from './LessonPlanPreview';
import LessonPlanForm from './LessonPlanForm';
import { lessonPlanService } from '@/app/lib/api/lessonPlans';
import { ResourceObject, LessonPlanAttributes } from '@/app/lib/api/types';
import { useAuth } from '@/app/context/AuthContext';
import styles from './css/LessonPlanManager.module.css';

interface LessonPlanManagerProps {
  onSelectPlan: (id: string) => void;
  onCreateNew: () => void;
  onFileSelect: (file: File, type: 'pdf' | 'docx') => void;
}

export default function LessonPlanManager({ onSelectPlan, onCreateNew, onFileSelect }: LessonPlanManagerProps) {
  const [lessonPlans, setLessonPlans] = useState<ResourceObject<LessonPlanAttributes>[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<ResourceObject<LessonPlanAttributes> | null>(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    if (!user?.id) {
      messageApi.error('Usuário não autenticado.');
      return;
    }

    const fetchLessonPlans = async () => {
      setLoading(true);
      try {
        const response = await lessonPlanService.getLessonPlansByUserId(user.id);
        const plans = Array.isArray(response.data) ? response.data : [];
        setLessonPlans(plans);
      } catch (error: any) {
        messageApi.error('Erro ao carregar planos de aula.');
      } finally {
        setLoading(false);
      }
    };

    fetchLessonPlans();
  }, [user?.id, messageApi]);

  const handleSelectPlan = (id: string) => {
    const plan = lessonPlans.find((p) => p.id === id);
    if (plan) {
      setSelectedPlan(plan);
    }
  };

  const items = [
    {
      key: 'list',
      label: 'Lista de Planos',
      children: (
        <LessonPlanList
          onCreateNew={onCreateNew}
          onSelectPlan={(id) => {
            handleSelectPlan(id);
            onSelectPlan(id);
          }}
        />
      ),
    },
    {
      key: 'details',
      label: 'Detalhes do Plano',
      disabled: !selectedPlan,
      children: selectedPlan && selectedPlan.attributes ? (
        <div>
          <h3>Preview do Documento Original</h3>
          {selectedPlan.attributes.originalDocumentId ? (
            <LessonPlanPreview
              file={`http://localhost:3001/uploads/${selectedPlan.attributes.originalDocumentId}`}
              fileType="pdf"
            />
          ) : (
            <p>Nenhum documento original disponível.</p>
          )}
          <h3>Preview do PDF Gerado</h3>
          {selectedPlan.attributes.generatedDocumentId ? (
            <LessonPlanPreview
              file={`http://localhost:3001/uploads/${selectedPlan.attributes.generatedDocumentId}`}
              fileType="pdf"
            />
          ) : (
            <p>PDF gerado não disponível.</p>
          )}
          <h3>Editar Plano</h3>
          <LessonPlanForm
            initialValues={selectedPlan.attributes}
            onFileSelect={onFileSelect}
            onSubmit={() => messageApi.success('Plano atualizado com sucesso!')}
          />
          <Button
            type="primary"
            icon={<FilePdfOutlined />}
            onClick={() => selectedPlan.id && onSelectPlan(selectedPlan.id)}
            style={{ marginTop: 16 }}
          >
            Ver PDF Gerado
          </Button>
        </div>
      ) : (
        <p>Selecione um plano para visualizar os detalhes.</p>
      ),
    },
  ];

  return (
    <>
      {contextHolder}
      <div className={styles.managerContainer}>
        <Spin spinning={loading}>
          <Tabs items={items} defaultActiveKey="list" />
        </Spin>
      </div>
    </>
  );
}