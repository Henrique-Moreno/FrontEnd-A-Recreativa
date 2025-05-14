'use client';

import { useState, useEffect } from 'react';
import { Table, Button, message, Spin, Space } from 'antd';
import { FilePdfOutlined, PlusOutlined } from '@ant-design/icons';
import { lessonPlanService } from '@/app/lib/api/lessonPlans';
import { ResourceObject, LessonPlanAttributes } from '@/app/lib/api/types';
import { useAuth } from '@/app/context/AuthContext';

interface LessonPlanListProps {
  onCreateNew: () => void;
  onSelectPlan: (id: string) => void;
}

export default function LessonPlanList({ onCreateNew, onSelectPlan }: LessonPlanListProps) {
  const [loading, setLoading] = useState(false);
  const [lessonPlans, setLessonPlans] = useState<ResourceObject<LessonPlanAttributes>[]>([]);
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
       
        setLessonPlans(Array.isArray(response.data) ? response.data : []);
        messageApi.success('Planos de aula carregados com sucesso!');
      } catch (error) {
        messageApi.error('Erro ao carregar planos de aula.');
      } finally {
        setLoading(false);
      }
    };

    fetchLessonPlans();
  }, [user?.id, messageApi]);

  const columns = [
    {
      title: 'Objetivos',
      dataIndex: ['attributes', 'objectives'],
      key: 'objectives',
      ellipsis: true,
    },
    {
      title: 'Atividades',
      dataIndex: ['attributes', 'activities'],
      key: 'activities',
      ellipsis: true,
    },
    {
      title: 'Avaliação',
      dataIndex: ['attributes', 'assessment'],
      key: 'assessment',
      ellipsis: true,
    },
    {
      title: 'Criado em',
      dataIndex: ['attributes', 'createdAt'],
      key: 'createdAt',
      render: (text: string) => new Date(text).toLocaleDateString('pt-BR'),
    },
    {
      title: 'Ações',
      key: 'actions',
      render: (_: any, record: ResourceObject<LessonPlanAttributes>) => (
        <Space>
          <Button
            type="link"
            icon={<FilePdfOutlined />}
            disabled={!record.attributes?.generatedDocumentFilePath}
            onClick={() => {
              const pdfUrl = record.attributes?.generatedDocumentFilePath;
              if (pdfUrl) {
                console.log('LessonPlanList: Baixando PDF:', pdfUrl);
                window.open(pdfUrl, '_blank');
              } else {
                messageApi.error('Nenhum PDF disponível para download.');
              }
            }}
          >
            Baixar PDF
          </Button>
          <Button
            type="link"
            onClick={() => {
              if (!record.id || typeof record.id !== 'string' || record.id.trim() === '') {
                console.error('LessonPlanList: ID do plano inválido:', record);
                messageApi.error('ID do plano de aula inválido.');
                return;
              }
              console.log('LessonPlanList: Gerando PDF para plano:', record.id);
              onSelectPlan(record.id);
            }}
          >
            Gerar PDF
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <>
      {contextHolder}
      <div style={{ padding: '24px' }}>
        <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between' }}>
          <h2>Meus Planos de Aula</h2>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={onCreateNew}
            aria-label="Criar novo plano de aula"
          >
            Criar Novo
          </Button>
        </div>
        <Spin spinning={loading}>
          <Table
            columns={columns}
            dataSource={lessonPlans}
            rowKey={record => record.id || 'unknown'}
            pagination={{ pageSize: 10 }}
            locale={{ emptyText: 'Nenhum plano de aula encontrado' }}
          />
        </Spin>
      </div>
    </>
  );
}