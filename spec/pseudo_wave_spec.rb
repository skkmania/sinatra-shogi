# -*- coding: utf-8 -*-
# vim: set fileencoding=utf-8 :
#
#  pseudo_wave_spec.rb
#
require '/home/skkmania/workspace/sinatra/shogi/pseudo_wave.rb'

SpecLog = Logger.new('log/pseudo_wave_spec.log')
  
$gps_config = {
	:initial_filename => "bin/csa.init",
	:opponent => "skkmania",
	:sente => false,
	:black => "skkmania", 
	:white => "gps",
	:limit => 1600, 
	:table_size => 30000,
	:table_record_limit => 50,
	:node_limit => 16000000,
	:timeleft => 100, 
	:byoyomi => 60,
	:logfile_basename => "bin/logs/x1_",
	:other_options => "",
	:base_command => 'bin/gpsshogi -v -r -c' # random play for test
}

#
#  PubSub
#
describe PubSub, 'は初期化されたとき' do

  it '@subscriber は空のHashである。' do
    ps = PubSub.new
    ps.size.should == 0
  end

  it '@seqid を管理し、その値は0である。' do
    ps = PubSub.new
    ps.seqid.should == 0
  end

end

describe PubSub, 'のsubscribeメソッドは' do

  it 'blockを受け取る。' do
    ps = PubSub.new
    ps.subscribe{|data| dummy = 0 }
  end

  it 'block以外のものを受け取ると例外が発生する' do
  end

  it 'blockを受け取ると、@seqidが + 1 される。' do
  end

  it 'blockを受け取ると、@subscriberに格納される。' do
  end

  it 'blockを受け取ると、そのblockを管理するkeyを返す。' do
  end
end

describe PubSub, 'のunsubscribeメソッドは' do

  it '正の整数を受け取る。' do
    ps = PubSub.new
    ps.unsubscribe(3)
  end

  it '正の整数以外のものを受け取ると例外が発生する' do
  end

  it 'blockを受け取ると、@seqidが + 1 される。' do
  end

  it 'blockを受け取ると、@subscriberに格納される。' do
  end

  it 'blockを受け取ると、そのblockを管理するkeyを返す。' do
  end
end

#
#  PseudoWaveConnection
#
describe PseudoWaveConnection, 'は初期化でon_openが呼ばれたとき' do
  before(:all) do
    host = '0.0.0.0'
    port = 8081
    tmpState = Wave::State.new(
         {'status'=>'gpsc', 'mode'=>'playing',
          'move'=>'+7776FU', 'bid'=> 1, 'count'=>'1', 'turn'=>'t',
          'board'=> ('1,t,' + Board::Initial_board_string + ',,') ,
          'next'=>'1,0,77,76,P,f,2:1,1,27,26,P,f,123',
          'prev'=>'' })
    $wave = Wave.new({ :state => tmpState, :host => host,
                       :mode => 'playing',
                       :participants => 'skkmania', :time => 3000,
                       :viewer => 'skphack' } )
    $gpsclient = GpsClient.new($wave, $gps_config, SpecLog)
    
    # $server = EventMachine::WebSocketServer.new(host, port, PseudoWaveConnection)
    # $server.attach(EventMachine::Loop.default)
    
    SpecLog.debug "start on #{host}:#{port}"
  end

  after(:all) do
    $server.close
  end

  it "current_bid が1である" do
    $gpsclient.board.store.current_bid.should == 1
    SpecLog.debug "current_bid == 1, ok"
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
=begin
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
=end
