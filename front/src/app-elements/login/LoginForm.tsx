import { useContext } from 'react';
import { AuthContext } from '../../lib/auth/useAuth';
import styles from './FormLogin.module.less';

export function LoginForm() {
  const auth = useContext(AuthContext);

  const doLogin = async (data: FormData) => {
    await auth?.login(data.get('username') as string, data.get('password') as string)
  }

  return (
    <form className={styles.loginForm} action={doLogin}>
      <fieldset>
        <label htmlFor="username">Usuário</label>
        <input type="text" id="username" name="username" required />

        <label htmlFor="password">Senha</label>
        <input type="password" id="password" name="password" required />

        <button>Entrar</button>
      </fieldset>
    </form>
  )
}