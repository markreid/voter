module.exports = {
    "parser": "babel-eslint", // lets us use things like @decorators
    "extends": "airbnb",
    "installedESLint": true,
    "plugins": [
        "react"
    ],
    "rules": {
      "no-unused-vars": [0, {
        "args": "none"
      }]
    }
};
