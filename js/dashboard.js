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
    data = response.data;
    $('#releases').empty()
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
    tag = response.data;
    if (tag.message === "Not Found") {
        return
    }
    date = new Date(tag.tagger.date)
        console.log(date.toString())
    details = {
        name: tag.tag,
        date: date.getFullYear()+"-"+date.getMonth()+"-"+date.getDay(),
        url: "https://github.com/mozilla/socorro/tree/" + tag.tag,
    }

    $('#releases').append(
        _.template($('#tag').text())(details)
    );
}

askGithub('/repos/mozilla/socorro/git/refs/tags', {success: handleTags})
