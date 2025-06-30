
import { Link } from "react-router-dom";
import { Handle, Position } from '@xyflow/react';
import PropTypes from 'prop-types';

// PropTypes validation
HyperLinkNode.propTypes = {
    data: PropTypes.shape({
        label: PropTypes.oneOfType([
            PropTypes.string.isRequired,
            PropTypes.node.isRequired
        ]).isRequired,
      value: PropTypes.number,
      type: PropTypes.string.isRequired,
      parent: PropTypes.string, // parent can be undefined or a string
      link: PropTypes.string.isRequired, // assuming link is a string
    }).isRequired,
};
 
function HyperLinkNode({  data }) {
    
    const getClassName = () => {
        let className = "nodrag h-fit text-center text-white font-bold cursor-pointer shadow-md transition-opacity duration-300 ease-in-out hover:opacity-75 hover:shadow-xl rounded-lg break-words";
        // Conditionally return JSX based on the node type
        if (data.type === "input") className += " bg-[#e53935] text-center text-3xl max-w-[400px] w-fit p-8"
        else if (data.type === "default") className += " text-2xl w-[240px] py-6 px-8"
        else if (data.type === "output") className += " text-xl py-4 w-[187.5px]"
        
        // Background color for middle nodes
        if (data.label === "Not Yet") className += " bg-[#f236a7]"; // node-notyet
        else if (data.label === "Survey") className += " bg-[#e64a19]"; // node-survey
        else if (data.label === "Delivery") className += " bg-[#d32f2f]"; // node-delivery
        else if (data.label === "Instalasi") className += " bg-[#8e24aa]"; // node-instalasi
        else if (data.label === "Integrasi") className += " bg-[#f9a825]"; // node-integrasi

        // Background color for right-most nodes
        if (data.parent === "Not Yet") className += " bg-[#d349e7]"; // node-a
        if (data.parent === "Survey") className += " bg-[#e59d49]"; // node-b
        if (data.parent === "Delivery") className += " bg-[#e66548]"; // node-c
        if (data.parent === "Instalasi") className += " bg-[#e749aa]"; // node-d
        if (data.parent === "Integrasi") className += " bg-[#e6c449]"; // node-e

        return className;
    };
 
  return (
    <Link to={data.link} className="text-none">
        <div className={getClassName()} // Don't pass a callback here
        >
            {data.type !== "input" && (
                <Handle
                    type="target"
                    position={Position.Left}
                />
            )}
                <div className="text-center break-words cursor-pointer">
                    {/* Isi konten dari nodes.js */}
                    <label className="font-bold">{data.label}</label> 
                    <br />
                    <label><span>({data.value})</span> Site</label>

                </div>
            {data.type !== 'output' && (
                <Handle
                    type="source"
                    position={Position.Right}
                    id="b"
                    />
            )}
        </div>
    </Link>
  );
}
 
export default HyperLinkNode;