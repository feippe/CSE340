const session = require("express-session")
const pool = require('./database/')


/* ******************************************
 * Primary server file
 *******************************************/
const express = require("express")
require("dotenv").config()
const app = express()

/* ***********************
 * Requires (routers / controllers / utils)
 *************************/
const expressLayouts = require("express-ejs-layouts")
const staticRoutes = require("./routes/static")
const baseController = require("./controllers/baseController")
const inventoryRoute = require("./routes/inventoryRoute")
const accountRoute = require("./routes/accountRoute")
const utilities = require("./utilities")

/* ***********************
 * Global middleware
 *************************/
// Body parsers
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
// Archivos estáticos
app.use(express.static("public"))

/* ***********************
 * View Engine and Templates
 *************************/
app.set("view engine", "ejs")
app.use(expressLayouts)
app.set("layout", "./layouts/layout")


/* ***********************
 * Middleware
 * ************************/
 app.use(session({
  store: new (require('connect-pg-simple')(session))({
    createTableIfMissing: true,
    pool,
  }),
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  name: 'sessionId',
}))

// Express Messages Middleware
app.use(require('connect-flash')())
app.use(function(req, res, next){
  res.locals.messages = require('express-messages')(req, res)
  next()
})

/* ***********************
 * Routes
 *************************/
app.use(staticRoutes)
app.use("/inv", inventoryRoute)
app.use("/account", accountRoute)

// Home (con wrapper de manejo de errores)
app.get("/", utilities.handleErrors(baseController.buildHome))

/* ***********************
 * 500
 *************************/
app.get("/cause-500", (_req, _res) => {
  const err = new Error("Intentional server error for testing")
  err.status = 500
  throw err
})

/* ***********************
 * 404 catch-all
 *************************/
app.use((req, res, next) => {
  next({ status: 404, message: "Sorry, we appear to have lost that page." })
})

/* ***********************
 * Global Error Handler (último)
 *************************/
app.use(async (err, req, res, _next) => {
  const nav = await utilities.getNav()
  const status = err.status || 500
  const message =
    status === 404
      ? err.message
      : "Oh no! There was a crash. Maybe try a different route?"

  console.error(`Error at: "${req.originalUrl}": ${err.message}`)
  res.status(status).render("errors/error", {
    title: status === 404 ? "404 - Not Found" : "Server Error",
    status,
    message,
    nav,
  })
})

/* ***********************
 * Server bootstrap
 *************************/
const port = process.env.PORT || 3000
const host = process.env.HOST || "http://localhost"

app.listen(port, () => {
  console.log(`app listening on ${host}:${port}`)
})
