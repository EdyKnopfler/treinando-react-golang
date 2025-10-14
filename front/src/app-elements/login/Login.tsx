import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../lib/auth/useAuth";
import { LoginForm } from "./LoginForm";
import style from './Login.module.less'

export function Login() {
   const auth = useContext(AuthContext);
   const navigate = useNavigate()

   const doLogout = async () => {
    await auth!.logout()
    navigate('/')
   }

   return (
    <div className={style.login}>
      {auth?.user 
        ? (
          <span className={style.loggedUser}>
            Bem-vindo, <b>{auth.user.name}</b>. |
            <button type="button" className={"button link " + style.buttonLink} onClick={doLogout}>Sair</button>
          </span>
        )
        : <LoginForm />
      }

    </div>
   )
}