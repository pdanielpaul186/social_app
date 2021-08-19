# social_app
Backend for a social networking site
------------------------------------

MINIMUM REQUIREMENTS:-

IDE :-  Microsoft Visual Studio Code(v1.59.0)
Database:- MongoDB v5.0.2  (MongoCompass for GUI v1.28.1)
Cloud Storage:- Firebase
API Testing Platform:- Postman(v8.9.1)
Programming Language:- NodeJS(v14.17.5) and ExpressJS(v~4.16.1)


PROCEDURE:-

After pulling this project into your server or local systems follow these steps
1. open  the folder in IDE or a terminal
2. npm install
3. npm install -g nodemon (for local systems) || npm install -g pm2 (for servers)
4. configure mongo connection and firebase connection in the config folder. When firebase storage is created then download the JSON file and store it in config folder and update the path in firebase.js file.
5. If you are using pm2 then open app.js and un comment the last files and update port number
6. If you are using nodemon then you are good to go !!!!!
