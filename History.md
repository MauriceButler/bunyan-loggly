bunyan-loggly changes
=====================

Documentation of all changes to bunyan-loggly.

v0.0.4
------

- bunyan-loggly now requires to be setup as a [raw stream][rawstream] (it always has, but now it is enforced)

v0.0.3
------

- added a buffering system to allow logs to be sent only every x log writes
- added a test suite

v0.0.2
------

- sends logs through to loggly upon every write to the stream

[rawstream]: https://github.com/trentm/node-bunyan#stream-type-raw "Bunyan raw stream"