const express = require("express");
const app = express();
const cors = require("cors");

const TreeGraph = require("./routes/TreeGraph");
const ConvertExcel = require("./routes/ConvertExcel");
const Auth = require("./routes/auth");
const SiteData = require("./routes/siteData");
const RequestApproval = require("./routes/requestApproval");

const TreeGraph1 = require("./routes1/TreeGraph");
const ConvertExcel1 = require("./routes1/ConvertExcel");
const SiteData1 = require("./routes1/siteData");
const RequestApproval1 = require("./routes1/requestApproval");

const TreeGraph2 = require("./routes2/TreeGraph");
const ConvertExcel2 = require("./routes2/ConvertExcel");
const SiteData2 = require("./routes2/siteData");
const RequestApproval2 = require("./routes2/requestApproval");

const TreeGraph3 = require("./routes3/TreeGraph");
const ConvertExcel3 = require("./routes3/ConvertExcel");
const SiteData3 = require("./routes3/siteData");
const RequestApproval3 = require("./routes3/requestApproval");


// For env variables retrieval
require("dotenv").config();

// middleware
app.use(cors({
    origin: ['https://mini-olt.scmt-telkom.com', 'http://localhost:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'], // Specify all methods here
    exposedHeaders: ['Authorization']
}));

app.use(express.json());

// URL Routes
// OLT routes (v1)
app.use('/api/v1', TreeGraph);
app.use('/api/v1/convert', ConvertExcel);
app.use('/api/v1/auth', Auth);
app.use('/api/v1/data', SiteData);
app.use('/api/v1/request', RequestApproval);

// Battery routes (v2)
app.use('/api/v2', TreeGraph1); // Root route for TreeGraph battery
app.use('/api/v2/convert', ConvertExcel1);
app.use('/api/v2/data', SiteData1);
app.use('/api/v2/request', RequestApproval1);


// edge otn routes (v3)
app.use('/api/v3', TreeGraph2); // Root route for TreeGraph battery
app.use('/api/v3/convert', ConvertExcel2);
app.use('/api/v3/data', SiteData2);
app.use('/api/v3/request', RequestApproval2);


// edge otn routes (v4)
app.use('/api/v4', TreeGraph3); // Root route for TreeGraph battery
app.use('/api/v4/convert', ConvertExcel3);
app.use('/api/v4/data', SiteData3);
app.use('/api/v4/request', RequestApproval3);



app.listen(process.env.PORT, () => {
    console.log(`server has started on port ${process.env.PORT}`);
});