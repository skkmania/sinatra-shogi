# vim: set expandtab ts=2 :
# WebSocket pseudo wave server

require 'rubygems'
require 'lib/rev/websocket'
require 'lib/gpsclient.rb'
require 'logger'

Log = Logger.new("log/pseudo_wave.log")

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
    Log.debug "PubSub publishing : #{data}"
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

class Wave
  def initialize(opt = {})
    @host = opt[:host]
    @mode = opt[:mode]
    @participants = opt[:participants]
    @state = opt[:state] || Wave::State.new
    @time = opt[:time]
    @viewer = opt[:viewer]
    @isInWaveContainer = opt[:isInWaveContainer] || false;
  end
  attr_accessor :state, :participants
  def getHost
    @host
  end
  def getMode
    @mode
  end
  def getParticipantById(id)
    @participants.find(id)
  end
  def getParticipants
    @participants
  end
  def getState
    @state
  end
  def getTime
    @time
  end
  def getViewer
    @viewer
  end
  def isInWaveContainer
    @isInWaveContainer
  end
  def setModeCallback(callback)
    @modeCallback = callback
  end
  def setParticipantCallback(callback)
    @participantCallback = callback
  end
  def setStateCallback(callback)
    @stateCallback = callback
  end
end

class Wave::Callback
  def initialize(callback, optContext)
    @callback = callback
  end
  def invoke(args)
    @callback.call(args)
  end
end

Wave::Mode = {:UNKNOWN=> 0, :VIEW=>1, :EDIT=>2, :DIFF_ON_OPEN=>3, :PLAYBACK=>4}

class Wave::Participant
  def initialize(name)
    @displayName = name
    @id = @displayName + '@shoogshogi.com'
    @thumbnailUrl = ''
  end
  def getDisplayName
    @displayName
  end
  def getId
    @id
  end
  def getThumbnailUrl
    @thumbnailUrl
  end
end

class Wave::State < Hash
  def initialize(opt = {})
    Log.debug "State initialized."
    self.merge! opt
  end
  def get(key, optDefault=nil)
    self[key] || optDefault
  end
  def put(key, value)
    self[key] = value
    Log.debug "put : State changed. >> #{self.inspect}"
  end
  def getKeys
    self.keys
  end
  def reset
    self.clear
  end
  def submitDelta(delta)
    self.merge! delta
    Log.debug "submitDelta : State changed. >> #{self.inspect}"
    publish
  end
  def submitValue(key, value)
    self[key] = value;
    Log.debug "submitValue : State changed. >> #{self.inspect}"
    publish
  end
  def toString
    self.to_a.inject([]){|r,a| r.push a.join('|'); r }.join('!!')
  end
  def fromString(str)
    str.split("!!").each{|e|
      a = e.split("|")
      self[a[0]] = (a[1] || '')
      # valueが空文字列の場合、a[1]にはnilがくるので、空文字列で置き換える
    }
    Log.debug "fromString : State changed. >> #{self.inspect}"
  end
  def publish
  end
end

class PseudoWaveConnection < Rev::WebSocket
	def on_open
		@host = peeraddr[2]
		Log.debug "WebSocket opened from '#{peeraddr[2]}': request=#{request.inspect}"
		# send_message

		@sid = $pubsub.subscribe {|data|
			send_message data
		}
		$record.each {|data| send_message data }
    #open_msg = $wave.state.toString
		#Log.debug "sending open message : #{open_msg}"
    #send_message open_msg
	end

	def on_message(data)
		Log.debug "state received: '#{data}'"
    case data
      when /^sync/
        Log.debug "sync request arrived : #{data}"
        send_message 'sync' + $wave.state.toString
        Log.debug "sent sync reply : #{'sync' + $wave.state.toString}"
      when /^reset/
        Log.debug "reset request arrived : #{data}"
        $wave.state.clear
        $pubsub.publish('reset state')
      else
        $wave.state.fromString(data)
        Log.debug "read state done : #{$wave.state.inspect}"
        $pubsub.publish($wave.state.toString)
    end
	end

	def on_close
		Log.debug "connection closed: <#{@host}>"

		$pubsub.unsubscribe(@sid)
		$pubsub.publish("msg:bye, I'm closing...")
	end
end

if $0 == __FILE__
  host = '0.0.0.0'
  port = 8081
  $wave = Wave.new
  $gpsclient = GpsClient.new
  
  $server = Rev::WebSocketServer.new(host, port, PseudoWaveConnection)
  $server.attach(Rev::Loop.default)
  # $pubsub.publish("this connection was attached to Psuedo Wave Server")
  
  Log.debug "start on #{host}:#{port}"
  
  Rev::Loop.default.run

end
