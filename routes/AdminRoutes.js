const express = require('express');
const processCSVFile=require('../controllers/AddUser') ;
const createList=require('../controllers/CreateList');
const multer = require("multer");
const sendEmailToListMembers = require('../controllers/SendEmail');

const router = express.Router();
const upload = multer({ dest: "uploads/" }); 
router.post('/createlist',createList);
router.post('/upload/:id', upload.single('file'), (req, res) => {
  const { id } = req.params;
  console.log(id);
  const filePath = req.file.path;
  console.log(filePath);
  // Call the function to process the CSV file
  processCSVFile(filePath, id, res);
});
router.post('/sendemail',sendEmailToListMembers);
module.exports=router;