const nodemailer = require('nodemailer');
const AdminList = require('../db/models/AdminList');

const sendEmailToListMembers = async (req, res) => {
  try {
    const { listId, subject, message } = req.body;

    // Retrieve the list from the database
    const adminList = await AdminList.findById(listId).populate('users');

    if (!adminList) {
      return res.status(404).json({ error: "AdminList not found" });
    }

    // Configure Nodemailer transport
    const transporter = nodemailer.createTransport({
      // Update this configuration with your SMTP settings or transport service details
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: 'hms.nitkkr@gmail.com',
        pass: process.env.pass
      }
    });

    // Construct the message body
    const placeholders = message.match(/\[([^\]]+)\]/g); // Find all placeholders in the message
    let processedMessage = message;

    for (const user of adminList.users) {
      let personalizedMessage = processedMessage;

      // Replace placeholders with user-specific values
      personalizedMessage = personalizedMessage.replace(/\[name\]/g, user.name);
      personalizedMessage = personalizedMessage.replace(/\[email\]/g, user.email);

      for (const placeholder of placeholders) {
        const property = placeholder.replace(/\[|\]/g, ''); // Extract the property name from the placeholder
        const value = user.customProperties.get(property); // Get the value from customProperties map

        personalizedMessage = personalizedMessage.replace(placeholder, value || adminList.customProperties.get(property));
      }

      // Send email to user.email with the personalizedMessage
      await transporter.sendMail({
        from: 'hms.nitkkr@gmail.com',
        to: user.email,
        subject: subject,
        text: personalizedMessage
      });

      console.log(`Email sent to ${user.email}`);
    }

    res.status(200).json({ message: "Emails sent successfully" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "An error occurred while sending emails" });
  }
};

module.exports = sendEmailToListMembers;
