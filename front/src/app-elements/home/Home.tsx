import { useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../../lib/auth/useAuth";

export function Home() {

  const auth = useContext(AuthContext);

  return (
    <>
      <h2>Home Peide</h2>
      {!auth?.user && <p><button onClick={() => auth?.login('', '')}>Entrar</button></p>}
      {auth?.user && <p>{auth.user.name}, vá para a <Link to={`/agenda/${'id1'}`}>Agenda</Link></p>}
    </>
  )
}