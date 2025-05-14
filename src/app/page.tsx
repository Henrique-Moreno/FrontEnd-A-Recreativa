'use server';

import { redirect } from 'next/navigation';
import Image from 'next/image';
import AuthContainer from '@/components/auth/AuthContainer';
import { authService } from '@/app/lib/api/authService.server';
import styles from './page.module.css';

export default async function HomePage() {
  const isAuthenticated = await authService.isAuthenticated();
  if (isAuthenticated) {
    redirect('/dashboard');
  }

  return (
    <div className={styles.container}>
      <main className={styles.mainContent} role="main">
        <section className={styles.imageColumn} aria-label="Imagem ilustrativa dos personagens MIA">
          <Image
            src="https://educacao.arecreativa.com.br/wp-content/uploads/2024/07/MIA-Characters.png"
            alt="Ilustração dos personagens da MIA, representando o futuro personalizado da educação"
            width={600}
            height={600}
            quality={85}
            priority
            style={{
              objectFit: 'contain',
              maxWidth: '100%',
              height: 'auto',
            }}
          />
        </section>

        <section className={styles.formColumn} aria-label="Área de autenticação">
          <div>
            <h1 className={styles.title}>O FUTURO DA EDUCAÇÃO É PERSONALIZADO</h1>
            <p className={styles.subtitle}>
              Com a MIA, você tem a ferramenta ideal para transformar a educação de seus alunos
            </p>
            <AuthContainer />
          </div>
        </section>
      </main>
    </div>
  );
}