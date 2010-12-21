# -*- coding: utf-8 -*-
# vim: set fileencoding=utf-8 :
#
#  gpsclient.rb
#
require 'rb_gpsshogi.rb'
require 'lib/shogi_model.rb'

class GpsClient < GpsShogi
  def initialize(wave, config, logger=Logger.new('log/gpsclient.log'))
    @gclogger = logger
    @wave   = wave
    @status = nil
    @board  = Board.new
    @board.store.update_store
    super config
    @th     = read_thread
  end
  attr_accessor :status, :board

  def read_thread
    Thread.start do
      @gclogger.debug("read_thread started")
      while line = read
        @gclogger.debug("response from binary : #{line}")
        delta = @board.apply(line)
        @gclogger.debug("applied to board : #{delta.inspect}")
        send_delta(delta)
      end
    end
  end

  # WebSocketServerからstateを受け取る    
  def accept(state)
    send(to_csa(state))
  end

  #
  #  to_csa
  #
  def to_csa
  end

  #
  # send_delta
  # 入力：Hash Stateに上書きしたいデータ
  # 出力：なし
  def send_delta(data)
    @gclogger.debug("entered send_delta with #{data.inspect}")
    @wave.state.submitDelta(data)
    @status = 'delta_sent'
    @gclogger.debug("leaving send_delta.")
  end

  def read_state
  end

  #
  #  send(move)
  #  まず自身のBoardに指し手を適用してから
  #  バイナリに対しcsa形式の指し手文字列を送る
  # 入力：文字列 csa形式の指し手文字列
  # 出力：なし
  #   
  def send(move)
    @board.apply(move)
    super(move)
    @status = 'sent_to_binary'
  end

  def close
  end

  def toryo
    send "%TORYO"
  end
end
