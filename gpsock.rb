# WebSocket gps server

require 'rubygems'
require 'rev/websocket'
require '/home/skkmania/workspace/gpsshogi/bin/network/rb_gpsshogi.rb'

class PubSub
	def initialize
		@subscriber = {}
		@seqid = 0
	end

	def subscribe(&block)
		sid = @seqid += 1
		@subscriber[sid] = block
		return sid
	end

	def unsubscribe(key)
		@subscriber.delete(key)
	end

	def publish(data)
		@subscriber.reject! {|sid,block|
			begin
				block.call(data)
				false
			rescue
				true
			end
		}
	end

	def size
		@subscriber.size
	end
end

$pubsub = PubSub.new
$record = []

class GpsConnection < Rev::WebSocket
	def on_open
		@host = peeraddr[2]
		puts "WebSocket opened from '#{peeraddr[2]}': request=#{request.inspect}"
		# send_message

		@sid = $pubsub.subscribe {|data|
			send_message data
		}
		$pubsub.publish("server: Hello, world!")
		$record.each {|data| send_message data }
	end

	def on_message(data)
		puts "WebSocket data received: '#{data}'"
                $pubsub.publish(data)
                $prog.send(data)
	end

	def on_close
		puts "connection closed: <#{@host}>"

		$pubsub.unsubscribe(@sid)
		$pubsub.publish("bye, I'm closing...")
	end
end

host = '0.0.0.0'
#host = '192.168.1.192'
port = ARGV[0] || 8081

  config = { :initial_filename => "csa.init",
             :opponent => "skkmania",
             :sente => false,
             :black => "skkmania", 
             :white => "gps",
             :limit => 1600, 
             :table_size => 30000,
             :table_record_limit => 50,
             :node_limit => 16000000,
             :timeleft => 100, 
             :byoyomi => 60,
             :logfile_basename => "logs/x1_",
             :other_options => "",
             :base_command => '/usr/games/gpsshogi -v -c'
           }
$prog = GpsShogi.new(config)
Thread.start {
  while 1 do
    res = $prog.read
    puts "Thread data received: '#{res}'"
    $pubsub.publish(res)
  end
}
$server = Rev::WebSocketServer.new(host, port, GpsConnection)
$server.attach(Rev::Loop.default)
$pubsub.publish("this connection was attached to WebSocketServer")

puts "start on #{host}:#{port}"

Rev::Loop.default.run
