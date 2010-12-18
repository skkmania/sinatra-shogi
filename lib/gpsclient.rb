# -*- coding: utf-8 -*-
# vim: set fileencoding=utf-8 :
#
#  gpsclient.rb
#
require 'rb_gpsshogi.rb'
require 'lib/shogi_model.rb'

class GpsClient < GpsShogi
  def initialize(wave, config)
    @wave   = wave
    @status = nil
    @board  = Board.new
    super config
    @th     = read_thread
  end
  attr_accessor :status, :store, :board

  def read_thread
    Thread.start do
      while line = read
        delta = @board.apply(line)
        send_delta(merge_delta(delta))
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
  # 入力：stateにmergeしてほしいHash
  # 出力：
  def merge_delta
  end

  def send_delta(data)
    @wave.state.submitDelta(data)
  end

  def read_state
  end

  def send(move)
    super(move)
    @status = 'sent'
  end

  def read
    @status = 'read'
    super
  end

  def close
  end

  def toryo
    send "%TORYO"
  end
end
