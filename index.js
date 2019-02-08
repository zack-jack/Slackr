const path = require('path');
const express = require('express');
const app = express();
const publicPath = path.join(__dirname, 'public');
const buildPath = path.join(__dirname, 'build');

if (process.env.NODE_ENV === 'production') {
  app.use(express.static('build'));

  app.get('*', (req, res) => {
    res.sendFile(path.join(buildPath, 'index.html'));
  });
} else {
  app.use(express.static('public'));

  app.get('*', (req, res) => {
    res.sendFile(path.join(publicPath, 'index.html'));
  });
}

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Express server is running on port ${port}`);
});
