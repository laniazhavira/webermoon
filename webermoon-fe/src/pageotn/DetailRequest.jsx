import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { SetJWT, GetJWT, GetRoleFromJWT } from '../config/configureJWT';
import ModalApprovalReject from "../modals/ModalApproveReject";

const DetailRequest1 = () => {
  const { idRequest } = useParams();
  const navigate = useNavigate();
  const role = GetRoleFromJWT();
  const [changes, setChanges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [log, setLog] = useState([]); // Initialize as an empty object
  const [siteDetails, setSiteDetails] = useState(null); // For storing site details
  const [isDetailsOpen, setIsDetailsOpen] = useState(false); // For toggling the dropdown
  const [showModal, setShowModal] = useState(false);
  const [flowStatus, setFlowStatus] = useState("");

  // Fetch the change request data from the API
  useEffect(() => {
    const fetchChanges = async () => {
      try {
        let jwtToken = GetJWT();
        let response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/v3/request/detail/${idRequest}`, {
          headers: { Authorization: `Bearer ${jwtToken}`, "Cache-Control": "no-cache" },
        });
        if (response.data && response.data.changes) {
          setChanges(response.data.changes);
          setLog({ status: response.data.status, notes: response.data.notes });
          console.log(response.data);
          SetJWT(response.headers.authorization);
        }

        jwtToken = GetJWT();
        response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/v3/request/site/detail/${idRequest}`, {
          headers: { Authorization: `Bearer ${jwtToken}`, "Cache-Control": "no-cache" },
        });
        if (response.data && response.data.result) {
          setSiteDetails(response.data.result);
          SetJWT(response.headers.authorization);
          setTimeout(() => {
            setLoading(false); // Stop loading after delay
          }, 100);
        }

      } catch (error) {
        console.error("Error fetching change request data:", error);
        setTimeout(() => {
          setLoading(false); // Stop loading after delay
        }, 100);
      }
    };

    fetchChanges();
  }, []);

  const toggleSiteDetails = () => {
    setIsDetailsOpen(!isDetailsOpen); // Toggle the visibility of site details
  };

  // Function to handle modal open for approve/reject
  const handleApprovalClick = (status) => {
    setFlowStatus(status);
    setShowModal(true);
  };

  // Function to handle modal submit
  const handleSubmit = async (status, notes) => {
    try {
      const changeRequest = {
        flowStatus: status,
        notes,
        change: changes,
      };
      await axios.patch(`${import.meta.env.VITE_BACKEND_URL}/api/v3/request/verify/${idRequest}`, changeRequest, {
        headers: { Authorization: `Bearer ${GetJWT()}`, "Cache-Control": "no-cache" },
      });
      setShowModal(false); // Close modal after submission
      navigate(-1); // Navigate back after successful approval/rejection
    } catch (error) {
      console.error("Error updating request:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center relative w-screen h-[calc(100vh-111px)]">
        <h1 className="text-center font-bold text-2xl">Loading...</h1>
      </div>
    );
  }

  return (
    <div className="flex flex-col  min-h-[calc(100vh-111px)] min-w-screen p-8 bg-gray-100">
      <div className="container mx-auto flex-grow">
        <h1 className="text-3xl font-bold text-center mb-8">Update Site Request</h1>
        <div className="text-center bg-yellow-200 w-fit m-auto py-1 px-4 rounded-lg text-lg font-semibold mb-6">
          Status: <span className={`text-${log.status === "Requested" ? 'yellow-500' : 'gray-600'}`}>{log.status}</span>
        </div>
        {log.notes && (
          <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
            <h2 className="text-2xl font-bold text-gray-700 mb-4">Notes</h2>
            <p className="text-gray-500">{log.notes}</p>
          </div>
        )}

        {changes.length === 0 ? (
          <div className="text-center text-lg text-gray-500">No changes detected.</div>
        ) : (
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-gray-700 mb-4">Changes Summary</h2>
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-4 py-2 text-left text-gray-600">Field Changes</th>
                  <th className="border border-gray-300 px-4 py-2 text-left text-gray-600">Previous Value</th>
                  <th className="border border-gray-300 px-4 py-2 text-left text-gray-600">Requested Change</th>
                </tr>
              </thead>
              <tbody>
                {changes.map((change) => (
                  <tr key={change.field} className="hover:bg-gray-50">
                    <td className="border border-gray-300 px-4 py-2 font-semibold text-gray-700">
                      {formatFieldName(change.field)}
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-gray-500">
                      {change.prev_value || "N/A"}
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-red-500 font-bold">
                      {change.new_value || "N/A"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Site Details Section */}
        {siteDetails && (
          <div className="mt-8">
            <button
              onClick={toggleSiteDetails}
              className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-lg mb-4"
            >
              {isDetailsOpen ? "Hide Site Details" : "Show Site Details"}
            </button>
            {isDetailsOpen && siteDetails && (
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <h2 className="text-2xl font-bold text-gray-700 mb-4">Site Details</h2>

                {/* Grid layout for Site Details */}
                <div className="grid grid-cols-2 gap-6">
                  {/* Column 1 */}
                  <div className="mb-4">
                    <p className="font-semibold">Cluster ID: </p>
                    <p>{siteDetails.cluster_id || "N/A"}</p>
                  </div>
                  <div className="mb-4">
                    <p className="font-semibold">Mitra: </p>
                    <p>{siteDetails.mitra || "N/A"}</p>
                  </div>
                </div>
                <div className="mb-4">
                  <p className="font-semibold">Type OLT: </p>
                  <p>{siteDetails.type_olt || "N/A"}</p>
                </div>
                <div className="mb-4">
                  <p className="font-semibold">Merk OTN: </p>
                  <p>{siteDetails.merk_otn || "N/A"}</p>
                </div>

                {/* Column 2 */}
                <div className="mb-4">
                  <p className="font-semibold">Plan Survey: </p>
                  <p>{siteDetails.plan_survey || "N/A"}</p>
                </div>
                <div className="mb-4">
                  <p className="font-semibold">Survey: </p>
                  <p>{siteDetails.survey || "N/A"}</p>
                </div>
                <div className="mb-4">
                  <p className="font-semibold">Plan Delivery: </p>
                  <p>{siteDetails.plan_delivery || "N/A"}</p>
                </div>
                <div className="mb-4">
                  <p className="font-semibold">Delivery: </p>
                  <p>{siteDetails.delivery || "N/A"}</p>
                </div>
                <div className="mb-4">
                  <p className="font-semibold">Plan Instalasi: </p>
                  <p>{siteDetails.plan_instalasi || "N/A"}</p>
                </div>
                <div className="mb-4">
                  <p className="font-semibold">Instalasi: </p>
                  <p>{siteDetails.instalasi || "N/A"}</p>
                </div>
                <div className="mb-4">
                  <p className="font-semibold">Plan Integrasi: </p>
                  <p>{siteDetails.plan_integrasi || "N/A"}</p>
                </div>
                <div className="mb-4">
                  <p className="font-semibold">Integrasi: </p>
                  <p>{siteDetails.integrasi || "N/A"}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal for Approve/Reject */}
      <ModalApprovalReject
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleSubmit}
        flowStatus={flowStatus}
      />

      {/* Back Button */}
      <div className="flex justify-center items-end space-x-10 mt-6">
        <button
          onClick={() => navigate(-1)}
          className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-lg shadow-md"
        >
          Back
        </button>
        {log.status === "Requested" && role === "admin" && (
          <>
            <button
              onClick={() => handleApprovalClick("Approved")}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg"
            >
              Approve
            </button>
            <button
              onClick={() => handleApprovalClick("Rejected")}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg"
            >
              Reject
            </button>
          </>
        )}
      </div>
    </div>
  );
};

// Helper function to format field name
const formatFieldName = (field) => {
  return field.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
};

export default DetailRequest1;