# Used Technology
- Handlebar as template
- CSS/JS
- Express.Js
- Mongoose
- User Authentication
- One directional password Hashing (bcrypt)

# How to start
- to use this project first install nodes into your computer and where you have downloded this project just in root directory run (npm init) commond and then node_module folder will be added . - Then install all the node package(dependency) mentioned in package.json file. commond will be (npm install package_name)
- make a .env file in root directory parallel to public folder.
- In .env file write SECRET_KEY = "key_(length_should_be_32)"
- now in commond prompt in the same direcory run (npm run dev) to start running the project


# The project follow all the testcase given
1.	Student A1 authenticates to access the system.
2.	Professor P1 authenticates to access the system.
3.	Professor P1 specifies which time slots he is free for appointments.
4.	Student A1 views available time slots for Professor P1.
5.	Student A1 books an appointment with Professor P1 for time T1.
6.	Student A2 authenticates to access the system.
7.	Student A2 books an appointment with Professor P1 for time T2.
8.	Professor P1 cancels the appointment with Student A1.
9.	Student A1 checks their appointments and realizes they do not have any pending appointments.
