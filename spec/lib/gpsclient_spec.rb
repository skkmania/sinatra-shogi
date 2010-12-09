require 'gpsclient.rb'

describe GpsClient do
  describe "#send" do
    it "sends move to binary" do
      gpsclient = GpsClient.new
      gpsclient.send('+7776FU')
      gpsclient.status == 'sent'
    end
  end
end
