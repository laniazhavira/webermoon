import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { SetJWT, GetJWT } from '../config/configureJWT';



const Site2 = () => {
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  

  const location = useLocation();
  const { selectedWitel, selectedSto } = location.state || {};
  
  const sections = {
    ALL: { name: "All Sections", cols: 12 },
    NOT_YET: { name: "Not Yet", cols: 2 },
    SURVEY: { name: "Survey", cols: 2 },
    DELIVERY: { name: "Delivers", cols: 2 },
    INSTALASI: { name: "Instalasi", cols: 2 },
    INTEGRASI: { name: "Integrasi", cols: 2 },
  };

  const [selectedSite, setSelectedSite] = useState("");
  const [selectedSection, setSelectedSection] = useState("ALL");
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [sectionDropdownVisible, setSectionDropdownVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [payload, setPayload] = useState(null);
  const [listSite, setListSite] = useState([]);
  const [filterSite, setFilterSite] = useState('');

const [currentDate] = useState(new Date());

const datePart = currentDate.toLocaleDateString('id-ID', {
  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
});

const timePart = currentDate.toLocaleTimeString('en-GB', {
  hour: '2-digit', minute: '2-digit'
});

const formattedDate = `${datePart}, ${timePart}`;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownVisible(false);
        setSectionDropdownVisible(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Function to get stos name and id
        const getSites = (data) => {
          return data.map(site => ({name: site.name, id: site.id}))
        };

        const jwtToken = GetJWT();
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/v3/data/site`,  {
          headers: { Authorization: `Bearer ${jwtToken}`, "Cache-Control": "no-cache" },
          params: { filterSto: selectedSto, filterWitel: selectedWitel }
        });
        setPayload(response.data.result); // Set the API data to the state
        SetJWT(response.headers.authorization);
        setListSite(getSites(response.data.result));
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const jwtToken = GetJWT();
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/v3/data/site`,  {
          headers: { Authorization: `Bearer ${jwtToken}`, "Cache-Control": "no-cache" },
          params: { filterSto: selectedSto, filterWitel: selectedWitel, filterSite }
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
  }, [filterSite, selectedSto, selectedWitel]);

  const handleFilterChange = (site, id) => {
    console.log(listSite);
    setSelectedSite(site);
    setFilterSite(id);
    setDropdownVisible(false);
  };

  const handleSectionChange = (section) => {
    setSelectedSection(section);
    setSectionDropdownVisible(false);
  };

  const toggleDropdown = () => {
    setDropdownVisible(!dropdownVisible);
    setSectionDropdownVisible(false);
  };

  const toggleSectionDropdown = () => {
    setSectionDropdownVisible(!sectionDropdownVisible);
    setDropdownVisible(false);
  };



const renderTableHeaders = () => {
    const headers = [];
    
    if (selectedSection === 'ALL' || selectedSection === 'NOT_YET') {
      headers.push(<th key="not-yet" className="border px-4 py-3" colSpan="2">NOT YET</th>);
    }
    if (selectedSection === 'ALL' || selectedSection === 'SURVEY') {
      headers.push(<th key="survey" className="border px-4 py-3" colSpan="2">SURVEY</th>);
    }
    if (selectedSection === 'ALL' || selectedSection === 'DELIVERY') {
      headers.push(<th key="delivers" className="border px-4 py-3" colSpan="2">DELIVERY</th>);
    }
    if (selectedSection === 'ALL' || selectedSection === 'INSTALASI') {
      headers.push(<th key="instalasi" className="border px-4 py-3" colSpan="2">INSTALASI</th>);
    }
    if (selectedSection === 'ALL' || selectedSection === 'INTEGRASI') {
      headers.push(<th key="integrasi" className="border px-4 py-3" colSpan="2">INTEGRASI</th>);
    }
    return headers;
};

const renderSubHeaders = () => {
    const subHeaders = [];
    
    if (selectedSection === 'ALL' || selectedSection === 'NOT_YET') {
      subHeaders.push(
        <th key="drop1" className="border px-4 py-3">Drop</th>,
        <th key="relokasi1" className="border px-4 py-4">Relokasi</th>
      );
    }
    if (selectedSection === 'ALL' || selectedSection === 'SURVEY') {
      subHeaders.push(
        <th key="plan1" className="border px-4 py-3">Plan</th>,
        <th key="realisasi1" className="border px-4 py-3">Realisasi</th>
      );
    }
    if (selectedSection === 'ALL' || selectedSection === 'DELIVERY') {
      subHeaders.push(
        <th key="plan2" className="border px-4 py-3">Plan</th>,
        <th key="realisasi2" className="border px-4 py-3">Realisasi</th>
      );
    }
    if (selectedSection === 'ALL' || selectedSection === 'INSTALASI') {
      subHeaders.push(
        <th key="plan3" className="border px-4 py-3">Plan</th>,
        <th key="realisasi3" className="border px-4 py-3">Realisasi</th>
      );
    }
    if (selectedSection === 'ALL' || selectedSection === 'INTEGRASI') {
      subHeaders.push(
        <th key="plan4" className="border px-4 py-3">Plan</th>,
        <th key="realisasi4" className="border px-4 py-3">Realisasi</th>
      );
    }

    return subHeaders;
};

const handleSiteClick = (idSite) => {
  navigate(`/tabel2/site/detail/${idSite}`);
};

const addSite = () => {
  navigate("/tabel2/site/add", { state: { selectedWitel, selectedSto} });
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

      <div className="max-w-[98%] mx-auto">
        <h2 className="text-2xl font-bold text-gray-700 mb-2 text-center">
          Tabel Edge OTN - Site
        </h2>
        <div className="flex justify-between items-center mb-5">
          <div className="flex items-center gap-3 relative">
            <button 
              className="px-5 py-2.5 bg-red-500 text-white rounded-lg flex items-center gap-2 hover:bg-red-600 transition shadow-md"
              onClick={toggleDropdown}
            >
              Site Filter: {selectedSite || 'All'} <span className="text-sm">▼</span>
            </button>

            {dropdownVisible && (
              <div 
                ref={dropdownRef}
                className="absolute top-full left-0 bg-white shadow-xl mt-2 w-48 rounded-lg z-50 overflow-hidden"
              >
                <button 
                  className="block w-full text-left px-5 py-3 hover:bg-red-300 hover:text-white transition border-b"
                  onClick={() => handleFilterChange("All Site")}
                >
                  All Site
                </button>
                {Object.entries(listSite).map(([key, value]) => (
                  <button
                    key={key}
                    className="block w-full text-left px-5 py-3 hover:bg-red-300 hover:text-white transition"
                    onClick={() => handleFilterChange(value.name, value.id)}
                  >
                    {value.name}
                  </button>
                ))}
              </div>
            )}

            <button 
              className="px-5 py-2.5 bg-red-500 text-white rounded-lg flex items-center gap-2 hover:bg-red-600 transition shadow-md"
              onClick={toggleSectionDropdown}
            >
              Section Filter: {sections[selectedSection].name} <span className="text-sm">▼</span>
            </button>

            {sectionDropdownVisible && (
              <div 
                ref={dropdownRef}
                className="absolute top-full left-48 bg-white shadow-xl mt-2 w-48 rounded-lg z-50 overflow-hidden"
              >
                {Object.entries(sections).map(([key, value]) => (
                  <button
                    key={key}
                    className="block w-full text-left px-5 py-3 hover:bg-red-300 hover:text-white transition border-b"
                    onClick={() => handleSectionChange(key)}
                  >
                    {value.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Add Site Button */}
          <button 
            className="ml-auto px-5 py-2.5 bg-purple-500 text-white rounded-lg flex items-center gap-2 hover:bg-purple-600 transition shadow-md"
            onClick={() => addSite()}
          >
            + Add Site
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-red-500 text-white">
                  <th className="border px-4 py-3" rowSpan="2">Site</th>
                  {renderTableHeaders()}
                </tr>
                <tr className="bg-red-500 text-white">
                  {renderSubHeaders()}
                </tr>
              </thead>
              <tbody>
              {Object.entries(payload).map(([key, value]) => {
                  return (
                    <tr key={key} className="odd:bg-gray-50 hover:bg-gray-100 transition duration-150 text-center">
                      <td className='border border-gray-200 px-4 py-4'>
                        <button
                          onClick={() => handleSiteClick(value.id)}
                          className={`border border-gray-200 px-4 py-3 ${key === "Total" ? 'pointer-events-none' : ''}`}
                          disabled={key === "Total"}
                        >
                          {value.name}
                        </ button>
                      </td>
                      {(selectedSection === 'ALL' || selectedSection === 'NOT_YET') && 
                        <>
                          <td className='border border-gray-200 px-4 py-3'>{value.is_drop ? "Yes" : "No"}</td>
                          <td className='border border-gray-200 px-4 py-3'></td>
                        </>
                      }
                      {(selectedSection === 'ALL' || selectedSection === 'SURVEY') && 
                        <>
                          <td className='border border-gray-200 px-4 py-3'>{value.plan_survey}</td>
                          <td className='border border-gray-200 px-4 py-3'>{value.survey}</td>
                        </>
                      }
                      {(selectedSection === 'ALL' || selectedSection === 'DELIVERY') && 
                        <>
                          <td className='border border-gray-200 px-4 py-3'>{value.plan_delivery}</td>
                          <td className='border border-gray-200 px-4 py-3'>{value.delivery}</td>
                        </>
                      }
                      {(selectedSection === 'ALL' || selectedSection === 'INSTALASI') && 
                        <>
                          <td className='border border-gray-200 px-4 py-3'>{value.plan_instalasi}</td>
                          <td className='border border-gray-200 px-4 py-3'>{value.instalasi}</td>
                        </>
                      }
                      {(selectedSection === 'ALL' || selectedSection === 'INTEGRASI') && 
                        <>
                          <td className='border border-gray-200 px-4 py-3'>{value.plan_integrasi}</td>
                          <td className='border border-gray-200 px-4 py-3'>{value.integrasi}</td>
                        </>
                      }
                    </tr>
                  );
              })}
              </tbody>
            </table>
          </div>
        </div>
        <div className="mt-4 text-l text-gray-500 text-center">
                  Last Updated : {formattedDate}
                </div>

        <div className="flex justify-between mt-8">
          <button className="px-6 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition shadow-md flex items-center gap-2">
            <span>Download</span>
          </button>
          <button 
            className="px-6 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition shadow-md flex items-center gap-2"
            onClick={() => navigate(-1)}
          >
            <span>Back</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Site2;