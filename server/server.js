function poll_tracker() {
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
  } catch (err) {
    // ignore, try again next time
  }

  schedule_poll();
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
