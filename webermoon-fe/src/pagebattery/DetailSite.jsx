import { useState,  useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { SetJWT, GetJWT, GetRoleFromJWT } from '../config/configureJWT';



const SiteDetail1 = () => {
  const navigate = useNavigate();
  const { idSite } = useParams();
  const role = GetRoleFromJWT();

  const [loading, setLoading] = useState(true);
  const [payload, setPayload] = useState(null);
  
const [currentDate] = useState(new Date());

const datePart = currentDate.toLocaleDateString('id-ID', {
  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
});

const timePart = currentDate.toLocaleTimeString('en-GB', {
  hour: '2-digit', minute: '2-digit'
});

const formattedDate = `${datePart}, ${timePart}`;


  useEffect(() => {
    const fetchData = async () => {
      try {
        const jwtToken = GetJWT();
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/v2/data/site/${idSite}`,  {
          headers: { Authorization: `Bearer ${jwtToken}`, "Cache-Control": "no-cache" },
        });
        setPayload(response.data.result); // Set the API data to the state
        SetJWT(response.headers.authorization);

        setTimeout(() => {
          setLoading(false); // Stop loading after delay
        }, 100); 
      } catch (error) {
        console.error('Error fetching data:', error);
        setTimeout(() => {
          setLoading(false); // Stop loading after delay
        }, 100);  
      }
    };

    fetchData();
  });

  if(loading) {
    return (
      <div className='flex items-center justify-center relative w-screen h-[calc(100vh-111px)]'>
        <h1 className=" text-center font-bold text-2xl">Loading...</h1>
      </div>
    );
  }

  return (
    
    <div className="bg-gray-100  min-h-[calc(100vh-111px)] min-w-screen p-8">
      <div className="mt-4 text-l text-gray-500 text-center">
                  Last Updated : {formattedDate}
                </div>
      <div className="bg-gradient-to-r  from-gray-500 to-gray-700 text-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center">{payload.clusters1_name}</h2>
        <p className="text-center text-lg mt-2">Priority: {payload.prioritas}</p>
        <h3 className="text-center text-[30px] text-red-500  font-bold mt-2">{payload.is_drop ? "Drop" : "Not Drop"}</h3>
      
      </div>
      
      {/* Site Information Section */}
      <div className="mt-6 bg-white shadow-lg rounded-lg p-6">
        

        <h2 className="text-2xl font-bold text-red-600 mb-4">Site Details</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="flex flex-col">
            <span className="text-gray-500 font-semibold">Mitra:</span>
            <span className="text-lg">{payload.mitra}</span>
          </div>

          <div className="flex flex-col">
            <span className="text-gray-500 font-semibold">Regional:</span>
            <span className="text-lg">{payload.regional_name}</span>
          </div>

          <div className="flex flex-col">
            <span className="text-gray-500 font-semibold">Witel:</span>
            <span className="text-lg">{payload.witel_name}</span>
          </div>

          <div className="flex flex-col">
            <span className="text-gray-500 font-semibold">STO:</span>
            <span className="text-lg">{payload.sto_name}</span>
          </div>

          {/* <div className="flex flex-col">
            <span className="text-gray-500 font-semibold">ini diganti:</span>
            <span className="text-lg">{payload.ihld}</span>
          </div>

          <div className="flex flex-col">
            <span className="text-gray-500 font-semibold">ini juga ganti:</span>
            <span className="text-lg">{payload.catuan_id}</span>
          </div> */}

        </div>
      </div>

      {/* Status Section */}
      <div className="mt-6 bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Project Status</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-6">
          {[
            { label: "Plan Survey", value: payload.plan_survey },
            { label: "Survey", value: payload.survey },
            { label: "Plan Delivery", value: payload.plan_delivery },
            { label: "Delivery", value: payload.delivery },
            { label: "Plan Instalasi", value: payload.plan_instalasi },
            { label: "Instalasi", value: payload.instalasi },
            { label: "Plan Integrasi", value: payload.plan_integrasi },
            { label: "Integrasi", value: payload.integrasi },
          ].map(({ label, value }) => (
            <div key={label} className="flex flex-col bg-gray-200 p-4 rounded-lg">
              <span className="text-gray-600 font-semibold">{label}:</span>
              <span className="text-lg">{value ?? "N/A"}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Remark Section */}
      {payload.remark && (
        <div className="mt-6 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg">
          <h3 className="font-bold">Remark:</h3>
          <p>{payload.remark}</p>
        </div>
      )}

      {/* Back Button */}
      <div className="flex justify-center mt-6">
        <button
          onClick={() => navigate(-1)}
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg shadow-md"
        >
          Back
        </button>
        {role === "mitra" && (
            <button
            onClick={() => navigate(`/tabel1/site/request/${idSite}`)}
            className="bg-blue-600 hover:bg-blue-700 text-white ml-6 px-6 py-2 rounded-lg shadow-md"
            >
            Update
            </button>
        )}
      </div>
      
    </div>
  );
};

export default SiteDetail1;