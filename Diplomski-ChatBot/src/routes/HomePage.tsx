import React, { useState } from "react";
import Header from '../components/Header'
import Hero from '../components/Hero'
import Footer from '../components/Footer'
import Login from '../components/Login'
import Register from "../components/Register";

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
                <Hero handleRegisterClick={handleRegisterClick} />
                <Footer/>
            </div>
        )
}

export default HomePage;