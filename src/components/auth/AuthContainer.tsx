'use client';

import { Card, Typography, Flex, Spin, Button } from 'antd';
import { useState } from 'react';
import SignInForm from './SignInForm';
import SignUpForm from './SignUpForm';
import { useAuth } from '@/app/context/AuthContext';

export default function AuthContainer() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Flex justify="center" align="middle" style={{ height: '100vh' }}>
        <Spin size="large" />
      </Flex>
    );
  }

  if (isAuthenticated) {
    return null; 
  }

  if (!SignInForm || !SignUpForm) {
    return <div>Erro ao carregar o formulário de autenticação.</div>;
  }

  return (
    <Flex
      justify="center"
      align="middle"
      style={{ minHeight: '100vh', background: '#f0f2f5' }}
      role="main"
      aria-label="Área de autenticação"
    >
      <Card style={{ maxWidth: 400, width: '100%', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
        <Typography.Title level={3} style={{ textAlign: 'center', marginBottom: 24 }}>
          {mode === 'login' ? 'Iniciar Sessão' : 'Criar Conta'}
        </Typography.Title>
        {mode === 'login' ? <SignInForm /> : <SignUpForm />}
        <Flex justify="center" style={{ marginTop: 16 }}>
          <Button
            type="link"
            onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
            aria-label={
              mode === 'login'
                ? 'Ir para o formulário de registro'
                : 'Ir para o formulário de login'
            }
          >
            {mode === 'login'
              ? 'Ainda não tem uma conta? Vamos começar!'
              : 'Já tem uma conta? Faça login'}
          </Button>
        </Flex>
      </Card>
    </Flex>
  );
}