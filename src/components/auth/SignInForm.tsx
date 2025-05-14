'use client';

import { useState, useEffect } from 'react';
import { Form, Input, Button, message } from 'antd';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/app/context/AuthContext';

const signInSchema = z.object({
  email: z.string().email({ message: 'E-mail inválido' }).min(1, { message: 'E-mail é obrigatório' }),
  password: z.string().min(6, { message: 'A senha deve ter pelo menos 6 caracteres' }),
});

type SignInFormData = z.infer<typeof signInSchema>;

export default function SignInForm() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [messageApi, contextHolder] = message.useMessage();
  const { login } = useAuth();

  const {
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onFinish = async (data: SignInFormData) => {
    setLoading(true);
    try {
      await login(data.email, data.password);
      setSuccess(true);
      reset();
    } catch (error) {
      setErrorMessage((error as Error).message || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (success) {
      messageApi.success('Login realizado com sucesso!');
    }
    if (errorMessage) {
      messageApi.error(errorMessage);
      setErrorMessage(null);
    }
  }, [success, errorMessage, messageApi]);

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
                type="email"
                placeholder="Digite seu e-mail"
                {...field}
                aria-label="E-mail"
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
                placeholder="Digite sua senha"
                {...field}
                aria-label="Senha"
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
            aria-label="Entrar"
          >
            Entrar
          </Button>
        </Form.Item>
      </Form>
    </>
  );
}