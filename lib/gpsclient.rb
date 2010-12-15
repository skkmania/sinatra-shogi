require 'rb_gpsshogi.rb'
require 'lib/store.rb'

class GpsClient < GpsShogi
  def initialize(config)
    @status = nil
    @store  = Store.new
    super config
    #@gps    = GpsShogi.new(config)
  end
  attr_accessor :status, :store
    
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
