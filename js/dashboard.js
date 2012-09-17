$(function(){
/**
 * Public: make a request to the github api
 *
 * apiCall - a url string to append to the host, styled like the examples
 *           given in the github developer documentation
 * options - optional object full of parameters for the request (default: {})
 *           :protocol    - transer protocol (default: https)
 *           :domain      - address of your github api
 *                          (default: api.github.com)
 *           :dataType    - the type of data you're expecting back from the
 *                          server. Do not override unless you really know what
 *                          you're doing (default: jsonp)
 *           :callHttpApi - function that combines the object properties into
 *                          a url and actually makes the ajax request. Do not
 *                          override unless you really know what you're doing.
 *           :success     - callback function to execute if your api request
 *                          is successful. (default: function(){})
 *           :type        - HTTP request type to use (default: GET)
 *           :data        - a dictionary containing any k/v pair data you need
 *                          to send as input when making a post call
 *                          (default: {})
 *
 *  The options list is in no way comprehensive. Since this is implemented
 *  using a call to $.ajax, and that is unlikely to change, you could
 *  include any other options listed here http://api.jquery.com/jQuery.ajax/
 *
 *  At the moment, there is extremely limited (possibly no) capability to auth
 *  as a github user.
 *
 *  Examples
 *
 *      askGithub( '/repos/mozilla/socorro/git/refs/tags',
 *          { success: function(resp) {
 *                _.each(resp.data, function(tag) { console.log(tag); };
 *            },
 *            error: function(xhr, status, error) {
 *                console.log(status + ' fuuuuuuuuuu: ' + error);
 *          },
 *      })
 *
 *      askGithub("/gists",
 *          { "type": "POST",
 *            "data": {
 *                "public": True
 *                "description": "mic check, 1, 2"
 *                "files": {
 *                  "file1.txt": { "content": "Some string" }
 *                }
 *            }
 *          }
 *      )
 */
var askGithub = function(apiCall, options) {
    apiParams = {
        protocol: "https",
        domain: "api.github.com",
        dataType: "jsonp",
        callHttpApi: function() {
            apiParams.url = apiParams.protocol + "://"
                            + apiParams.domain + apiCall;
            $.ajax(apiParams);
        }
    }
    _.extend(apiParams, options).callHttpApi();
},
/**
 * Public: a callback that populates the page with release information
 *
 * response - a response object from a Github api call to the refs api
 *            containing lists of refs, all of which are assumed to be tags
 */
handleTags = function(response) {
    var data = response.data;
    $('#releases').empty();
    _.map(data, function(d) {
        askGithub(
            '/repos/mozilla/socorro/git/tags/'+d.object.sha,
            { success: handleTag }
        );
    });
},
/**
 * Public: a callback for adding a single tag to the release info list
 */
handleTag = function(response) {
    var tag = response.data;
    if (tag.message === "Not Found") {
        return
    }
    var date = new Date(tag.tagger.date)
    var details = {
        // ditch the leading 'v' char
        name: tag.tag.substring(1),
        date: date.getFullYear()+"-"+date.getMonth()+"-"+date.getDay(),
        github_url: "https://github.com/mozilla/socorro/tree/" + tag.tag,
    }


    releases.create(details);
    //$('#releases').append(
    //    _.template($('#tag-template').text())(details)
    //);
}

askGithub('/repos/mozilla/socorro/git/refs/tags', {success: handleTags})


/****************/

// Tag Model
// ---------

// model for a tagged release
var Tag = Backbone.Model.extend({

    // the notion of defaults don't really make sense here,
    // but these help with debugging.
    defaults: function() {
        return {
            name: 'null',
            date: new Date(),
            github_url: "/",
        }
    },

    // no initialize function?
    // what about getting the bugs?
    // initialize: function() {},
});

// collection of tags
var TagList = Backbone.Collection.extend({

    // This is a collection of Tags
    model: Tag,

    // cache these in localstorage since tags will only be
    // added and never removed
    localStorage: new Store("releases-backbone"),

    // sort tags by version number
    // for historic reasons,
    // versions are dot seperated numbers of variable length
    // though modern versions are typically a single integer
    // ex. 10, 11.8, 11.8.2
    comparator: function(tagA, tagB) {
        var a = tagA.get('name').split("."),
            b = tagB.get('name').split("."),
            m = 0;
        while (m < a.length) {
            var a0 = Number(a[m]),
                b0 = Number(b[m]);
            if (a0 < b0) {
                return 1;
            }
            if (a0 > b0) {
                return -1;
            }
            m += 1;
        }
        return 0;
    }

});

// global collection of release tags
var releases = new TagList;

// The DOM element for presenting a release tag
var TagView = Backbone.View.extend({

    //... is a list item
    tagName: "li",

    // cache the template function
    template: _.template($('#tag-template').html()),

    // register the view with the model so that renders
    // can be triggered from the model
    initialize: function() {
        this.model.on('change', this.render, this);
        this.model.view = this;
    },

    // Render the view with the model information
    render: function() {
        this.$el.html(this.template(this.model.toJSON()));
        return this;
    }

});


// Releases UI
var ReleaseView = Backbone.View.extend({

    // Bind to the existing skeleton of the App in the HTML
    el: $("#releasedash"),

    // Ensure new tags get reflected in the UI
    // tags are only added, never deleted
    initialize: function() {
        releases.on('add', this.addOne, this);
        releases.on('all', this.render, this);
    },

    // Add a single release tag item
    addOne: function(tag) {
        var view = new TagView({model: tag});
        //this.$("#releases").append(view.render().el);
        this.$('#releases').empty();
        releases.each(function(tag) {
           this.$('#releases').append(tag.view.render().el);
        });
    }

});

releaseManager = new ReleaseView;
})
