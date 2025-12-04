
TravelNest 

A simple platform to explore stays, add your own property, and read/write reviews.
Built using Node.js, Express, MongoDB, Cloudinary and EJS.

About the Project
TravelNest is a basic clone-style project where users can:
Browse different listings (hotels, rooms, stays)
Filter listings by category
Register & Login securely
Add new listings with images (Cloudinary)
Edit or delete their own listings
Add reviews and ratings
View property details with images and owner info
This project is perfect for beginners learning full-stack development.

 Technologies Used
Backend
Node.js
Express.js
MongoDB + Mongoose
Passport.js (Authentication)
Cloudinary (Image Upload)
Multer (File handling)
Frontend
EJS Templates
Bootstrap
Font Awesome

 Features
✔ User Registration & Login
✔ Add new stay/listing
✔ Upload images using Cloudinary
✔ Edit or Delete listing (only owner)
✔ Add reviews & ratings
✔ Explore stays by category
✔ Responsive UI
✔ Secure session handling

 How to Run Locally
 Clone the repository
git clone https://github.com/your-username/wanderstay.git
cd wanderstay

 Install packages
npm install

 Create a .env file

Add the following:

CLOUD_NAME=your_cloudinary_name
CLOUD_API_KEY=your_cloudinary_key
CLOUD_API_SECRET=your_cloudinary_secret

DB_URL=mongodb://127.0.0.1:27017/travelnest
SECRET=somesecretstring
NODE_ENV=development

 Start the server
nodemon app.js

Then open your browser:
 http://localhost:8080

 Project Structure
TravelNest/
│── models/
│── views/
│── public/
│── routes/
│── utils/
│── app.js
│── cloudinary.js
│── schema.js
│── middleware.js
│── package.json
│── README.md

 Live Demo (Render)
 https://wanderstay-1-jvbi.onrender.com

Contributing
Feel free to contribute by improving the design, adding features, or fixing bugs!

 Author
Sonu Kumar
Full-Stack Developer

<div align="center">
<img src="<img width="1355" height="609" alt="image" src="https://github.com/user-attachments/assets/ff00c623-0a0c-435e-beeb-67b074db6d7f" />
">
  
</div>
