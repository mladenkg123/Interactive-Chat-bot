import './register.css'
import { useState } from 'react';
import Swal from 'sweetalert2';
import Select from 'react-select';


type RegisterProps = {
    isShowRegister : boolean;
    onCloseRegister : () => void;
}

const Register = ({ isShowRegister, onCloseRegister} : RegisterProps) => {
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [username, setUsername] = useState('');
  const [plan, setPlan] = useState({ value: 'free', label: 'Free plan' });
  const options =  [
      { value: 'free', label: 'Free plan' },
      { value: 'pro', label: 'Pro plan' },
      { value: 'business', label: 'Biznis plan', },
    ];
  const handleSubmit = (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json'},
        body: JSON.stringify({ email: email, username: username, password: pass, plan: plan.value, role: "USER" })
    };
    fetch('http://localhost:8000/auth/register', requestOptions)
      .then(response => {
        if (!response.ok) {
          throw new Error('Registration failed'); // Throw an error to handle the unsuccessful response
        }
        return response;
      })
      .then(async () => {
          onCloseRegister();
          await Swal.fire({
            title: 'Registracija uspesna.',
            text: 'Uspesno ste registrovali svoj nalog.',
            icon: 'success',
            timer: 2000,
            timerProgressBar: true,
            didOpen: () => {
              Swal.showLoading();
            }
          }).then(() => {
          });
      })
      .catch(async error => {
        console.error(error);
        onCloseRegister();
        await Swal.fire({
          title: 'Registracija nije uspela.',
          text: 'Postoji greska prilikom vase registracije.',
          icon: 'error',
          showCancelButton: false,
          confirmButtonText: 'Pokušaj ponovo',
          customClass: {
            confirmButton: 'swal-button swal-button--error'
          }
        }).then((result) => {
          if (result.isConfirmed) {
            onCloseRegister();
          }
        });
  
      });
  }
  return (
    <div className={`${isShowRegister ? "active" : ""} show`}>
      <div className="register-form">
        <div className="form-box solid">
        <button className="close-button" onClick={onCloseRegister}>X</button> {/* Close button */}
          <form onSubmit={handleSubmit}>
            <h1 className="register-text">REGISTRACIJA</h1>
            <label style={{color:"white"}}>E-mail</label>
            <br></br>
            <input className="register-box" value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="vašemail@gmail.com" id="email" name="email" />
            <br></br>
            <label style={{color:"white"}}>Username</label>
            <br></br>
            <input className="register-box" value={username} onChange={(e) => setUsername(e.target.value)} type="username" placeholder="Vaš username" id="user" name="user" />
            <br></br>
            <label style={{color:"white"}}>Šifra</label>
            <br></br>
            <input className="register-box"  value={pass} onChange={(e) => setPass(e.target.value)} type="password" placeholder="********" id="password" name="password" />
            <br></br>
            <label style={{color:"white"}}>Vrsta naloga:</label>
            <Select 
             defaultValue={plan}
              onChange={setPlan}
              options={options}
              />
            <input type="submit" value="REGISTRUJ ME" className="register-btn" />
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
