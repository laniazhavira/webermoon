import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import Cookies from 'universal-cookie';

const LoginPage1 = () => {
    const navigate = useNavigate();
    // Initialize cookie
    const cookies = new Cookies();

    const [credentialError, setCredentialError] = useState("");
    const [loginInputs, setLoginInputs] = useState({name: "", password:""});

    const onChange = (e) => {
        setLoginInputs({ ...loginInputs, [e.target.id]: e.target.value });
        if (e.target.id === "username" || e.target.id === "password") setCredentialError("");
    }

    let { username, password } = loginInputs;

    const handleSubmit = async (e) => {    
        e.preventDefault();
        try {
          let response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/v1/auth/login`, 
            {
                username,
                password
            },
            {
            headers: {
              "Content-Type": "application/json",
              "Cache-Control": "no-cache"
            },
          });

            if (response.data.jwtToken) {
                login(response.data.jwtToken);
                navigate("/");
            } else {
                setCredentialError("JWT is empty");
            }
        } catch (error) {
        // Properly handle the error response
        if (error.response && error.response.data) {
            setCredentialError(error.response.data.message);
        } else {
            setCredentialError("Failed to log in. Please try again.");
        }
        // alert("Failed Log In. Please try again.");
        }
    };

    const login = (jwtToken) => {
        // Decode jwt token
        const decoded = jwtDecode(jwtToken);

        // Set cookie
        cookies.set("jwt_authorization", jwtToken, {
            expires: new Date(decoded.exp * 1000),
            path: "/"
        });       
    }

    return (
      <div className="flex bg-slate-100 min-h-screen min-w-screen">
        {/* Left Section */}
        <div className="w-6/12 flex flex-col items-center justify-center py-5 px-[15rem]">
          <img src="/images/image1.png" alt="Logo" className="w-40 mb-10" />
          <h2 className="text-3xl font-bold mb-4">Sign In Mini OLT</h2>
          <p className="mb-6">Enter your username and password to sign in</p>
          {credentialError && <p className="text-red-500 text text-center font-bold mb-4">{credentialError}</p>}
          <form onSubmit={handleSubmit} className="flex flex-col items-center justify-center w-full">
            <input
                type="text"
                id="username"
                name="loginInput"
                placeholder="Username"
                onChange={onChange}
                className="w-3/4 p-3 border-3 border-[#FFE7E7] rounded-lg mb-[28px] focus:outline-none bg-[#FCF2F2]"
            />
            <input
                type="password"
                id="password"
                name="loginInput"
                placeholder="Password"
                onChange={onChange}
                className="w-3/4 p-3 border-3 border-[#FFE7E7] rounded-lg mb-[28px] focus:outline-none bg-[#FCF2F2]"
            />
            <button className="w-3/4 bg-red-500 text-white p-[10px] rounded-lg font-bold hover:bg-red-600" type="submit">Log In</button>
          </form>
        </div>
        
        {/* Right Section */}
        <div className="w-6/12 h-screen relative py-16 pr-30">
            <div className="bg-red-300 rounded-[20px] w-full h-full">
                <img
                    src="/images/telkom-hub.png"
                    alt="Telkom Hub"
                    className="w-full h-full rounded-[20px] mix-blend-multiply opacity-75"
                />
            </div>
          <div className="absolute inset-0 bg-transparent bg-opacity-50 flex flex-col items-center justify-center text-white text-center p-4">
            <h2 className="text-[40px] font-bold mb-4">MINI OLT</h2>
            <p className="text-[32px]">Digital Infrastructure Development.</p>
          </div>
        </div>
      </div>
    );
  };
  
  export default LoginPage1;