const csv = require("csv-parser");
const fs = require("fs");
const { Parser } = require("json2csv");
const User = require("../db/models/User");
const AdminList = require("../db/models/AdminList");

// Function to process CSV file and update the database
const processCSVFile = async (filePath, listId, res) => {
  const results = [];
  let count_error = 0;
  let count_success = 0;
  const errorRecords = [];

  fs.createReadStream(filePath)
    .pipe(csv({}))
    .on("data", (data) => results.push(data))
    .on("end", async () => {
      try {
        const adminList = await AdminList.findById(listId);
        if (!adminList) {
          fs.unlinkSync(filePath); // Delete the file after processing
          return res.status(404).json({ error: "AdminList not found" });
        }

        for (const obj of results) {
          try {
            const existingUser = await User.findOne({ email: obj.email });

            if (existingUser) {
              if (obj.name !== existingUser.name) {
                count_error++;
                obj.msg = "Error";
                errorRecords.push(obj);
                continue;
              }

              if (adminList.users.includes(existingUser._id)) {
                count_error++;
                obj.msg = "Error: User already in AdminList";
                errorRecords.push(obj);
                console.log("User already in AdminList:", existingUser);
              } else {
                adminList.users.push(existingUser._id);
                await adminList.save();
                count_success++;
                obj.msg = "Success";
                console.log("User added to AdminList:", existingUser);
              }

              for (const key of Object.keys(obj)) {
                if (key !== "name" && key !== "email" && key!=="msg") {
                  if (obj[key].trim() !== "") {
                    existingUser.customProperties.set(key, obj[key]);
                  }
                }
              }
              await existingUser.save();
              // console.log("User already exists and updated:", existingUser);
            } else {
              const customProperties = new Map();

              for (const key of Object.keys(obj)) {
                if (key !== "name" && key !== "email" && key!=="msg") {
                  if (obj[key].trim() !== "") {
                    customProperties.set(key, obj[key]);
                  }
                }
              }

              const newUser = new User({
                name: obj.name,
                email: obj.email,
                customProperties: customProperties,
              });

              await newUser.save();
              adminList.users.push(newUser._id);
              await adminList.save();
              obj.msg = "Success";
              count_success++;
              // console.log("New user created and added to AdminList:", newUser);
            }
          } catch (error) {
            count_error++;
            obj.msg = `Error: ${error.message}`;
            errorRecords.push(obj);
            // console.error("Error processing user:", error);
          }
        }

        // Convert error records to CSV
        const fields = Object.keys(results[0]);
       
        const json2csvParser = new Parser({ fields });
        const csvErrorData = json2csvParser.parse(errorRecords);
        console.log(csvErrorData);
        // Write CSV file with error records
        const errorFilePath = `${filePath}_errors.csv`;
        fs.writeFileSync(errorFilePath, csvErrorData);

        // Delete the original file after processing
        fs.unlinkSync(filePath);

        res.status(200).json({
          message: "Processing complete",
          totalErrors: count_error,
          totalSuccess: count_success,
          totalInList: adminList.users.length,
          errorFilePath: errorFilePath,
        });
      } catch (error) {
        console.error("Error:", error);
        res
          .status(500)
          .json({ error: "An error occurred while processing the file" });
      }
    });
};

module.exports = processCSVFile;
