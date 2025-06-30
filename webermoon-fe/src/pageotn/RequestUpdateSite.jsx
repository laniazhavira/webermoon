import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { SetJWT, GetJWT } from '../config/configureJWT';
import AutoCloseAlert from "../alert/AlreadyLoggedIn";
import NotFound from './404NotFound';

const RequestUpdateSite1 = () => {
    const navigate = useNavigate();
    const { idSite } = useParams();

    const [formData, setFormData] = useState({
        cluster_id: "",
        mitra: "",
        plan_survey: null,
        survey: null,
        plan_delivery: null,
        delivery: null,
        plan_instalasi: null,
        instalasi: null,
        plan_integrasi: null,
        integrasi: null,
        type_olt: "",
        merk_otn: "",
        is_drop: 0,
    });

    const [loading, setLoading] = useState(true);
    const [alertMessage, setAlertMessage] = useState('');
    const [showNotFound, setShowNotFound] = useState(false);

    const allowedFields = Object.keys(formData);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const jwtToken = GetJWT();
                const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/v3/data/site/form-detail/${idSite}`, {
                    headers: { Authorization: `Bearer ${jwtToken}`, "Cache-Control": "no-cache" },
                });

                const filteredData = {};
                allowedFields.forEach(field => {
                    filteredData[field] = response.data.result[field] ?? "";
                });

                setFormData(filteredData);
                SetJWT(response.headers.authorization);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching data:', error);
                if (error.response?.status === 404) setShowNotFound(true);
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? (checked ? 1 : 0) : (value === "" ? null : value)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setAlertMessage('');

        try {
            if (!formData.mitra || formData.mitra.trim() === "") {
                setAlertMessage('Field "mitra" cannot be empty.');
                return;
            }

            console.log("Form Data:", formData); // Log form data

            const jwtToken = GetJWT();
            await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/v3/request/site/${idSite}/add`, formData, {
                headers: { Authorization: `Bearer ${jwtToken}`, "Cache-Control": "no-cache" },
            });

            alert("Request Submitted!");
            navigate(-1);
        } catch (error) {
            console.error("Error:", error);
            if (error.response) {
                console.error("Response data:", error.response.data);
                setAlertMessage(error.response.data.message || "Something went wrong.");
            } else {
                setAlertMessage("Network error. Please try again.");
            }
        }

    };



    const formatDateToDisplay = (dateStr) => {
        if (!dateStr) return "";
        const months = {
            JAN: "01", FEB: "02", MAR: "03", APR: "04", MAY: "05", JUN: "06",
            JUL: "07", AUG: "08", SEP: "09", OCT: "10", NOV: "11", DEC: "12"
        };
        const [day, month, year] = dateStr.split("-");
        return `${year}-${months[month]}-${day}`;
    };

    const formatDateToSave = (dateStr) => {
        if (!dateStr) return "";
        const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
        const [year, month, day] = dateStr.split("-");
        return `${day}-${months[parseInt(month, 10) - 1]}-${year}`;
    };

    if (loading) {
        return <div className='flex items-center justify-center h-[calc(100vh-111px)]'><h1 className="text-center font-bold text-2xl">Loading...</h1></div>;
    }

    if (showNotFound) {
        return (<NotFound />);
    }

    return (
        <div className="h-[calc(100vh-111px)] min-w-screen p-8 bg-gray-100">
            {alertMessage && <AutoCloseAlert message={alertMessage} />}
            <div className="max-w-3xl mx-auto bg-white p-6 rounded-lg shadow-lg">
                <h2 className="text-2xl font-bold text-red-600 mb-4">Update Site</h2>
                <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-6">

                    {allowedFields.map((key) => (
                        <div key={key} className="flex flex-col">
                            <label className="text-red-700 font-semibold capitalize" htmlFor={key}>
                                {key === "is_drop" ? "Drop" : key.replace(/_/g, " ")}
                            </label>

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
                                        onChange={handleChange}
                                        className="hidden"
                                    />
                                    <div className={`w-10 h-5 flex items-center rounded-full p-1 transition duration-300 ${formData[key] ? "bg-green-500" : "bg-gray-300"}`}>
                                        <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition duration-300 ${formData[key] ? "translate-x-5" : ""}`} />
                                    </div>
                                    <span>{formData[key] ? "Yes" : "No"}</span>
                                </label>
                            ) : key === "cluster_id" ? (
                                <input
                                    type="text"
                                    id={key}
                                    name={key}
                                    value={formData[key]}
                                    disabled
                                    className="border border-gray-300 p-2 rounded-md bg-gray-200 text-gray-500 cursor-not-allowed"
                                />
                            ) : key === "mitra" || key === "type_olt" || key === "merk_otn" ? (
                                <input
                                    type="text"
                                    id={key}
                                    name={key}
                                    value={formData[key] || ''}
                                    onChange={handleChange}
                                    className="border border-gray-300 p-2 rounded-md"
                                    required={key === "mitra"}
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

export default RequestUpdateSite1;
