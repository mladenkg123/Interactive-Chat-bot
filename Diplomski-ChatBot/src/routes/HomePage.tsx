import React, { useState } from "react";
import Particles from "react-particles";
import Header from '../components/Header'
import Hero from '../components/Hero'
import Footer from '../components/Footer'
import Login from '../components/Login'
import Register from "../components/Register";
import ParticleComponent from "../components/Particle";
import "./HomePage.css"; 



function HomePage(){

  const [isShowLogin, setIsShowLogin] = useState(true);
  const [isShowRegister, setIsShowRegister] = useState(true);
  

  const handleLoginClick = () => {
    setIsShowLogin((isShowLogin) => !isShowLogin);
  };
  const handleRegisterClick = () => {
    setIsShowRegister((isShowRegister) => !isShowRegister);
  };

        return(
            <div>
                <Header handleLoginClick={handleLoginClick} handleRegisterClick={handleRegisterClick}/>
                <Login isShowLogin={isShowLogin} onCloseLogin={handleLoginClick} />
                <Register isShowRegister={isShowRegister} onCloseRegister={handleRegisterClick}/>
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