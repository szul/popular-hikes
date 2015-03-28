#!/usr/bin/env node

/*
 * Convenience methods.
 * I used startsWith to check some of the URL src attributes.
 */

String.prototype.startsWith = function (part){
    return this.slice(0, part.length) == part;
};

String.prototype.endsWith = function (part){
    return this.slice(-part.length) == part;
};

var express = require('express');
var request = require('request');
var app = express();

app.get('/', function (req, res) {

    /*
     * Simple object to evaluate callbacks that need to be completed before returning the response.
     * This should be replaced with something like async.each.
     */
    var Scraper = {
        callbacks: 0,
        evaluator: function(collection, response) {
            this.callbacks++;
            console.log(this.callbacks);
            if (this.callbacks == collection.length) {
                this.callbacks = 0;
                response.json({ hikes: collection });
            }
        }
    };

    /*
     * In my opinion, cheerio is much better for simple scraping and jQuery functionality than jsdom.
     */
    var cheerio = require('cheerio');
    var url = 'http://www.hikingupward.com';
    var collection = [];
  
    /*
     * There are better libraries out there that work well for multiple fetches.
     * The request module is just being used for simplicity.
     */
    request(url, function (error, response, body) {
        var $ = cheerio.load(body);
        $('p.SmallFont').next().find('td.SmallFont > a').each(function() {
            if (typeof($(this).attr('href')) !== 'undefined' && $(this).attr('href').startsWith('/')) {
                collection.push( { name: $(this).text(), url: $(this).attr('href') }); 
            }
        });
        for(var i = 0; i < collection.length; i++) {
            (function(item) {
                request(url + item.url, function (err, resp, bod) {
                    //Scope this better.
                    $ = cheerio.load(bod);
                    item.ratings = [];
                    $("img[src*='stars']").each(function(idx, val) {
                        //Need to account for missing ratings and multiple lines of ratings.
                        item.ratings[idx] = $(this).attr('src').split('/stars/')[1].substring(4,5);
                    });
                    Scraper.evaluator(collection, res)
                });
            })(collection[i])
        }
    });
});

var server = app.listen(3000, function () {
  console.log('Listening on localhost:3000');
});
