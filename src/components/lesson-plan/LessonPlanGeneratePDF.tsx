'use client';

import { useState, useEffect } from 'react';
import { Button, message, Spin } from 'antd';
import { lessonPlanService } from '@/app/lib/api/lessonPlans';
import type { ResourceObject, LessonPlanAttributes } from '@/app/lib/api/types';
import { useAuth } from '@/app/context/AuthContext';
import styles from './css/LessonPlanGeneratePDF.module.css';

interface LessonPlanGeneratePDFProps {
  lessonPlanId: string;
}

export default function LessonPlanGeneratePDF({ lessonPlanId }: LessonPlanGeneratePDFProps) {
  const [loading, setLoading] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [lessonPlan, setLessonPlan] = useState<ResourceObject<LessonPlanAttributes> | null>(null);
  const { user, isAuthenticated } = useAuth();
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    if (!isAuthenticated || !user) {
      messageApi.error('Usuário não autenticado.');
      return;
    }

    const fetchLessonPlan = async () => {
      if (!lessonPlanId || typeof lessonPlanId !== 'string' || lessonPlanId.trim() === '') {
        messageApi.error('ID do plano de aula inválido.');
        return;
      }

      setLoading(true);
      try {
        const response = await lessonPlanService.getLessonPlan(lessonPlanId);
        if (!response.attributes) {
          throw new Error('Atributos do plano de aula não encontrados.');
        }
        setLessonPlan(response);
        if (response.attributes.generatedDocumentId) {
          const url = `http://localhost:3001/uploads/${response.attributes.generatedDocumentId}`;
          setPdfUrl(url);
        }
      } catch (error: any) {
        messageApi.error(error.message || 'Erro ao carregar o plano de aula.');
      } finally {
        setLoading(false);
      }
    };

    fetchLessonPlan();
  }, [lessonPlanId, isAuthenticated, user, messageApi]);

  if (!isAuthenticated || !user) {
    return <div>Usuário não autenticado.</div>;
  }

  return (
    <>
      {contextHolder}
      <Spin spinning={loading}>
        <div className={styles.container}>
          <h3>Gerar PDF Padronizado</h3>
          {lessonPlan && lessonPlan.attributes ? (
            <>
              <div className={styles.planDetails}>
                <p><strong>Objetivos:</strong> {lessonPlan.attributes.objectives}</p>
                <p><strong>Atividades:</strong> {lessonPlan.attributes.activities}</p>
                <p><strong>Avaliação:</strong> {lessonPlan.attributes.assessment}</p>
              </div>
              {pdfUrl ? (
                <div className={styles.pdfViewer}>
                  <iframe
                    src={pdfUrl}
                    width="100%"
                    height="600px"
                    title="PDF Padronizado"
                    style={{ border: '1px solid #d9d9d9', borderRadius: '4px' }}
                  />
                  <Button
                    type="primary"
                    href={pdfUrl}
                    download
                    style={{ marginTop: '16px' }}
                  >
                    Baixar PDF
                  </Button>
                </div>
              ) : (
                <p>PDF já gerado automaticamente ao criar o plano de aula.</p>
              )}
            </>
          ) : (
            <p>Carregando plano de aula...</p>
          )}
        </div>
      </Spin>
    </>
  );
}