var pcmembers = {};

Handlebars.registerHelper('getSession', function (key) {
  return Session.get(key);
});

Handlebars.registerHelper('hidePaperID', function () {
  var s = Status.findOne({});
  if (!s) {
    return false;
  }

  return s.hide_conflicts;
});

function get_curpapers() {
  var s = Status.findOne({});
  if (!s) {
    return [];
  }

  return s.papers;
}

Template.admin.events({
  'click #cookie': function (ev, template) {
    var u = template.find("#cookie-url").value;
    var k = template.find("#cookie-key").value;
    var v = template.find("#cookie-val").value;

    Meteor.call('setcookie', u, k, v);
  },
});

Template.paperlist.curpapers = function () {
  return get_curpapers();
};

Template.toppage.events({
  'click #admintoggle': function (ev, template) {
    var curadmin = Session.get('adminmode');
    Session.set('adminmode', !curadmin);
  },
});

Template.paper.position = function () {
  var cur = get_curpapers();
  if (this.pid == cur[0].pid) {
    return "Current";
  }
  if (this.pid == cur[1].pid) {
    return "Next";
  }
  if (this.pid == cur[2].pid) {
    return "Then";
  }
};

Template.paper.posclass = function () {
  var cur = get_curpapers();
  if (this.pid == cur[0].pid) {
    return "error";
  }
  if (this.pid == cur[1].pid) {
    return "info";
  }
  if (this.pid == cur[2].pid) {
    return "warn";
  }
};

Meteor.startup(function () {
  Meteor.subscribe('status');

  var lastbuzz;
  Deps.autorun(function () {
    var cur = get_curpapers();
    if (cur[0] != lastbuzz) {
      document.getElementById('buzzer').play();
      lastbuzz = cur[0];
    }
  });
});
