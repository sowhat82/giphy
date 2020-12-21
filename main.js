//load libaries
const express = require('express')
const handlebars = require('express-handlebars')
const fetch = require('node-fetch')
const withquery = require('with-query').default
const secureEnv = require('secure-env')
global.env = secureEnv({secret:'mySecretPassword'})

//configure the PORT
const PORT = parseInt(process.argv[2]) || parseInt(process.env.PORT) || 3000
const apikey = global.env.API_KEY || process.env.apikey || ""
const giphyurl = 'https://api.giphy.com/v1/gifs/search'




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
    const searchterm = req.query['search-term'] //to pull data from the search field in index.html form
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

    var searchedgifs = []
    var arrayLength = giphys.data.length;
    
    for (var i = 0; i < arrayLength; i++) {
        const url = giphys.data[i].images.fixed_height.url
        const title = giphys.data[i].title
        searchedgifs.push({title,url})
    }
// the below works the same as the above, to move certain elements from an array to a new array
    const imgs = giphys.data
//        .filter(
  //          d => {
    //            return !d.title.includes('f**k')
      //      }
   //     )
        .map(               //length of new array will be the same
            (d)=> {
                return {title: d.title, url: d.images.fixed_height.url}          
            }
        )

//    console.info(giphys.data[0].images.fixed_height.url)
console.info(searchedgifs)
var hascontent
    resp.status(200)
    resp.type('text/html')
    resp.render('searchresult', {searchedgifs: imgs, searchterm, hascontent: !!imgs.length})
})



/*https://api.giphy.com/v1/gifs/search
?api_key=??
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