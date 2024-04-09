# Smack

This is a full stack group project developed while a student at App Academy.  It is a clone of the popular messaging app Slack.  The back-end utilizes a Flask server framework with a SQLAlchemy ORM. The front-end is React and makes use of Redux as a data store. No styling frameworks were used... just standard CSS.

Additional Contributors: 
[Cameron Beck](https://github.com/cbkinase) |
[Brian Hitchin](https://github.com/brianhitchin) |
[Cynthia Liang](https://github.com/cynthialiang00)

Available for view at: [Smack](https://davet-smack.onrender.com/)
* This site may take a minute to spin up.  Give it a minute. 😀 

![smack_screenshots](https://user-images.githubusercontent.com/111056707/236525525-acaef303-4d02-40cd-b79b-f31d92bf2a63.png)


## Technologies Used

<img src="https://img.shields.io/badge/JavaScript-323330?style=for-the-badge&logo=javascript&logoColor=F7DF1E" /><img src="https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white" /><img src="https://img.shields.io/badge/Flask-000000?style=for-the-badge&logo=flask&logoColor=white" /><img src="https://img.shields.io/badge/SQLite-07405E?style=for-the-badge&logo=sqlite&logoColor=white" /><img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" /><img src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white" /><img src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white" /><img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" /><img src="https://img.shields.io/badge/Redux-593D88?style=for-the-badge&logo=redux&logoColor=white" /><img src="https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white" />

* Front-end:
  * React
  * Redux
* Back-end:
  * Flask
  * SQLAlchemy
* Database:
  * SQLite (Development)
  * PostgreSQL (Production)

## Index

[Wiki](https://github.com/dtitus929/Smack/wiki) |
[API Documentation](https://github.com/dtitus929/Smack/wiki/API-Documentation) |
[Database Schema](https://github.com/dtitus929/Smack/wiki/DB-Schema) |
[Redux Store Shape](https://github.com/dtitus929/Smack/wiki/Redux-Store-Shape)

## Setup Instructions

The structure for this app includes a root Pipfile for installing dependancies for the back-end Flask server.  The react-app folder contains a package.json file for setting up dependancies the front-end server.

#### Launching the Full Application Locally

1. Download the application as a zip file from GitHub.
2. From within the root folder install the dependent pip packages: `pipenv install`
3. Enter the pipenv shell environment: `pipenv shell`
4. Migrate the SQLAlchemy database schema: `flask db upgrade`
5. Generate SQLAlchemy seed data for testing: `flask seed all`
6. Start the back-end server: `flask run`
7. From within the react-app folder install the dependent npm packages: `npm install`
7. Start the front-end server: `npm start`




