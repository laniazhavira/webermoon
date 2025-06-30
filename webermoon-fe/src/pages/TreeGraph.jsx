import { useCallback, useState, useEffect, Fragment } from 'react';
import {
  ReactFlow,
  MiniMap,
  BezierEdge,
  useNodesState,
  useEdgesState,
  addEdge,
  Controls,
} from '@xyflow/react';

import '@xyflow/react/dist/style.css';
import axios from 'axios';
import PropTypes from 'prop-types';

import { initialNodes } from '../config/nodes';
import { initialEdges } from '../config/edges';


import HyperLinkNode from '../config/customNode'; 
import FilterNode from '../config/filterNode';
import AutoCloseAlert from '../alert/AlreadyLoggedIn'; 
import { SetJWT, GetJWT } from '../config/configureJWT';
import '../style/TreeGraph.css';

const nodeTypes = { hyperLink: HyperLinkNode, filter: FilterNode };
const edgeTypes = { customBezier: BezierEdge };

// PropTypes validation
TreeGraph1.propTypes = {
    nodeData: PropTypes.arrayOf(PropTypes.number), // nodeData is an array of numbers
};
 
export default function TreeGraph1() {
  const [nodes,, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [nodeData, setNodeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterMitra, setFilterMitra] = useState('');
  const [filterRegional, setFilterRegional] = useState('');
  const [filterPrioritas, setFilterPrioritas] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  
const [currentDate] = useState(new Date());

const datePart = currentDate.toLocaleDateString('id-ID', {
  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
});

const timePart = currentDate.toLocaleTimeString('en-GB', {
  hour: '2-digit', minute: '2-digit', second: '2-digit'
});

const formattedDate = `${datePart}, ${timePart}`;

 
  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  useEffect(() => {
    const alertData = localStorage.getItem("showAlert");

    if (alertData) {
        const { status, message } = JSON.parse(alertData);

        if (status) {
            setShowAlert(true);
            setAlertMessage(message);
        }

        localStorage.removeItem("showAlert"); // Clear after showing alert
    }
    const fetchData = async () => {
      try {
        const jwtToken = GetJWT();
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/v1/get-data`, {
          headers: { Authorization: `Bearer ${jwtToken}`, "Cache-Control": "no-cache" },
          params: { filterMitra, filterRegional, filterPrioritas }
        });
        
        setNodeData(response.data.result); // Set the API data to the state
        SetJWT(response.headers.authorization);
        setTimeout(() => {
          setLoading(false); // After delay, stop loading
        }, 200);
      } catch (error) {
        console.error('Error fetching data:', error);
        setTimeout(() => {
          setLoading(false);
        }, 200);
      }
    };
  
    fetchData();
  }, [filterMitra, filterRegional, filterPrioritas]); // Fetch data whenever filters change
 
  return (
    <Fragment>
      {loading ? (
        <div className='flex items-center justify-center relative w-screen h-[calc(100vh-111px)]'>
            <h1 className=" text-center font-bold text-2xl">Loading...</h1>
        </div>
      ) : (
        <div className='relative w-screen h-screen'>
          {showAlert && <AutoCloseAlert message={alertMessage}/>}
          {/* <img src="/images/image1.png" alt="Logo" className="absolute top-12 left-20  w-auto h-auto" /> */}

          {/* Iterate over the nodeData and pass each value to HyperLinkNode */}
          <ReactFlow
            // index value sesuai dengan id node
            nodes={nodes.map((node, index) => ({
                ...node,
                data: {
                  ...node.data,
                  ...(node.type === "hyperLink" ? { value: nodeData?.[index] ?? 0 } : {}),
                  ...(node.type === "filter" ? { 
                    filterMitra, 
                    setFilterMitra, 
                    filterRegional, 
                    setFilterRegional,
                    filterPrioritas,
                    setFilterPrioritas 
                  } : {}),
                },
              }))}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            panOnDrag={true}
            zoomOnScroll={false}
            zoomOnPinch={false}
            fitView
          >
            <Controls />
            <MiniMap 
              // pannable={false}
            />
          </ReactFlow>
          
<div className="mt-4 text-l text-gray-500 text-center">
                  Last Updated : {formattedDate}
                </div>

        </div>
        
      )}
    </Fragment>
  );
};