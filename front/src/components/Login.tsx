import './login.css'
import { useState } from 'react';
import { getExpireFromJWT } from '../logic/utils';
import Cookies from 'universal-cookie';
import Swal from 'sweetalert2';

type LoginProps = {
    isShowLogin : boolean;
    onCloseLogin : () => void;
    onLoginSuccess : () => void;
}
interface LoginResponse {
  jwt: string;
}

const cookies = new Cookies();



const Login = ({ isShowLogin, onCloseLogin, onLoginSuccess } : LoginProps) => {
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const handleSubmit = (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email, password: pass })
    };
    fetch('http://localhost:8000/auth/login', requestOptions)
      .then(response => {
        if (!response.ok) {
          throw new Error('Login failed'); 
        }
        return response.json() as Promise<LoginResponse>;
      })
      .then(async data=> {
        onCloseLogin();
        onLoginSuccess();

        const expire = getExpireFromJWT(data.jwt);
        if (expire !== null) {
          cookies.set('jwt', data.jwt);
         
          await Swal.fire({
            title: 'Prijavljivanje.',
            text: 'Uspešno ste se prijavili na vas nalog.',
            icon: 'success',
            timer: 2000,
            timerProgressBar: true,
            didOpen: () => {
              Swal.showLoading();
            },
            willClose: () => {
              cookies.set('jwt', data.jwt);
            },
          }).then(() => {
            onLoginSuccess();
          });
          
        }
      })
      .catch(async error => {
        onCloseLogin();
        console.error(error)
        await Swal.fire({
          title: 'Šifra nije tacna.',
          text: 'Šifra koju ste uneli je pogrešna.',
          icon: 'error',
          showCancelButton: false,
          confirmButtonText: 'Pokušaj ponovo',
          customClass: {
            confirmButton: 'swal-button swal-button--error'
          }
        }).then((result) => {
          if (result.isConfirmed) {
            onCloseLogin();
          }
        });
      });
  };
  return (
    <div className={`${isShowLogin ? "active" : ""} show`}>
      <div className="login-form">
        <div className="form-box solid">
        <button className="close-button1" onClick={onCloseLogin}>X</button>
          <form onSubmit={handleSubmit}>
            <h1 className="login-text">PRIJAVLJIVANJE</h1>
            <label style={{color:"white"}}>E-mail</label>
            <br></br>
            <input className="login-box" value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="vašemail@gmail.com" id="email" name="email" />
            <br></br>
            <label style={{color:"white"}}>Šifra</label>
            <br></br>
            <input className="login-box" value={pass} onChange={(e) => setPass(e.target.value)} type="password" placeholder="********" id="password" name="password" />
            <br></br>
            <input type="submit" value="ULOGUJ ME" className="login-btn" />
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
