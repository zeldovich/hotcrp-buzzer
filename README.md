hotcrp-buzzer
=============

This is a web application that helps manage conflicts during a PC meeting.

The application displays the list of conflicted PC members for the paper
currently being discussed, as well as for the next two papers.  When the
currently discussed paper changes, the application emits a buzz.

The intended use case is to have a laptop open on this web application's
page in the hallway.  The buzz and the list of conflicts for the current
and next two papers will help conflicted PC members determine when they
should go back into the room.

The application piggy-backs on top of HotCRP's tracker feature.  This
application is itself written in [Meteor](https://www.meteor.com/).
