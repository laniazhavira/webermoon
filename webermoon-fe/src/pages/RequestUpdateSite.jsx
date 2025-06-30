import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { SetJWT, GetJWT } from '../config/configureJWT';
import AutoCloseAlert from "../alert/AlreadyLoggedIn";
import NotFound from './404NotFound';

const RequestUpdateSite = () => {
    const navigate = useNavigate();
    const { idSite } = useParams();
    const [formData, setFormData] = useState({
        remark: "",
        status_osp: "",
        plan_survey: null,
        survey: null,
        plan_delivery: null,
        plan_instalasi: null,
        instalasi: null,
        plan_integrasi: null,
        integrasi: null,
        is_drop: 0,
        ihld: "",
        catuan_id: null,
        cluster_id: ""
    });
    const [loading, setLoading] = useState(true);
    const [alertMessage, setAlertMessage] = useState('');
    const [showNotFound, setShowNotFound] = useState(false);
    
    useEffect(() => {
        const fetchData = async () => {
            try {
                const jwtToken = GetJWT();
                const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/v1/data/site/form-detail/${idSite}`,  {
                    headers: { Authorization: `Bearer ${jwtToken}`, "Cache-Control": "no-cache" },
                });
                console.log(response);
                setFormData(response.data.result); // Set the API data to the state
                SetJWT(response.headers.authorization);
                
                setTimeout(() => {
                    setLoading(false); // Stop loading after delay
                }, 100); 
            } catch (error) {
                console.error('Error fetching data:', error);
                if (error.response?.status === 404) {
                    setShowNotFound(true);
                }
                setTimeout(() => {
                    setLoading(false); // Stop loading after delay
                }, 1000);
            }
        };
        
        fetchData();
    }, []);
    
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        
        // If the value is an empty string, set it to null
        const newValue = value === "" ? null : value;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? (checked ? 1 : 0) : newValue
        }));
        console.log(formData);
    };
    
    const handleSubmit = async (e) => {
        setAlertMessage((prev) => '');
        e.preventDefault();
        try {
            // Check if any required field is empty
            const requiredFields = ["ihld"]; // specify required fields
            for (let field of requiredFields) {
                if (!formData[field] || formData[field].trim() === "") {
                    setAlertMessage((prev) => `Field "${field}" cannot be empty.`);
                    return;
                }
            }
            
            const { cluster_id, ...body } = formData;
            const jwtToken = GetJWT();
            await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/v1/request/site/${cluster_id}/add`, body, {
                headers: { Authorization: `Bearer ${jwtToken}`, "Cache-Control": "no-cache" },
            });
            alert("Request Submitted!");
            navigate(-1);
        } catch (error) {
            setAlertMessage((prev) => error.response.data.message);
            console.error("Error updating site:", error);
        }
    };
    
    const formatDateToDisplay = (dateStr) => {
        if (!dateStr) return "";
        const months = {
            JAN: "01", FEB: "02", MAR: "03", APR: "04", MAY: "05", JUN: "06",
            JUL: "07", AUG: "08", SEP: "09", OCT: "10", NOV: "11", DEC: "12"
        };
        
        const [day, month, year] = dateStr.split("-");
        return `${year}-${months[month]}-${day}`; // Convert to YYYY-MM-DD for <input type="date">
    };
    
    const formatDateToSave = (dateStr) => {
        if (!dateStr) return "";
        const months = [
            "JAN", "FEB", "MAR", "APR", "MAY", "JUN",
            "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"
        ];
        
        const [year, month, day] = dateStr.split("-");
        return `${day}-${months[parseInt(month, 10) - 1]}-${year}`; // Convert back to DD-MMM-YYYY
    };
    
    if(loading) {
        return (
            <div className='flex items-center justify-center relative w-screen h-[calc(100vh-111px)]'>
            <h1 className=" text-center font-bold text-2xl">Loading...</h1>
            </div>
        );
    }
    
    if(showNotFound) {
        return (
            <NotFound />
        );
    }
    
    return (
        <div className="h-[calc(100vh-111px)] min-w-screen p-8 bg-gray-100">
        {alertMessage && <AutoCloseAlert message={alertMessage} />}
        <div className="max-w-3xl mx-auto bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Update Site</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-6">
        {Object.keys(formData).map((key) => (
            <div key={key} className="flex flex-col">
            {/* Label */}
            {key === "is_drop" ? (
                <label className="text-red-700 font-semibold capitalize" htmlFor={key}>
                Drop
                </label>
            ) : key === "status_osp" ? (
                <label className="text-red-700 font-semibold capitalize" htmlFor={key}>
                Priority
                </label>
            ) : (
                <label className="text-red-700 font-semibold capitalize" htmlFor={key}>
                {key.replace(/_/g, " ")}
                </label>
            )}
            
            {/* Input Fields */}
            {key === "plan_survey" ? (
                // Disable editing for "plan_survey"
                <input
                type="text"
                id={key}
                name={key}
                value={formData[key] || ''}
                disabled
                className="border border-gray-300 p-2 rounded-md bg-gray-200 text-gray-500 cursor-not-allowed"
                />
            ) : key === "is_drop" ? (
                <label className="flex items-center space-x-2 cursor-pointer mb-2">
                <input
                type="checkbox"
                id={key}
                name={key}
                checked={!!formData[key]}
                onChange={(e) =>
                    handleChange({
                        target: { name: key, value: e.target.checked ? 1 : 0 }
                    })
                }
                className="hidden"
                />
                <div
                className={`w-10 h-5 flex items-center rounded-full p-1 transition duration-300 ${
                    formData[key] ? "bg-green-500" : "bg-gray-300"
                }`}
                >
                <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition duration-300 ${
                    formData[key] ? "translate-x-5" : ""
                }`}
                />
                </div>
                <span>{formData[key] ? "Yes" : "No"}</span>
                </label>
            ) : key === "status_osp" ? (
                <select
                id={key}
                name={key}
                value={formData[key]}
                onChange={handleChange}
                className="border border-gray-300 p-2 rounded-md"
                >
                {["P1", "P2", "P3", "P4"].map((option) => (
                    <option key={option} value={option}>
                    {option}
                    </option>
                ))}
                </select>
            ) : key === "cluster_id" ? (
                <input
                type="text"
                id={key}
                name={key}
                value={formData[key]}
                disabled
                className="border border-gray-300 p-2 rounded-md bg-gray-200 text-gray-500 cursor-not-allowed"
                />
            ) : key === "remark" ? (
                <textarea
                id={key}
                name={key}
                value={formData[key] || ''}
                onChange={handleChange}
                rows="4"
                className="border border-gray-300 p-2 w-full rounded-md resize-none"
                />
            ) : key === "ihld" || key === "catuan_id" ? (
                <input
                type="text"
                id={key}
                name={key}
                value={formData[key] || ''}
                onChange={handleChange}
                className="border border-gray-300 p-2 rounded-md"
                required
                />
            ) : (
                <input
                type="date"
                id={key}
                name={key}
                value={formatDateToDisplay(formData[key]) || ''}
                onChange={(e) =>
                    handleChange({
                        target: { name: key, value: formatDateToSave(e.target.value) }
                    })
                }
                className="border border-gray-300 p-2 rounded-md"
                />
            )}
            </div>
        ))}
        
        <div className="col-span-2 flex justify-end">
        <button type="submit" className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700">
        Update
        </button>
        </div>
        </form>
        </div>
        </div>
    );    
};

export default RequestUpdateSite;
