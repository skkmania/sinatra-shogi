# -*- coding: utf-8 -*-
# vim: set ts=2 :
#
#  state_server.rb
#	WebSocket state publishing server
#
require 'rubygems'
require 'em-websocket'
require 'lib/gpsclient.rb'
require 'logger'

Log = Logger.new("log/state_server.log")

#
#	gps clientを作成するための設定
#
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

#
#	State server の実務を実装
#
module StateModule
  # ログイン要求コマンド
  CMD_LOGIN = "sync"
  CMD_RETURN_LOGIN_OK = "[CreateLoginUserCmd_OK]"
  CMD_RETURN_LOGIN_NG = "[CreateLoginUserCmd_NG]"
  
	#
  # ユーザー管理
	#
  @@connected_clients = Hash.new
  @@state = Hash.new

	#
  # 受信したメッセージがログイン要求かどうか
	#
  def loginMessage?(msg)
    msgArray = msg.strip.split("|")
    (0 < msgArray.size) && (msgArray[0].include?(CMD_LOGIN))
  end

	#
  # 接続ユーザー全員にメッセージを送る
	#
  def sendBroadcast(msg)
    if msg.empty?
			Log.debug "StateModule#sendBroadcast : empty message has arrived."
			return
		else
      @@connected_clients.each_value { |c| c.send(msg) }
      puts msg
  		Log.debug "sent to all : #{msg}"
		end
  end

	#
  # ログイン処理
	#
  def login(msg)
    msgArray = msg.strip.split(":")
    name = msgArray[1][0...(msgArray[1].size-1)]
    if @@connected_clients.has_key?(name) == false
      @loginName = name
      @@connected_clients[@loginName] = self
      send(CMD_RETURN_LOGIN_OK)
      puts "Login name is #{@loginName}"
      Log.debug "Login name is #{@loginName}"
    else
      send(CMD_RETURN_LOGIN_NG)
      Log.debug "Login NG : #{msg}"
    end
  end

	#
  #ログアウト処理
	#
  def logout()
    if @loginName && (@loginName.empty? == false)
      msg = "[#{@loginName}] is logging out."
      puts msg
      Log.debug msg
      @@connected_clients.delete(@loginName)
      @@connected_clients.each_value { |c| c.send(msg) }
    end
    puts "WebSocket closed"
  end

  def state
    return @@state
  end

  def readStatus(data)
    @@state.fromString(data).get('status') # に相当する処理
  end

  def get(key)
    return @@state.get(key)
  end

  def put(key)
    return @@state.put(key)
  end

  def toString
    # self.to_a.inject([]){|r,a| r.push a.join('|'); r }.join('!!')
    return @@state.inspect
  end

  def fromString(str)
    str.split("!!").each{|e|
      a = e.split("|")
      @@state[a[0]] = (a[1] || '')
      # valueが空文字列の場合、a[1]にはnilがくるので、空文字列で置き換える
    }
    Log.debug "fromString : State changed. >> #{@@state.inspect}"
    return @@state
  end

  def clear
    @@state.clear
  end

  def submitDelta(delta)
    Log.debug("into StateModule.submitDelta with #{delta.inspect}")
    STDERR.puts "into submitDelta with #{delta.inspect}"
    @@state.merge! delta
    Log.debug "submitDelta : State changed. >> #{@@state.inspect}"
    sendBroadcast(@@state.inspect)
    Log.debug("leaving submitDelta.")
    STDERR.puts("leaving submitDelta.")
    return @@state
  end
end

def main
  EM::WebSocket.start(:host => "0.0.0.0", :port => 8081) { |ws|
  
    ws.extend(StateModule)
  
    ws.onopen{
      ws.send("Welcome! Please login!")
    }
  
    ws.onmessage { |data|
      Log.debug "state received: '#{data}'"
      status = ws.readStatus(data)
      case status
        when 'sync'
          Log.debug "sync request arrived : #{data}"
          ws.sendBroadcast ws.toString
          Log.debug "sent sync reply : #{ws.toString}"
        when 'reset'
          Log.debug "reset request arrived : #{data}"
          ws.clear
          ws.sendBroadcast('status|reset')
        when 'gpss'
          # gps対局を申し込まれた
          $gps_config[:sente] = (ws.get('blacks') == 'gps')
          $gpsclient = GpsClient.new(ws, $gps_config)
          ws.put('status', 'gpsc')
          ws.put('mode', 'playing')
          $gpsclient.make_and_send_delta($gpsclient.board.store.get_section(1))
          #ws.sendBroadcast(ws.toString)
        when 'gpst'
          # 局面指定gps対局を申し込まれた
          $gps_config[:sente] = (ws.get('blacks') == 'gps')
          $gps_config[:black] =  ws.get('blacks')
          $gps_config[:white] =  ws.get('whites')
          $gps_config[:initial_filename] = nil
          ws.put('status', 'gpsc')
          ws.put('mode', 'playing')
          $gpsclient = GpsClient.new(ws, $gps_config)
        when 'toryo'
          # gps対局中にユーザから投了された
          $gpsclient.toryo
          ws.put('status', 'normal')
          ws.sendBroadcast(ws.toString)
        when 'gpsc'
          # gpsclientとして参加しているクライアントはstateのstatusは必ず
          # gpscとして送ること
          # まずユーザからの指し手を配布
          ws.sendBroadcast(ws.toString)
          # それからgpsclientに指し手を渡す
          $gpsclient.accept(ws.state)
        else
          Log.debug "read state done : #{ws.state.inspect}"
          ws.sendBroadcast(ws.toString)
      end
    }
    
    ws.onclose{
      ws.logout
    }
    
    ws.onerror{ |e|
      ws.logout
      puts "Error: #{e.message}"
    }
  }
end

if $0 == __FILE__
  main
end
