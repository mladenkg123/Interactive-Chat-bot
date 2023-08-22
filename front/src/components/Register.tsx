import './register.css'
import { useState } from 'react';


type RegisterProps = {
    isShowRegister : boolean;
    onCloseRegister : () => void;
}

const Register = ({ isShowRegister, onCloseRegister} : RegisterProps) => {
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  //const [isRegisterSuccessful, setIsRegisterSuccessful] = useState(false);
  const handleSubmit = (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json'},
        body: JSON.stringify({ email: email, password: pass })
    };
    fetch('http://localhost:8000/auth/register', requestOptions)
      .then(response => {
        if (!response.ok) {
          throw new Error('Registration failed'); // Throw an error to handle the unsuccessful response
        }
        return response;
      })
      .then(data => {
          //setIsRegisterSuccessful(true);
          console.log(data);
      })
      .catch(error => {
        console.log(error); // Handle the error appropriately (e.g., show an error message)
      });
  }
  return (
    <div className={`${isShowRegister ? "active" : ""} show`}>
      <div className="register-form">
        <div className="form-box solid">
        <button className="close-button" onClick={onCloseRegister}>X</button> {/* Close button */}
          <form onSubmit={handleSubmit}>
            <h1 className="register-text">Register</h1>
            <label>E-mail</label>
            <br></br>
            <input className="register-box" value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="youremail@gmail.com" id="email" name="email" />
            <br></br>
            <label>Password</label>
            <br></br>
            <input className="register-box"  value={pass} onChange={(e) => setPass(e.target.value)} type="password" placeholder="********" id="password" name="password" />
            <br></br>
            <input type="submit" value="REGISTER" className="register-btn" />
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
