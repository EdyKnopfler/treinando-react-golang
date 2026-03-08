import { useContext, useState, type FormEvent } from 'react';
import { AuthContext } from '../../lib/auth/useAuth';
import styles from './FormLogin.module.less';

export function LoginForm() {
  const auth = useContext(AuthContext);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    const data = new FormData(event.currentTarget);
    const username = data.get('username') as string;
    const password = data.get('password') as string;

    const success = await auth?.login(username, password);

    if (!success) {
      setError('Falha no login. Verifique suas credenciais e tente novamente.');
    }
  };

  return (
    <>
      <form className={styles.loginForm} onSubmit={handleSubmit}>
        <fieldset>
          <label htmlFor="username">Usuário</label>
          <input type="text" id="username" name="username" required />

          <label htmlFor="password">Senha</label>
          <input type="password" id="password" name="password" required />

          <button type="submit">Entrar</button>
        </fieldset>
      </form>
      {error && <p className={styles.loginError}>{error}</p>}
    </>
  );
}