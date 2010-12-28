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
    $gpsclient = GpsClient.new($wave, $gps_config)
    
    $server = Rev::WebSocketServer.new(host, port, PseudoWaveConnection)
    $server.attach(Rev::Loop.default)
    
    SpecLog.debug "start on #{host}:#{port}"
  end

  after(:all) do
    $server.close
  end

  it "current_bid が1である" do
    $gpsclient.board.store.current_bid.should == 1
  end
end

describe Wave::State, '文字列受け入れテスト' do
  it "空文字列を渡されると空のStateになる" do
    Wave::State.new.fromString('').should == {}
  end
  it "|がkeyとvalueを区切るので'key|value'は要素がひとつのStateをつくる" do
    Wave::State.new.fromString('key|value').should == {'key' => 'value'}
  end  
  it "!!が要素を区切るので'key1|value1!!key2|value2'は要素がふたつのStateをつくる" do
    Wave::State.new.fromString('key1|value1!!key2|value2').should == {'key1' => 'value1', 'key2' => 'value2'}
  end  
end

describe Wave::State, 'toStateのテスト' do
  before(:all) do
    $wave = Wave.new
    @state = $wave.state
    $gpsclient = GpsClient.new($wave, $gps_config)
  end  
  it "bid = 10 のsectionをStateに載せると" do
    @section = $gpsclient.board.store.get_section 10
    @state.merge! @section
    puts @state.inspect
  end
end
