import { useState } from "react";
import PropTypes from 'prop-types';

const ModalApprovalReject = ({ isOpen, onClose, onSubmit, flowStatus }) => {
  const [notes, setNotes] = useState("");

  const handleSubmit = () => {
    onSubmit(flowStatus, notes);
    setNotes(""); // Reset notes after submit
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96 border">
        <h2 className="text-2xl font-bold text-center mb-4">
          Add Notes for {flowStatus}
        </h2>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full h-32 p-4 border border-gray-300 rounded-lg"
          placeholder="Add your notes here..."
        />
        <div className="mt-4 flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

ModalApprovalReject.propTypes = {
    isOpen: PropTypes.bool.isRequired,   
    onClose: PropTypes.func.isRequired,   
    onSubmit: PropTypes.func.isRequired,
    flowStatus: PropTypes.string.isRequired
  };
export default ModalApprovalReject;
