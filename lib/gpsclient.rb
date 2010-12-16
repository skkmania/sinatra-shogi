# -*- coding: utf-8 -*-
# vim: set fileencoding=utf-8 :
#
#  gpsclient.rb
#
require 'rb_gpsshogi.rb'
require 'lib/store.rb'
require 'lib/shogi_model.rb'
require 'lib/db_accessor.rb'

class GpsClient < GpsShogi
  def initialize(config)
    @status = nil
    @store  = Store.new
    @board  = Board.new
    @dba    = DbAccessor.new
    super config
    @th = read_thread
  end
  attr_accessor :status, :store, :board

  def read_thread
    Thread.start do
      while line = read
        @board.apply(line)
        if find_move(line)
          send_delta(make_delta(line))
        else
          result = regist_board(@board)
          send_delta(make_delta(result))
        end
      end
    end
  end

  # WebSocketServerからstateを受け取る    
  def accept(state)
    send(state.get_move)
  end

  def make_delta
  end

  def send_delta
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
