const express = require("express");
const path = require("path");
const app = express();
const mongoose = require("mongoose");
const Form = require("./formschema");
const nodemailer = require("nodemailer");
require("dotenv").config();

app.use(express.static(path.join(__dirname)));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const mongoURI = process.env.MONGO_URI;

mongoose.connect(mongoURI)
.then(() => console.log("Connected to MongoDB"))
.catch((err) => console.error("MongoDB connection error:", err));

app.post("/send-mail", async (req, res) => {
    const { firstName, lastName, email, subject, message } = req.body;

    try {
        const formData = new Form({
            firstName,
            lastName,
            email,
            subject,
            message,
        });

        await formData.save();

        res.redirect("/?status=success");

        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        await transporter.sendMail({
            from: `"${firstName} ${lastName}" <${email}>`,
            to: process.env.EMAIL_USER,
            subject: subject,
            text: message,
            html: `
                <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; border: 1px solid #e0e0e0;">
                    <div style="padding: 40px;">
                    <h1 style="margin: 0 0 24px; font-weight: 500; font-size: 26px; color: #000;">New Contact Request</h1>
                    <p style="font-size: 16px; color: #333; margin: 0 0 32px;">You have received a new message via your portfolio site.</p>

                    <table style="width: 100%; border-collapse: collapse; font-size: 15px; color: #000;">
                        <tr>
                        <td style="padding: 8px 0; font-weight: 500;">Name</td>
                        <td style="padding: 8px 0;">${firstName} ${lastName}</td>
                        </tr>
                        <tr>
                        <td style="padding: 8px 0; font-weight: 500;">Email</td>
                        <td style="padding: 8px 0;"><a href="mailto:${email}" style="color: #000; text-decoration: underline;">${email}</a></td>
                        </tr>
                        <tr>
                        <td style="padding: 8px 0; font-weight: 500;">Subject</td>
                        <td style="padding: 8px 0;">${subject}</td>
                        </tr>
                    </table>

                    <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 32px 0;" />

                    <div style="font-size: 15px; color: #333; line-height: 1.6; white-space: pre-wrap;">
                        ${message}
                    </div>
                    </div>
                    <div style="background-color: #f7f7f7; text-align: center; padding: 20px; color: #999; font-size: 13px;">
                    © ${new Date().getFullYear()} Virat Kohli Small Brother
                    </div>
                </div>
            `


        });

    } catch (err) {
        console.error("Error saving form data:", err.message);
        res.redirect("/?status=error");
    }
});

app.listen(2000, () => {
    console.log("Server running at http://localhost:2000");
});
