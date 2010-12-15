# -*- coding: utf-8 -*-
# vim: set fileencoding=utf-8 :
#
#  gpsclient.rb
#
require 'rb_gpsshogi.rb'
require 'lib/store.rb'
require 'lib/shogi_model.rb'

class GpsClient < GpsShogi
  def initialize(config)
    @status = nil
    @store  = Store.new
    @board  = Board.new
    super config
    #@gps    = GpsShogi.new(config)
  end
  attr_accessor :status, :store, :board
    
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
