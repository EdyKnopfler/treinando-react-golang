import { BrowserRouter, Routes, Route } from "react-router-dom"; 
import { Agenda } from './app-elements/agenda/Agenda'
import style from './App.module.less'
import { Home } from "./app-elements/home/Home";
import { AuthContext, useAuth } from "./lib/auth/useAuth";
import { Protected } from "./lib/auth/Protected";

function App() {
  const auth = useAuth();

  return (
    <div className={style.app}>
      <h1 className={style.title}>DÊRÇO Viagens</h1>

      <AuthContext.Provider value={auth}>
        <BrowserRouter>
        <Routes>
          <Route path='/auth'>
            {/* 
              <Route path='register' element={<Register />} />
              <Route path='login' element={<Login />} /> 
            */}
          </Route>
          <Route path="/agenda/:idAgenda" element={
            <Protected>
              <Agenda />
            </Protected>
            } /> 
          <Route path="/" element={<Home />} /> 
        </Routes> 
        </BrowserRouter>
      </AuthContext.Provider>
    </div>
  )
}

export default App
