### Assignment: Setting Up Your First Node.js Server

**Objective:** Build and run your first Node.js HTTP server to gain hands-on experience with server-side development.

**Instructions:**

1. **Initialize Your Project with NPM:**

   - Run `npm init -y` to initialize a `package.json` file for your project.
   - Install dependencies accordingly
   > `npm install --save-dev @types/node`
   - Create `src` directory and `index.ts` in it
   - Configure the `tsconfig.json` with for the `outDir` and `rootDir` accordingly
   - Make sure you are converting the ts to js using 
   > `tsc --watch`

2. **Create Your Server Script:**

   - Import `http`. It comes with `node.js`
   - Create a basic HTTP server.
   - Utilize the `http` module's `createServer` and `listen` methods.

3. **Testing Your Server:**

   - Execute your server script using the command line.
   - Open a web browser and navigate to `http://localhost:<port>` to confirm your server is running.
   - Alternatively on your terminal run the command `curl http://localhost:<port>` or use `Postman`

4. **Enhance Your Server:**

   - Implement the endpoint `/posts` that supports CRUD operations. Please reference [JSONPlaceholder](https://jsonplaceholder.typicode.com/#:~:text=the%20full%20list.-,Routes,-All%20HTTP%20methods)
   - For now, you may use a globalVariable to save information in the server. This global data you can manipulate using the CURD operations. 