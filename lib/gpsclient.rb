require 'rb_gpsshogi.rb'

class GpsClient < GpsShogi
  def initialize
    @status = nil
  end
  attr_accessor :status
    
  def send(move)
    # $super(move)
    @status = 'sent'
  end
end
