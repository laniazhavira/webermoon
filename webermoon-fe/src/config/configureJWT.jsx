import { jwtDecode } from 'jwt-decode';
import Cookies from 'universal-cookie';

const cookies  = new Cookies();

function SetJWT(authHeader) {
    if (authHeader && authHeader.startsWith("Bearer ")) {
        const jwtToken = authHeader.split(" ")[1];
        // Decode jwt token
        const decoded = jwtDecode(jwtToken);
        
        // Set cookie
        cookies.set("jwt_authorization", jwtToken, {
            expires: new Date(decoded.exp * 1000),
            path: "/"
        });  
    }
}

function GetJWT() {
    return cookies.get("jwt_authorization");
}

function RemoveJWT() {
    return cookies.remove("jwt_authorization", {path: "/"});
}

function GetRoleFromJWT() {
    const jwtToken = cookies.get("jwt_authorization");
    
    // Return if JWT is missing
    if (!jwtToken) {
        return null;
    }
    
    // Decode jwt token
    const decoded = jwtDecode(jwtToken);
    
    return decoded.user.role; 
}

function GetUsernameFromJWT() {
    // const navigate = useNavigate();
    const jwtToken = cookies.get("jwt_authorization");

    // Redirect to login if jwt is missing
    if (!jwtToken) {
        // navigate("/login");
        return null;
    }

    // Decode jwt token
    const decoded = jwtDecode(jwtToken);

    return decoded.user.username; 
}

function VerifyAuthentication() {
    const jwtToken = cookies.get("jwt_authorization");

    if (!jwtToken) {
        return null;
    }

    // Decode jwt token
    const decoded = jwtDecode(jwtToken);

    return decoded.user.username; 
}



export { SetJWT, GetJWT, GetRoleFromJWT, GetUsernameFromJWT, VerifyAuthentication, RemoveJWT }