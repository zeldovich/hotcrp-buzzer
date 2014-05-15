function poll_tracker() {
  var tracker_url;

  try {
    var cookie = Cookie.findOne({});
    if (!cookie.url || !cookie.key || !cookie.val) {
      schedule_poll();
      return;
    }

    var r = HTTP.get(cookie.url,
                     {query: "ajax=1",
                      headers: {"Cookie": cookie.key + "=" + cookie.val},
                      timeout: 10000});
    if (r.statusCode != 200 || !r.data) {
      schedule_poll();
      return;
    }

    var papers = [];
    if (r.data.tracker && r.data.tracker.papers) {
      papers = _.map(r.data.tracker.papers, function(p) { return p.pid; });
    }
    Status.update({}, {$set: {papers: papers}});

    if (r.data.tracker_poll) {
      tracker_url = r.data.tracker_poll;

      if (!r.data.tracker_poll_corrected && !/^(?:https?:|\/)/.test(tracker_url)) {
        hotcrp_base = cookie.url.replace(/deadlines$/, "");
        tracker_url = hotcrp_base + tracker_url;
      }
    }
  } catch (err) {
    // ignore, try again next time
  }

  if (tracker_url) {
    try {
      HTTP.get(tracker_url, {timeout: 60000});
    } catch (err) {
      // ignore, just try again
    }
    poll_now();
  } else {
    schedule_poll();
  }
}

function poll_now() {
  Meteor.setTimeout(poll_tracker, 0);
}

function schedule_poll() {
  Meteor.setTimeout(poll_tracker, 5000);
}

Meteor.startup(function () {
  if (Cookie.findOne({}) === undefined) {
    Cookie.insert({});
  }

  if (Status.findOne({}) === undefined) {
    Status.insert({papers: []});
  }

  Meteor.publish('papers', function () {
    return Papers.find({});
  });

  Meteor.publish('status', function () {
    return Status.find({});
  });

  Papers.allow({
    insert: function (userId, doc) {
      return true;
    },

    update: function (userId, doc, fields, modifier) {
      return true;
    },

    remove: function (userId, doc) {
      return true;
    },
  });

  schedule_poll();
});

Meteor.methods({
  'setcookie': function (u, k, v) {
    Cookie.update({}, {$set: {url: u, key: k, val: v}});
  },
});
