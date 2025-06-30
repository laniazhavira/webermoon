import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GetRoleFromJWT, RemoveJWT } from "../config/configureJWT";
import { FaChevronDown } from "react-icons/fa";

const Navbar2 = () => {
    const [isDropdownOpenTabel, setIsDropdownOpenTabel] = useState(false);
    const navigate = useNavigate();
    let role = GetRoleFromJWT();
    role = role ? role : "guest";

    const handleLogout = () => {
        RemoveJWT();
        navigate("/login");
    };

    const toggleDropdownTabel = () => setIsDropdownOpenTabel(!isDropdownOpenTabel);
    const navigateAndCloseDropdownTabel = (path) => {
        setIsDropdownOpenTabel(false);
        navigate(path);
    };

    const navItems = {
        admin: [
            { 
                name: "Table", 
                subItems: [
                    { name: "Main", link: "/tabel2" },
                    { name: "Not Yet", link: "/tabel2/notyet" },
                    { name: "Survey", link: "/tabel2/survey" },
                    { name: "Delivery", link: "/tabel2/delivery" },
                    { name: "Instalasi", link: "/tabel2/instalasi" },
                    { name: "Integrasi", link: "/tabel2/integrasi" }
                ] 
            },
            { name: "Request", link: "/tabel2/request" },
            { name: "Upload", link: "/edgeotn/upload" },
            { name: "Logout" }
        ],
        mitra: [
            { 
                name: "Table", 
                subItems: [
                    { name: "Main", link: "/tabel2" },
                    { name: "Not Yet", link: "/tabel2/notyet" },
                    { name: "Survey", link: "/tabel2/survey" },
                    { name: "Delivery", link: "/tabel2/delivery" },
                    { name: "Instalasi", link: "/tabel2/instalasi" },
                    { name: "Integrasi", link: "/tabel2/integrasi" }
                ] 
            },
            { name: "Request", link: "/tabel2/request" },
            { name: "Logout" }
        ],
        guest: [
            { 
                name: "Table", 
                subItems: [
                    { name: "Main", link: "/tabel2" },
                    { name: "Not Yet", link: "/tabel2/notyet" },
                    { name: "Survey", link: "/tabel2/survey" },
                    { name: "Delivery", link: "/tabel2/delivery" },
                    { name: "Instalasi", link: "/tabel2/instalasi" },
                    { name: "Integrasi", link: "/tabel2/integrasi" }
                ] 
            },
            { name: "Login", link: "/login" }
        ]
    };

    if (role === null) {
        return null;
    }

    return (
        <nav className="navbar sticky top-0 left-0 right-0 z-20 flex items-center justify-between px-10 py-4 shadow-lg bg-gradient-to-r from-white via-red-300 to-red-900 text-black font-semibold">
            <div className="flex items-center space-x-8">
                <a href="/" className="flex items-center space-x-2">
                    <img src="/images/image1.png" alt="Telkom Indonesia Logo" className="w-16" />
                </a>
                {navItems[role].map((item, index) => (
                    item.name !== "Login" && item.name !== "Logout" && (
                        <div
                            key={index}
                            className="relative cursor-pointer group flex items-center space-x-2"
                        >
                            {item.name === "Table" ? (
                                <button className="text-lg flex items-center font-space focus:outline-none group-hover:underline" onClick={() => toggleDropdownTabel()}>
                                    {item.name}
                                    <FaChevronDown className="text-sm ml-2 group-hover:rotate-180 transition-transform duration-300" />
                                </button>
                            ) : (
                                <button
                                    onClick={() => navigate(item.link)}
                                    className="text-lg font-space bg-transparent focus:outline-none hover:underline"
                                >
                                    {item.name}
                                </button>
                            )}

                            {isDropdownOpenTabel && item.subItems && (
                                <ul
                                    className={`absolute left-0 top-10 bg-white text-black shadow-lg rounded-lg w-48 z-50 py-2`}
                                >
                                    {item.subItems.map((subItem, subIndex) => (
                                        <li key={subIndex} className="px-4 py-2 text-sm hover:bg-gray-100 rounded-md">
                                            <button
                                                onClick={() => navigateAndCloseDropdownTabel(subItem.link)}
                                                className="text-left w-full focus:outline-none"
                                            >
                                                {subItem.name}
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    )
                ))}
            </div>
            <div className="flex items-center space-x-4">
                {navItems[role].map((item, index) => (
                    item.name === "Login" ? (
                        <button key={index} onClick={() => navigate(item.link)} className="bg-white text-gray-800 font-semibold hover:bg-gray-200 px-4 py-2 rounded-lg shadow-md transition duration-300">
                            {item.name}
                        </button>
                    ) : item.name === "Logout" ? (
                        <button key={index} onClick={() => handleLogout()} className="bg-white text-gray-800 font-semibold hover:bg-gray-200 px-4 py-2 rounded-lg shadow-md transition duration-300">
                            {item.name}
                        </button>
                    ) : null
                ))}
            </div>
        </nav>
    );
};

export default Navbar2;

