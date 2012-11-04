# -*- coding: utf-8 -*-
# vim: set ts=2 :
#
#  pseudo_wave.rb
#	WebSocket pseudo wave server
#
require 'rubygems'
require 'lib/rev/websocket'
require 'lib/gpsclient.rb'
require 'logger'

Log = Logger.new("log/pseudo_wave.log")

$gps_config = {
  :initial_filename	=> "bin/csa.init",
  :opponent		=> "skkmania",
  :sente 		=> false,
  :black 		=> "skkmania", 
  :white 		=> "gps",
  :limit 		=> 1600, 
  :table_size 		=> 30000,
  :table_record_limit 	=> 50,
  :node_limit 		=> 16000000,
  :timeleft 		=> 100, 
  :byoyomi 		=> 10, # 10 seconds for each move
  #:byoyomi 		=> 60,
  :logfile_basename 	=> "bin/logs/x1_",
  :other_options 	=> "",
  :base_command 	=> 'bin/gpsshogi -c'
  #:base_command 	=> 'bin/gpsshogi -v -c'
  #:base_command 	=> 'bin/gpsshogi -v -r -c' # random play for test
}

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
    Log.debug("Wave::initialized")
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
  def to_s
    "host : #@host,  mode: #@mode, participants: #@participants\n" +
    "state : #{@state.inspect}\n" +
    "time: #@time,  viewer: #@viewer\n"
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
    self
  end
  def get(key, optDefault=nil)
    self[key] || optDefault
  end
  def put(key, value)
    self[key] = value
    Log.debug "put : State changed. >> #{self.inspect}"
    self
  end
  def getKeys
    self.keys
  end
  def reset
    self.clear
  end
  def submitDelta(delta)
    Log.debug("into Wave::State.submitDelta with #{delta.inspect}")
    STDERR.puts "into submitDelta with #{delta.inspect}"
    self.merge! delta
    Log.debug "submitDelta : State changed. >> #{self.inspect}"
    publish
    Log.debug("leaving submitDelta.")
    STDERR.puts("leaving submitDelta.")
    self
  end
  def submitValue(key, value)
    self[key] = value;
    Log.debug "submitValue : State changed. >> #{self.inspect}"
    publish
    self
  end
  def toString
    # self.to_a.inject([]){|r,a| r.push a.join('|'); r }.join('!!')
    self.inspect
  end

  def fromString(str)
    str.split("!!").each{|e|
      a = e.split("|")
      self[a[0]] = (a[1] || '')
      # valueが空文字列の場合、a[1]にはnilがくるので、空文字列で置き換える
    }
    Log.debug "fromString : State changed. >> #{self.inspect}"
    self
  end
  def publish
    $pubsub.publish(toString)
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

  #
  #  on_message(data)
  #    WebSocketクライアントから送られてくる文字列を受け取り処理する関数
  #    入力: 文字列
  #    出力: なし
  def on_message(data)
    Log.debug "state received: '#{data}'"
    status = $wave.state.fromString(data).get('status')
    case status
      when 'sync'
        Log.debug "sync request arrived : #{data}"
        send_message $wave.state.toString
        Log.debug "sent sync reply : #{$wave.state.toString}"
      when 'reset'
        Log.debug "reset request arrived : #{data}"
        $wave.state.clear
        $pubsub.publish('status|reset')
      when 'gpss'
        # gps対局を申し込まれた
        $gps_config[:sente] = ($wave.state.get('blacks') == 'gps')
        $gpsclient = GpsClient.new($wave, $gps_config)
        $wave.state.put('status', 'gpsc')
        $wave.state.put('mode', 'playing')
        $gpsclient.make_and_send_delta($gpsclient.board.store.get_section(1))
        #$pubsub.publish($wave.state.toString)
      when 'gpst'
        # 局面指定gps対局を申し込まれた
        $gps_config[:sente] = ($wave.state.get('blacks') == 'gps')
        $gps_config[:black] =  $wave.state.get('blacks')
        $gps_config[:white] =  $wave.state.get('whites')
        $gps_config[:initial_filename] = nil
        $wave.state.put('status', 'gpsc')
        $wave.state.put('mode', 'playing')
        $gpsclient = GpsClient.new($wave, $gps_config)
      when 'toryo'
        # gps対局中にユーザから投了された
        $gpsclient.toryo
        $wave.state.put('status', 'normal')
        $pubsub.publish($wave.state.toString)
      when 'gpsc'
        # gpsclientとして参加しているクライアントはstateのstatusは必ず
        # gpscとして送ること
        # まずユーザからの指し手を配布
        $pubsub.publish($wave.state.toString)
        # それからgpsclientに指し手を渡す
        $gpsclient.accept($wave.state)
      else
        Log.debug "read state done : #{$wave.state.inspect}"
        $pubsub.publish($wave.state.toString)
    end
  end

  def on_error
    Log.debug "error occured duaring connecting : <#{@host}>"
  end

  def on_close
    if @host
      Log.debug "connection closed: by <#{@host}>"
    else
      Log.debug "connection closed: can't get host."
    end

    $pubsub.unsubscribe(@sid)
    $pubsub.publish("msg:bye, I'm closing...")
  end
end

if $0 == __FILE__
  host = '0.0.0.0'
  port = 8081
  $wave = Wave.new
#  $gpsclient = GpsClient.new($wave, $gps_config)
  
  $server = Rev::WebSocketServer.new(host, port, PseudoWaveConnection)
  $server.attach(Rev::Loop.default)
  # $pubsub.publish("this connection was attached to Psuedo Wave Server")
  
  Log.debug "start on #{host}:#{port}"
  
  Rev::Loop.default.run

end
