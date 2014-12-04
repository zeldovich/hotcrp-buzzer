var deadlines_url = "https://nsdi15.usenix.hotcrp.com/deadlines";
var lastbuzz;
var tracker;

var template_source = $("#paperlist-template").html();
var template = Handlebars.compile(template_source);

Handlebars.registerHelper('position', function (pid) {
  var cur = tracker.papers;
  if (this.pid == cur[0].pid) {
    return "Current";
  }
  if (this.pid == cur[1].pid) {
    return "Next";
  }
  if (this.pid == cur[2].pid) {
    return "Then";
  }
});

Handlebars.registerHelper('posclass', function (pid) {
  var cur = tracker.papers;
  if (this.pid == cur[0].pid) {
    return "danger";
  }
  if (this.pid == cur[1].pid) {
    return "info";
  }
  if (this.pid == cur[2].pid) {
    return "warning";
  }
});

function refresh() {
  if (tracker && tracker.papers && tracker.papers[0].pid != lastbuzz) {
    document.getElementById('buzzer').play();
    lastbuzz = tracker.papers[0].pid;
  }

  var context = tracker;
  var html = template(context);
  $("#main-table").html(html);
}

function poll_tracker() {
  var req = new XMLHttpRequest();

  req.onerror = function () {
    schedule_poll();
  }

  req.onload = function (e) {
    if (req.readyState !== 4)
      return;

    if (req.status !== 200) {
      schedule_poll();
      return;
    }

    var data = jQuery.parseJSON(req.responseText);
    if (data) {
      tracker = data.tracker;
      refresh();
    }

    if (data && data.tracker_poll) {
      var tracker_url = data.tracker_poll;

      if (!data.tracker_poll_corrected && !/^(?:https?:|\/)/.test(tracker_url)) {
        hotcrp_base = deadlines_url.replace(/deadlines$/, "");
        tracker_url = hotcrp_base + tracker_url;
      }

      var req2 = new XMLHttpRequest();
      req2.onerror = function () { poll_now(); };
      req2.onload = function () {
        if (req2.readyState != 4)
          return;
        poll_now();
      }
      req2.open("GET", tracker_url, true);
      req2.send();
    } else {
      schedule_poll();
    }
  }

  req.open("GET", deadlines_url + "?ajax=1&pc_conflicts=1", true);
  req.send();
}

function poll_now() {
  setTimeout(poll_tracker, 0);
}

function schedule_poll() {
  setTimeout(poll_tracker, 5000);
}

refresh();
poll_now();
