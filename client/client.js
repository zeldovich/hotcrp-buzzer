var pcmembers = {};

Handlebars.registerHelper('getSession', function (key) {
  return Session.get(key);
});

function get_curpapers() {
  var s = Status.findOne({});
  if (!s) {
    return [];
  }

  return s.papers;
}

function get_input_file(inputelt, cb) {
  var files = inputelt.files;
  if (files.length == 0)
    return;

  var file = files[0];
  var ftype = file.type;

  var fr = new FileReader();
  fr.onload = function (e) {
    var data = e.target.result;
    cb(data, ftype);
  };

  fr.readAsBinaryString(file);
}

Template.admin.events({
  'click #reset': function (ev, template) {
    _.each(Papers.find({}).fetch(), function (p) {
      Papers.remove(p._id);
    });

    return false;
  },

  'click #authors': function (ev, template) {
    get_input_file(template.find('#authorsfile'), function (textdata) {
      var seen = {};
      _.each($.csv.toObjects(textdata), function (paper) {
        if (seen[paper.paper])
          return;
        Papers.insert({ number: paper.paper,
                        title: paper.title,
                        conflicts: [] });
        seen[paper.paper] = true;
      });
    });

    return false;
  },

  'click #users': function (ev, template) {
    get_input_file(template.find('#pcusers'), function (textdata) {
      pcmembers = {};
      _.each($.csv.toObjects(textdata), function (user) {
        pcmembers[user.email] = user.name;
      });
    });
  },

  'click #conflicts': function (ev, template) {
    get_input_file(template.find('#conflictsfile'), function (textdata) {
      _.each($.csv.toObjects(textdata), function (conflict) {
        var paper = Papers.findOne({ number: conflict.paper });
        var newconflict = conflict['PC email'];
        if (pcmembers[newconflict]) {
          newconflict = pcmembers[newconflict];
        }
        Papers.update(paper._id, { $push: { conflicts: newconflict }});
      });
    });

    return false;
  },

  'click #cookie': function (ev, template) {
    var u = template.find("#cookie-url").value;
    var k = template.find("#cookie-key").value;
    var v = template.find("#cookie-val").value;

    Meteor.call('setcookie', u, k, v);
  },

});

Template.admin.count = function () {
  var papers = Papers.find({});
  return papers.fetch().length;
};

Template.paperlist.curpapers = function () {
  return _.map(get_curpapers(), function (pid) {
    return Papers.findOne({"number": ""+pid});
  });
};

Template.toppage.events({
  'click #admintoggle': function (ev, template) {
    var curadmin = Session.get('adminmode');
    Session.set('adminmode', !curadmin);
  },
});

Template.paper.isActive = function () {
  return false;
};

Template.paper.position = function () {
  var cur = get_curpapers();
  if (this.number == cur[0]) {
    return "Current";
  }
  if (this.number == cur[1]) {
    return "Next";
  }
  if (this.number == cur[2]) {
    return "Then";
  }
};

Template.paper.posclass = function () {
  var cur = get_curpapers();
  if (this.number == cur[0]) {
    return "error";
  }
  if (this.number == cur[1]) {
    return "info";
  }
  if (this.number == cur[2]) {
    return "warn";
  }
};

Meteor.startup(function () {
  Meteor.subscribe('papers');
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
