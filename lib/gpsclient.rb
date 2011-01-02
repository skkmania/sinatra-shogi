# -*- coding: utf-8 -*-
# vim: set fileencoding=utf-8 :
#
#  gpsclient.rb
#
require 'thread'
require 'lib/rb_gpsshogi.rb'
require 'lib/shogi_model.rb'

class GpsClient < GpsShogi
  def initialize(wave, config, logger=Logger.new('log/gpsclient.log'))
    @gclogger = logger
    @wave   = wave
    @status = nil
    @board  = Board.new
    @board.store.update_store
    super config
    @board_m     = Mutex.new
    @move_sended = ConditionVariable.new
    @read_done   = ConditionVariable.new
    @gps_th      = gps_thread
    #@svr_th     = svr_thread
    @debug_cnt   = 0
  end
  attr_accessor :status, :board
  attr_reader :gps_th

  def gps_thread
    Thread.start do
      @gclogger.debug("gps_thread started")
      loop do
          puts "debug_cnt : #{@debug_cnt += 1}"
          line = read
          if line.size > 1
            @gclogger.debug("response from binary : #{line}")
            delta = @board.apply(line.dup)
            STDERR.puts "#{line} applied."
            @gclogger.debug("applied to board : #{@board.store.dba.log_format delta}")
            make_and_send_delta(delta)
          else
            @gclogger.debug "other response from gps : size -> #{line.size}, response -> #{line}"
            STDERR.puts "other response from gps : size -> #{line.size}, response -> #{line}"
          end
      end
    end
  end

  def svr_thread
    Thread.start do
      @gclogger.debug("svr_thread started")
      loop do
      end
    end
  end

  # WebSocketServerからstateを受け取る    
  def accept(state)
    @board.store.from_state state
    send(to_csa(state))
  end

  #
  #  to_csa
  #    stateにより伝えられる指し手をCSA棋譜形式の文字列にする
  #    入力: Hash Wave::State オブジェクト
  #    出力: 文字列 
  #    例 
  #
  def to_csa(state)
    state['move']
  end

  #
  #  to_delta(hash)
  #    board, next, prevの各値を
  #    stateに載せる文字列に加工してからHashを組立て返す
  #    入力: Hash DBから取得したhash
  #    出力: Hash  
  #    例 
  def to_delta(hash)
    ret = {}
    if (b = hash['board'])
      b = b[0]
      ret['board'] = [b[:bid], (b[:turn]?'t':'f'), b[:board], b[:black], b[:white]].join(',')
    end
    if (n = hash['next'])
      ret['next'] = n.map{|m| [m[:bid],m[:mid],m[:m_from],m[:m_to],m[:piece],(m[:promote]?'t':'f'),m[:nxt_bid]].join(',') }.join(':')
    end
    if (n = hash['prev'])
      ret['prev'] = n.map{|m| [m[:bid],m[:mid],m[:m_from],m[:m_to],m[:piece],(m[:promote]?'t':'f'),m[:nxt_bid]].join(',') }.join(':')
    end
    ret
  end
  #
  # make_and_send_delta(data)
  # 入力：Hash Stateに上書きするdataの元になるsectionのHash
  # 出力：なし
  def make_and_send_delta(data)
    @gclogger.debug("entered make_and_send_delta with #{@board.store.dba.log_format data}")
    STDERR.puts "entered make_and_send_delta with #{@board.store.dba.log_format data}"
    delta = to_delta(data)
    # gpsの着手の結果をstateに反映させる
    delta['bid']   = data['board'][0][:bid]
    delta['turn']  = (data['board'][0][:turn]?'t':'f')
    delta['count'] = (@wave.state.get('count').to_i + 1).to_s
    delta['move']  = '' # browser userには必要ない値なので。
    @wave.state.submitDelta(delta)
    STDERR.puts "delta submitted."
    @status = 'delta_sent'
    @gclogger.debug("leaving make_and_send_delta.")
  end

  def read_state
  end

  #
  #  send(move)
  #  まず自身のBoardに指し手を適用してから
  #  バイナリに対しcsa形式の指し手文字列を送る
  # 入力：文字列 csa形式の指し手文字列 あるいは %で始まるコマンド文字列
  # 出力：なし
  #   
  def send(move)
      @board.apply(move.dup) if '+-'.index(move[0])
      STDERR.puts "#{move} applied."
      move += "\n" if move[-1] != "\n"[0]
           # \nで終わらないとコマンドとして認識されないので
      super(move)
      @status = 'sent_to_binary'
  end

  def close
  end

  def toryo
    send "%TORYO\n"
  end
end
