'use client';

import { Button, Space, Typography } from 'antd';
import { LogoutOutlined } from '@ant-design/icons';
import { useAuth } from '@/app/context/AuthContext';

const { Text } = Typography;

export default function Header() {
  const { user, isLoading, error, logout } = useAuth();

  return (
    <header style={{ padding: '16px', background: '#fff', borderBottom: '1px solid #f0f0f0' }}>
      <Space style={{ justifyContent: 'space-between', width: '100%', display: 'flex' }}>
        <div>
          {isLoading ? (
            <Text type="secondary">Carregando...</Text>
          ) : error ? (
            <Text type="danger">{error}</Text>
          ) : user ? (
            <Text strong>Bem-vindo, {user.email}</Text>
          ) : (
            <Text type="secondary">Usuário não autenticado</Text>
          )}
        </div>
        {user && (
          <Button
            type="text"
            icon={<LogoutOutlined />}
            onClick={logout}
            danger
            aria-label="Sair"
          >
            Sair
          </Button>
        )}
      </Space>
    </header>
  );
}