'use server';

import { redirect } from 'next/navigation';
import Header from '@/components/layout/Header';
import DynamicDashboard from '@/components/lesson-plan/DynamicDashboard';
import { authService } from '@/app/lib/api/authService.server';
import { Flex } from 'antd';

export default async function DashboardPage() {
  const isAuthenticated = await authService.isAuthenticated();
  if (!isAuthenticated) {
    redirect('/');
  }

  return (
    <Flex vertical style={{ minHeight: '100vh' }}>
      <Header />
      <main style={{ flex: 1 }}>
        <DynamicDashboard />
      </main>
    </Flex>
  );
}