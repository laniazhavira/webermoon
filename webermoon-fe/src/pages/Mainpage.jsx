import React from 'react';
import { Link } from 'react-router-dom';
import { FaNetworkWired, FaBatteryFull, FaServer, FaWifi, FaSatellite } from 'react-icons/fa';

const MainPage = () => {
    return (
        <div className="w-screen h-screen flex flex-col items-center relative bg-gradient-to-b from-white-800 via-white-900 to-white pt-30 overflow-hidden">
            {/* Main Content */}
            <h1 className="text-4xl font-bold mb-4 text-black">Main Menu</h1>
            <div className="flex flex-row flex-wrap gap-8 w-full max-w-5xl justify-center mt-15">
                <Link
                    to="/miniolt/treegraph"
                    className="flex flex-col items-center p-6 border border-blue-600 text-blue-600 rounded-lg shadow-lg hover:bg-blue-600 hover:text-white transition w-40"
                >
                    <FaNetworkWired className="text-4xl mb-2" />
                    <h2 className="text-lg font-bold text-center">Mini OLT</h2>
                </Link>
                <Link
                    to="/battery/treegraph"
                    className="flex flex-col items-center p-6 border border-green-600 text-green-600 rounded-lg shadow-lg hover:bg-green-600 hover:text-white transition w-40"
                >
                    <FaBatteryFull className="text-4xl mb-2" />
                    <h2 className="text-lg font-bold text-center">Battery</h2>
                </Link>
                <Link 
                    to="/edgeotn/treegraph"
                    className="flex flex-col items-center p-6 border border-red-600 text-red-600 rounded-lg shadow-lg hover:bg-red-600 hover:text-white transition w-40"
                >
                    <FaServer className="text-4xl mb-2" />
                    <h2 className="text-lg font-bold text-center">Edge OTN</h2>
                </Link>
                <Link
                    to="/olt/treegraph"
                    className="flex flex-col items-center p-6 border border-yellow-600 text-yellow-600 rounded-lg shadow-lg hover:bg-yellow-600 hover:text-white transition w-40"
                >
                    <FaWifi className="text-4xl mb-2" />
                    <h2 className="text-lg font-bold text-center">OLT</h2>
                </Link>
                <Link
                    to="/redirect"
                    className="flex flex-col items-center p-6 border border-orange-600 text-orange-600 rounded-lg shadow-lg hover:bg-orange-600 hover:text-white transition w-40"
                >
                    <FaSatellite className="text-4xl mb-2" />
                    <h2 className="text-lg font-bold text-center">NTE</h2>
                </Link>
            </div>
        </div>
    );
};

export default MainPage;
