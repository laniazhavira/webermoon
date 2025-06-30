import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { GetRoleFromJWT, VerifyAuthentication } from './config/configureJWT';
import { useEffect } from 'react';

import TreeGraph from './pages/TreeGraph';
import UploadExcel from './pages/UploadExcel';
import Tabel from './pages/Tabel';
import Site from './pages/Site'; 
import Witel from './pages/Witel';
import Sto from './pages/Sto';
import Notyet from './pages/Notyet';
import Survey from './pages/Survey';
import Delivery from './pages/Delivery';
import Instalasi from './pages/Instalasi';
import Integrasi from './pages/Integrasi';
import Login from './pages/Login';
import SiteDetail from './pages/DetailSite';
import RequestUpdateSite from './pages/RequestUpdateSite';
import TabelRequestUpdateSite from './pages/TabelRequestUpdateSite';
import NotFound from './pages/404NotFound';
import DetailRequest from './pages/DetailRequest';
import AddSite from './pages/AddSite';
import Navbar from './navbar/NavbarMini';
import MainPage from './pages/mainpage';
import Navbarhome from './navbar/NavbarMainmenu';
import ExternalRedirect from "./pages/Externaldirect";


import TreeGraph1 from './pagebattery/TreeGraph';
import Navbar1 from './navbar/NavbarBattery';
import UploadExcel1 from './pagebattery/UploadExcel';
import Tabel1 from './pagebattery/Tabel';
import Site1 from './pagebattery/Site'; 
import Witel1 from './pagebattery/Witel';
import Sto1 from './pagebattery/Sto';
import Notyet1 from './pagebattery/Notyet';
import Survey1 from './pagebattery/Survey';
import Delivery1 from './pagebattery/Delivery';
import Instalasi1 from './pagebattery/Instalasi';
import Integrasi1 from './pagebattery/Integrasi';
import Login1 from './pagebattery/Login';
import SiteDetail1 from './pagebattery/DetailSite';
import RequestUpdateSite1 from './pagebattery/RequestUpdateSite';
import TabelRequestUpdateSite1 from './pagebattery/TabelRequestUpdateSite';
import DetailRequest1 from './pagebattery/DetailRequest';
import AddSite1 from './pagebattery/AddSite';

import TreeGraph2 from './pageotn/TreeGraph';
import Navbar2 from './navbar/NavbarOtn';
import UploadExcel2 from './pageotn/UploadExcel';
import Tabel2 from './pageotn/Tabel';
import Site2 from './pageotn/Site'; 
import Witel2 from './pageotn/Witel';
import Sto2 from './pageotn/Sto';
import Notyet2 from './pageotn/Notyet';
import Survey2 from './pageotn/Survey';
import Delivery2 from './pageotn/Delivery';
import Instalasi2 from './pageotn/Instalasi';
import Integrasi2 from './pageotn/Integrasi';
import Login2 from './pageotn/Login';
import SiteDetail2 from './pageotn/DetailSite';
import RequestUpdateSite2 from './pageotn/RequestUpdateSite';
import TabelRequestUpdateSite2 from './pageotn/TabelRequestUpdateSite';
import NotFound2 from './pageotn/404NotFound';
import DetailRequest2 from './pageotn/DetailRequest';
import AddSite2 from './pageotn/AddSite';

import TreeGraph3 from './pageolt/TreeGraph';
import Navbar3 from './navbar/NavbarOlt';
import UploadExcel3 from './pageolt/UploadExcel';
import Tabel3 from './pageolt/Tabel';
import Site3 from './pageolt/Site'; 
import Witel3 from './pageolt/Witel';
import Sto3 from './pageolt/Sto';
import Notyet3 from './pageolt/Notyet';
import Survey3 from './pageolt/Survey';
import Delivery3 from './pageolt/Delivery';
import Instalasi3 from './pageolt/Instalasi';
import Integrasi3 from './pageolt/Integrasi';
import Login3 from './pageolt/Login';
import SiteDetail3 from './pageolt/DetailSite';
import RequestUpdateSite3 from './pageolt/RequestUpdateSite';
import TabelRequestUpdateSite3 from './pageolt/TabelRequestUpdateSite';
import NotFound3 from './pageolt/404NotFound';
import DetailRequest3 from './pageotn/DetailRequest';
import AddSite3 from './pageolt/AddSite';



