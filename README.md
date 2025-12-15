# firebase-base-site

Base template repository for a standard firebase backed react website

## Getting Started

1. Clone the repository

2. Create a new firebase project

```
firebase -i projects:create
```

Follow the URL to the firebase site and enable firebase database and firebase storage (if needed)

3. Initialize the firebase project

Initialize the project with the following settings:

- Github actions setup and hosting enabled
- Firestore database plus rules enabled
- Firebase storage enabled plus rules
- Dataconnect for sql database (if desired)

Follow the defaults during this setup as they ask.

4. Add Firebase to your web app

Go to the firebase console and click on the web app icon. Copy the config object and add it to your `.env` file.

5. Install the dependencies

```
npm install
```

6. Start the development server

```
npm start dev
```
