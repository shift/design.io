require 'rb-fsevent'

fsevent     = FSEvent.new
STDOUT.sync = true
io          = STDOUT
directory   = STDIN.read
fsevent.watch directory do |directories|
  io.write directories[0][0..-2]
end
fsevent.run