// eslint-disable-next-line react/prop-types
const NotAuthenticated = ({ children }) => {
  
  const isVerified = VerifyAuthentication(); // Check authentication
  
  useEffect(() => {
    if (isVerified) {
      localStorage.setItem("showAlert", JSON.stringify({
        status: true, 
        message: "You are already logged in!"
      }));
    }
  }, [isVerified]);
  
  return !isVerified ? children : <Navigate to="/" replace />;
};

// eslint-disable-next-line react/prop-types
const AuthenticateAdmin = ({ children }) => {
  
  const role = GetRoleFromJWT(); // Check authentication
  
  useEffect(() => {
    if (role !== "admin") {
      localStorage.setItem("showAlert", JSON.stringify({
        status: true, 
        message: "Login with admin account to access the page!"
      }));
    }
  }, [role]);
  
  return role === "admin" ? children : <Navigate to="/" replace />;
};

// eslint-disable-next-line react/prop-types
const AuthenticateMitra = ({ children }) => {
  
  const role = GetRoleFromJWT(); // Check authentication
  console.log(role);
  
  useEffect(() => {
    if (role !== "mitra") {
      localStorage.setItem("showAlert", JSON.stringify({
        status: true, 
        message: "Login with mitra account to access the page!"
      }));
    }
  }, [role]);
  
  return role === "mitra" ? children : <Navigate to="/" replace />;
};

// eslint-disable-next-line react/prop-types
const AuthenticateUser = ({ children }) => {
  
  const role = GetRoleFromJWT(); // Check authentication
  
  useEffect(() => {
    if (!role) {
      localStorage.setItem("showAlert", JSON.stringify({
        status: true, 
        message: "Login with user account to access the page!"
      }));
    }
  }, [role]);
  
  return role ? children : <Navigate to="/" replace />;
};


