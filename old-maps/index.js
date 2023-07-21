// loading dependencies for express server
const express = require('express');
const app = express();
const port = 3000
app.use(express.static('src'));

// serves everything in the src directory on the '/' route
app.use('/max', express.static(__dirname + '/src/maxtemp-map'));
app.use('/min', express.static(__dirname + '/src/mintemp-map'));
app.use('/precip', express.static(__dirname + '/src/precip-map'));
// app.use('/wata', express.static(__dirname + '/dist'))

app.listen(port, ()=>{console.log(`listening internally on port ${port}`)});