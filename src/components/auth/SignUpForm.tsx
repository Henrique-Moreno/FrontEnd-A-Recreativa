'use client';

import { Button, Form, Input } from 'antd';
import { MailOutlined, LockOutlined } from '@ant-design/icons';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import message from 'antd/es/message';
import { useAuth } from '@/app/context/AuthContext';

const signUpSchema = z.object({
  email: z.string().email({ message: 'Por favor, insira um e-mail válido' }),
  password: z.string().min(6, { message: 'A senha deve ter no mínimo 6 caracteres' }),
});

type SignUpFormData = z.infer<typeof signUpSchema>;

export default function SignUpForm() {
  const [loading, setLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const { register } = useAuth();

  const {
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onFinish = async (data: SignUpFormData) => {
    setLoading(true);
    try {
      await register(data.email, data.password);
      messageApi.success('Registro realizado com sucesso! Faça login.');
    } catch (error) {
      messageApi.error(error instanceof Error ? error.message : 'Erro ao criar conta');
    } finally {
      setLoading(false);
      reset();
    }
  };

  return (
    <>
      {contextHolder}
      <Form onFinish={handleSubmit(onFinish)} layout="vertical">
        <Form.Item
          label="E-mail"
          validateStatus={errors.email ? 'error' : ''}
          help={errors.email?.message}
        >
          <Controller
            name="email"
            control={control}
            render={({ field }) => (
              <Input
                prefix={<MailOutlined />}
                placeholder="Digite seu e-mail"
                {...field}
                aria-label="E-mail"
                autoComplete="email"
              />
            )}
          />
        </Form.Item>
        <Form.Item
          label="Senha"
          validateStatus={errors.password ? 'error' : ''}
          help={errors.password?.message}
        >
          <Controller
            name="password"
            control={control}
            render={({ field }) => (
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Digite sua senha"
                {...field}
                aria-label="Senha"
                autoComplete="new-password"
              />
            )}
          />
        </Form.Item>
        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            block
            aria-label="Criar Conta"
          >
            Criar Conta
          </Button>
        </Form.Item>
      </Form>
    </>
  );
}