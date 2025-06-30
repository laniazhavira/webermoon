import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import axios from 'axios';
import { SetJWT, GetJWT } from '../config/configureJWT';
import transformChartData from '../config/transformChartData';



const Integrasi1 = () => {
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const descriptionDropdownRef = useRef(null);
  const firstRender = useRef(true);
  
  
  const [selectedRegion, setSelectedRegion] = useState("");
  const [filterRegional, setFilterRegional] = useState("");
  const [listRegional, setListRegional] = useState([]);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [descriptionVisible, setDescriptionVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [payload, setPayload] = useState(null);
  const [chartData, setChartData] = useState([]);
const [currentDate] = useState(new Date());

const datePart = currentDate.toLocaleDateString('id-ID', {
  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
});

const timePart = currentDate.toLocaleTimeString('en-GB', {
  hour: '2-digit', minute: '2-digit'
});

const formattedDate = `${datePart}, ${timePart}`;

  // Description data
  const descriptions = {
    "Plan Integrasi": "Rencana pelaksanaan integrasi",
    "Realisasi Integrasi": "Status pelaksanaan integrasi yang sudah dilakukan",
    "Progress": "Persentase kemajuan dari proses integrasi",
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownVisible(false);
      }
      if (descriptionDropdownRef.current && !descriptionDropdownRef.current.contains(event.target)) {
        setDescriptionVisible(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      // Function to get regionals name and id
      const getRegionals = (data) => {
        return Object.fromEntries(
          Object.keys(data)
            .filter(key => key !== "Total" && key !== "id")
            .map(key => [key, { id: data[key].id }])
        );
      };

      try {
        const jwtToken = GetJWT();
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/v4/data/table`, {
          headers: { Authorization: `Bearer ${jwtToken}`, "Cache-Control": "no-cache" },
          params: { filterRegional, type: "regional" }
        });
        setPayload(response.data.result);

        const response_chart = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/v4/data/chart`, {
          headers: { Authorization: `Bearer ${jwtToken}`, "Cache-Control": "no-cache" },
          params: { filterRegional, status: "integrasi" }
        });
        SetJWT(response.headers.authorization);
        
        // Transform data for chart
        if (response_chart.data.result) {
          setChartData(transformChartData(response_chart.data.result, "Plan Integrasi", "Realisasi Integrasi"));
        }

        // Set listRegional only on first render
        if (firstRender.current) {
          setListRegional(getRegionals(response.data.result));
          firstRender.current = false; // Mark as executed
        }

        setTimeout(() => {
          setLoading(false);
        }, 100);
      } catch (error) {
        console.error('Error fetching data:', error);
        setTimeout(() => {
          setLoading(false);
        }, 100);
      }
    };

    fetchData();
  }, [filterRegional]);

  const handleFilterChange = (region, id) => {
    setSelectedRegion(region);
    setFilterRegional(id);
    setDropdownVisible(false);
  };

  const toggleDropdown = () => {
    setDropdownVisible(!dropdownVisible);
    setDescriptionVisible(false);
  };

  const toggleDescription = () => {
    setDescriptionVisible(!descriptionVisible);
    setDropdownVisible(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center relative w-screen h-[calc(100vh-111px)]">
        <h1 className="text-center font-bold text-2xl">Loading...</h1>
      </div>
    );
  }

  return (
    <div className="bg-gray-100  min-h-[calc(100vh-111px)] min-w-screen p-8">
      <div className="max-w-[100%] mx-auto">
        {/* Filter Buttons */}
        <div className="flex gap-4 mb-8 relative">
          <button 
            className="px-5 py-2.5 bg-red-500 text-white rounded-lg flex items-center gap-2 hover:bg-red-600 transition shadow-md"
            onClick={toggleDropdown}
          >
            Region Filter: {selectedRegion || 'All'} <span className="text-sm">▼</span>
          </button>
          
          {dropdownVisible && (
            <div 
              ref={dropdownRef}
              className="absolute top-full left-0 bg-white shadow-xl mt-2 w-48 rounded-lg z-50 overflow-hidden"
            >
              <button 
                className="block w-full text-left px-5 py-3 hover:bg-red-300 hover:text-white transition border-b"
                onClick={() => handleFilterChange("All Regions")}
              >
                All Regions
              </button>
              {Object.entries(listRegional).map(([key, value]) => (
                  <button
                    key={key}
                    className="block w-full text-left px-5 py-3 hover:bg-red-300 hover:text-white transition"
                    onClick={() => handleFilterChange(key, value.id)}
                  >
                    {key}
                  </button>
                ))}
            </div>
          )}

          <div className="relative">
            <button 
              className="px-6 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition shadow-md flex items-center gap-2"
              onClick={toggleDescription}
            >
              <span>Keterangan</span>
              <span className="text-sm">▼</span>
            </button>

            {descriptionVisible && (
              <div 
                ref={descriptionDropdownRef}
                className="absolute top-full left-0 bg-white shadow-xl mt-2 w-72 rounded-lg z-50 overflow-hidden"
              >
                {Object.entries(descriptions).map(([key, value], index) => (
                  <div key={index} className="p-4 border-b hover:bg-gray-50">
                    <h3 className="font-semibold text-gray-800">{key}</h3>
                    <p className="text-sm text-gray-600 mt-1">{value}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-8">
          {/* Left Table Section */}
          <div className="w-2/5 bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Integrasi Data</h2>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr>
                      <th className="bg-red-500 text-white border-b-2 border-red-600 px-6 py-3 text-center">Treg</th>
                      <th className="bg-red-500 text-white border-b-2 border-red-600 px-6 py-3 text-center" colSpan="2">INTEGRASI</th>
                    </tr>
                    <tr className="bg-red-500 text-white">
                      <th className="border-b-2 border-red-600 px-6 py-3"></th>
                      <th className="border-b-2 border-red-600 px-6 py-3">Plan</th>
                      <th className="border-b-2 border-red-600 px-6 py-3">Realisasi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payload && Object.entries(payload).map(([key, value]) => (
                      <tr key={key} className={`hover:bg-gray-50 ${key === "Total" ? 'font-bold bg-gray-50' : ''}`}>
                        <td className="text-center border-b border-gray-200 px-6 py-4">{key}</td>
                        <td className="border-b border-gray-200 px-6 py-4 text-center">{value.values[8]}</td>
                        <td className="border-b border-gray-200 px-6 py-4 text-center">{value.values[9]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="mt-4 text-l text-gray-500 text-center">
                  Last Updated : {formattedDate}
                </div>
              </div>
            </div>
          </div>

          {/* Right Chart Section */}
          <div className="w-3/5 bg-white rounded-xl shadow-lg overflow-hidden flex">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Kurva S Status Integrasi CSF OLT</h2>
              <div className="overflow-x-auto">
                <LineChart width={600} height={400} data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" label={{ value: 'Date', position: 'bottom' }} />
                  <YAxis label={{ value: 'Count', angle: -90, position: 'left' }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white',
                      border: '1px solid #ccc',
                      borderRadius: '4px'
                    }}
                  />
                  <Legend 
                    verticalAlign="top"
                    height={36}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="plan" 
                    stroke="#ef4444" 
                    name="Plan Integrasi"
                    strokeWidth={2}
                    dot={{ strokeWidth: 2 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="realisasi" 
                    stroke="#3b82f6" 
                    name="Realisasi Integrasi"
                    strokeWidth={2}
                    dot={{ strokeWidth: 2 }}
                  />
                </LineChart>
              </div>
              <div className="mt-4 text-l text-gray-500 text-center">
                  Last Updated : {formattedDate}
                </div>
            </div>
            <div className='flex flex-col items-center justify-center'>
                <h2 className='font-bold mb-5 text-[36px] text-red-500'>Notes</h2>
                <h2 className='font-bold w-2/3 text-center'>Null Value dan Value selain tanggal tidak termasuk ke dalam chart</h2>
            </div>
          </div>
        </div>

        {/* Back Button */}
        <div className="flex justify-end mt-8">
          <button 
            onClick={() => navigate(-1)}
            className="px-8 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition shadow-md flex items-center gap-2"
          >
            <span>Back</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Integrasi1;