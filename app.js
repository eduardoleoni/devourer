var express = require('express');
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var app     = express();
var striptags = require('striptags');
var mysql      = require('mysql');

var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'root',
  database : 'worldismine'
});
connection.connect();

function scrape(url){ 

    request(url, function(error, response, html){
        if(!error){

            var $ = cheerio.load(html);

            var json = { title : "", body : "", time : "", url : ""};
            
            json.url = url;
            json.time = new Date().getTime();
            json.body = striptags(html);
            
            $('title').filter(function(){
                json.title= $(this).text();
            });
            
            links = [];
            domain = url.split("/");
            method = domain[0];
            domain = domain[2];
            
            $('a').filter(function(){
                links.push($(this).attr('href'));
            });
            
            query = "INSERT INTO monster (title, body, time, url) VALUES ('" + json.title + "', '" + "json.body" + "', '" + json.time + "', '" + json.url + "')";

            connection.query(query);
            links.forEach(function(link){
                if (link !== undefined){
                    if (link.substr(0,4) !== "http"){
                        link = method + "//" + domain + link;
                        created_at = new Date().getTime();
                        query = "INSERT INTO queue (url, created_at) VALUES ('" + link + "', '" + created_at + "')";
                        connection.query(query);
                    }
                }
            });
        } 
        
        
    });
    getNew();
}

function getNew(){
    connection.query('SELECT * FROM queue  ORDER BY id ASC LIMIT 1', function(err, rows, fields) {
        if (err) throw err;

        scrape(rows[0].url);
        connection.query('DELETE FROM queue WHERE url = "' + rows[0].url + '"');
    });
}


getNew();
//})

app.listen('8081');
console.log('Magic happens on port 8081');
exports = module.exports = app; 
