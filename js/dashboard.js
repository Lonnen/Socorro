// DIY
var askGithub = function(apiCall, optionalMixin) {
    apiParams = {
        protocol: "https",
        domain: "api.github.com",
        dataType: "jsonp",
        callHttpApi: function() {
            apiParams.url = apiParams.protocol + "://"
                            + apiParams.domain + "/" + apiCall;
            $.ajax(apiParams);
        }
    }
    _.extend(apiParams, optionalMixin).callHttpApi();
};
askGithub('repos/mozilla/socorro/git/refs/tags', {success: function(r) { console.log(r) }})
