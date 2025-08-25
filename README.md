# koszhunter System Backend

Backend project for managing the koszhunter system from owner and society using Node.js and Prisma ORM.

### Requirements
Before you begin, make sure you have the following installed:
1. Node.js (v14 or newer)
2. npm or yarn
3. MySQL Database
   
### Getting Started
Follow the steps below to clone the repository, set up the environment, and run the project.

1. Clone the Repository

    `git clone https://github.com/krizzk/be-koszhunter.git`
  
2. Change directory

   `cd be-koszhunter`
  
4. Install Dependencies

   Install the required Node.js dependencies:

   `npm install`

   Or using Yarn:

   `yarn install`
   
4 Configure Environment Variables

  Create a .env file in the root directory and configure your database connection. Below is an example of the .env file:
    
    DATABASE_URL="mysql://root@localhost:3306/kosz_hunter"
    PORT=8000
    SECRET=kosz
    
  Replace user, password, and localhost:5432 with your PostgreSQL credentials and database details.

5 Run Database Migration

  Use Prisma to create and migrate the ordering_system database schema:
  
    npx prisma migrate dev --name init
  
  This command will:
  - Generate the necessary database tables.
  - Create a migration history in your prisma/migrations directory.
      
6 Start the Development Server
  
  Run the backend server in development mode:
  
    npm run dev
  
  Or with Yarn:
  
    yarn dev
  
  The server will typically start on http://localhost:8000.

## Contributing
Feel free to fork this repository, create a branch, and submit pull requests.

## License
This project is licensed under the MIT License.
