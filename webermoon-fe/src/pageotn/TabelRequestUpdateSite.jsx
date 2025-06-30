import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { GetJWT, SetJWT } from "../config/configureJWT";

const UpdateSiteRequests1 = () => {

  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [payload, setPayload] = useState([]); // Initialize as an empty array
   
  useEffect(() => {
    const fetchData = async () => {
      try {
        const jwtToken = GetJWT();
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/V3/request/all1`,  {
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
  }, []);

    const formatDateToGMT7 = (isoString) => {
        if (!isoString) return "-"; // Handle null or undefined values

        const date = new Date(isoString);

        // Get the individual time components
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        const seconds = date.getSeconds().toString().padStart(2, '0');

        // Format the time manually with colon separator
        const formattedTime = `${hours}:${minutes}:${seconds}`;

        // Format the date part
        const formattedDate = date.toLocaleDateString("id-ID", {
            timeZone: "Asia/Jakarta",
            year: "numeric",
            month: "long",
            day: "numeric"
        });

        return `${formattedTime}, ${formattedDate}`;
    };  

  if(loading) {
    return (
      <div className='flex items-center justify-center relative w-screen h-[calc(100vh-111px)]'>
        <h1 className=" text-center font-bold text-2xl">Loading...</h1>
      </div>
    );
  }

  return (
    <div className="bg-gray-100  min-h-[calc(100vh-111px)] min-w-screen p-8">
      <h1 className="text-xl font-semibold flex justify-center mb-[2rem]">Update Site Requests</h1>
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-red-500 text-white">
                <th className="border border-gray-200 px-4 py-3">ID</th>
                <th className="border border-gray-200 px-4 py-3">Status</th>
                <th className="border border-gray-200 px-4 py-3">Cluster ID</th>
                <th className="border border-gray-200 px-4 py-3">Requested By</th>
                <th className="border border-gray-200 px-4 py-3">Requested At</th>
                <th className="border border-gray-200 px-4 py-3">Approved By</th>
                <th className="border border-gray-200 px-4 py-3">Approved At</th>
              </tr>
            </thead>
            <tbody>
              {payload.map((request) => (
                <tr key={request.id} className="odd:bg-gray-50 hover:bg-gray-200 transition duration-150 text-center cursor-pointer"
                onClick={() => navigate(`/site/request/detail/${request.id}`)}>
                  <td className="border border-gray-200 px-4 py-3">{request.id}</td>
                  <td className="border border-gray-200 px-4 py-3">{request.flow_status}</td>
                  <td className="border border-gray-200 px-4 py-3">{request.cluster_id}</td>
                  <td className="border border-gray-200 px-4 py-3">{request.requested_by}</td>
                  <td className="border border-gray-200 px-4 py-3 tracking-[0.1em]">{formatDateToGMT7(request.requested_at)}</td>
                  <td className="border border-gray-200 px-4 py-3">{request.approved_by ? request.approved_by : '-'}</td>
                  <td className="border border-gray-200 px-4 py-3 tracking-[0.1em]">{request.approved_at ? formatDateToGMT7(request.approved_at) : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UpdateSiteRequests1;