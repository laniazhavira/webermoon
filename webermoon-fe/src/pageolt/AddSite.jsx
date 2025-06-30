import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { GetJWT, SetJWT } from "../config/configureJWT";
import AutoCloseAlert from "../alert/AlreadyLoggedIn";

const AddSite1 = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { selectedWitel, selectedSto } = location.state || {};

    if (!selectedWitel || !selectedSto) {
        localStorage.setItem("showAlert", JSON.stringify({
            status: true, 
            message: "Please access the feature correctly!"
        }));
        navigate("/");
    }

    const [formData, setFormData] = useState({
        name: "",
        status_osp: "P3",
        mitra: "zte",
        is_drop: 0,
        plan_survey: null,
        survey: null,
        plan_delivery: null,
        plan_instalasi: null,
        instalasi: null,
        plan_integrasi: null,
        integrasi: null,
        ihld: "",
        catuan_id: null,
        remark: ""
    });

    const [alertMessage, setAlertMessage] = useState("");

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        // If the value is an empty string, set it to null
        const newValue = value === "" ? null : value;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? (checked ? 1 : 0) : newValue || null
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setAlertMessage("");

        try {
            const requiredFields = ["ihld", "name"]; // specify required fields
            for (let field of requiredFields) {
                if (!formData[field] || formData[field].trim() === "") {
                    setAlertMessage((prev) => `Field "${field}" cannot be empty.`);
                    return;
                }
            }

            const jwtToken = GetJWT();

            const body = {...formData, sto_id: selectedSto, witel_id: selectedWitel};

            const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/v4/data/site/add`, body, {
                headers: { Authorization: `Bearer ${jwtToken}`, "Cache-Control": "no-cache" }
            });

            alert("New Site Added!");
            SetJWT(response.headers.authorization);
            navigate(-1);
        } catch (error) {
            setAlertMessage(error.response?.data?.message || "Error adding site");
            console.error("Error adding site:", error);
        }
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

    const formatDateToDisplay = (dateStr) => {
        if (!dateStr) return "";
        const months = {
            JAN: "01", FEB: "02", MAR: "03", APR: "04", MAY: "05", JUN: "06",
            JUL: "07", AUG: "08", SEP: "09", OCT: "10", NOV: "11", DEC: "12"
        };
        
        const [day, month, year] = dateStr.split("-");
        return `${year}-${months[month]}-${day}`; // Convert to YYYY-MM-DD for <input type="date">
    };

    return (
        <div className=" h-[calc(100vh-111px)] min-w-screen p-8 bg-red-100">
            {alertMessage && <AutoCloseAlert message={alertMessage} />}
            <div className="max-w-3xl mx-auto bg-white p-6 rounded-lg shadow-lg">
                <h2 className="text-2xl font-bold text-red-600 mb-4">Add Site</h2>
                <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-6">
                    {Object.keys(formData).map((key) => (
                        <div key={key} className="flex flex-col">
                            <label className="text-red-700 font-semibold capitalize" htmlFor={key}>
                                {key === "is_drop" ? "Drop" : key.replace(/_/g, " ")}
                            </label>

                            {key === "is_drop" ? (
                                <label className="flex items-center space-x-2 cursor-pointer mb-2">
                                    <input
                                        type="checkbox"
                                        id={key}
                                        name={key}
                                        checked={!!formData[key]}
                                        onChange={handleChange}
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
                            ) : key === "mitra" ? (
                                <select
                                    id={key}
                                    name={key}
                                    value={formData[key]}
                                    onChange={handleChange}
                                    className="border border-gray-300 p-2 rounded-md"
                                >
                                    {["zte", "fh"].map((option) => (
                                        <option key={option} value={option}>
                                            {option}
                                        </option>
                                    ))}
                                </select>
                            ) : key === "remark" ? (
                                <textarea
                                    id={key}
                                    name={key}
                                    value={formData[key] || ""}
                                    onChange={handleChange}
                                    rows="4"
                                    className="border border-gray-300 p-2 w-full rounded-md resize-none"
                                />
                            ) : key === "ihld" || key === "name" ? (
                                <input
                                    type="text"
                                    id={key}
                                    name={key}
                                    value={formData[key] || ""}
                                    onChange={handleChange}
                                    className="border border-gray-300 p-2 rounded-md"
                                    required
                                />
                            ) : key === "catuan_id" ? (
                                <input
                                    type="text"
                                    id={key}
                                    name={key}
                                    value={formData[key] || ""}
                                    onChange={handleChange}
                                    className="border border-gray-300 p-2 rounded-md"
                                />
                            ) : (
                                <input
                                    type="date"
                                    id={key}
                                    name={key}
                                    value={formatDateToDisplay(formData[key]) || ''}
                                    onChange={(e) =>  handleChange({
                                        target: { name: key, value: formatDateToSave(e.target.value) }
                                    })}
                                    className="border border-gray-300 p-2 rounded-md"
                                />
                            )}
                        </div>
                    ))}
                    <div className="col-span-2 flex justify-end">
                        <button type="submit" className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700">
                            Add Site
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddSite1;
