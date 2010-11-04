# vim: set ts=2
# WebSocket pseudo wave server

require 'rubygems'
require 'lib/rev/websocket'
require 'logger'

Log = Logger.new("log/pseudo-wave.log")

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

class PseudoWaveConnection < Rev::WebSocket
	def on_open
		@host = peeraddr[2]
		Log.debug "WebSocket opened from '#{peeraddr[2]}': request=#{request.inspect}"
		# send_message

		@sid = $pubsub.subscribe {|data|
			send_message data
		}
		# $pubsub.publish("server: Hello, world!")
		$record.each {|data| send_message data }
	end

	def on_message(data)
		Log.debug "state received: '#{data}'"
                $pubsub.publish(data)
	end

	def on_close
		Log.debug "connection closed: <#{@host}>"

		$pubsub.unsubscribe(@sid)
		$pubsub.publish("bye, I'm closing...")
	end
end

host = '0.0.0.0'
port = ARGV[0] || 8081

$server = Rev::WebSocketServer.new(host, port, PseudoWaveConnection)
$server.attach(Rev::Loop.default)
$pubsub.publish("this connection was attached to Psuedo Wave Server")

Log.debug "start on #{host}:#{port}"

Rev::Loop.default.run
