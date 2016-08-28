const Browser = require('zombie');
const BASE_ROOT = "https://fabric.io" ;
const API_ROOT = BASE_ROOT + "/api/v2" ;
const querystring = require('querystring');

function Client(options) {
  this._browser=new Browser()
  this._request = require('request')
  this._cookieJar = this._request.jar();

  this.developerToken = null;
  this.csrfToken = null;
  this.accessToken = null;


}

// Helper function to fetch data , after login
Client.prototype.get = function(url,callback) {
  var self = this;

  // Prepare request
  var opts = {
    url: API_ROOT + url,
    headers: {
      'X-CRASHLYTICS-DEVELOPER-TOKEN': self.developerToken,
      'X-CSRF-Token': self.csrfToken,
      'X-CRASHLYTICS-ACCESS-TOKEN' : self.accessToken
    },
    jar: self._cookieJar
  }

  self._request.get(opts, function(err,res,body) {
    if (err) {
      console.log(err)
      callback(err,null)
    }

    data = JSON.parse(body)
    callback(null,data)
  })
}

// Logs into fabric , and figures out the csrf, device_token and access_token for subsequent request
Client.prototype.login = function(email,password,callback) {
  var self = this ; 
  var login_url =BASE_ROOT + "/login";
  var config_url =API_ROOT + "/client_boot/config_data";
  var session_url = API_ROOT + '/session'

  // Step 1 Login - to find the CSRF Token
  self._browser.visit(login_url, function(e) {

    if (e) {
      callback(e)
    }

    // Extract the csrf token
    var csrfElement = self._browser.querySelector("meta[name=csrf-token]");
    var csrf_token = csrfElement.getAttribute('content');

    // Add it to the headers of the next request
    self._browser.headers = {}
    self._browser.headers["X-CSRF-Token"] = csrf_token;
    self.csrfToken = csrf_token;

    // Step 2  Get the Config Data - to find the developer token
    self._browser.visit(config_url,function(e) {
      var body = self._browser.text("body")
      var json_body = JSON.parse(body)

      // Extract the developer token from the json
      var developer_token = json_body.developer_token
      self.developerToken = developer_token

      //require('request-debug')(request);

      // Copy the cookies from zombie browser to request
      // filter out non fabric.io cookies
      Object.keys(self._browser.cookies).forEach(function(key) {
        var cookieString = self._browser.cookies[key].toString()
        if (cookieString.indexOf('fabric.io') != -1) {
          self._cookieJar.setCookie(cookieString,session_url)
        }
      })

      // Prepare request
      var opts = {
        url: session_url,
        form: {
          'email': email,
          'password': password
        },
        headers: {
          'X-CRASHLYTICS-DEVELOPER-TOKEN': developer_token,
          'X-CSRF-Token': csrf_token
        },
        jar: self._cookieJar
      }

      // Do the actual login
      self._request.post(opts, function (err, res, body) {
        if (err) {
          callback(err)
        }

        var session = JSON.parse(body)
        var access_token = session.token
        self.accessToken = access_token

        callback(null)

      })

    })
  })
}


Client.prototype.organization_list = function(callback) {
  var url = '/organizations'
  var self = this;

  self.get(url, function(err,data) {
    if (err) {
      callback(err)
    }
    callback(null,data)
  })
}

Client.prototype.organization_get_by_id = function(organization_id,callback) {
  var url = '/organizations/'+organization_id
  var self = this;

  self.get(url, function(err,data) {
    if (err) {
      callback(err)
    }
    callback(null,data)
  })
}

Client.prototype.team_member_list = function(organization_id,callback) {
  var url = '/organizations/'+organization_id+'/team_members'
  var self = this;

  self.get(url, function(err,data) {
    if (err) {
      callback(err)
    }
    callback(null,data)
  })
}


Client.prototype.app_list = function(organization_id,callback) {
  var url = '/organizations/'+organization_id+'/apps'
  var self = this;

  self.get(url, function(err,data) {
    if (err) {
      callback(err)
    }
    callback(null,data)
  })
}

Client.prototype.app_get_by_id = function(organization_id,app_id,callback) {
  var url = '/organizations/'+organization_id+'/apps/'+app_id
  var self = this;

  self.get(url, function(err,data) {
    if (err) {
      callback(err)
    }
    callback(null,data)
  })
}

// ---
Client.prototype.active_now = function(organization_id,app_id,callback) {

  var self = this;
  var url = '/organizations/'+organization_id+'/apps/'+app_id+"/growth_analytics/active_now.json";

  self.get(url, function(err,data) { if (err) { callback(err) } callback(null,data) })
}

// ---
Client.prototype.daily_active = function(organization_id,app_id,callback) {

  var self = this;
  var params = { start: 1469750400, end: 1472342400, build: 'all', transformation: 'seasonal' };
  var q = querystring.stringify(params);
  var url = '/organizations/'+organization_id+'/apps/'+app_id+"/growth_analytics/daily_active.json?"+q;

  self.get(url, function(err,data) { if (err) { callback(err) } callback(null,data) })
}

