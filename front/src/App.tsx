import { BrowserRouter, Routes, Route } from "react-router-dom"; 
import { Agenda } from './app-elements/agenda/Agenda'
import style from './App.module.less'
import { Home } from "./app-elements/home/Home";
import { AuthContext, useAuth } from "./lib/auth/useAuth";
import { Protected } from "./lib/auth/Protected";
import { Login } from "./app-elements/login/Login";

function App() {
  const auth = useAuth();

  return (
    <div className={style.app}>
      <h1 className={style.title}>DÊRÇO Viagens</h1>

      <AuthContext.Provider value={auth}>
        <BrowserRouter>
          <Login />
          
          <div className={style.page}>
            <Routes>
              <Route path='/auth'>
                {/* 
                  <Route path='register' element={<Register />} />
                */}
              </Route>
              <Route path="/agenda/:idAgenda" element={
                <Protected>
                  <Agenda />
                </Protected>
              } />
              <Route path="/" element={<Home />} />
            </Routes> 
          </div>
        </BrowserRouter>
      </AuthContext.Provider>
    </div>
  )
}

export default App
