'use strict';
const createRouter = require("@arangodb/foxx/router");
const router = createRouter();
const joi = require('joi'); // imported from npm
const db = require('@arangodb').db;
const foxxColl = db._collection('imdb_vertices');
const aql = require('@arangodb').aql;
const errors = require('@arangodb').errors;
const DOC_NOT_FOUND = errors.ERROR_ARANGO_DOCUMENT_NOT_FOUND.code;


// Registers the router with the Foxx service context
module.context.use(router);

// Retrieve entry from myFoxxCollection using AQL
router.get('/entries/:searchString', function (req, res){
  try {
    const keys = db._query(aql`
          for d in firstView
          SEARCH ANALYZER(d.description IN TOKENS(
          ${req.pathParams.searchString}, 'text_en'), 'text_en')
          SORT BM25(d) DESC
          LIMIT 20
          RETURN d.description`);
    res.send(keys)
  } catch (e) {
    if (!e.isArangoError || e.errorNum !== DOC_NOT_FOUND) {
      throw e;
    }
    res.throw(404, 'No results found', e);
  }
})
.pathParam('searchString', joi.strict().required(), 'Type to search')
.response(joi.array().items(joi.string().required()).required(), 'Search movies')
.summary('List entry keys')
.description('List of matched entries in the collection.')

// ${req.pathParams.searchString}