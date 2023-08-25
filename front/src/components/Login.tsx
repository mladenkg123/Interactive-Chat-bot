import './login.css'
import { useState } from 'react';
import { getExpireFromJWT } from '../logic/utils';
import Cookies, { Cookie as CookieType } from 'universal-cookie';
import Swal from 'sweetalert2';

type LoginProps = {
    isShowLogin : boolean;
    onCloseLogin : () => void;
    onLoginSuccess : () => void;
}
interface LoginResponse {
  jwt: string;
}

const cookies: CookieType = new Cookies();



const Login = ({ isShowLogin, onCloseLogin, onLoginSuccess } : LoginProps) => {
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  //const [isLoginSuccessful, setIsLoginSuccessful] = useState(false);
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
          throw new Error('Login failed'); // Throw an error to handle the unsuccessful response
        }
        return response.json() as Promise<LoginResponse>;
      })
      .then(data=> {
        onCloseLogin();
        onLoginSuccess();

        const expire = getExpireFromJWT(data.jwt);
        if (expire !== null) {
          const expirationDate = new Date(expire * 1000 + 100000);
          document.cookie = `jwt=${JSON.stringify(data.jwt)}; expires=${expirationDate.toUTCString()}; SameSite=None`;
         
          Swal.fire({
            title: 'Signing In',
            text: 'You have been successfully signed in.',
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
        //setIsLoginSuccessful(true);
      })
      .catch(error => {
        onCloseLogin();
        console.log(error)
        Swal.fire({
          title: 'Password Incorrect',
          text: 'The password you entered is incorrect.',
          icon: 'error',
          showCancelButton: false,
          confirmButtonText: 'Try Again',
          customClass: {
            confirmButton: 'swal-button swal-button--error'
          }
        });
      });
  };
  return (
    <div className={`${isShowLogin ? "active" : ""} show`}>
      <div className="login-form">
        <div className="form-box solid">
        <button className="close-button" onClick={onCloseLogin}>X</button>
          <form onSubmit={handleSubmit}>
            <h1 className="login-text">Sign In</h1>
            <label>E-mail</label>
            <br></br>
            <input className="login-box" value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="youremail@gmail.com" id="email" name="email" />
            <br></br>
            <label>Password</label>
            <br></br>
            <input className="login-box" value={pass} onChange={(e) => setPass(e.target.value)} type="password" placeholder="********" id="password" name="password" />
            <br></br>
            <input type="submit" value="LOGIN" className="login-btn" />
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
