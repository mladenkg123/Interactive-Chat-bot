import { useEffect, useState } from "react";
import Header from '../components/Header'
import Hero from '../components/Hero'
import Footer from '../components/Footer'
import Login from '../components/Login'
import Register from "../components/Register";
import ParticleComponent from "../components/Particle";
import "./HomePage.css"; 
import Cookies from 'universal-cookie';



function HomePage(){

  const [isShowLogin, setIsShowLogin] = useState(true);
  const [isShowRegister, setIsShowRegister] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const cookies = new Cookies();
  useEffect(() => {
    const userId= cookies.get('jwt') as string;
    if (userId) {
      setIsAuthenticated(true); 
    }
  }, []); 

  const handleLoginClick = () => {
    setIsShowLogin((isShowLogin) => !isShowLogin);
  };
  const handleRegisterClick = () => {
    setIsShowRegister((isShowRegister) => !isShowRegister);
  };
  const handleSignOut = () => {
    setIsAuthenticated(false);
  };

 

        return(
            <div>
                <Header handleLoginClick={handleLoginClick} handleRegisterClick={handleRegisterClick} handleSignOut={handleSignOut} isAuthenticated={isAuthenticated} />
                <Login isShowLogin={isShowLogin} onCloseLogin={handleLoginClick}  onLoginSuccess={() => setIsAuthenticated(true)}/>
                <Register isShowRegister={isShowRegister} onCloseRegister={handleRegisterClick} isAuthenticated={()=>isAuthenticated}/>
                <div className="hero-container">
                  <ParticleComponent />
                  <div className="hero-content">
                    <Hero handleRegisterClick={handleRegisterClick}/>
                  </div>
                </div>
                <Footer/>
            </div>
        )
}

export default HomePage;