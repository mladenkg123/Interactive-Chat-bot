import './login.css'

type LoginProps = {
    isShowLogin : boolean;
    onCloseLogin : () => void;
}

const Login = ({ isShowLogin, onCloseLogin} : LoginProps) => {
  return (
    <div className={`${isShowLogin ? "active" : ""} show`}>
      <div className="login-form">
        <div className="form-box solid">
        <button className="close-button" onClick={onCloseLogin}>X</button>
          <form>
            <h1 className="login-text">Sign In</h1>
            <label>Username</label>
            <br></br>
            <input type="text" name="username" className="login-box" />
            <br></br>
            <label>Password</label>
            <br></br>
            <input type="password" name="password" className="login-box" />
            <br></br>
            <input type="submit" value="LOGIN" className="login-btn" />
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