function App() {
  return (
    <Router>
      <Routes>
      {/* Halaman Utama */}
      <Route path="/" element={
        <>
        <Navbarhome />
        <MainPage />
        </>
      } />
      
      {/* Halaman TreeGraph */}
      <Route path="/miniolt/treegraph" element={
        <>
        <Navbar />
        <TreeGraph />
        </>
      } />
      <Route path="/tabel" element={
        <>
        <Navbar />
        <Tabel />
        </>
      } />
      <Route path="/tabel/witel" element={
        <>
        <Navbar />
        <Witel />
        </>
      } />
      <Route path="/tabel/sto" element={
        <>
        <Navbar />
        <Sto />
        </>
      } />
      <Route path="/tabel/site" element={
        <>
        <Navbar />
        <Site />
        </>
      } />
      <Route path="/tabel/site/add" element={
        <AuthenticateMitra>
        <Navbar />
        <AddSite />
        </AuthenticateMitra>
      } />
      <Route path="/tabel/site/detail/:idSite" element={
        <>
        <Navbar />
        <SiteDetail />
        </>
      } />
      <Route path="/tabel/site/request/:idSite" element={
        <AuthenticateUser>
        <Navbar />
        <RequestUpdateSite />
        </AuthenticateUser>
      } />
      <Route path="/tabel/request" element={
        <AuthenticateUser>
        <Navbar />
        <TabelRequestUpdateSite />
        </AuthenticateUser>
      } />
      <Route path="/site/request/detail/:idRequest" element={
        <AuthenticateUser>
        <Navbar />
        <DetailRequest />
        </AuthenticateUser>
      } />
      <Route path="/tabel/notyet" element={
        <>
        <Navbar />
        <Notyet />
        </>
      } />
      <Route path="/tabel/survey" element={
        <>
        <Navbar />
        <Survey />
        </>
      } />
      <Route path="/tabel/delivery" element={
        <>
        <Navbar />
        <Delivery />
        </>
      } />
      <Route path="/tabel/instalasi" element={
        <>
        <Navbar />
        <Instalasi />
        </>
      } />
      <Route path="/tabel/integrasi" element={
        <>
        <Navbar />
        <Integrasi />
        </>
      } />
      
      //pagebattery
      
      <Route path="/battery/treegraph" element={
        <>
        <Navbar1 />
        <TreeGraph1 />
        </>
      } />

      <Route path="/tabel1" element={
        <>
        <Navbar1 />
        <Tabel1 />
        </>
      } />
      <Route path="/tabel1/witel" element={
        <>
        <Navbar1 />
        <Witel1 />
        </>
      } />
      <Route path="/tabel1/sto" element={
        <>
        <Navbar1 />
        <Sto1 />
        </>
      } />
      <Route path="/tabel1/site" element={
        <>
        <Navbar1 />
        <Site1 />
        </>
      } />
      <Route path="/tabel1/site/add" element={
        <AuthenticateMitra>
        <Navbar1 />
        <AddSite1 />
        </AuthenticateMitra>
      } />
      <Route path="/tabel1/site/detail/:idSite" element={
        <>
        <Navbar1 />
        <SiteDetail1 />
        </>
      } />
      <Route path="/tabel1/site/request/:idSite" element={
        <AuthenticateUser>
        <Navbar1 />
        <RequestUpdateSite1 />
        </AuthenticateUser>
      } />
      <Route path="/tabel1/request" element={
        <AuthenticateUser>
        <Navbar1 />
        <TabelRequestUpdateSite1 />
        </AuthenticateUser>
      } />
      <Route path="/site1/request/detail/:idRequest" element={
        <AuthenticateUser>
        <Navbar1 />
        <DetailRequest1 />
        </AuthenticateUser>
      } />
      <Route path="/tabel1/notyet" element={
        <>
        <Navbar1 />
        <Notyet1 />
        </>
      } />
      <Route path="/tabel1/survey" element={
        <>
        <Navbar1 />
        <Survey1 />
        </>
      } />
      <Route path="/tabel1/delivery" element={
        <>
        <Navbar1 />
        <Delivery1 />
        </>
      } />
      <Route path="/tabel1/instalasi" element={
        <>
        <Navbar1 />
        <Instalasi1 />
        </>
      } />
      <Route path="/tabel1/integrasi" element={
        <>
        <Navbar1 />
        <Integrasi1 />
        </>
      } />
      
      //EDGE OTN//
      <Route path="/edgeotn/treegraph" element={
        <>
        <Navbar2 />
        <TreeGraph2 />
        </>
      } /> 
      

      <Route path="/tabel2" element={
        <>
        <Navbar2 />
        <Tabel2 />
        </>
      } />
      <Route path="/tabel2/witel" element={
        <>
        <Navbar2 />
        <Witel2 />
        </>
      } />
      <Route path="/tabel2/sto" element={
        <>
        <Navbar2 />
        <Sto2 />
        </>
      } />
      <Route path="/tabel2/site" element={
        <>
        <Navbar2 />
        <Site2 />
        </>
      } />
      <Route path="/tabel2/site/add" element={
        <AuthenticateMitra>
        <Navbar2 />
        <AddSite2 />
        </AuthenticateMitra>
      } />
      <Route path="/tabel2/site/detail/:idSite" element={
        <>
        <Navbar2 />
        <SiteDetail2 />
        </>
      } />
      <Route path="/tabel2/site/request/:idSite" element={
        <AuthenticateUser>
        <Navbar2 />
        <RequestUpdateSite2 />
        </AuthenticateUser>
      } />
      <Route path="/tabel2/request" element={
        <AuthenticateUser>
        <Navbar2 />
        <TabelRequestUpdateSite2 />
        </AuthenticateUser>
      } />
      <Route path="/site2/request/detail/:idRequest" element={
        <AuthenticateUser>
        <Navbar2 />
        <DetailRequest2 />
        </AuthenticateUser>
      } />
      <Route path="/tabel2/notyet" element={
        <>
        <Navbar2 />
        <Notyet2 />
        </>
      } />
      <Route path="/tabel2/survey" element={
        <>
        <Navbar2 />
        <Survey2 />
        </>
      } />
      <Route path="/tabel2/delivery" element={
        <>
        <Navbar2 />
        <Delivery2 />
        </>
      } />
      <Route path="/tabel2/instalasi" element={
        <>
        <Navbar2 />
        <Instalasi2 />
        </>
      } />
      <Route path="/tabel2/integrasi" element={
        <>
        <Navbar2 />
        <Integrasi2 />
        </>
      } />


     //PAGE OLT
      
      <Route path="/olt/treegraph" element={
        <>
        <Navbar />
        <TreeGraph3 />
        </>
      } />

      <Route path="/tabel3" element={
        <>
        <Navbar3 />
        <Tabel3 />
        </>
      } />
      <Route path="/tabel3/witel" element={
        <>
        <Navbar3 />
        <Witel3 />
        </>
      } />
      <Route path="/tabel3/sto" element={
        <>
        <Navbar3 />
        <Sto3 />
        </>
      } />
      <Route path="/tabel3/site" element={
        <>
        <Navbar3 />
        <Site3 />
        </>
      } />
      <Route path="/tabel3/site/add" element={
        <AuthenticateMitra>
        <Navbar3 />
        <AddSite3 />
        </AuthenticateMitra>
      } />
      <Route path="/tabel3/site/detail/:idSite" element={
        <>
        <Navbar3 />
        <SiteDetail3 />
        </>
      } />
      <Route path="/tabel3/site/request/:idSite" element={
        <AuthenticateUser>
        <Navbar3 />
        <RequestUpdateSite3 />
        </AuthenticateUser>
      } />
      <Route path="/tabel3/request" element={
        <AuthenticateUser>
        <Navbar3 />
        <TabelRequestUpdateSite3 />
        </AuthenticateUser>
      } />
      <Route path="/site3/request/detail/:idRequest" element={
        <AuthenticateUser>
        <Navbar3 />
        <DetailRequest3 />
        </AuthenticateUser>
      } />
      <Route path="/tabel3/notyet" element={
        <>
        <Navbar3 />
        <Notyet3 />
        </>
      } />
      <Route path="/tabel3/survey" element={
        <>
        <Navbar3 />
        <Survey3 />
        </>
      } />
      <Route path="/tabel3/delivery" element={
        <>
        <Navbar3 />
        <Delivery3 />
        </>
      } />
      <Route path="/tabel3/instalasi" element={
        <>
        <Navbar3 />
        <Instalasi3 />
        </>
      } />
      <Route path="/tabel3/integrasi" element={
        <>
        <Navbar3 />
        <Integrasi3 />
        </>
      } />


      
      
      <Route path="/redirect" element={<ExternalRedirect url="https://minitok.scmt-telkom.com/login" />} />
      
      
      <Route path="/about" element={
        <div className='bg-red-200 h-screen w-screen items-center flex justify-center'>
        <h1 className='font-bold text-center text-xl'>Under Construction</h1>
        </div>
      } />
      <Route path="/miniolt/upload" element={
        <AuthenticateAdmin>
        <Navbar />
        <UploadExcel />
        </AuthenticateAdmin>
      } />

      <Route path="/battery/upload" element={
        <AuthenticateAdmin>
        <Navbar1 />
        <UploadExcel1 />
        </AuthenticateAdmin>
      } />

       <Route path="/edgeotn/upload" element={
        <AuthenticateAdmin>
        <Navbar2 />
        <UploadExcel2 />
        </AuthenticateAdmin>
      } />
      
      <Route path="/olt/upload" element={
        <AuthenticateAdmin>
        <Navbar3 />
        <UploadExcel3 />
        </AuthenticateAdmin>
      } />
      
      
      <Route path="/login" element={
        <NotAuthenticated>
        <Login />
        </NotAuthenticated>
      } />
      <Route path="*" element={<NotFound />} />
      </Routes>
      </Router>
    );
  }
  
  export default App
  