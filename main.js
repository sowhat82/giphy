//load libaries
const express = require('express')
const handlebars = require('express-handlebars')
const fetch = require('node-fetch')
const withquery = require('with-query').default

//configure the PORT
const PORT = parseInt(process.argv[2]) || parseInt(process.env.APP_PORT) || 3000
const apikey = process.env.apikey || ""
const giphyurl = 'https://api.giphy.com/v1/gifs/search'

var searchedgifs = []



//var apikey = '9eNVZa9XniHwaX6foVq3Dbz2daw9XhQs'

// create an instance of express
const app = express()

// configure handlebars
app.engine('hbs', handlebars({defaultLayout: 'default.hbs'}))
app.set('view engine', 'hbs')

if (apikey){
        // starts the server
        app.listen(PORT, () => {
            console.info(`Application started on port ${PORT} at ${new Date()}`)
        })
    }
else{
    console.error('API key not set')
}

// load/mount static resources to be used in the html files
app.use(
    express.static(__dirname + '/static') //can have multiple resource directories
)

//configure main page
app.get('/',
(req,resp) => {
    //status 200
    resp.status(200)
    resp.type('text/html')
    resp.render('index')
})

app.get('/search',
async (req,resp) => {
    //status 200
    const searchterm = req.query['search-term'] //to pull data from the search field in html form
    console.info(searchterm)

//construct the url with the query parameters
    const url = withquery(
        giphyurl,
        {
            api_key: apikey,
            q: searchterm,
            limit: 10

        }
    )
    console.info(url)
    
    const result = await fetch(url) //fetch returns a promise, to be opened using await. within it is an object with a json function.
    const giphys =  await result.json() //result.json returns yet another promise, containing the final json object to be examined.
//    console.info(giphys)
    
    var arrayLength = giphys.data.length;
    
    for (var i = 0; i < arrayLength; i++) {
        //console.log(myStringArray[i]);
        searchedgifs[i] = giphys.data[i].images.fixed_height.url
    }

//    console.info(giphys.data[0].images.fixed_height.url)
//console.info(searchedgifs)

    resp.status(200)
    resp.type('text/html')
    resp.render('searchresult', {searchedgifs})
})



/*https://api.giphy.com/v1/gifs/search
?api_key=9eNVZa9XniHwaX6foVq3Dbz2daw9XhQs
&q=noodles
&limit=25
&offset=0
&rating=g
&lang=en
*/

// redirect all incorrect urls to main page
//app.use((req, resp, next) => {
//    resp.redirect('/')
//} )