require 'rb_gpsshogi.rb'
require 'lib/store.rb'

class GpsClient < GpsShogi
  def initialize
    @status = nil
    @store  = Store.new
  end
  attr_accessor :status, :store
    
  def send(move)
    # $super(move)
    @status = 'sent'
  end
end