// ---
Client.prototype.daily_new = function(organization_id,app_id,callback) {

  var self = this;
  var params = { start: 1469750400, end: 1472342400, build: 'all', transformation: 'seasonal' };
  var q = querystring.stringify(params);
  var url = '/organizations/'+organization_id+'/apps/'+app_id+"/growth_analytics/daily_new.json?"+q;

  var self = this;

  self.get(url, function(err,data) { if (err) { callback(err) } callback(null,data) })
}

// ---
Client.prototype.audience_insights = function(organization_id,app_id,callback) {

  var self = this;
  var params = { date: 1469750400, end: 1472342400, tag: 'all' };
  var q = querystring.stringify(params);
  var url = '/organizations/'+organization_id+'/apps/'+app_id+"/growth_analytics/audience_insights.json?"+q;

  var self = this;

  self.get(url, function(err,data) { if (err) { callback(err) } callback(null,data) })
}


// ---
Client.prototype.read_audience_insights_app_state = function(organization_id,app_id,callback) {

  var self = this;
  var url = '/organizations/'+organization_id+'/apps/'+app_id+"/growth_analytics/read_audience_insights_app_state.json?";

  var self = this;

  self.get(url, function(err,data) { if (err) { callback(err) } callback(null,data) })
}

// ---
Client.prototype.retention = function(organization_id,app_id,callback) {

  var self = this;
  var params = { start: 1469750400, end: 1472342400, metric:'all', transformation: 'seasonal' };
  var q = querystring.stringify(params);
  var url = '/organizations/'+organization_id+'/apps/'+app_id+"/growth_analytics/retention.json?"+q;

  var self = this;

  self.get(url, function(err,data) { if (err) { callback(err) } callback(null,data) })
}

// Calls to implement
// /growth_analytics/daily_active.json?start=1469750400&end=1472342400&build=all&transformation=seasonal
// /growth_analytics/daily_new.json?start=1469750400&end=1472342400&build=all&transformation=seasonal
// /growth_analytics/active_now.json
// /growth_analytics/audience_insights.json?date=1472342400&tag=all
// /growth_analytics/audience_insights.json?date=1472342400&tag=all
// /growth_analytics/read_audience_insights_app_state.json

// /growth_analytics/active_now_history.json?range_seconds=86411&filter_zeros=false
// /growth_analytics/event_types.json?start=1471737600&end=1472342400&build=all
// /growth_analytics/monthly_active.json?start=1469750400&end=1472342400&build=all&transformation=weighted
//
// /growth_analytics/user_sessions_timeseries.json?start=1469750400&end=1472342400&build=all&transformation=seasonal
// /growth_analytics/top_builds.json?start=1469750400&end=1472342400&limit=20&show_launch_status=true
// /growth_analytics/builds_info.json?date=1472342400&builds=2.0.2+(1346)%2C2.0.1+(1182)%2C1.0.7+(623)
// /growth_analytics/os_distribution_timeseries.json?start=1469750400&end=1472342400&platform=ios&limit=9
// /growth_analytics/device_distribution_timeseries.json?start=1469750400&end=1472342400&platform=ios&limit=9

// /growth_analytics/multi_build_dau.json?start=1469750400&end=1472342400&builds=2.0.2+(1346)%2C2.0.1+(1182)%2C1.0.7+(623)
// /growth_analytics/launch_day_trackers.json?date=1472342400&build=2.0.2+(1346)&limit=180&end_minute=1440
// /growth_analytics/wau_cohorts.json?start=1469750400&end=1472342400
// /growth_analytics/dnd_over_dau.json?start=1469750400&end=1472342400&transformation=seasonal
// /growth_analytics/retention.json?start=1469750400&end=1472342400&metric=all&transformation=seasonal

// /growth_analytics/top_issues.json?date=1472342400&build=all&limit=3
// /growth_analytics/crash_free_users_for_top_builds.json?transformation=weighted&limit=3&start=1469750400&end=1472342400
// /growth_analytics/crash_free_sessions_for_top_builds.json?transformation=weighted&limit=3&start=1469750400&end=1472342400
// /growth_analytics/stability_timeseries.json?build=all&transformation=weighted&start=1469750400&end=1472342400

// /growth_analytics/pe_total_events.json?start=1469750400&end=1472342400&event_type=content-view&build=all&transformation=seasonal
// /growth_analytics/pe_unique_devices.json?start=1469750400&end=1472342400&event_type=content-view&build=all&transformation=seasonal

// /growth_analytics/session_duration_timeseries.json?start=1469750400&end=1472342400&build=all&transformation=seasonal
// /growth_analytics/time_in_app_per_dau.json?start=1469750400&end=1472342400&build=all&transformation=seasonal

module.exports = Client;
