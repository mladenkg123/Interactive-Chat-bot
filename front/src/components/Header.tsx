//import HomePage from '../routes/HomePage';
//import React   from 'react';
//import { Link } from 'react-router-dom';

import { Link as ScrollLink } from 'react-scroll'; 
import Cookies from 'universal-cookie';
import Swal from 'sweetalert2';
import './Login';
import './headerCss.css';
import 'react-toastify/dist/ReactToastify.css';

const cookies = new Cookies();


type HeaderProps = {
  handleLoginClick: () => void;
  handleRegisterClick: () => void;
  handleSignOut: () => void;
  isAuthenticated: boolean; 
}


function Header({handleLoginClick, handleRegisterClick, handleSignOut, isAuthenticated  }: HeaderProps  ){

  const handleClickLog = () =>{
    handleLoginClick()
  }
  const handleClickReg = () =>{
    handleRegisterClick()
  }


  const handleSigningOut = () =>{
      Swal.fire({
        title: 'Signing Out',
        text: 'You have been successfully signed out.',
        icon: 'success',
        timer: 2000,            //TEST 
        timerProgressBar: true,
        didOpen: () => {
          Swal.showLoading();
        },
        willClose: () => {
          cookies.remove('jwt');
          handleSignOut();
        },
      }).then(() => {
      });
  }
  const preventLogin = () => {

    const jwtExists = cookies.get('jwt');
    
    if (jwtExists == undefined) {
      Swal.fire({
        title: 'Morate se ulogovati!',
        text: 'Morate se ulogovati kako bi pristupili ovoj stranici.',
        icon: 'error',
        showCancelButton: false,
        confirmButtonText: 'Zatvori',
        customClass: {
          confirmButton: 'swal-button swal-button--error'
        }
      }).then(() => {
        close();
      });
    }
    else {
      window.location.href = '/ChatBot'; 
    }
  }

  const svg = () => {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        
    <path d="M19.0675 7.74658C19.0349 7.68284 18.9837 7.63052 18.9207 7.59653L12.165 4.04097C12.1139 4.01406 12.0571 4 11.9993 4C11.9416 4 11.8847 4.01406 11.8336 4.04097L5.078 7.59653C5.01512 7.63053 4.96394 7.6827 4.93115 7.74622L11.9993 11.4668L19.0675 7.74658Z" fill="url(#paint0_linear_110_1179)"/>
    <path d="M11.9993 11.4668L11.9996 20C12.0574 20 12.1142 19.986 12.1653 19.9591L18.921 16.4035C18.9783 16.3734 19.0263 16.3281 19.0597 16.2726C19.0932 16.2172 19.1109 16.1536 19.1108 16.0889V7.91107C19.1102 7.8535 19.0952 7.79709 19.0675 7.74658L11.9993 11.4668Z" fill="url(#paint1_linear_110_1179)"/>
    <path d="M4.93115 7.74622C4.90364 7.79691 4.88893 7.85343 4.88818 7.9111V16.0889C4.88817 16.1537 4.90585 16.2172 4.93931 16.2727C4.97277 16.3281 5.02075 16.3734 5.07805 16.4036L11.8337 19.9591C11.8848 19.986 11.9419 20 11.9996 20L11.9993 11.4668L4.93115 7.74622Z" fill="url(#paint2_linear_110_1179)"/>
    <g filter="url(#filter0_bi_110_1179)">
    <path d="M22.6022 5.61982C22.5533 5.52422 22.4765 5.44573 22.382 5.39476L12.2487 0.0614479C12.1721 0.0210902 12.0868 0 12.0002 0C11.9135 0 11.8282 0.0210902 11.7516 0.0614479L1.61834 5.39476C1.52401 5.44576 1.44725 5.524 1.39807 5.61929L12.0002 11.2001L22.6022 5.61982Z" fill="#1D1D1D" fillOpacity="0.05"/>
    <path d="M22.6022 5.61982C22.5533 5.52422 22.4765 5.44573 22.382 5.39476L12.2487 0.0614479C12.1721 0.0210902 12.0868 0 12.0002 0C11.9135 0 11.8282 0.0210902 11.7516 0.0614479L1.61834 5.39476C1.52401 5.44576 1.44725 5.524 1.39807 5.61929L12.0002 11.2001L22.6022 5.61982Z" fill="url(#paint3_linear_110_1179)" fillOpacity="0.2"/>
    <path d="M12.0002 11.0306L1.62612 5.56982C1.64552 5.5536 1.66657 5.53926 1.68901 5.52707C1.68923 5.52695 1.68946 5.52682 1.68968 5.5267L11.8215 0.194186L11.8215 0.194165C11.8766 0.165159 11.9379 0.15 12.0002 0.15C12.0624 0.15 12.1237 0.165159 12.1788 0.194165L12.1788 0.194186L22.3108 5.52678C22.311 5.52689 22.3112 5.527 22.3114 5.52711C22.334 5.53934 22.3551 5.55377 22.3746 5.57011L12.0002 11.0306Z" stroke="url(#paint4_linear_110_1179)" strokeOpacity="0.1" strokeWidth="0.3"/>
    </g>
    <g filter="url(#filter1_bi_110_1179)">
    <path d="M12.0001 11.1999V23.9998C12.0867 23.9998 12.172 23.9788 12.2487 23.9385L22.3819 18.6052C22.4679 18.5599 22.5399 18.492 22.59 18.4088C22.6402 18.3256 22.6668 18.2303 22.6667 18.1332V5.86656C22.6658 5.7802 22.6437 5.69539 22.6022 5.61963L12.0001 11.1999Z" fill="#1D1D1D" fillOpacity="0.05"/>
    <path d="M12.0001 11.1999V23.9998C12.0867 23.9998 12.172 23.9788 12.2487 23.9385L22.3819 18.6052C22.4679 18.5599 22.5399 18.492 22.59 18.4088C22.6402 18.3256 22.6668 18.2303 22.6667 18.1332V5.86656C22.6658 5.7802 22.6437 5.69539 22.6022 5.61963L12.0001 11.1999Z" fill="url(#paint5_linear_110_1179)" fillOpacity="0.2"/>
    <path d="M22.5149 5.83507L12.1501 11.2904V23.8193C12.1598 23.8152 12.1694 23.8107 12.1788 23.8057L22.5149 5.83507ZM22.5149 5.83507C22.516 5.84581 22.5166 5.85662 22.5167 5.86747V18.1332V18.1332C22.5168 18.203 22.4977 18.2715 22.4616 18.3313C22.4256 18.3911 22.3738 18.4399 22.3121 18.4724C22.3121 18.4724 22.3121 18.4724 22.312 18.4724L12.1788 23.8057L22.5149 5.83507Z" stroke="url(#paint6_linear_110_1179)" strokeOpacity="0.1" strokeWidth="0.3"/>
    </g>
    <g filter="url(#filter2_bi_110_1179)">
    <path d="M1.39803 5.61914C1.35677 5.69517 1.33462 5.7801 1.3335 5.86661V18.1332C1.33348 18.2304 1.35999 18.3257 1.41018 18.4089C1.46038 18.492 1.53234 18.5599 1.61829 18.6052L11.7516 23.9385C11.8282 23.9788 11.9135 23.9999 12.0001 23.9999V11.1999L1.39803 5.61914Z" fill="#1D1D1D" fillOpacity="0.05"/>
    <path d="M1.39803 5.61914C1.35677 5.69517 1.33462 5.7801 1.3335 5.86661V18.1332C1.33348 18.2304 1.35999 18.3257 1.41018 18.4089C1.46038 18.492 1.53234 18.5599 1.61829 18.6052L11.7516 23.9385C11.8282 23.9788 11.9135 23.9999 12.0001 23.9999V11.1999L1.39803 5.61914Z" fill="url(#paint7_linear_110_1179)" fillOpacity="0.2"/>
    <path d="M11.8501 23.8194V11.2905L1.48543 5.83466C1.48431 5.8456 1.48367 5.85661 1.4835 5.86766V18.1332V18.1332C1.48348 18.2031 1.50254 18.2716 1.53862 18.3314L1.41018 18.4089L1.53862 18.3314C1.57468 18.3911 1.62639 18.4399 1.68816 18.4725L11.8501 23.8194ZM11.8501 23.8194C11.8404 23.8153 11.8308 23.8107 11.8214 23.8058C11.8214 23.8058 11.8214 23.8058 11.8214 23.8058L1.68819 18.4725L11.8501 23.8194Z" stroke="url(#paint8_linear_110_1179)" strokeOpacity="0.1" strokeWidth="0.3"/>
    </g>
    <defs>
    <filter id="filter0_bi_110_1179" x="-4.60193" y="-6" width="33.2042" height="23.2001" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
    <feFlood floodOpacity="0" result="BackgroundImageFix"/>
    <feGaussianBlur in="BackgroundImageFix" stdDeviation="3"/>
    <feComposite in2="SourceAlpha" operator="in" result="effect1_backgroundBlur_110_1179"/>
    <feBlend mode="normal" in="SourceGraphic" in2="effect1_backgroundBlur_110_1179" result="shape"/>
    <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
    <feOffset dy="1"/>
    <feGaussianBlur stdDeviation="1.5"/>
    <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
    <feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.15 0"/>
    <feBlend mode="normal" in2="shape" result="effect2_innerShadow_110_1179"/>
    </filter>
    <filter id="filter1_bi_110_1179" x="6.00012" y="-0.380371" width="22.6666" height="30.3802" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
    <feFlood floodOpacity="0" result="BackgroundImageFix"/>
    <feGaussianBlur in="BackgroundImageFix" stdDeviation="3"/>
    <feComposite in2="SourceAlpha" operator="in" result="effect1_backgroundBlur_110_1179"/>
    <feBlend mode="normal" in="SourceGraphic" in2="effect1_backgroundBlur_110_1179" result="shape"/>
    <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
    <feOffset dy="1"/>
    <feGaussianBlur stdDeviation="1.5"/>
    <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
    <feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.15 0"/>
    <feBlend mode="normal" in2="shape" result="effect2_innerShadow_110_1179"/>
    </filter>
    <filter id="filter2_bi_110_1179" x="-4.6665" y="-0.380859" width="22.6666" height="30.3807" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
    <feFlood floodOpacity="0" result="BackgroundImageFix"/>
    <feGaussianBlur in="BackgroundImageFix" stdDeviation="3"/>
    <feComposite in2="SourceAlpha" operator="in" result="effect1_backgroundBlur_110_1179"/>
    <feBlend mode="normal" in="SourceGraphic" in2="effect1_backgroundBlur_110_1179" result="shape"/>
    <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
    <feOffset dy="1"/>
    <feGaussianBlur stdDeviation="1.5"/>
    <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
    <feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.15 0"/>
    <feBlend mode="normal" in2="shape" result="effect2_innerShadow_110_1179"/>
    </filter>
    <linearGradient id="paint0_linear_110_1179" x1="4.88818" y1="4" x2="21.8577" y2="7.83023" gradientUnits="userSpaceOnUse">
    <stop stopColor="#75A5FF"/>
    <stop offset="0.703125" stopColor="#2339FF"/>
    </linearGradient>
    <linearGradient id="paint1_linear_110_1179" x1="4.88818" y1="4" x2="21.8577" y2="7.83023" gradientUnits="userSpaceOnUse">
    <stop stopColor="#75A5FF"/>
    <stop offset="0.703125" stopColor="#2339FF"/>
    </linearGradient>
    <linearGradient id="paint2_linear_110_1179" x1="4.88818" y1="4" x2="21.8577" y2="7.83023" gradientUnits="userSpaceOnUse">
    <stop stopColor="#75A5FF"/>
    <stop offset="0.703125" stopColor="#2339FF"/>
    </linearGradient>
    <linearGradient id="paint3_linear_110_1179" x1="1.39807" y1="0" x2="22.9953" y2="10.3823" gradientUnits="userSpaceOnUse">
    <stop stopColor="#87FFE1"/>
    <stop offset="0.776042" stopColor="#5C6DFF"/>
    </linearGradient>
    <linearGradient id="paint4_linear_110_1179" x1="2.0607" y1="0.509094" x2="22.6022" y2="0.509094" gradientUnits="userSpaceOnUse">
    <stop stopColor="#3CDEB6"/>
    <stop offset="0.65625" stopColor="#364AFF"/>
    </linearGradient>
    <linearGradient id="paint5_linear_110_1179" x1="12.0001" y1="5.61963" x2="25.0909" y2="7.54865" gradientUnits="userSpaceOnUse">
    <stop stopColor="#87FFE1"/>
    <stop offset="0.776042" stopColor="#5C6DFF"/>
    </linearGradient>
    <linearGradient id="paint6_linear_110_1179" x1="12.3335" y1="6.45509" x2="22.6667" y2="6.45509" gradientUnits="userSpaceOnUse">
    <stop stopColor="#3CDEB6"/>
    <stop offset="0.65625" stopColor="#364AFF"/>
    </linearGradient>
    <linearGradient id="paint7_linear_110_1179" x1="1.3335" y1="5.61914" x2="14.4243" y2="7.54811" gradientUnits="userSpaceOnUse">
    <stop stopColor="#87FFE1"/>
    <stop offset="0.776042" stopColor="#5C6DFF"/>
    </linearGradient>
    <linearGradient id="paint8_linear_110_1179" x1="1.66683" y1="6.45463" x2="12.0001" y2="6.45463" gradientUnits="userSpaceOnUse">
    <stop stopColor="#3CDEB6"/>
    <stop offset="0.65625" stopColor="#364AFF"/>
    </linearGradient>
    </defs>
    </svg> 
    );
  }
  return (
    <nav className="navbar">
      <div className="navbar-container">

        <div className="navbar-logo">
      <a href='/'>
         {svg()}
        <span>Cube-BOT</span>
        </a>
        </div>
        <ul className="nav-menu">
          <li className="nav-item">
            <a href="/">Pocetna</a>
          </li>
          <li className="nav-item">
          <ScrollLink to="pricingContainer" smooth={true} duration={500} offset={570} spy={true}>
              Cenovnik
          </ScrollLink>
          </li>
          <li className="nav-item">
          <ScrollLink to="aboutContainer" smooth={true} duration={500} offset={280} spy={true}>
              O nama
          </ScrollLink>
          </li>
          <li className="nav-item">
            <a onClick={preventLogin}>Chat-BOT</a>
          </li>
        </ul>
        <div className="auth-buttons">
          {isAuthenticated ? (
            <button className="btn btn-logout" onClick={handleSigningOut}>
              <i className="fas fa-sign-out-alt"></i> Sign Out
            </button>
          ) : (
            <>
              <button className="btn btn-login" onClick={handleClickLog}>
                <i className="fas fa-sign-in-alt"></i> Login
              </button>
              <button className="btn btn-signup" onClick={handleClickReg}>
                <i className="fas fa-user-plus"></i> Sign Up
              </button>
            </>
          )}
        </div>

      </div>
    </nav>
  );
}

export default Header;
