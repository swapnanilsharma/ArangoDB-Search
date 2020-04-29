'use strict';
const createRouter = require("@arangodb/foxx/router");
const router = createRouter();
const joi = require('joi'); // imported from npm
const db = require('@arangodb').db;
const foxxColl = db._collection('myFoxxCollection');
const aql = require('@arangodb').aql;

// Registers the router with the Foxx service context
module.context.use(router);

// Basic Hello World route
router.get('/hello-world', function (req, res){
  res.send("Hello World");
})
.response(['text/plain'], 'A generic greeting.')
.summary('Generic greeting')
.description('Prints a generic greeting.');

router.get('/hello/:name', function (req, res){
  res.send(`Hello ${req.pathParams.name}`);
})
.pathParam('name', joi.strict().required(), 'Name to greet.')
.response(['text/plain'], 'A personalized greeting.')
.summary('Personalized greeting')
.description('Prints a personalized greeting.');

// Add entry to myFoxxCollection
router.post('/entries', function (req, res){
  const data = req.body;
  const meta = foxxColl.save(req.body);
  res.send(Object.assign(data, meta));
})
.body(joi.object().required(), 'Entry to store in the collection.')
.response(joi.object().required(), 'Entry stored in the collection.')
.summary('Store an entry')
.description('Stores and entry in "myFoxxCollection" collection.');

// Retrieve entry from myFoxxCollection using AQL
router.get('/entries', function (req, res){
  const keys = db._query(aql`
    FOR entry IN ${foxxColl}
    RETURN entry._key
    `);
    res.send(keys)
})
.response(joi.array().items(
  joi.string().required()
).required(), 'List of entry keys.')
.summary('List entry keys')
.description('Assembles a list of keys of entries in the collection.')
