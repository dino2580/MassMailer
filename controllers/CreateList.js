const AdminList = require("../db/models/AdminList");

const createList = async (req, res) => {
  try {
    const { title, customProperties } = req.body;

    // Validate and convert the list of key-value pairs into a Map
    const customPropertiesMap = new Map();

    if (Array.isArray(customProperties)) {
      customProperties.forEach((property) => {
        // Extract the key-value pair from each object in the array
        const key = Object.keys(property)[0];
      
        const value = property[key];
        customPropertiesMap.set(key, value);
        
        
      });
    } else {
      return res.status(400).json({ error: "customProperties should be an array of key-value pairs" });
    }

    // Check if a list with the same title already exists
    const existingList = await AdminList.findOne({ title });
    if (existingList) {
      return res.status(405).json({ error: "List with the same title already present" });
    }

    // Create a new list with the title and custom properties
    const newList = new AdminList({
      title,
      customProperties: customPropertiesMap
    });
    await newList.save();

    return res.status(201).json({ message: "List created", listId: newList._id });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "An error occurred while creating the list" });
  }
};

module.exports = createList;
