# -*- coding: utf-8 -*-
# vim: set fileencoding=utf-8 :
#
#  pseudo_wave_spec.rb
#
require 'pseudo_wave.rb'

SpecLog = Logger.new('log/pseudo_wave_spec.log')
describe PseudoWaveConnection, 'は初期化でon_openが呼ばれたとき' do
  before(:all) do
    host = '0.0.0.0'
    port = 8081
    $wave = Wave.new
    $gpsclient = GpsClient.new
    
    $server = Rev::WebSocketServer.new(host, port, PseudoWaveConnection)
    $server.attach(Rev::Loop.default)
    
    SpecLog.debug "start on #{host}:#{port}"
  end

  after(:all) do
    $server.close
  end

  it "current_bid が1である" do
    $gpsclient.store.current_bid.should == 1
  end
end
