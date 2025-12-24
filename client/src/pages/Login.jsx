import {useState} from "react";
import api from "../api/axios";

import {useNavigate} from "react-router-dom";
import {useAuth} from "../context/authcontext";

const Login=()=>{
    const [email,setemail]=useState("");
    const [password,setpassword]=useState("");
    const [error,seterror]=useState("");

    const {login}=useAuth();
    const navigate=useNavigate();

    const handlesumbit=async(e)=>{
        e.preventDefault();
        try{
            const res=await api.post("/auth/login",{
                email,password
            })

            login(res.data.user);
            navigate("/groups");
        }
        catch(err){
            seterror(err.response?.data?.message || "Login failed");
        }
    };

    return(
        <div>
            <h2>Login</h2>
            {error && <p style={{ color: "red" }}>{error}</p>}

      <form onSubmit={handlesumbit}>
        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setemail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setpassword(e.target.value)}
        />

        <button type="submit">Login</button>
      </form>
        </div>
    );
}
export default Login;