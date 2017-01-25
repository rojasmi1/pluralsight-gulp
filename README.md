# pluralsight-gulp
You've built your JavaScript application but how do you automate testing, code analysis, running it locally or deploying it? These redundant tasks can consume valuable time and resources. Stop working so hard and take advantage of JavaScript task automation using Gulp to streamline these tasks and give you back more time in the day. Studying this repo can help clarify how Gulp works, jump-start task automation with Gulp, find and resolve issues faster, and be a more productive.

## Requirements

- Install Node
	- on OSX install [home brew](http://brew.sh/) and type `brew install node`
	- on Windows install [chocolatey](https://chocolatey.org/) 
    - Read here for some [tips on Windows](http://jpapa.me/winnode)
    - open command prompt as administrator
        - type `choco install nodejs`
        - type `choco install nodejs.install`
- On OSX you can alleviate the need to run as sudo by [following these instructions](http://jpapa.me/nomoresudo). I highly recommend this step on OSX
- Open terminal
- Type `npm install -g node-inspector bower gulp`

## Quick Start
Prior to taking the course, clone this repo and run the content locally
```bash
$ npm install
$ bower install
$ npm start
```

## Gulp tasks
-	`gulp help/gulp`: Lists all the available gulp tasks 
-	`gulp vet`: Analysis code with JSHint and JSCS
-	`gulp serve-dev`: Serves the application from the source code
-	`gulp serve-build`: Serves the application from the dist folder
-	`gulp clean`: Cleans temp/build folders and their content
-	`gulp less-watcher`: Watches for changes in the LESS files to transpile the code to CSS
-	`gulp images`: Compresses images and copies them to the dist folder
-	`gulp fonts`: Copies fonts to the dist folder
-	`gulp inject`: Injects Angular templateCache, transpiled CSS and JS references inside the index.html
-	`gulp optimize`: Minifies and mangles JavaScript/CSS files and marge them into single files (app.js,lib.js,app.css,lib.css)
-	`gulp bump`: Bumps new version of the application based on passed arguments
	- --type=pre will bump the prerelease version *.*.*-x
	- --type=patch or no flag will bump the patch version *.*.x
	- --type=minor will bump the minor version *.x.*
	- --type=major will bump the major version x.*.*
	- --version=1.2.3 will bump to a specific version and ignore other flags
	