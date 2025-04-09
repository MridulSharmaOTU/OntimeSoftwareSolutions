# On-time Software Solutions
We are a company delivering the best database style sites
to hold all your video games or anything else you want to
store.

## Setup
If you'd like to run the server on your own device, follow these steps: 

### Webserver
1. Install Maven/Jetty (or any webserver of your choice).

2. You will need to ensure your webserver DOES NOT open the `.csv` files
For Jetty that requires a `jetty-context.xml`:
```
<?xml version="1.0"?>
<!DOCTYPE Configure PUBLIC "-//Jetty//Configure//EN" "http://www.eclipse.org/jetty/configure_9_3.dtd">
<Configure class="org.eclipse.jetty.webapp.WebAppContext">
  <Call name="setInitParameter">
    <Arg>org.eclipse.jetty.servlet.Default.excludePatterns</Arg>
    <Arg>.*metadataGames\.csv|accounts\.csv|reviews\.csv</Arg>
  </Call>
</Configure>
```
which you can slot in to your `pom.xml` using `<contextXmlFile>${project.basedir}/jetty-context.xml</contextXmlFile>`.

3. Ensure your `pom.xml` file is in your root directory.

### API
1. In your root folder run `npm init -y`.
2. Install the following dependancies:
```
npm install cors
npm install express
npm install express-session
npm install jsonwebtoken
npm install multer
npm install nodemailer
npm install sharp
```

### Deploying the Servers
1. Run your jetty server with `mvn jetty:run` in your terminal.

2. Run the `server.js` file in `resources\database` with node.js.

3. Go in your browsers and type in `localhost:3000/data` to see
if `metadataGames.csv` loads in your browser. If it loads correctly,
then your Jetty server (`localhost:8080` is default) should load
the HTML pages.

## Feature List

### Home Page 
- Slider 
- Trending feed

### Game Page
- YouTube integration 
- Dynamically loading information
- CSV based data source
- Cross-Environment CSV Loader in `loadMetadataGames.js` (equipped to handle node.js and browser)

### Navbar 
- Filter searches with Console and Genre

### Search Results (dynamically loading boxes from csv)
- Advanced search logic (roman numerals and accents)
- Sorting (title, release, rating)

### Register for Accounts 
- Full process works
- Including email verification

# Logging into a Verified Account
- Icon changes when logged into the website

# Admin Account 
- Icon changes to show admin account
- Shows the add/edit game buttons

# Admin Panel (adding games, updating games, deleting games) 
- Changes are made to the local `metadataGames.csv` file
- Pictures are uploaded to `resources\images\games\{id}\{cover/banner/ssn}.webp` 
- Changes are reflected on `localhost:3000/data` and `localhost:3000/images/games/{id}/{banner/cover/ssn}.webp`
